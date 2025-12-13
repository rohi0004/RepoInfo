"use client";

import { useEffect, useState } from "react";
import { X, Loader2, FileCode, AlertCircle, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

// Add CSS for proper text visibility in light and dark modes
const styles = `
  .file-preview-markdown h1,
  .file-preview-markdown h2,
  .file-preview-markdown h3,
  .file-preview-markdown h4,
  .file-preview-markdown h5,
  .file-preview-markdown h6 {
    color: var(--foreground) !important;
  }
  .file-preview-markdown p,
  .file-preview-markdown li,
  .file-preview-markdown blockquote,
  .file-preview-markdown code,
  .file-preview-markdown a {
    color: var(--foreground) !important;
  }
  .file-preview-markdown a {
    color: var(--accent) !important;
    text-decoration: underline;
  }
  .file-preview-markdown blockquote {
    border-left-color: var(--accent);
    color: var(--muted);
  }
  .file-preview-markdown pre {
    background-color: var(--surface);
  }
  .file-preview-markdown code:not(pre code) {
    background-color: var(--border);
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

interface FilePreviewProps {
    isOpen: boolean;
    filePath: string | null;
    repoOwner: string;
    repoName: string;
    onClose: () => void;
}

export function FilePreview({ isOpen, filePath, repoOwner, repoName, onClose }: FilePreviewProps) {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<{ size: number; html_url: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState<string>("");

    useEffect(() => {
        if (!isOpen || !filePath) {
            setContent("");
            setLoading(false);
            setError(null);
            setFileInfo(null);
            setHighlightedCode("");
            return;
        }

        const fetchFileContent = async () => {
            setLoading(true);
            setError(null);
            setFileInfo(null);
            setHighlightedCode("");
            try {
                // Encode each segment of the path to handle spaces and special characters
                const encodedPath = filePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
                const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${encodedPath}`;
                console.log("Fetching file preview:", url);

                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) throw new Error('File not found');
                    if (response.status === 403) throw new Error('Rate limit exceeded');
                    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setFileInfo({ size: data.size, html_url: data.html_url });

                // Check for binary/video/large files based on extension and size
                const ext = filePath.split('.').pop()?.toLowerCase() || '';
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
                const isVideo = ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext);
                const isBinary = ['pdf', 'zip', 'tar', 'gz', 'exe', 'dll', 'bin'].includes(ext);

                // 1. File > 1MB
                if (data.size > 1000000) {
                    setError('File is too large to show (>1MB)');
                    return;
                }

                // 2. Image > 500KB
                if (isImage && data.size > 500000) {
                    setError('Image is too large to show (>500KB)');
                    return;
                }

                // 3. Video or Binary
                if (isVideo || isBinary) {
                    setError('Cannot preview binary or video file');
                    return;
                }

                if (data.content) {
                    const decoded = atob(data.content);
                    setContent(decoded);
                    
                    // Apply syntax highlighting
                    const language = getLanguageFromPath(filePath);
                    try {
                        const highlighted = hljs.highlight(decoded, { language, ignoreIllegals: true }).value;
                        setHighlightedCode(highlighted);
                    } catch (err) {
                        console.error("Highlight error:", err);
                        setHighlightedCode(decoded);
                    }
                } else {
                    setError('No content available');
                }
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to load file content';
                setError(errorMessage);
                toast.error(errorMessage);
                console.error("FilePreview Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFileContent();
    }, [isOpen, filePath, repoOwner, repoName]);

    if (!isOpen) return null;

    const getLanguageFromPath = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        const langMap: Record<string, string> = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'css': 'css',
            'html': 'html',
            'json': 'json',
            'md': 'markdown',
            'yaml': 'yaml',
            'yml': 'yaml',
            'sh': 'bash',
            'sql': 'sql',
            'xml': 'xml',
            'dockerfile': 'dockerfile',
        };
        return langMap[ext || ''] || 'plaintext';
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Copied to clipboard!");
        } catch {
            toast.error("Failed to copy");
        }
    };

    const isMarkdown = filePath?.endsWith('.md');
    const language = filePath ? getLanguageFromPath(filePath) : 'plaintext';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 backdrop-blur-sm"
                    style={{ background: 'rgba(0, 0, 0, 0.8)' }}
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 backdrop-blur-sm" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <div className="flex items-center gap-3">
                            <FileCode className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                            <h2 className="font-semibold truncate max-w-md" title={filePath || ''} style={{ color: 'var(--foreground)' }}>
                                {filePath}
                            </h2>
                            <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--border)', color: 'var(--muted)' }}>
                                {language}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {!loading && !error && content && (
                                <button
                                    onClick={handleCopy}
                                    className="p-2 rounded-lg transition-all duration-200"
                                    style={{ background: 'var(--border)', color: 'var(--accent)' }}
                                    title="Copy to clipboard"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg transition-colors hover:opacity-70"
                                style={{ background: 'transparent' }}
                            >
                                <X className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-0" style={{ background: 'var(--background)' }}>
                        {loading && (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                                <AlertCircle className="w-12 h-12" style={{ color: 'var(--muted)' }} />
                                <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>{error}</p>
                                {fileInfo?.html_url && (
                                    <a
                                        href={fileInfo.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-4 hover:opacity-70"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        View file on GitHub
                                    </a>
                                )}
                            </div>
                        )}

                        {!loading && !error && content && (
                            <>
                                {isMarkdown ? (
                                    <div className="file-preview-markdown prose-sm max-w-none p-6" style={{ color: 'var(--foreground)' }}>
                                        <ReactMarkdown>{content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <pre 
                                            className="text-sm font-mono overflow-x-auto p-6 m-0 leading-relaxed"
                                            style={{ 
                                                color: 'var(--foreground)',
                                                background: 'var(--background)',
                                                margin: 0,
                                            }}
                                        >
                                            <code 
                                                className="hljs"
                                                dangerouslySetInnerHTML={{ __html: highlightedCode || content }}
                                                style={{ 
                                                    display: 'block',
                                                    whiteSpace: 'pre',
                                                    wordWrap: 'normal',
                                                }}
                                            />
                                        </pre>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 backdrop-blur-sm flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)' }}>
                        <span>{content ? `${content.split('\n').length} lines` : 'N/A'}</span>
                        <span>{fileInfo?.size ? `${(fileInfo.size / 1024).toFixed(2)} KB` : '0 KB'}</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
