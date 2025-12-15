"use client";
import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function GrantAccessPage() {
    const [visitorId, setVisitorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const grantUnlimited = async () => {
        if (!visitorId.trim()) {
            setError('Please enter a visitor ID');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/billing/test-unlimited', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId: visitorId.trim() })
            });

            const data = await res.json();
            
            if (data.success) {
                setResult(data);
                // Also fetch billing check to confirm
                const checkRes = await fetch(`/api/billing/check?visitorId=${encodeURIComponent(visitorId.trim())}`);
                const checkData = await checkRes.json();
                setResult({ ...data, check: checkData });
            } else {
                setError(data.error || 'Failed to grant access');
            }
        } catch (e: any) {
            setError(e.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const autoFillFromStorage = () => {
        const stored = localStorage.getItem('visitor_id');
        if (stored) {
            setVisitorId(stored);
        } else {
            setError('No visitor ID found in localStorage');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b1020] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-[#071024] rounded-2xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
                    <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Grant Unlimited Access</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">Manually grant unlimited access to a visitor after payment completion</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Visitor ID</label>
                            <input
                                type="text"
                                value={visitorId}
                                onChange={(e) => setVisitorId(e.target.value)}
                                placeholder="Enter visitor ID (e.g., c3e9b4aa-d733-471b-8a9e-475125fb980c)"
                                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={autoFillFromStorage}
                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Auto-fill from localStorage
                            </button>
                        </div>

                        <button
                            onClick={grantUnlimited}
                            disabled={loading || !visitorId.trim()}
                            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                    Granting Access...
                                </span>
                            ) : (
                                'Grant Unlimited Access'
                            )}
                        </button>

                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium text-green-800 dark:text-green-200">Unlimited access granted successfully!</div>
                                        <div className="text-xs text-green-700 dark:text-green-300 mt-1">Visitor ID: {result.visitorId}</div>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 dark:bg-[#0b1020] rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                                    <h3 className="text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Billing Status</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-600 dark:text-zinc-400">Plan:</span>
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.data?.plan}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-600 dark:text-zinc-400">Unlimited:</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">{result.data?.unlimited === '1' ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-600 dark:text-zinc-400">Extra Queries:</span>
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.data?.extraQueries}</span>
                                        </div>
                                        {result.check && (
                                            <>
                                                <div className="border-t border-zinc-200 dark:border-zinc-800 my-2 pt-2"></div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-600 dark:text-zinc-400">Access Allowed:</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">{result.check.allowed ? 'Yes' : 'No'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-600 dark:text-zinc-400">Remaining:</span>
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.check.remaining === -1 ? 'Unlimited' : result.check.remaining}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <a
                                    href="/chat?q=rohi0004/AuthFeedbackSysytem"
                                    className="block w-full text-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Go to Chat
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">How to use:</h3>
                        <ol className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 list-decimal list-inside">
                            <li>Complete a payment through Stripe</li>
                            <li>Copy your visitor ID from localStorage or browser console</li>
                            <li>Paste it above and click "Grant Unlimited Access"</li>
                            <li>You'll now have unlimited queries!</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
