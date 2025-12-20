"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Loader2, FileCode, ChevronRight, ArrowLeft, Sparkles, Github, Menu, MessageCircle, Shield, AlertTriangle, Download, CheckCircle, Info, Trash2 } from "lucide-react";
import { BotIcon } from "@/components/icons/BotIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { analyzeRepoFiles, fetchRepoFiles, generateAnswer, generateAnswerStream, scanRepositoryVulnerabilities, fetchProfile, fetchFileContent } from "@/app/actions";
import { cn } from "@/lib/utils";
import mermaid from "mermaid";
import * as html2canvasModule from "html2canvas-pro";
const html2canvas = (html2canvasModule as any).default ?? (html2canvasModule as any);
import { EnhancedMarkdown } from "./EnhancedMarkdown";
import { countMessageTokens, formatTokenCount, getTokenWarningLevel, isRateLimitError, getRateLimitErrorMessage, MAX_TOKENS } from "@/lib/tokens";
import { validateMermaidSyntax, sanitizeMermaidCode, getFallbackTemplate, generateMermaidFromJSON } from "@/lib/diagram-utils";
import { saveConversation, loadConversation, clearConversation } from "@/lib/storage";
import { getSelectedModel } from "@/lib/models";
import { ConfirmDialog } from "./ConfirmDialog";
import { CongratsModal } from "./CongratsModal";
import { CodeBlock } from "./CodeBlock";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import Link from "next/link";
import { StreamingProgress } from "./StreamingProgress";
import type { StreamUpdate } from "@/lib/streaming-types";

// Initialize mermaid - will be dynamically configured based on theme
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict',
    themeVariables: {
        primaryColor: '#1e3a5f',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#60a5fa',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f1729',
        background: '#1e293b',
        mainBkg: '#1e3a5f',
        textColor: '#ffffff',
        nodeBorder: '#60a5fa',
        clusterBkg: '#1e293b',
        clusterBorder: '#60a5fa',
        fontSize: '16px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    }
});

import { Mermaid } from "./Mermaid";

// ... (imports remain the same, remove local Mermaid definition)

import { repairMarkdown } from "@/lib/markdown-utils";

// ... (imports)

// Extract MessageContent to a memoized component
const MessageContent = ({ content, messageId }: { content: string, messageId: string }) => {
    const repairedContent = useMemo(() => repairMarkdown(content), [content]);

    // Use a ref to allow recursive reference to components
    const componentsRef = useRef<any>(null);

    const components = useMemo(() => {
        const comps = {
            code: ({ className, children, inline, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                const isMermaid = match && match[1] === "mermaid";
                const isMermaidJson = match && match[1] === "mermaid-json";

                if (isMermaid) {
                    return <Mermaid key={messageId} chart={String(children).replace(/\n$/, "")} />;
                }

                if (isMermaidJson) {
                    try {
                        const jsonContent = String(children).replace(/\n$/, "");
                        const data = JSON.parse(jsonContent);
                        const chart = generateMermaidFromJSON(data);
                        return <Mermaid key={messageId} chart={chart} />;
                    } catch (e) {
                        return (
                            <div className="flex items-center gap-2 p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--muted)' }} />
                                <span className="text-sm" style={{ color: 'var(--muted)' }}>Generating diagram...</span>
                            </div>
                        );
                    }
                }

                const contentStr = String(children);
                const isBlock = contentStr.endsWith('\n');
                const shouldRenderBlock = match || isBlock || (inline === false);

                return shouldRenderBlock ? (
                    <CodeBlock
                        language={match ? match[1] : "markdown"}
                        value={contentStr.replace(/\n$/, "")}
                        components={componentsRef.current}
                    />
                ) : (
                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-red-400 font-mono text-sm" {...props}>
                        {children}
                    </code>
                );
            },
            p: ({ children }: any) => <div className="mb-4 leading-relaxed last:mb-0">{children}</div>,
            pre: ({ children }: any) => <>{children}</>,
            table: ({ children }: any) => (
                <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse" style={{ border: '1px solid var(--border)' }}>
                        {children}
                    </table>
                </div>
            ),
            thead: ({ children }: any) => (
                <thead style={{ background: 'var(--surface)' }}>{children}</thead>
            ),
            tbody: ({ children }: any) => (
                <tbody style={{ background: 'var(--background)' }}>{children}</tbody>
            ),
            tr: ({ children }: any) => (
                <tr style={{ borderBottom: '1px solid var(--border)' }}>{children}</tr>
            ),
            th: ({ children }: any) => (
                <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                    {children}
                </th>
            ),
            td: ({ children }: any) => (
                <td className="px-4 py-2 text-sm" style={{ color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                    {children}
                </td>
            ),
        };
        componentsRef.current = comps;
        return comps;
    }, [messageId]);

    return (
        <EnhancedMarkdown
            content={repairedContent}
            components={components}
        />
    );
};

// ... (rest of the file)

// In the render loop:
// <div className="prose prose-invert prose-sm max-w-none leading-relaxed break-words overflow-hidden w-full min-w-0">
//     <MessageContent content={msg.content} messageId={msg.id} />
// </div>

const REPO_SUGGESTIONS = [
    "Show me the user flow chart",
    "Find security vulnerabilities",
    "Evaluate code quality",
    "What's the tech stack?",
    "Explain the architecture",
];

interface Vulnerability {
    title: string;
    severity: string;
    description: string;
    file: string;
    line?: number;
    recommendation: string;
}

interface Message {
    id: string;
    role: "user" | "model";
    content: string;
    relevantFiles?: string[];
    tokenCount?: number;
    vulnerabilities?: Vulnerability[];
}

interface ChatInterfaceProps {
    repoContext: { owner: string; repo: string; fileTree: any[] };
    onToggleSidebar?: () => void;
}

export function ChatInterface({ repoContext, onToggleSidebar }: ChatInterfaceProps) {
    // Generate unique IDs for messages using a more robust approach
    const messageIdCounter = useRef(0);
    const generateMessageId = () => {
        messageIdCounter.current += 1;
        return `msg-${Date.now()}-${messageIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Helper to add message while ensuring no duplicate IDs
    const addMessage = (newMessage: Message) => {
        setMessages((prev) => {
            // Check if this ID already exists
            const isDuplicate = prev.some(msg => msg.id === newMessage.id);
            if (isDuplicate) {
                console.warn('Duplicate message ID detected, regenerating:', newMessage.id);
                return [...prev, { ...newMessage, id: generateMessageId() }];
            }
            return [...prev, newMessage];
        });
    };

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "model",
            content: `Hello! I've analyzed **${repoContext.owner}/${repoContext.repo}**. Ask me anything about the code structure, dependencies, or specific features.`,
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [scanning, setScanning] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState(false);
    const [showCongratsModal, setShowCongratsModal] = useState(false);
    const [congratsVisitorId, setCongratsVisitorId] = useState<string | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    // Streaming state
    const [streamingStatus, setStreamingStatus] = useState<{ message: string; progress: number } | null>(null);
    const [currentStreamingMessage, setCurrentStreamingMessage] = useState("");
    const [ownerProfile, setOwnerProfile] = useState<any>(null);

    // Initialize selected model from localStorage
    useEffect(() => {
        setSelectedModel(getSelectedModel());
    }, []);

    // Handler to claim unlimited in dev mode
    const claimUnlimitedDev = async (visitorId: string | null) => {
        if (!visitorId) return;
        try {
            // Call the test-unlimited endpoint used by admin pages
            // Request 10 days of temporary unlimited access in dev mode
            const res = await fetch('/api/billing/test-unlimited', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId, durationDays: 10 })
            });
            const data = await res.json();
            if (data && data.success) {
                const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
                toast.success(`Temporary unlimited access granted${expiresAt ? ` until ${expiresAt.toLocaleString()}` : ''}.`, { duration: 6000 });
                setShowCongratsModal(false);
                // store a flag so user doesn't see popup again
                localStorage.setItem('dev_unlimited_granted', '1');
            } else {
                toast.error('Failed to grant unlimited access: ' + (data.error || 'unknown'));
            }
        } catch (e: any) {
            console.error('Failed to claim dev unlimited:', e);
            toast.error('Failed to grant unlimited access');
        }
    };

    // Fetch owner profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await fetchProfile(repoContext.owner);
                setOwnerProfile(profile);
            } catch (e) {
                console.error("Failed to load owner profile:", e);
            }
        };
        loadProfile();
    }, [repoContext.owner]);

    // Load conversation on mount
    const toastShownRef = useRef(false);
    useEffect(() => {
        const saved = loadConversation(repoContext.owner, repoContext.repo);
        if (saved && saved.length > 1) {
            // Fix any duplicate IDs and regenerate old-style timestamp IDs
            const seenIds = new Set<string>();
            const messagesWithUniqueIds = saved.map((msg) => {
                // Check if this is an old-style ID (pure timestamp or timestamp+1)
                const isOldStyleId = /^\d+$/.test(msg.id);
                
                if (seenIds.has(msg.id) || isOldStyleId) {
                    // Generate a new unique ID for duplicates or old-style IDs
                    const newId = generateMessageId();
                    seenIds.add(newId);
                    console.log(`Regenerating ID: ${msg.id} -> ${newId}`);
                    return { ...msg, id: newId };
                }
                seenIds.add(msg.id);
                return msg;
            });
            
            setMessages(messagesWithUniqueIds);
            setShowSuggestions(false);
            if (!toastShownRef.current) {
                toast.info('Conversation restored', { duration: 2000 });
                toastShownRef.current = true;
            }
        }
        setInitialized(true);
    }, [repoContext.owner, repoContext.repo]);

    // Save on every message change
    useEffect(() => {
        if (initialized && messages.length > 1) {
            saveConversation(repoContext.owner, repoContext.repo, messages);
        }
    }, [messages, initialized, repoContext.owner, repoContext.repo]);

    // Calculate total token count
    const totalTokens = useMemo(() => {
        return countMessageTokens(messages.map(m => ({ role: m.role, parts: m.content })));
    }, [messages]);

    const tokenWarningLevel = getTokenWarningLevel(totalTokens);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        // Check token limit
        if (totalTokens >= MAX_TOKENS) {
            toast.error("Conversation limit reached", {
                description: "Please clear the chat to start a new conversation.",
                duration: 5000,
            });
            return;
        }

        // Skip billing check if user just returned from payment (welcome=1)
        const urlParams = new URLSearchParams(window.location.search);
        const skipBillingCheck = urlParams.has('welcome');
        if (skipBillingCheck) {
            // Clear the welcome param after first use
            urlParams.delete('welcome');
            const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState({}, '', newUrl);
        }

        // Ensure visitor has quota before continuing (skip if just paid)
        if (!skipBillingCheck) {
            try {
                let visitorId = localStorage.getItem("visitor_id");
                let visitorWasJustCreated = false;
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem("visitor_id", visitorId);
                    visitorWasJustCreated = true;
                }

                const checkRes = await fetch(`/api/billing/check?visitorId=${encodeURIComponent(visitorId)}`);
                const checkData = await checkRes.json();
                
                // Show remaining queries info
                if (checkData.remaining !== undefined && checkData.remaining >= 0 && checkData.remaining <= 2) {
                    toast.info(`${checkData.remaining} free ${checkData.remaining === 1 ? 'query' : 'queries'} remaining`, {
                        description: checkData.remaining === 0 ? "Upgrade to continue" : "Consider upgrading for unlimited queries",
                        duration: 4000,
                    });
                }
                
                if (!checkData.allowed) {
                    // If we're running on localhost or in a dev preview, offer a friendly free unlimited grant popup
                    const hostname = window.location.hostname;
                    const params = new URLSearchParams(window.location.search);
                    const envFlag = (process.env.NEXT_PUBLIC_DEV_MODE === '1' || process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_UNLIMITED === '1' || process.env.NEXT_PUBLIC_DEV_UNLIMITED === 'true');
                    // Support a comma-separated list of hosts that should be treated as dev previews (e.g. preview domains)
                    const hostsRaw = process.env.NEXT_PUBLIC_DEV_HOSTS || '';
                    const allowedHosts = hostsRaw.split(',').map(s => s.trim()).filter(Boolean);
                    const hostMatches = allowedHosts.some(h => {
                        if (!h) return false;
                        // exact match or endsWith to allow subdomains (e.g. preview--app.render.com)
                        return hostname === h || hostname.endsWith(h) || hostname.includes(h);
                    });

                    const isDevEnv = hostname === 'localhost'
                        || hostname === '127.0.0.1'
                        || (window as any).__DEV_MODE === true
                        || params.has('dev_unlimited')
                        || params.has('dev')
                        || localStorage.getItem('dev_unlimited_enabled') === '1'
                        || localStorage.getItem('dev_unlimited_granted') === '1'
                        || envFlag
                        || hostMatches;

                    if (isDevEnv) {
                        // Show congratulations modal and allow claiming unlimited access
                        setCongratsVisitorId(visitorId);
                        setShowCongratsModal(true);
                        // do not redirect; allow the flow to continue after user claims
                        return;
                    }

                    toast.error("Query limit reached", {
                        description: "You've used all 5 free queries. Upgrade to continue!",
                        duration: 5000,
                    });
                    // Store current URL so we can return after payment
                    const returnUrl = window.location.pathname + window.location.search;
                    localStorage.setItem('checkout_return_url', returnUrl);
                    // Redirect user to pricing screen
                    window.location.href = `/pricing?visitorId=${encodeURIComponent(visitorId)}`;
                    return;
                }
            } catch (err) {
                // On error, allow the request but log it
                console.warn('Billing check failed, allowing request by default', err);
            }
        }

        setShowSuggestions(false);

        // Use selected files from tags
        const targetFiles = selectedFiles.length > 0 ? selectedFiles : [];

        console.log('🔍 Input:', input);
        console.log('📁 Selected files:', targetFiles);

        const userMsg: Message = {
            id: generateMessageId(),
            role: "user",
            content: input,
            relevantFiles: targetFiles.length > 0 ? targetFiles : undefined
        };

        addMessage(userMsg);
        setInput("");
        setSelectedFiles([]); // Clear selected files after submission
        setLoading(true);

        // Handle file-specific queries
        if (targetFiles.length > 0) {
            console.log('🎯 File-specific query triggered for:', targetFiles);
            try {
                // Fetch the content of the specified files
                console.log('📥 Fetching file content for:', targetFiles);
                const fileContents = await Promise.all(
                    targetFiles.map(async (filePath) => {
                        try {
                            console.log(`  → Fetching: ${filePath}`);
                            const result = await fetchFileContent(repoContext.owner, repoContext.repo, filePath);
                            console.log(`  ✓ Result for ${filePath}:`, result.success ? 'SUCCESS' : 'FAILED', result.content ? `(${result.content.length} chars)` : '(no content)');
                            if (result.success && result.content) {
                                return { path: filePath, content: result.content, success: true };
                            }
                            return { path: filePath, content: '', success: false, error: result.error };
                        } catch (err) {
                            console.error(`  ✗ Error fetching ${filePath}:`, err);
                            return { path: filePath, content: '', success: false, error: String(err) };
                        }
                    })
                );

                console.log('📊 Fetch results:', fileContents.map(f => ({ path: f.path, success: f.success })));
                const successfulFiles = fileContents.filter(f => f.success);
                const failedFiles = fileContents.filter(f => !f.success);
                
                if (successfulFiles.length === 0) {
                    const errorDetails = failedFiles.map(f => `- ${f.path}: ${f.error || 'Unknown error'}`).join('\n');
                    const botMsg: Message = {
                        id: generateMessageId(),
                        role: "model",
                        content: `I couldn't find the specified file(s):\n\n${errorDetails}\n\nPlease make sure the file path is correct. You can type \`/\` to see available files.`,
                    };
                    addMessage(botMsg);
                    setLoading(false);
                    return;
                }

                // Create a focused context with the file content
                const fileContext = successfulFiles.map(f => 
                    `File: ${f.path}\n\`\`\`\n${f.content.slice(0, 8000)}\n\`\`\``
                ).join('\n\n');

                // Check if user asked a question or just provided file path
                const hasQuestion = input.trim().length > 0;
                
                const enhancedQuery = hasQuestion 
                    ? `IMPORTANT: Answer ONLY based on these specific files. Do not provide general knowledge or information from other files.\n\nUser Question: ${input}\n\nFILES TO ANALYZE:\n${fileContext}\n\nProvide a focused answer based ONLY on the content of these files. If the answer cannot be found in these files, say so clearly. You may suggest checking other related files if relevant.`
                    : `IMPORTANT: Analyze ONLY these specific files. Do not include general information.\n\nFILES TO ANALYZE:\n${fileContext}\n\nProvide a concise summary of:\n1. What each file does\n2. Main functionality and purpose\n3. Key components/functions\n4. Important patterns or logic\n\nYou may suggest related files that might be useful to explore.`;

                // Use the streaming answer function
                console.log('🤖 Generating AI response...');
                console.log('📝 Query:', enhancedQuery.substring(0, 200) + '...');
                
                const botMsg: Message = {
                    id: generateMessageId(),
                    role: "model",
                    content: "Analyzing files...",
                    relevantFiles: successfulFiles.map(f => f.path)
                };

                addMessage(botMsg);

                const answer = await generateAnswer(
                    enhancedQuery,
                    "", // context - empty for now
                    { owner: repoContext.owner, repo: repoContext.repo },
                    messages.map(m => ({ role: m.role, content: m.content })),
                    undefined, // profileData
                    undefined, // visitorId
                    selectedModel // selected AI model
                );

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === botMsg.id ? { ...msg, content: answer } : msg
                    )
                );

                setLoading(false);
                console.log('✓ File-specific query complete');
                return;
            } catch (error) {
                console.error("File query error:", error);
                const errorMsg: Message = {
                    id: generateMessageId(),
                    role: "model",
                    content: "I encountered an error while processing the file. Please try again.",
                };
                addMessage(errorMsg);
                setLoading(false);
                return;
            }
        }

        // Handle special commands
        if (input.toLowerCase().includes("find security vulnerabilities") || input.toLowerCase().includes("scan for vulnerabilities")) {
            console.log('🎯 Security scan triggered!');
            setScanning(true);
            try {
                // Step 1: Start scan
                setStreamingStatus({ message: "Preparing security scan...", progress: 10 });

                const filesToScan = repoContext.fileTree.map((f: any) => ({ path: f.path, sha: f.sha }));
                console.log('📋 Total files in tree:', filesToScan.length);

                // Step 2: Show file count
                const codeFileCount = filesToScan.filter((f: any) =>
                    /\.(js|jsx|ts|tsx|py|java|php|rb|go|rs)$/i.test(f.path) || f.path === 'package.json'
                ).length;
                console.log('💻 Code files found:', codeFileCount);
                setStreamingStatus({ message: `Scanning ${Math.min(codeFileCount, 20)} code files...`, progress: 30 });

                // Step 3: Run scan
                setStreamingStatus({ message: "Running pattern-based analysis...", progress: 50 });
                console.log('🚀 Calling scanRepositoryVulnerabilities...');

                const { findings, summary } = await scanRepositoryVulnerabilities(
                    repoContext.owner,
                    repoContext.repo,
                    filesToScan
                );

                console.log('✅ Scan complete! Findings:', findings.length, 'Summary:', summary);
                console.log('📊 Debug Info:', summary.debug);

                // Step 4: Finalizing
                setStreamingStatus({ message: "Analyzing results...", progress: 90 });



                let content = '';

                if (summary.total === 0) {
                    // No vulnerabilities found
                    const filesScanned = summary.debug?.filesSuccessfullyFetched || 0;
                    content = `✅ **Security scan complete!**\n\nI've scanned **${filesScanned} files** and found **no security vulnerabilities**.\n\nYour code looks secure! The scan checked for:\n- SQL injection vulnerabilities\n- Cross-site scripting (XSS)\n- Unsafe child_process usage\n- Hardcoded secrets\n- Weak cryptographic algorithms\n- Command injection\n\nKeep up the good security practices! 🔒`;
                } else {
                    // Vulnerabilities found
                    const filesScanned = summary.debug?.filesSuccessfullyFetched || 0;
                    content = `⚠️ **Security scan complete!**\n\nI've scanned **${filesScanned} files** and found **${summary.total} potential issue${summary.total !== 1 ? 's' : ''}**.\n\n`;

                    if (summary.critical > 0) content += `🔴 **${summary.critical} Critical**\n`;
                    if (summary.high > 0) content += `🟠 **${summary.high} High**\n`;
                    if (summary.medium > 0) content += `🟡 **${summary.medium} Medium**\n`;
                    if (summary.low > 0) content += `🔵 **${summary.low} Low**\n`;

                    content += `\nHere are the key findings:\n\n`;

                    findings.slice(0, 5).forEach(f => {
                        content += `### ${f.title}\n`;
                        content += `**Severity**: ${f.severity.toUpperCase()}\n`;
                        content += `**File**: \`${f.file}\` ${f.line ? `(Line ${f.line})` : ''}\n`;
                        content += `**Issue**: ${f.description}\n`;
                        content += `**Fix**: ${f.recommendation}\n\n`;
                    });

                    if (findings.length > 5) {
                        content += `*...and ${findings.length - 5} more issue${findings.length - 5 !== 1 ? 's' : ''}.*`;
                    }
                }


                const modelMsg: Message = {
                    id: generateMessageId(),
                    role: "model",
                    content: content,
                    vulnerabilities: findings as any
                };
                addMessage(modelMsg);
                setStreamingStatus(null); // Clear streaming status
                setLoading(false);
                setScanning(false);
                return;
            } catch (error) {
                console.error("Scan failed:", error);
                toast.error("Security scan failed", {
                    description: error instanceof Error ? error.message : "An error occurred during scanning"
                });
                setStreamingStatus(null); // Clear streaming status
                setScanning(false);
                setLoading(false);

                // Show error message to user
                const errorMsg: Message = {
                    id: generateMessageId(),
                    role: "model",
                    content: "I encountered an error while scanning for security vulnerabilities. Please try again.",
                };
                addMessage(errorMsg);
                return; // Don't fall through to normal chat
            }
        }

        try {
            const filePaths = repoContext.fileTree.map((f: any) => f.path);

            // Step 1: Analyze files
            setStreamingStatus({ message: "Selecting relevant files...", progress: 10 });
            const { relevantFiles, fileCount } = await analyzeRepoFiles(input, filePaths, repoContext.owner, repoContext.repo);

            // Step 2: Fetch files  
            setStreamingStatus({ message: `Fetching ${fileCount} file${fileCount !== 1 ? 's' : ''} from GitHub...`, progress: 40 });

            const filesToFetch = relevantFiles.map(path => {
                const node = repoContext.fileTree.find((f: any) => f.path === path);
                return { path, sha: node?.sha || "" };
            });

            const { context } = await fetchRepoFiles(repoContext.owner, repoContext.repo, filesToFetch);

            // Step 3: Generate response
            setStreamingStatus({ message: "Generating response...", progress: 70 });
            
            // Create bot message immediately so user sees it's responding
            const modelMsg: Message = {
                id: generateMessageId(),
                role: "model",
                content: "Thinking...",
                relevantFiles,
            };
            addMessage(modelMsg);

            // Get visitor ID
            let visitorId = localStorage.getItem("visitor_id");
            if (!visitorId) {
                visitorId = crypto.randomUUID();
                localStorage.setItem("visitor_id", visitorId);
            }

            const answer = await generateAnswer(
                input,
                context,
                { owner: repoContext.owner, repo: repoContext.repo },
                messages.map(m => ({ role: m.role, content: m.content })),
                ownerProfile, // Pass profile data for developer cards
                visitorId,
                selectedModel // selected AI model
            );

            // Update the message with the actual response
            setMessages((prev) => 
                prev.map((msg) => 
                    msg.id === modelMsg.id ? { ...msg, content: answer } : msg
                )
            );
            setStreamingStatus(null);
        } catch (error: any) {
            console.error(error);

            // Check if it's a rate limit error
            if (isRateLimitError(error)) {
                toast.error(getRateLimitErrorMessage(error), {
                    description: "Please wait a few moments before trying again.",
                    duration: 5000,
                });
            } else {
                toast.error("Failed to analyze code", {
                    description: "An unexpected error occurred. Please try again.",
                });
            }

            // Show user-friendly error message
            const errorMsg: Message = {
                id: generateMessageId(),
                role: "model",
                content: "I encountered an error while analyzing the code. Please try again or rephrase your question.",
            };
            addMessage(errorMsg);
            setStreamingStatus(null);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        clearConversation(repoContext.owner, repoContext.repo);
        setMessages([
            {
                id: "welcome",
                role: "model",
                content: `Hello! I've analyzed **${repoContext.owner}/${repoContext.repo}**. Ask me anything about the code structure, dependencies, or specific features.`,
            },
        ]);
        setShowSuggestions(true);
        toast.success("Chat history cleared");
    };

    return (
        <div className="flex flex-col h-full" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Header */}
            <div className="p-2 sm:p-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div className="flex items-center gap-2 sm:gap-4 max-w-3xl mx-auto">
                    {onToggleSidebar && (
                        <button
                            onClick={onToggleSidebar}
                            className="md:hidden p-1.5 sm:p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                        </button>
                    )}
                    <Link
                        href="/"
                        className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Back to home"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--muted)' }} />
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Github className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: 'var(--muted)' }} />
                        <h1 className="text-sm sm:text-base lg:text-lg font-semibold truncate" style={{ color: 'var(--foreground)' }}>{repoContext.owner}/{repoContext.repo}</h1>
                    </div>

                    <div className={cn(
                        "ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        tokenWarningLevel === 'danger' && "bg-red-500/10 text-red-400 border border-red-500/20",
                        tokenWarningLevel === 'warning' && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
                        tokenWarningLevel === 'safe' && "text-opacity-50"
                    )} style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{formatTokenCount(totalTokens)} / {formatTokenCount(MAX_TOKENS)} tokens</span>
                    </div>

                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="p-2 rounded-lg transition-colors hover:opacity-80"
                        style={{ color: 'var(--muted)' }}
                        title="Clear Chat"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>


                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-4 max-w-3xl mx-auto",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                            )}>
                                {msg.role === "model" ? (
                                    <BotIcon className="w-full h-full text-white" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <UserIcon className="w-full h-full text-zinc-400" />
                                    </div>
                                )}
                            </div>

                            <div className={cn(
                                "flex flex-col gap-2",
                                msg.role === "user" ? "items-end max-w-[85%] sm:max-w-[80%]" : "items-start max-w-full md:max-w-full w-full min-w-0"
                            )}>
                            <div className={cn(
                                "p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl overflow-hidden w-full min-w-0",
                                msg.role === "user"
                                    ? "text-white rounded-tr-none"
                                    : "rounded-tl-none"
                            )}
                            style={{
                                background: msg.role === "user" ? 'var(--accent)' : 'var(--surface)',
                                border: msg.role === "user" ? 'none' : '1px solid var(--border)',
                                color: msg.role === "user" ? '#fff' : 'var(--foreground)'
                            }}>
                                <div className="prose prose-sm prose-invert max-w-none leading-relaxed break-words overflow-hidden w-full min-w-0 [&_*]:text-inherit" style={{color: msg.role === "user" ? '#fff' : 'var(--foreground)'}}>
                                    <MessageContent content={msg.content} messageId={msg.id} />
                                </div>
                            </div>

                                {msg.relevantFiles && msg.relevantFiles.length > 0 && (
                                    <details className="group mt-1">
                                        <summary className="flex items-center gap-2 text-xs cursor-pointer transition-colors select-none font-medium" style={{ color: 'var(--muted)' }}>
                                            <FileCode className="w-3 h-3" />
                                            <span>{msg.relevantFiles.length} files analyzed</span>
                                            <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <ul className="mt-2 space-y-1 text-xs pl-4" style={{ color: 'var(--foreground)' }}>
                                            {msg.relevantFiles.map((file, i) => (
                                                <li key={i} className="font-mono">{file}</li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {(loading || streamingStatus) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4 max-w-3xl mx-auto"
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 animate-pulse overflow-hidden">
                            <BotIcon className="w-full h-full text-white opacity-80" />
                        </div>
                        <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl rounded-tl-none flex-1" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                            {streamingStatus ? (
                                <StreamingProgress
                                    message={streamingStatus.message}
                                    progress={streamingStatus.progress}
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--muted)' }} />
                                    <span className="text-sm" style={{ color: 'var(--foreground)' }}>Analyzing code...</span>
                                </div>
                            )}

                            {/* Show streaming content if available */}
                            {currentStreamingMessage && (
                                <div className="prose prose-sm prose-invert max-w-none leading-relaxed break-words overflow-hidden w-full min-w-0 mt-4 pt-4 [&_*]:text-inherit" style={{ borderTop: '1px solid var(--border)', color: 'var(--foreground)' }}>
                                    <MessageContent content={currentStreamingMessage} messageId="streaming" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 space-y-3" style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
                {/* Suggestions */}
                {showSuggestions && messages.length === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Try asking:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {REPO_SUGGESTIONS.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all hover:opacity-80"
                                    style={{ background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative px-2 sm:px-0">
                    <ChatInput
                        value={input}
                        onChange={setInput}
                        onSubmit={handleSubmit}
                        placeholder={totalTokens >= MAX_TOKENS ? "Conversation limit reached. Please clear chat." : "Ask a question about the code... (type / to search files)"}
                        disabled={totalTokens >= MAX_TOKENS}
                        loading={loading}
                        fileTree={repoContext.fileTree}
                        selectedFiles={selectedFiles}
                        onFileSelect={(filePath) => {
                            // Add file to selected files if not already added
                            if (!selectedFiles.includes(filePath)) {
                                setSelectedFiles([...selectedFiles, filePath]);
                            }
                        }}
                        onRemoveFile={(filePath) => {
                            setSelectedFiles(selectedFiles.filter(f => f !== filePath));
                        }}
                        onModelChange={(modelId) => setSelectedModel(modelId)}
                    />
                </form>
            </div>

            <ConfirmDialog
                isOpen={showClearConfirm}
                title="Clear Chat History?"
                message="This will permanently delete all messages in this conversation. This action cannot be undone."
                confirmText="Clear Chat"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={handleClearChat}
                onCancel={() => setShowClearConfirm(false)}
            />
            <CongratsModal
                isOpen={showCongratsModal}
                title="Congratulations! 🎉"
                message={
                    <>
                        <p>The site is now live and publicly accessible. However, the payment gateway is still under development. To ensure uninterrupted usage, you have been granted temporary unlimited access for evaluation and testing purposes.</p>

                        <p className="mt-3 font-medium">Please note:</p>
                        <ul className="list-disc ml-5 mt-2 text-sm">
                            <li>This access is temporary</li>
                            <li>It is provided while payment integration is being finalized</li>
                            <li>Full access rules will apply once payments are enabled</li>
                        </ul>

                        <p className="mt-3">Thank you for using the platform and supporting us during this phase.</p>
                    </>
                }
                confirmText="Claim Temporary Access"
                cancelText="Maybe Later"
                onConfirm={() => claimUnlimitedDev(congratsVisitorId)}
                onCancel={() => setShowCongratsModal(false)}
            />
        </div>
    );
}
