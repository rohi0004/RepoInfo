"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface CongratsModalProps {
    isOpen: boolean;
    title?: string;
    message?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

export function CongratsModal({
    isOpen,
    title = "Congratulations!",
    message = "You've reached the free query limit. In this development environment you can claim temporary unlimited access to continue testing.",
    confirmText = "Claim Temporary Access",
    cancelText = "Maybe Later",
    onConfirm,
    onCancel,
}: CongratsModalProps) {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const handleConfirm = async () => {
        setError(null);
        setLoading(true);
        try {
            const maybe = onConfirm();
            if (maybe && typeof (maybe as any).then === "function") await maybe;
        } catch (e: any) {
            console.error("CongratsModal onConfirm error", e);
            setError(e?.message || String(e) || "Failed to claim access");
            setLoading(false);
            return;
        }
        setLoading(false);
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl"
                        style={{ background: 'linear-gradient(180deg, rgba(17,24,39,0.96), rgba(17,24,39,0.94))', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                        <div className="p-6 pt-8 pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                                        {/* Decorative burst - simple star */}
                                        <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="32" cy="32" r="30" fill="rgba(255,255,255,0.02)" />
                                            <path d="M32 16L36 28L48 28L38 34L42 46L32 38L22 46L26 34L16 28L28 28L32 16Z" fill="white" fillOpacity="0.9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-extrabold" style={{ color: 'white' }}>{title}</h2>
                                        <div className="mt-2 text-sm text-zinc-300 max-w-md">{message}</div>
                                    </div>
                                </div>
                                <button onClick={onCancel} className="p-2 rounded-lg hover:opacity-80 text-zinc-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-2 border-t" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                            {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-white ${loading ? 'opacity-60 cursor-wait' : 'bg-gradient-to-r from-purple-600 to-pink-500'}`}
                                >
                                    {loading ? 'Processing...' : confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
