'use client';

import { Users, Activity, Smartphone, Monitor, Globe, Lock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export const dynamic = 'force-dynamic'; // Ensure real-time data

// Type definition for analytics data
type AnalyticsData = {
    totalVisitors?: number;
    totalQueries?: number;
    activeUsers24h?: number;
    deviceStats?: {
        desktop?: number;
        mobile?: number;
        tablet?: number;
        [key: string]: number | undefined;
    };
    countryStats?: Record<string, number>;
    recentVisitors?: Array<any>;
};

function AdminLoginPage({ isError }: { isError: boolean }) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '916286') {
            window.location.hash = '#' + btoa(password);
            window.location.reload();
        } else {
            alert('Invalid key');
        }
    };

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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="key" className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Admin Key
                            </label>
                            <input
                                type="password"
                                id="key"
                                placeholder="Enter admin key..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

interface AdminStatsPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function AdminStatsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        // Check authentication using hash
        const hash = window.location.hash.slice(1); // Remove '#' from beginning
        if (hash) {
            try {
                const decodedKey = atob(hash);
                if (decodedKey === '916286') {
                    setIsAuthenticated(true);
                } else {
                    setIsError(true);
                }
            } catch (e) {
                setIsError(true);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthenticated && !data) {
            // Fetch analytics data from API
            fetch('/api/admin/analytics')
                .then(res => res.json())
                .then(setData)
                .catch(err => console.error('Failed to fetch analytics:', err));
        }
    }, [isAuthenticated, data]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <AdminLoginPage isError={isError} />;
    }

    if (!data) {
        return <div>Loading analytics...</div>;
    }

    // Provide safe defaults for data structure
    const safeData = {
        totalVisitors: data?.totalVisitors || 0,
        totalQueries: data?.totalQueries || 0,
        activeUsers24h: data?.activeUsers24h || 0,
        deviceStats: data?.deviceStats || { desktop: 0, mobile: 0 },
        countryStats: data?.countryStats || {},
        recentVisitors: data?.recentVisitors || []
    };

    // Get current user debug info (client-side)
    const userAgent = navigator.userAgent;
    const country = "Client-side"; // Can't get country on client side easily
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || /Mobile/i.test(userAgent);

    return (
        <div className="min-h-screen p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold" style={{ background: 'linear-gradient(to right, var(--accent), #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Analytics Dashboard
                    </h1>
                    <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Debug Card */}
                <div className="rounded-xl p-4 mb-8" style={{ background: 'var(--surface)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                    <h3 className="font-mono text-sm mb-2 uppercase tracking-wider" style={{ color: '#eab308' }}>Your Current Session (Debug)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono" style={{ color: 'var(--muted)' }}>
                        <div>
                            <span style={{ opacity: 0.6 }}>Detected Country:</span> <span style={{ color: 'var(--foreground)' }}>{country || "Unknown"}</span>
                        </div>
                        <div>
                            <span style={{ opacity: 0.6 }}>Detected Device:</span> <span className={isMobile ? "text-orange-400" : "text-blue-400"}>{isMobile ? "Mobile" : "Desktop"}</span>
                        </div>
                        <div className="md:col-span-2 truncate">
                            <span style={{ opacity: 0.6 }}>User-Agent:</span> <span style={{ opacity: 0.4 }} title={userAgent}>{userAgent}</span>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Visitors"
                        value={safeData.totalVisitors}
                        icon={<Users className="w-5 h-5 text-purple-400" />}
                    />
                    <StatsCard
                        title="Total Queries"
                        value={safeData.totalQueries}
                        icon={<Activity className="w-5 h-5 text-blue-400" />}
                    />
                    <StatsCard
                        title="Active (24h)"
                        value={safeData.activeUsers24h}
                        icon={<Globe className="w-5 h-5 text-green-400" />}
                    />
                    <StatsCard
                        title="Mobile Users"
                        value={`${safeData.deviceStats.mobile || 0} (${Math.round(((safeData.deviceStats.mobile || 0) / (safeData.totalVisitors || 1)) * 100)}%)`}
                        icon={<Smartphone className="w-5 h-5 text-orange-400" />}
                    />
                </div>

                {/* Device & Country Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Monitor className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                            Device Breakdown
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(safeData.deviceStats).map(([device, count]) => (
                                <div key={device} className="flex items-center justify-between">
                                    <span className="capitalize" style={{ color: 'var(--foreground)' }}>{device}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                            <div
                                                className="h-full"
                                                style={{ width: `${(count / safeData.totalVisitors) * 100}%`, background: 'var(--accent)', opacity: 0.7 }}
                                            />
                                        </div>
                                        <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                            Top Countries
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(safeData.countryStats)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([country, count]) => (
                                    <div key={country} className="flex items-center justify-between">
                                        <span style={{ color: 'var(--foreground)' }}>{country}</span>
                                        <span className="font-mono text-sm" style={{ color: 'var(--muted)' }}>{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Visitors Table */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                        <h2 className="text-xl font-semibold">Recent Visitors</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="font-medium" style={{ background: 'var(--background)', color: 'var(--muted)' }}>
                                <tr>
                                    <th className="px-6 py-3">Visitor ID</th>
                                    <th className="px-6 py-3">Country</th>
                                    <th className="px-6 py-3">Device</th>
                                    <th className="px-6 py-3">Queries</th>
                                    <th className="px-6 py-3">Last Seen</th>
                                </tr>
                            </thead>
                            <tbody style={{ borderTop: '1px solid var(--border)' }}>
                                {safeData.recentVisitors.map((visitor) => (
                                    <tr key={visitor.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="px-6 py-4 font-mono text-xs" style={{ color: 'var(--muted)' }}>
                                            {visitor.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4" style={{ color: 'var(--foreground)' }}>{visitor.country}</td>
                                        <td className="px-6 py-4 capitalize" style={{ color: 'var(--foreground)' }}>{visitor.device}</td>
                                        <td className="px-6 py-4 font-mono" style={{ color: 'var(--foreground)' }}>{visitor.queryCount || 0}</td>
                                        <td className="px-6 py-4" style={{ color: 'var(--muted)' }}>
                                            {new Date(visitor.lastSeen).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {safeData.recentVisitors.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center" style={{ color: 'var(--muted)' }}>
                                            No visitors recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="rounded-xl p-6 flex items-center gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="p-3 rounded-lg" style={{ background: 'var(--accent)', opacity: 0.1 }}>
                {icon}
            </div>
            <div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>{title}</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</div>
            </div>
        </div>
    );
}
