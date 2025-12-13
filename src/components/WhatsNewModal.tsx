"use client";

import { createPortal } from "react-dom";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WhatsNewModal({ isOpen, onClose }: WhatsNewModalProps) {
    if (!isOpen) return null;

    const versions = [
        {
            version: "v1.3.3",
            isNew: true,
            features: [
                "📝 Markdown Support: User input contained between three backticks is now treated as markdown.",
                "📱 PWA Support: Full Progressive Web App support is now available.",
                "🐙 GitHub Link: GitHub repository link is now implemented on the webpage."
            ]
        },
        {
            version: "v1.3.2",
            isNew: false,
            features: [
                "⚡ Blazing Fast: Instant profile loads & faster file selection with Flash-Lite.",
                "🌐 Web Search: Real-time answers for competitors, news, and jobs.",
                "🔗 Smart URLs: Intelligent LinkedIn summarization & identity verification."
            ]
        },
        {
            version: "v1.3.1",
            isNew: false,
            features: [
                "Increased accuracy in complex flowchart generation from 70% to 95+%",
                "Improved error handling: Mermaid syntax errors are now hidden from the UI",
                "Added context for better chat results"
            ]
        },
        {
            version: "v1.3",
            isNew: false,
            features: [
                "Introduced the codeblocks in chat UI for code display with horizontal scrolling",
                "Integrated an enhanced flowchart diagrams.",
                "Added hidden files section to optimise the repo tree.",
                "Implemented the devtools",
                "Added realtime next js server response",
                "Introduced the Vercel KV caching for GitHub API calls",
                "Robust mermaid diagram fix pipeline using JSON by LLM to mermaid by typescript."
            ]
        },
        {
            version: "v1.2",
            isNew: false,
            features: [
                "Dev Tools Suite: Advanced Search (Regex/AST), Code Quality Analysis, and Automated Generators.",
                "Zero-Cost Security: Vulnerability scanning using pattern matching and Gemini AI.",
                "Enhanced Data: Precise language statistics via GraphQL and commit history.",
                "Auto-Persistence: Conversations are now automatically saved locally and restored instantly."
            ]
        },
        {
            version: "v1.1",
            isNew: false,
            features: [
                "Smart Caching: Instant load times for previously visited profiles and repositories.",
                "Mobile Experience: Optimized layout for mobile devices.",
                "Repo Chat: Deep dive into repositories with AI-powered chat and file analysis.",
                "File Preview: Instant syntax-highlighted previews for any file in the repository."
            ]
        }
    ];

    return typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    onClick={onClose}
                    style={{ background: 'rgba(0,0,0,0.8)' }}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[90vh] md:max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6" style={{ borderBottom: '1px solid var(--border)', background: 'linear-gradient(90deg, rgba(99,102,241,0.04), rgba(59,130,246,0.04))' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 md:p-2 bg-purple-600 rounded-lg">
                                <Sparkles className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--accent)' }} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold">What's New</h2>
                                <p className="text-xs md:text-sm" style={{ color: 'var(--muted)' }}>Latest updates and improvements</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-400 hover:text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="flex flex-col gap-8">
                            {versions.map((version, vIndex) => (
                                <div key={version.version} className="relative">
                                    <div className="flex items-center gap-3 mb-4">
                                            <h3 className="text-xl font-bold">{version.version}</h3>
                                        {version.isNew && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                                                LATEST
                                            </span>
                                        )}
                                    </div>

                                    <ul className="space-y-3">
                                        {version.features.map((feature, fIndex) => (
                                            <motion.li
                                                key={fIndex}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: (vIndex * 0.1) + (fIndex * 0.05) }}
                                                className="flex items-start gap-3"
                                            >
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                                                <span className="leading-relaxed" style={{ color: 'var(--foreground)' }}>{feature}</span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    {vIndex < versions.length - 1 && (
                                        <div className="mt-8 h-px" style={{ background: 'var(--border)' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 text-center" style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                            More features coming soon! Stay tuned 🚀
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    ) : null;
}
