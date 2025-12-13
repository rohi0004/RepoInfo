'use client';

import { useState } from 'react';
import { X, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

interface ProjectInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectInfoModal({ isOpen, onClose }: ProjectInfoModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.7)' }}>
            <div
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span style={{ color: 'var(--accent)' }}>ℹ️</span>
                        Project Information
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ background: 'var(--background)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* About Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span style={{ color: 'var(--accent)' }}>📌</span>
                            About RepoInfo
                        </h3>
                        <p style={{ color: 'var(--muted)' }} className="leading-relaxed">
                            RepoInfo is an intelligent repository analysis platform powered by AI. It helps developers understand codebases quickly, analyze dependencies, explore code structure, and get instant insights through interactive AI-powered conversations.
                        </p>
                    </section>

                    {/* Features Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span style={{ color: 'var(--accent)' }}>✨</span>
                            Key Features
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { icon: '🔍', title: 'Code Analysis', desc: 'Analyze repository structure and dependencies' },
                                { icon: '🤖', title: 'AI Conversations', desc: 'Chat with AI about your codebase' },
                                { icon: '📊', title: 'Insights', desc: 'Get quality metrics and security analysis' },
                                { icon: '🛡️', title: 'Security', desc: 'Vulnerability scanning and security reports' },
                                { icon: '📈', title: 'Statistics', desc: 'Track analytics and usage metrics' },
                                { icon: '🎨', title: 'Dark Mode', desc: 'Beautiful dark and light themes' }
                            ].map((feature, idx) => (
                                <li key={idx} className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                                    <span className="text-lg mt-1">{feature.icon}</span>
                                    <div>
                                        <p className="font-semibold">{feature.title}</p>
                                        <p style={{ color: 'var(--muted)' }} className="text-sm">{feature.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Developer Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span style={{ color: 'var(--accent)' }}>👨‍💻</span>
                            About Developer
                        </h3>
                        <div className="p-4 rounded-lg" style={{ background: 'var(--background)' }}>
                            <p className="font-semibold mb-2">Rohit Kumar</p>
                            <p style={{ color: 'var(--muted)' }} className="mb-4">
                                Full-stack developer passionate about building intelligent tools that help developers write better code. Experienced in AI integration, cloud platforms, and modern web technologies.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="https://www.linkedin.com/in/rohi0004/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-70"
                                    style={{ background: 'var(--surface)', color: 'var(--accent)' }}
                                >
                                    <Linkedin className="w-4 h-4" />
                                    LinkedIn
                                </Link>
                                <Link
                                    href="mailto:sahrohitkumar10@gmail.com"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-70"
                                    style={{ background: 'var(--surface)', color: 'var(--accent)' }}
                                >
                                    <Mail className="w-4 h-4" />
                                    Email
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Settings Section */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span style={{ color: 'var(--accent)' }}>⚡</span>
                            Settings
                        </h3>
                        <button
                            onClick={() => {
                                window.location.hash = '#' + btoa('916286');
                                window.location.href = '/admin/stats';
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity hover:opacity-70"
                            style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                        >
                            <span>📊</span>
                            Admin Analytics
                        </button>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    <p>RepoInfo © 2025 | Made with ❤️ by Rohit Kumar</p>
                </div>
            </div>
        </div>
    );
}
