"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "danger" | "primary";
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "danger",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const confirmButtonStyles =
        confirmVariant === "danger"
            ? "bg-red-600 hover:bg-red-500 text-white"
            : "bg-purple-600 hover:bg-purple-500 text-white";

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 pb-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                    <AlertTriangle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{title}</h2>
                                    <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                                        {message}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onCancel}
                                className="p-1 rounded-lg transition-colors hover:opacity-70"
                                style={{ color: 'var(--muted)' }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 pt-4" style={{ background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--border)' }}>
                            <button
                                onClick={onCancel}
                                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors"
                                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const maybePromise = onConfirm();
                                        if (maybePromise && typeof (maybePromise as any).then === 'function') {
                                            await maybePromise;
                                        }
                                    } catch (e) {
                                        console.error('ConfirmDialog onConfirm error', e);
                                    } finally {
                                        onCancel();
                                    }
                                }}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${confirmButtonStyles}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
