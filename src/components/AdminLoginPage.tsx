import { Lock, AlertCircle } from "lucide-react";

function AdminLoginPage({ isError }: { isError: boolean }) {
    'use client';

    return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <div className="max-w-md w-full">
                <div className="rounded-xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--accent)', opacity: 0.1 }}>
                            <Lock className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                            Enter the admin key to access the analytics dashboard
                        </p>
                    </div>

                    {isError && (
                        <div className="mb-6 p-4 rounded-lg border" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Invalid Key</span>
                            </div>
                            <p className="text-sm mt-1 opacity-90">
                                You have not permission to access the admin stats. Please enter the correct key.
                            </p>
                        </div>
                    )}

                    <form action="/admin/stats" method="get" className="space-y-4">
                        <div>
                            <label htmlFor="key" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Admin Key
                            </label>
                            <input
                                type="password"
                                id="key"
                                name="key"
                                placeholder="Enter admin key..."
                                className="w-full px-4 py-3 rounded-lg border font-mono text-center text-lg tracking-wider"
                                style={{
                                    background: 'var(--background)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--foreground)',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    const target = e.target as HTMLElement;
                                    target.style.borderColor = 'var(--accent)';
                                    target.style.boxShadow = '0 0 0 2px rgba(var(--accent-rgb), 0.2)';
                                }}
                                onBlur={(e) => {
                                    const target = e.target as HTMLElement;
                                    target.style.borderColor = 'var(--border)';
                                    target.style.boxShadow = 'none';
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                            style={{
                                background: 'var(--accent)',
                                color: 'var(--accent-foreground)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.opacity = '0.9';
                                target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.opacity = '1';
                                target.style.transform = 'translateY(0)';
                            }}
                        >
                            <Lock className="w-4 h-4" />
                            Access Admin Dashboard
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            This area is restricted to authorized administrators only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}