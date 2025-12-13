import { useRef, useEffect, useState } from "react";
import { Send, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    fileTree?: any[];
    onFileSelect?: (filePath: string) => void;
}

export function ChatInput({ value, onChange, onSubmit, placeholder, disabled, loading, fileTree = [], onFileSelect }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showFileSuggestions, setShowFileSuggestions] = useState(false);
    const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(pointer: coarse)').matches);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // File suggestion logic
    useEffect(() => {
        const text = value;
        const lastSlashIndex = text.lastIndexOf('/');
        
        if (lastSlashIndex !== -1) {
            const afterSlash = text.slice(lastSlashIndex + 1);
            const beforeSlash = text.slice(0, lastSlashIndex);
            
            // Check if this looks like a file command (not a URL)
            const isFileCommand = !beforeSlash.includes('http') && !beforeSlash.includes('://') && 
                                 (lastSlashIndex === 0 || text[lastSlashIndex - 1] === ' ' || lastSlashIndex === text.length - 1 || afterSlash.length > 0);
            
            if (isFileCommand && fileTree.length > 0) {
                const searchTerm = afterSlash.toLowerCase();
                const matches = fileTree
                    .filter((f: any) => {
                        const fileName = f.path.split('/').pop().toLowerCase();
                        const fullPath = f.path.toLowerCase();
                        return fileName.includes(searchTerm) || fullPath.includes(searchTerm);
                    })
                    .slice(0, 10);
                
                setFilteredFiles(matches);
                setShowFileSuggestions(matches.length > 0);
                setSelectedIndex(0);
            } else {
                setShowFileSuggestions(false);
            }
        } else {
            setShowFileSuggestions(false);
        }
    }, [value, fileTree]);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 200);
            textarea.style.height = `${newHeight}px`;

            // Only show scrollbar if content exceeds max height
            if (textarea.scrollHeight > 200) {
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showFileSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, filteredFiles.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (filteredFiles[selectedIndex]) {
                    handleFileSelect(filteredFiles[selectedIndex].path);
                }
                return;
            } else if (e.key === 'Escape') {
                setShowFileSuggestions(false);
            }
        } else if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    const handleFileSelect = (filePath: string) => {
        const lastSlashIndex = value.lastIndexOf('/');
        const newValue = value.slice(0, lastSlashIndex + 1) + filePath + ' ';
        onChange(newValue);
        setShowFileSuggestions(false);
        if (onFileSelect) {
            onFileSelect(filePath);
        }
        textareaRef.current?.focus();
    };

    return (
        <div className="relative">
            {/* File Suggestions Dropdown */}
            {showFileSuggestions && filteredFiles.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-lg overflow-hidden border z-50"
                    style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}
                >
                    <div className="p-2 text-xs font-medium" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                        Select a file (↑↓ to navigate, Enter to select)
                    </div>
                    {filteredFiles.map((file, index) => (
                        <button
                            key={file.path}
                            onClick={() => handleFileSelect(file.path)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2",
                                index === selectedIndex && "bg-opacity-10"
                            )}
                            style={{
                                background: index === selectedIndex ? 'var(--accent)' : 'transparent',
                                color: index === selectedIndex ? 'var(--foreground)' : 'var(--muted)',
                                opacity: index === selectedIndex ? 1 : 0.8
                            }}
                        >
                            <FileCode className="w-4 h-4 shrink-0" />
                            <span className="truncate font-mono">{file.path}</span>
                        </button>
                    ))}
                </div>
            )}

            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className={cn(
                    "w-full rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 transition-all resize-none min-h-[48px] max-h-[200px]",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--border) transparent',
                    overflowY: 'hidden' // Default to hidden
                }}
            />
            <button
                type="submit"
                disabled={!value.trim() || loading || disabled}
                className="absolute right-2 bottom-2 p-2 transition-colors disabled:opacity-50"
                style={{ color: 'var(--accent)' }}
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
    );
}
