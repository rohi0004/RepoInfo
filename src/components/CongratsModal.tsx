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
    // detect theme (dark mode) using several fallbacks
    const [isDark, setIsDark] = useState<boolean>(true);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const detect = () => {
            try {
                // prefer explicit html class (common in Tailwind setups)
                const html = document.documentElement;
                if (html.classList.contains('dark')) return true;
                // check prefers-color-scheme
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return true;
                // fallback to body dataset
                if ((document.body as any).dataset?.theme === 'dark') return true;
            } catch (e) {
                // ignore
            }
            return false;
        };

        setIsDark(detect());
        const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setIsDark(detect());
        try { mq && mq.addEventListener && mq.addEventListener('change', handler); } catch(e) { /* noop */ }
        return () => { try { mq && mq.removeEventListener && mq.removeEventListener('change', handler); } catch(e) { /* noop */ } };
    }, []);

    useEffect(() => setMounted(true), []);

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

    // Sparkles overlay: page-wide animated particles
    const SparklesOverlay = ({ count = 18 }: { count?: number }) => {
        const sparks = Array.from({ length: count }).map((_, i) => {
            const startX = Math.random() * 100; // percent
            const startY = -10 - Math.random() * 20; // start slightly above viewport
            const endX = startX + (Math.random() * 40 - 20); // drift
            const endY = 80 + Math.random() * 40; // end below
            const delay = Math.random() * 0.6;
            const size = 6 + Math.floor(Math.random() * 10);
            const rotate = Math.random() * 360;
            return { startX, startY, endX, endY, delay, size, rotate, key: `s-${i}` };
        });

        return (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
                {sparks.map(s => (
                    <motion.div
                        key={s.key}
                        initial={{ opacity: 0, x: `${s.startX}%`, y: `${s.startY}%`, scale: 0.4, rotate: 0 }}
                        animate={{ opacity: [0, 1, 0], x: [`${s.startX}%`, `${s.endX}%`], y: [`${s.startY}%`, `${s.endY}%`], scale: [0.4, 1, 0.8], rotate: [0, s.rotate] }}
                        transition={{ delay: s.delay, duration: 2.2 + Math.random() * 0.6, ease: 'circOut' }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            transform: `translate(${s.startX}vw, ${s.startY}vh)`,
                            width: s.size,
                            height: s.size,
                            borderRadius: 8,
                            background: isDark ? 'radial-gradient(circle at 30% 30%, #fff, #ffd6f3)' : 'radial-gradient(circle at 30% 30%, #fff, #f0f9ff)',
                            boxShadow: isDark ? '0 6px 20px rgba(124,58,237,0.12)' : '0 6px 20px rgba(59,130,246,0.12)'
                        }}
                    />
                ))}
            </div>
        );
    };

    // Sparkle particles for page-wide fly effect
    const [particles, setParticles] = useState<Array<{id:number; dx:number; dy:number; size:number; color:string;}>>([]);
    useEffect(() => {
        if (!isOpen) return;
        const colors = isDark
            ? ['#fff5fb', '#ffd6f3', '#ffecbf', '#c7b3ff']
            : ['#ffffff', '#c7e9ff', '#fff2cc', '#cfe8ff'];
        const count = 18;
        const list: any[] = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 260;
            list.push({
                id: Date.now() + i,
                dx: Math.cos(angle) * dist,
                dy: Math.sin(angle) * dist - 20,
                size: 6 + Math.random() * 12,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
        setParticles(list);
        const t = setTimeout(() => setParticles([]), 1200);
        return () => clearTimeout(t);
    }, [isOpen, isDark]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* page-wide particle layer (visible when modal opens) */}
                    <div className="pointer-events-none fixed inset-0 z-[100001]">
                        {particles.map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 1, x: '50%', y: '50%', scale: 0.3 }}
                                animate={{ opacity: [1, 0.9, 0], x: `calc(50% + ${p.dx}px)`, y: `calc(50% + ${p.dy}px)`, scale: [0.3, 1, 0.6] }}
                                transition={{ duration: 1.05, ease: 'circOut' }}
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    width: p.size,
                                    height: p.size,
                                    marginLeft: -p.size / 2,
                                    marginTop: -p.size / 2,
                                    borderRadius: p.size > 8 ? 4 : 2,
                                    background: p.color,
                                    boxShadow: `0 8px 20px ${p.color}22`,
                                }}
                            />
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: isDark
                                ? 'linear-gradient(180deg, rgba(12,18,28,0.98), rgba(17,24,39,0.96))'
                                : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,250,252,0.98))',
                            border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(2,6,23,0.04)'
                        }}
                    >
                        <div className="p-6 pt-8 pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{
                                        background: isDark ? 'linear-gradient(135deg,#7c3aed,#ec4899)' : 'linear-gradient(135deg,#06b6d4,#3b82f6)'
                                    }}>
                                        {/* Central badge (no star) */}
                                        <div className="w-12 h-12 rounded-full" style={{
                                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
                                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 6px 18px rgba(0,0,0,0.25)'
                                        }} />

                                        {/* Sparkle blast - animated small sparks */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            {[...Array(10)].map((_, i) => {
                                                const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
                                                const distance = 28 + Math.random() * 40;
                                                const x = Math.cos(angle) * distance;
                                                const y = Math.sin(angle) * distance - 6;
                                                const size = 5 + Math.random() * 10;
                                                const color = isDark ? (i % 2 ? '#ffd6f3' : '#fff5fb') : (i % 2 ? '#c7e9ff' : '#fff9db');
                                                return (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: 0, y: 0, scale: 0.2, rotate: 0 }}
                                                        animate={{ opacity: [0, 1, 0], x: [0, x], y: [0, y], scale: [0.2, 1, 0.5], rotate: [0, 90] }}
                                                        transition={{ delay: 0.06 * i, duration: 0.9 + Math.random() * 0.4, ease: 'easeOut' }}
                                                        style={{
                                                            position: 'absolute',
                                                            left: '50%',
                                                            top: '50%',
                                                            width: size,
                                                            height: size,
                                                            marginLeft: -size / 2,
                                                            marginTop: -size / 2,
                                                            borderRadius: size > 8 ? 3 : 2,
                                                            background: color,
                                                            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 8px 20px rgba(15,23,42,0.06)'
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-extrabold" style={{ color: isDark ? '#fff' : '#031024' }}>{title}</h2>
                                        <div className="mt-2 text-sm max-w-md" style={{ color: isDark ? 'rgba(255,255,255,0.78)' : 'rgba(2,6,23,0.7)' }}>{message}</div>
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
