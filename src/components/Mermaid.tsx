"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import mermaid from "mermaid";
import { validateMermaidSyntax, sanitizeMermaidCode, getFallbackTemplate, generateMermaidFromJSON } from "@/lib/diagram-utils";
import { Download, X, Maximize2, ZoomIn, Sparkles } from "lucide-react";
import { toast } from "sonner";
import * as html2canvasModule from "html2canvas-pro";
const html2canvas = (html2canvasModule as any).default ?? (html2canvasModule as any);
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export const Mermaid = ({ chart }: { chart: string }) => {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const diagramRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure theme is loaded
    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';
    const isDark = currentTheme === 'dark';

    // Initialize mermaid with theme-aware configuration
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            securityLevel: 'strict',
            suppressErrorRendering: true,
            themeVariables: isDark ? {
                primaryColor: '#1e3a5f',
                primaryTextColor: '#ffffff',
                primaryBorderColor: '#60a5fa',
                lineColor: '#94a3b8',
                secondaryColor: '#1e293b',
                tertiaryColor: '#0f1729',
                background: '#1e293b',
                mainBkg: '#1e3a5f',
                secondaryBkg: '#1e293b',
                tertiaryBkg: '#0f1729',
                textColor: '#ffffff',
                border1: '#60a5fa',
                border2: '#60a5fa',
                nodeBorder: '#60a5fa',
                clusterBkg: '#1e293b',
                clusterBorder: '#60a5fa',
                defaultLinkColor: '#94a3b8',
                titleColor: '#ffffff',
                edgeLabelBackground: '#1e293b',
                nodeTextColor: '#ffffff',
                fontSize: '16px',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            } : {
                primaryColor: '#bfdbfe',
                primaryTextColor: '#1e3a8a',
                primaryBorderColor: '#3b82f6',
                lineColor: '#3b82f6',
                secondaryColor: '#dbeafe',
                tertiaryColor: '#eff6ff',
                background: '#ffffff',
                mainBkg: '#bfdbfe',
                secondaryBkg: '#dbeafe',
                tertiaryBkg: '#eff6ff',
                textColor: '#1e3a8a',
                border1: '#3b82f6',
                border2: '#3b82f6',
                nodeBorder: '#3b82f6',
                clusterBkg: '#dbeafe',
                clusterBorder: '#3b82f6',
                defaultLinkColor: '#3b82f6',
                titleColor: '#1e3a8a',
                edgeLabelBackground: '#ffffff',
                nodeTextColor: '#1e3a8a',
                actorBkg: '#bfdbfe',
                actorBorder: '#3b82f6',
                actorTextColor: '#1e3a8a',
                actorLineColor: '#3b82f6',
                signalColor: '#1e3a8a',
                signalTextColor: '#1e3a8a',
                labelBoxBkgColor: '#dbeafe',
                labelBoxBorderColor: '#3b82f6',
                labelTextColor: '#1e3a8a',
                loopTextColor: '#1e3a8a',
                noteBorderColor: '#3b82f6',
                noteBkgColor: '#eff6ff',
                noteTextColor: '#1e3a8a',
                activationBorderColor: '#3b82f6',
                activationBkgColor: '#bfdbfe',
                sequenceNumberColor: '#ffffff',
                sectionBkgColor: '#dbeafe',
                altSectionBkgColor: '#eff6ff',
                sectionBkgColor2: '#bfdbfe',
                excludeBkgColor: '#f3f4f6',
                taskBorderColor: '#3b82f6',
                taskBkgColor: '#bfdbfe',
                taskTextColor: '#1e3a8a',
                taskTextLightColor: '#1e3a8a',
                taskTextOutsideColor: '#1e3a8a',
                taskTextClickableColor: '#1e40af',
                activeTaskBorderColor: '#2563eb',
                activeTaskBkgColor: '#93c5fd',
                gridColor: '#cbd5e1',
                doneTaskBkgColor: '#d1fae5',
                doneTaskBorderColor: '#10b981',
                critBorderColor: '#ef4444',
                critBkgColor: '#fecaca',
                todayLineColor: '#ef4444',
                fontSize: '16px',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }
        });
    }, [isDark]);

    // Use a stable ID based on chart content to prevent re-renders
    const id = useMemo(() => {
        // Simple hash function for stable ID
        let hash = 0;
        for (let i = 0; i < chart.length; i++) {
            const char = chart.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `mermaid-${Math.abs(hash).toString(36)}`;
    }, [chart]);

    useEffect(() => {
        if (!chart) return;

        let mounted = true;

        const renderDiagram = async (retryCount = 0) => {
            try {
                let codeToRender = chart;

                // Check if the content is JSON (starts with {)
                // This handles cases where the LLM uses ```mermaid for JSON content
                if (chart.trim().startsWith('{')) {
                    try {
                        console.log('🔍 Detected JSON content in Mermaid block, converting...');
                        const data = JSON.parse(chart);
                        codeToRender = generateMermaidFromJSON(data);
                        console.log('✅ Converted JSON to Mermaid:', codeToRender);
                    } catch (e) {
                        console.warn('⚠️ Failed to parse JSON in Mermaid block:', e);
                        // Continue with original content if parsing fails
                    }
                }

                // Layer 1: Basic sanitization (fast, catches obvious issues)
                console.log('🔄 Attempting Layer 1: Basic sanitization...');
                const sanitized = sanitizeMermaidCode(codeToRender);
                const validation = validateMermaidSyntax(sanitized);

                if (!validation.valid) {
                    console.warn('⚠️ Validation warning:', validation.error);
                }

                // Try rendering with sanitized code
                try {
                    const { svg } = await mermaid.render(id, sanitized);
                    if (mounted) {
                        setSvg(svg);
                        setError(null);
                        setIsFixing(false);
                        console.log('✅ Layer 1 successful: Basic sanitization worked');
                    }
                    return; // Success!
                } catch (renderError: any) {
                    console.warn('❌ Layer 1 failed:', renderError.message || 'Render error');

                    // PROACTIVE AI FIXING (Layer 2 Auto-Trigger)
                    // If this is the first failure, try to auto-fix immediately
                    if (retryCount === 0 && mounted) {
                        console.log('🔄 Auto-triggering Layer 2: Proactive AI fix...');
                        setIsFixing(true);
                        setError(null); // Clear error while fixing

                        try {
                            const response = await fetch('/api/fix-mermaid', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ code: sanitized })
                            });

                            if (response.ok) {
                                const { fixed } = await response.json();
                                if (fixed) {
                                    console.log('✅ AI Fix received, retrying render...');
                                    // Recursive call with fixed code, but increment retry count to avoid infinite loop
                                    // We update the chart ref implicitly by passing the fixed code to mermaid.render
                                    // But since we need to re-run the whole flow, let's just try rendering the fixed code directly here
                                    const { svg } = await mermaid.render(id + '-autofixed', fixed);
                                    if (mounted) {
                                        setSvg(svg);
                                        setError(null);
                                        setIsFixing(false);
                                        console.log('✅ Layer 2 successful: Auto-fix worked');
                                    }
                                    return;
                                }
                            }
                        } catch (aiError) {
                            console.warn('⚠️ Auto-fix failed:', aiError);
                        }
                    }

                    if (mounted) {
                        setIsFixing(false);
                        // Sanitize error message to remove internal IDs (e.g., #dmermaid-...) and parse errors
                        const errorMessage = renderError.message || 'Syntax error in diagram';
                        const isInternalError = errorMessage.includes('dmermaid') ||
                            errorMessage.includes('#') ||
                            errorMessage.startsWith('Parse error');

                        const sanitizedError = isInternalError ? 'Syntax error in diagram' : errorMessage;
                        setError(sanitizedError);
                    }
                }
            } catch (error: any) {
                console.error('Complete render failure:', error);
                if (mounted) {
                    setIsFixing(false);
                    setError('Failed to render diagram');
                }
            }
        };

        renderDiagram();

        return () => {
            mounted = false;
        };
    }, [chart, id, isDark]);

    const handleRetry = async () => {
        if (!chart) return;
        setError(null);
        setIsFixing(true);

        try {
            // Layer 3: Manual AI-powered syntax fix (if auto-fix failed or user wants to try again)
            console.log('🔄 Attempting Layer 3: Manual AI-powered fix...');
            const sanitized = sanitizeMermaidCode(chart);

            const response = await fetch('/api/fix-mermaid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: sanitized })
            });

            if (response.ok) {
                const { fixed } = await response.json();
                if (fixed) {
                    const { svg } = await mermaid.render(id + '-manualfixed', fixed);
                    setSvg(svg);
                    setError(null);
                    console.log('✅ Layer 3 successful: Manual AI fix worked');
                    return;
                }
            }
            setError("Could not automatically fix the diagram. Please try asking again.");
        } catch (e: any) {
            setError(e.message || "Failed to fix diagram");
        } finally {
            setIsFixing(false);
        }
    };

    const exportToPNG = async (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent modal opening if clicking export button
        // Use the ref that is currently visible (modal or inline)
        const element = isModalOpen ? modalRef.current : diagramRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#18181b', // zinc-900
                scale: 2, // Higher resolution
            });

            const link = document.createElement('a');
            link.download = `architecture-diagram-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            toast.success('Diagram exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export diagram');
        }
    };

    return (
        <>
            <div
                className="my-4 group relative cursor-zoom-in"
                onClick={() => setIsModalOpen(true)}
            >
                <div
                    ref={diagramRef}
                    className="overflow-x-auto p-4 rounded-lg transition-colors flex justify-center min-w-0"
                    dangerouslySetInnerHTML={{ __html: svg }}
                    style={{ minHeight: svg ? 'auto' : '200px', background: 'var(--background)', border: '1px solid var(--border)' }}
                />

                {/* Overlay controls */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                        onClick={exportToPNG}
                        className="p-2 rounded-lg backdrop-blur-sm hover:opacity-80"
                        style={{ background: 'var(--surface)', color: 'var(--muted)' }}
                        title="Export as PNG"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        className="p-2 rounded-lg backdrop-blur-sm hover:opacity-80"
                        style={{ background: 'var(--surface)', color: 'var(--muted)' }}
                        title="View Fullscreen"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>

                {isFixing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm rounded-lg z-10" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                        <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                            <Sparkles className="w-5 h-5 animate-pulse" style={{ color: 'var(--accent)' }} />
                            <span className="text-sm font-medium">Fixing diagram...</span>
                        </div>
                    </div>
                )}

                {error && !isFixing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm rounded-lg p-4 text-center z-10" style={{ background: 'rgba(0, 0, 0, 0.9)' }}>
                        <p className="text-red-400 text-sm mb-3 max-w-[90%] break-words">{error}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRetry();
                            }}
                            className="px-4 py-2 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-2"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        >
                            <Sparkles className="w-4 h-4" />
                            Fix Diagram
                        </button>
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 md:p-8"
                        style={{ background: 'rgba(0, 0, 0, 0.9)' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                                <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--muted)' }}>
                                    <ZoomIn className="w-4 h-4" />
                                    Diagram Preview
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={exportToPNG}
                                        className="p-2 rounded-lg transition-colors hover:opacity-70"
                                        style={{ color: 'var(--muted)' }}
                                        title="Export as PNG"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 rounded-lg transition-colors hover:opacity-70"
                                        style={{ color: 'var(--muted)' }}
                                        title="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-auto relative custom-scrollbar" style={{ background: 'var(--background)' }}>
                                <div className="min-h-full w-full flex items-center justify-center p-8">
                                    <div
                                        ref={modalRef}
                                        className="bg-zinc-950 p-4 rounded-lg"
                                        dangerouslySetInnerHTML={{ __html: svg }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
