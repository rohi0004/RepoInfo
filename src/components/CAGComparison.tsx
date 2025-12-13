"use client";

import { motion } from "framer-motion";
import { Check, X, Brain, Database, Zap, HardDrive } from "lucide-react";

export default function CAGComparison() {
    return (
        <section id="cag-comparison" className="py-24 px-4 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                        CAG vs. Traditional RAG
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
                        RepoInfo uses <strong>Context Augmented Generation (CAG)</strong>. We don't just retrieve fragments; we understand the whole picture.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Traditional RAG Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                        className="rounded-2xl p-8 backdrop-blur-sm hover:opacity-80 transition-all cursor-default"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-lg" style={{ background: 'var(--border)' }}>
                                <Database className="w-6 h-6" style={{ color: 'var(--muted)' }} />
                            </div>
                            <h3 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Traditional RAG</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-1 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <X className="w-4 h-4 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Fragmented Context</h4>
                                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Chops code into small, disconnected vector chunks.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-1 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <X className="w-4 h-4 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Similarity Search</h4>
                                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Relies on fuzzy matching which often misses logic.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-1 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <X className="w-4 h-4 text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Stateless</h4>
                                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Forgets everything after each query.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RepoInfo CAG Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        style={{ background: 'var(--accent)', borderColor: 'var(--accent)', opacity: 0.95 }}
                        className="border rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden hover:opacity-100 transition-all cursor-default"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full" />

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-semibold text-white">RepoInfo (CAG)</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Full File Context</h4>
                                    <p className="text-sm mt-1 text-white/80">Loads entire relevant files into the 1M+ token window.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">Smart Agent Selection</h4>
                                    <p className="text-sm mt-1 text-white/80">AI intelligently picks files based on dependency graphs.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                                    <Check className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">KV Caching</h4>
                                    <p className="text-sm mt-1 text-white/80">Remembers context for instant follow-up answers.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
