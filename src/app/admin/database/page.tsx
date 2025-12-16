"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Search, Trash2, Edit, RefreshCw, Plus, X, DollarSign, Database, Users, CreditCard, Shield, Download, Trash, Copy, Eye } from 'lucide-react';

export default function AdminDatabasePage() {
    const [visitorId, setVisitorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Database management state
    const [allVisitors, setAllVisitors] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
    const [showBulkActionModal, setShowBulkActionModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [visitorToBlock, setVisitorToBlock] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'visitors' | 'payments'>('visitors');
    const [selectedVisitors, setSelectedVisitors] = useState<Set<string>>(new Set());
    const [sortField, setSortField] = useState<string>('lastSeen');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

    // Load all visitors
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

    // Load payments
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

    const openBlockModal = (vid: string) => {
        setVisitorToBlock(vid);
        setBlockReason('');
        setShowBlockModal(true);
    };

    const blockVisitor = async () => {
        if (!visitorToBlock) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'block-visitor',
                    visitorId: visitorToBlock,
                    reason: blockReason || 'Blocked by admin'
                })
            });

            const data = await res.json();
            if (data.success) {
                setShowBlockModal(false);
                setVisitorToBlock(null);
                setBlockReason('');
                loadVisitors();
                setResult({ success: true, message: 'Visitor blocked successfully' });
                setTimeout(() => setResult(null), 3000);
            } else {
                setError(data.error || 'Failed to block');
            }
        } catch (e: any) {
            setError(e.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    const unblockVisitor = async (vid: string) => {
        if (!confirm(`Unblock visitor ${vid.substring(0, 12)}...?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'unblock-visitor',
                    visitorId: vid
                })
            });

            const data = await res.json();
            if (data.success) {
                loadVisitors();
                setResult({ success: true, message: 'Visitor unblocked successfully' });
                setTimeout(() => setResult(null), 3000);
            } else {
                setError(data.error || 'Failed to unblock');
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

    // Bulk actions
    const toggleSelectAll = () => {
        if (selectedVisitors.size === filteredVisitors.length) {
            setSelectedVisitors(new Set());
        } else {
            setSelectedVisitors(new Set(filteredVisitors.map(v => v.visitorId)));
        }
    };

    const toggleSelectVisitor = (visitorId: string) => {
        const newSet = new Set(selectedVisitors);
        if (newSet.has(visitorId)) {
            newSet.delete(visitorId);
        } else {
            newSet.add(visitorId);
        }
        setSelectedVisitors(newSet);
    };

    const bulkGrantUnlimited = async () => {
        if (selectedVisitors.size === 0) return;
        if (!confirm(`Grant unlimited access to ${selectedVisitors.size} visitors?`)) return;

        setLoading(true);
        try {
            for (const vid of selectedVisitors) {
                await fetch('/api/billing/process-checkout?session_id=manual&visitorId=' + encodeURIComponent(vid), {
                    method: 'POST'
                });
            }
            setResult({ success: true, message: `Granted unlimited to ${selectedVisitors.size} visitors` });
            setSelectedVisitors(new Set());
            loadVisitors();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
            setShowBulkActionModal(false);
        }
    };

    const bulkDelete = async () => {
        if (selectedVisitors.size === 0) return;
        if (!confirm(`DELETE ${selectedVisitors.size} visitors permanently?`)) return;

        setLoading(true);
        try {
            for (const vid of selectedVisitors) {
                await fetch('/api/admin/db', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete-visitor', visitorId: vid })
                });
            }
            setResult({ success: true, message: `Deleted ${selectedVisitors.size} visitors` });
            setSelectedVisitors(new Set());
            loadVisitors();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
            setShowBulkActionModal(false);
        }
    };

    const bulkResetUsage = async () => {
        if (selectedVisitors.size === 0) return;
        if (!confirm(`Reset usage for ${selectedVisitors.size} visitors?`)) return;

        setLoading(true);
        try {
            for (const vid of selectedVisitors) {
                await fetch('/api/admin/db', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reset-usage', visitorId: vid })
                });
            }
            setResult({ success: true, message: `Reset usage for ${selectedVisitors.size} visitors` });
            setSelectedVisitors(new Set());
            loadVisitors();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
            setShowBulkActionModal(false);
        }
    };

    const exportData = () => {
        const data = {
            visitors: allVisitors,
            payments: payments,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `repoinfo-export-${Date.now()}.json`;
    const stats = {
        totalVisitors: allVisitors.length,
        unlimitedVisitors: allVisitors.filter(v => v.billing?.unlimited && !v.billing?.blocked).length,
        blockedVisitors: allVisitors.filter(v => v.billing?.blocked).length,
        paidVisitors: allVisitors.filter(v => v.billing?.plan).length,
        totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        totalQueries: allVisitors.reduce((sum, v) => sum + (v.queryCount || 0), 0),
    };  setResult({ success: true, message: 'Visitor ID copied!' });
        setTimeout(() => setResult(null), 2000);
    };

    const viewPaymentDetails = (payment: any) => {
        setSelectedPayment(payment);
        setShowPaymentDetailsModal(true);
    };

    const deletePayment = async (paymentId: string) => {
        if (!confirm('Delete this payment record?')) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/db', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete-payment',
                    paymentId
                })
            });

            const data = await res.json();
            if (data.success) {
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white dark:bg-[#071024] rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalVisitors}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Visitors</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#071024] rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.unlimitedVisitors}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Unlimited Active</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#071024] rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.blockedVisitors}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Blocked Users</div>
                            </div>
                        </div>
                    </div>l ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }
            
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

    const filteredPayments = payments.filter(p =>
        p.visitorId?.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
        p.plan?.toLowerCase().includes(paymentSearchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-[#0a0d1a] dark:via-[#0b1020] dark:to-[#0a0d1a] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Admin Database Management
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Full control over visitor access, billing, payments and database records
                            </p>
                        </div>
                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export All Data
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white dark:bg-[#071024] rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalVisitors}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Visitors</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#071024] rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.unlimitedVisitors}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Unlimited Users</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#071024] rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.paidVisitors}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Paid Plans</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#071024] rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                                <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">${stats.totalRevenue}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Revenue</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#071024] rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/20">
                                <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalQueries}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Queries</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Grant Access Card */}
                <div className="bg-white dark:bg-[#071024] rounded-2xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-800 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                {/* Visitors Tab */}
                {activeTab === 'visitors' && (
                    <div className="bg-white dark:bg-[#071024] rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">All Visitors</h2>
                                    {selectedVisitors.size > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {selectedVisitors.size} selected
                                            </span>
                                            <button
                                                onClick={() => setShowBulkActionModal(true)}
                                                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                                            >
                                                Bulk Actions
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={loadVisitors}
                                    disabled={refreshing}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                            
                            <div className="flex gap-3 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by visitor ID, plan, or country..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>
                                <select
                                    value={sortField}
                                    onChange={(e) => setSortField(e.target.value)}
                                    className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                >
                                    <option value="lastSeen">Last Seen</option>
                                    <option value="queryCount">Query Count</option>
                                    <option value="createdAt">Created At</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                {/* Status Messages */}
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

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('visitors')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'visitors'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white dark:bg-[#071024] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                        }`}
                    >
                        <Database className="w-4 h-4 inline mr-2" />
                        Visitors ({allVisitors.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'payments'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white dark:bg-[#071024] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                        }`}
                    >
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedVisitors.size === filteredVisitors.length && filteredVisitors.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-zinc-300 dark:border-zinc-700"
                                            />
                                        </th>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {filteredVisitors.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                                {searchTerm ? 'No visitors found matching your search' : 'No visitors yet'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredVisitors.map((visitor) => (
                                            <tr key={visitor.visitorId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedVisitors.has(visitor.visitorId)}
                                                        onChange={() => toggleSelectVisitor(visitor.visitorId)}
                                                        className="rounded border-zinc-300 dark:border-zinc-700"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
                                                            {visitor.visitorId.substring(0, 12)}...
                                                        </div>
                                                        <button
                                                            onClick={() => copyVisitorId(visitor.visitorId)}
                                                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                                                            title="Copy full ID"
                                                        >
                                                            <Copy className="w-3 h-3 text-zinc-400" />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{visitor.country || 'Unknown'}</div>
                                                </td>
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
                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="bg-white dark:bg-[#071024] rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
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
                            
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={paymentSearchTerm}
                                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                                    placeholder="Search by visitor ID, email, or plan..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100"
                                />
                            </div>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                                {paymentSearchTerm ? 'No payments found matching your search' : 'No payment records yet'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment, idx) => (
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

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="bg-white dark:bg-[#071024] rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
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
                        </div>

                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                                                        {payment.status || 'completed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => viewPaymentDetails(payment)}
                                                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                                                            title="View Details"
                                                        >
                {/* Block Modal */}
                {showBlockModal && visitorToBlock && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-[#071024] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Block Visitor</h3>
                                <button onClick={() => setShowBlockModal(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                    Visitor ID: <span className="font-mono text-zinc-900 dark:text-zinc-100">{visitorToBlock.substring(0, 12)}...</span>
                                </div>
                                
                                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                                    Block Reason (optional)
                                </label>
                                <textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="e.g., Abuse, Spam, Terms violation..."
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0b1020] text-zinc-900 dark:text-zinc-100 resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBlockModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={blockVisitor}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Blocking...' : 'Block Visitor'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Details Modal */}
                {showPaymentDetailsModal && selectedPayment && (>
                                                        <button
                                                            onClick={() => copyVisitorId(payment.visitorId)}
                                                            className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                                                            title="Copy Visitor ID"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deletePayment(payment._id)}
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

                {/* Bulk Actions Modal */}
                {showBulkActionModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-[#071024] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Bulk Actions</h3>
                                <button onClick={() => setShowBulkActionModal(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                                {selectedVisitors.size} visitor(s) selected
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={bulkGrantUnlimited}
                                    disabled={loading}
                                    className="w-full px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors text-left flex items-center gap-3"
                                >
                                    <Shield className="w-5 h-5" />
                                    Grant Unlimited Access
                                </button>

                                <button
                                    onClick={bulkResetUsage}
                                    disabled={loading}
                                    className="w-full px-4 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors text-left flex items-center gap-3"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Reset Usage Counts
                                </button>

                                <button
                                    onClick={bulkDelete}
                                    disabled={loading}
                                    className="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors text-left flex items-center gap-3"
                                >
                                    <Trash className="w-5 h-5" />
                                    Delete Permanently
                                </button>

                                <button
                                    onClick={() => setShowBulkActionModal(false)}
                                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Details Modal */}
                {showPaymentDetailsModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-[#071024] rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Payment Details</h3>
                                <button onClick={() => setShowPaymentDetailsModal(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Payment ID</label>
                                        <div className="text-sm font-mono text-zinc-900 dark:text-zinc-100">{selectedPayment._id}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Date</label>
                                        <div className="text-sm text-zinc-900 dark:text-zinc-100">
                                            {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Amount</label>
                                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                            ${selectedPayment.amount} {selectedPayment.currency}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Plan</label>
                                        <div className="text-sm text-zinc-900 dark:text-zinc-100">{selectedPayment.plan}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Visitor ID</label>
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-mono text-zinc-900 dark:text-zinc-100 flex-1">{selectedPayment.visitorId}</div>
                                        <button
                                            onClick={() => copyVisitorId(selectedPayment.visitorId)}
                                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {selectedPayment.email && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Email</label>
                                        <div className="text-sm text-zinc-900 dark:text-zinc-100">{selectedPayment.email}</div>
                                    </div>
                                )}

                                {selectedPayment.stripeSessionId && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Stripe Session ID</label>
                                        <div className="text-sm font-mono text-zinc-900 dark:text-zinc-100">{selectedPayment.stripeSessionId}</div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Status</label>
                                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                                        {selectedPayment.status || 'completed'}
                                    </span>
                                </div>

                                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Raw Data</h4>
                                    <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg overflow-x-auto">
                                        {JSON.stringify(selectedPayment, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
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

                {/* Edit Modal */}
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

                {/* Payment Modal */}
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
