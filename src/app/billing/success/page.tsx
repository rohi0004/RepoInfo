"use client";
import { useEffect, useState } from 'react';

export default function BillingSuccessPage() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const session_id = params.get('session_id');
                if (!session_id) {
                    setError('Missing session id');
                    setLoading(false);
                    return;
                }

                const res = await fetch(`/api/billing/session?session_id=${encodeURIComponent(session_id)}`);
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                    setLoading(false);
                    return;
                }
                setSession(data.session);
                
                // Automatically grant unlimited access (fallback if webhook doesn't fire)
                const visitorId = data.session?.metadata?.visitorId;
                const planId = data.session?.metadata?.planId;
                if (visitorId && session_id) {
                    console.log('🔄 Auto-granting unlimited access for visitor:', visitorId, 'plan:', planId);
                    try {
                        const grantRes = await fetch(`/api/billing/process-checkout?session_id=${encodeURIComponent(session_id)}&visitorId=${encodeURIComponent(visitorId)}`, {
                            method: 'POST'
                        });
                        const grantData = await grantRes.json();
                        console.log('✅ Unlimited access granted:', grantData);
                        if (!grantData.success) {
                            console.warn('Grant may have failed:', grantData);
                        }
                    } catch (e) {
                        console.warn('Failed to auto-grant unlimited:', e);
                    }
                }
            } catch (e: any) {
                setError(e?.message || 'Failed to fetch session');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Auto-redirect immediately to stored return URL (repo chat)
    useEffect(() => {
        if (!session) return;
        const returnUrl = session?.metadata?.returnUrl || '/chat?welcome=1';
        // Redirect immediately
        window.location.href = returnUrl;
    }, [session]);

    const handleSendReceipt = async () => {
        if (!session) return;
        setSending(true);
        try {
            const res = await fetch('/api/billing/send-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: session.id })
            });
            const data = await res.json();
            if (data.ok) {
                alert('Receipt sent to customer email (if configured)');
            } else {
                alert(data.error || 'Failed to send receipt');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to send receipt');
        } finally {
            setSending(false);
        }
    };

    const handleDownload = () => {
        if (!session) return;
        (async () => {
            try {
                const res = await fetch(`/api/billing/receipt?session_id=${encodeURIComponent(session.id)}`);
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    alert(body.error || 'Failed to download receipt');
                    return;
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt_${session.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } catch (e) {
                console.error(e);
                alert('Failed to download receipt');
            }
        })();
    };

    if (loading || session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">Payment Successful! ✓</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Redirecting you back to your chat with unlimited access...</p>
                </div>
            </div>
        );
    }
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
            <div className="min-h-screen flex items-start justify-center p-8">
            <div className="max-w-3xl w-full bg-white dark:bg-[#061024] rounded-2xl p-8 shadow">
                <h1 className="text-2xl font-semibold mb-2">Payment {session?.payment_status === 'paid' ? 'Successful' : 'Processed'}</h1>
                <p className="text-sm text-zinc-600 mb-4">Thank you for your purchase. Below is your billing preview — you can send it to the customer's email or download it.</p>                <div className="bg-zinc-50 dark:bg-[#071024] p-4 rounded">
                    <div className="text-sm"><strong>Plan:</strong> {session?.metadata?.planId || '—'}</div>
                    <div className="text-sm"><strong>Visitor ID:</strong> {session?.metadata?.visitorId || '—'}</div>
                    <div className="text-sm"><strong>Customer email:</strong> {session?.customer_details?.email || session?.customer_email || '—'}</div>
                    <div className="text-sm"><strong>Amount:</strong> {session?.amount_total ? `$${(session.amount_total/100).toFixed(2)}` : '—'}</div>
                    <div className="text-sm"><strong>Session:</strong> {session?.id}</div>
                </div>

                <div className="mt-4 flex gap-3">
                    <button onClick={() => {
                        const returnUrl = session?.metadata?.returnUrl || '/chat?welcome=1';
                        window.location.href = returnUrl;
                    }} className="px-4 py-2 rounded bg-green-600 text-white">Go to chat</button>
                    <button onClick={handleSendReceipt} disabled={sending || !session?.customer_details?.email} className="px-4 py-2 rounded bg-zinc-900 text-white">{sending ? 'Sending...' : 'Send receipt to email'}</button>
                    <button onClick={handleDownload} className="px-4 py-2 rounded border">Download receipt</button>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Receipt preview</h3>
                    <div className="prose max-w-none p-4 bg-white dark:bg-[#041021] rounded border"> 
                        <h2>Receipt</h2>
                        <p><strong>Plan:</strong> {session?.metadata?.planId || '—'}</p>
                        <p><strong>Visitor ID:</strong> {session?.metadata?.visitorId || '—'}</p>
                        <p><strong>Customer email:</strong> {session?.customer_details?.email || session?.customer_email || '—'}</p>
                        <p><strong>Amount:</strong> {session?.amount_total ? `$${(session.amount_total/100).toFixed(2)}` : '—'}</p>
                        <p>Thank you for your purchase.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
