'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Search, Trash2, Edit, RefreshCw, Plus, X, DollarSign, Database } from 'lucide-react';

export default function AdminDatabasePage() {
    const [visitorId, setVisitorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [allVisitors, setAllVisitors] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'visitors' | 'payments'>('visitors');
    const [editForm, setEditForm] = useState({
        plan: '',
        extraQueries: 0,
        unlimited: false,
        activeUntil: ''
    });
    const [paymentForm, setPaymentForm] = useState({
        visitorId: '',
        amount: 0,
        currency: 'USD',
        plan: 'pro_yearly',
        email: '',
        stripeSessionId: ''
    });
    const [refreshing, setRefreshing] = useState(false);

    const loadVisitors = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/admin/db?action=all-visitors');
            const data = await res.json();
            if (data.visitors) {
                setAllVisitors(data.visitors);
            }
        } catch (e: any) {
            console.error('Failed to load visitors:', e);
        } finally {
            setRefreshing(false);
        }
    };

    const loadPayments = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/admin/db?action=payments');
            const data = await res.json();
            if (data.payments) {
                setPayments(data.payments);
            }
        } catch (e: any) {
            console.error('Failed to load payments:', e);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadVisitors();
        loadPayments();
    }, []);

    const grantUnlimited = async () => {
        if (!visitorId.trim()) {
            setError('Please enter a visitor ID');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/billing/process-checkout?session_id=manual&visitorId=' + encodeURIComponent(visitorId.trim()), {
                method: 'POST'
            });

            const data = await res.json();
            
            if (data.success) {
                setResult({ success: true, message: 'Unlimited access granted!', data });
                loadVisitors();
                setVisitorId('');
            } else {
                setError(data.error || 'Failed to grant access');
            }
        } catch (e: any) {
            setError(e.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (visitor: any) => {
        setSelectedVisitor(visitor);
        setEditForm({
            plan: visitor.billing?.plan || '',
            extraQueries: visitor.billing?.extraQueries || 0,
            unlimited: visitor.billing?.unlimited || false,
            activeUntil: visitor.billing?.activeUntil ? new Date(visitor.billing.activeUntil).toISOString().split('T')[0] : ''
        });
        setShowEditModal(true);
    };

    const saveEdit = async () => {
        if (!selectedVisitor) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update-billing',
                    visitorId: selectedVisitor.visitorId,
                    data: editForm
                })
            });

            const data = await res.json();
            if (data.success) {
                setShowEditModal(false);
                setSelectedVisitor(null);
                loadVisitors();
                setResult({ success: true, message: 'Updated successfully' });
                setTimeout(() => setResult(null), 3000);
            } else {
                setError(data.error || 'Failed to update');
            }
        } catch (e: any) {
            setError(e.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const deleteVisitor = async (vid: string) => {
        if (!confirm(`Are you sure you want to delete visitor ${vid}?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete-visitor',
                    visitorId: vid
                })
            });

            const data = await res.json();
            if (data.success) {
                loadVisitors();
                setResult({ success: true, message: 'Deleted successfully' });
                setTimeout(() => setResult(null), 3000);
            } else {
                setError(data.error || 'Failed to delete');
            }
        } catch (e: any) {
            setError(e.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const resetUsage = async (vid: string) => {
        if (!confirm(`Reset query count for visitor ${vid}?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reset-usage',
                    visitorId: vid
                })
            });

            const data = await res.json();
            if (data.success) {
                loadVisitors();
                setResult({ success: true, message: 'Usage reset successfully' });
                setTimeout(() => setResult(null), 3000);
            } else {
                setError(data.error || 'Failed to reset');
            }
        } catch (e: any) {
            setError(e.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const recordPayment = async () => {
        if (!paymentForm.visitorId || !paymentForm.amount) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'record-payment',
                    data: paymentForm
                })
            });

            const data = await res.json();
            if (data.success) {
                setShowPaymentModal(false);
                setPaymentForm({
                    visitorId: '',
                    amount: 0,
                    currency: 'USD',
                    plan: 'pro_yearly',
                    email: '',
                    stripeSessionId: ''
                });
                loadPayments();
                setResult({ success: true, message: 'Payment recorded successfully' });
                setTimeout(() => setResult(null), 3000);
            } else {
                setError(data.error || 'Failed to record payment');
            }
        } catch (e: any) {
            setError(e.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const filteredVisitors = allVisitors.filter(v => 
        v.visitorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.billing?.plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#0a0d1a] dark:via-[#0b1020] dark:to-[#0a0d1a] py-4 sm:py-8 px-3 sm:px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="mb-4">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Admin Database Management
                        </h1>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Manage visitor access, billing, payments and database records
                    </p>
                </div>

                <div className="bg-white dark:bg-[#071024] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-zinc-200 dark:border-zinc-800 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Quick Grant Unlimited Access</h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <input
                            type="text"
                            value={visitorId}
                            onChange={(e) => setVisitorId(e.target.value)}
                            placeholder="Enter visitor ID..."
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-sm sm:text-base text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex gap-2 sm:gap-4">
                            <button
                                onClick={grantUnlimited}
                                disabled={loading || !visitorId.trim()}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm sm:text-base font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                            >
                                {loading ? 'Granting...' : 'Grant Access'}
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-medium hover:opacity-90 transition-all whitespace-nowrap"
                            >
                                Record Payment
                            </button>
                            <button
                                onClick={async () => {
                                    if (!confirm('Grant unlimited access to ALL visitors? This will update every visitor record.')) return;
                                    setLoading(true);
                                    setError(null);
                                    setResult(null);
                                    try {
                                        let successCount = 0;
                                        for (const v of allVisitors) {
                                            try {
                                                const res = await fetch('/api/billing/test-unlimited', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ visitorId: v.visitorId })
                                                });
                                                const data = await res.json();
                                                if (data?.success) successCount++;
                                            } catch (e) {
                                                // ignore individual errors
                                            }
                                        }
                                        loadVisitors();
                                        setResult({ success: true, message: `Unlimited granted to ${successCount} visitors` });
                                        setTimeout(() => setResult(null), 5000);
                                    } catch (e: any) {
                                        setError(e.message || 'Failed to grant to all');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm sm:text-base font-medium hover:opacity-90 transition-all whitespace-nowrap"
                            >
                                Grant All Unlimited
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800 dark:text-red-200 flex-1">{error}</div>
                        <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {result?.success && (
                    <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-800 dark:text-green-200 flex-1">{result.message || 'Operation successful!'}</div>
                        <button onClick={() => setResult(null)} className="text-green-600 dark:text-green-400">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('visitors')}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                            activeTab === 'visitors'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white dark:bg-[#071024] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                        }`}
                    >
                        <Database className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                        Visitors ({allVisitors.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                            activeTab === 'payments'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white dark:bg-[#071024] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                        }`}
                    >
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                        Payments ({payments.length})
                    </button>
                </div>

                {activeTab === 'visitors' && (
                    <div className="bg-white dark:bg-[#071024] rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">All Visitors</h2>
                                <button
                                    onClick={loadVisitors}
                                    disabled={refreshing}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                            
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by visitor ID, plan, or country..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Visitor ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Queries</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Plan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Last Seen</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {filteredVisitors.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                                {searchTerm ? 'No visitors found matching your search' : 'No visitors yet'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredVisitors.map((visitor) => (
                                            <tr key={visitor.visitorId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
                                                        {visitor.visitorId.substring(0, 12)}...
                                                    </div>
                                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{visitor.country || 'Unknown'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-zinc-900 dark:text-zinc-100">{visitor.queryCount || 0}</div>
                                                    {visitor.billing?.extraQueries > 0 && (
                                                        <div className="text-xs text-blue-600 dark:text-blue-400">+{visitor.billing.extraQueries} extra</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-zinc-900 dark:text-zinc-100">
                                                        {visitor.billing?.plan || 'Free'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {visitor.billing?.unlimited ? (
                                                        <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                                                            Unlimited
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                                                            Limited
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                    {visitor.lastSeen ? new Date(visitor.lastSeen).toLocaleString() : 'Never'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(visitor)}
                                                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => resetUsage(visitor.visitorId)}
                                                            className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 transition-colors"
                                                            title="Reset Usage"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteVisitor(visitor.visitorId)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="bg-white dark:bg-[#071024] rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Payment Records</h2>
                                <button
                                    onClick={loadPayments}
                                    disabled={refreshing}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                            
                            {/* Payment Summary Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="p-3 sm:p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                    <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total Payments</div>
                                    <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{payments.length}</div>
                                </div>
                                <div className="p-3 sm:p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                    <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total Revenue</div>
                                    <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                                        ${payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                    <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-1">Monthly Plans</div>
                                    <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {payments.filter(p => p.plan === 'pro_monthly').length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Visitor ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Plan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                                No payment records yet
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment, idx) => (
                                            <tr key={payment._id || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                    {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono text-zinc-900 dark:text-zinc-100">
                                                    {payment.visitorId ? payment.visitorId.substring(0, 12) + '...' : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    ${payment.amount} {payment.currency}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                                                    {payment.plan}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                    {payment.email || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                                                        {payment.status || 'completed'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {showEditModal && selectedVisitor && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-[#071024] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Visitor</h3>
                                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Visitor ID</label>
                                    <input
                                        type="text"
                                        value={selectedVisitor.visitorId}
                                        disabled
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Plan</label>
                                    <select
                                        value={editForm.plan}
                                        onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                    >
                                        <option value="">None (Free)</option>
                                        <option value="pro_monthly">Pro Monthly</option>
                                        <option value="pro_yearly">Pro Yearly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Extra Queries</label>
                                    <input
                                        type="number"
                                        value={editForm.extraQueries}
                                        onChange={(e) => setEditForm({ ...editForm, extraQueries: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="unlimited"
                                        checked={editForm.unlimited}
                                        onChange={(e) => setEditForm({ ...editForm, unlimited: e.target.checked })}
                                        className="rounded border-zinc-300 dark:border-zinc-700"
                                    />
                                    <label htmlFor="unlimited" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Unlimited Access
                                    </label>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveEdit}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-[#071024] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Record Payment</h3>
                                <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Visitor ID *</label>
                                    <input
                                        type="text"
                                        value={paymentForm.visitorId}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, visitorId: e.target.value })}
                                        placeholder="e.g., 65891f41-ce3a..."
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Amount *</label>
                                        <input
                                            type="number"
                                            value={paymentForm.amount}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                                            placeholder="99.00"
                                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Currency</label>
                                        <select
                                            value={paymentForm.currency}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Plan</label>
                                    <select
                                        value={paymentForm.plan}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, plan: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                    >
                                        <option value="pro_monthly">Pro Monthly</option>
                                        <option value="pro_yearly">Pro Yearly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Email</label>
                                    <input
                                        type="email"
                                        value={paymentForm.email}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                                        placeholder="customer@example.com"
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Stripe Session ID</label>
                                    <input
                                        type="text"
                                        value={paymentForm.stripeSessionId}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, stripeSessionId: e.target.value })}
                                        placeholder="cs_test_..."
                                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={recordPayment}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Recording...' : 'Record Payment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
