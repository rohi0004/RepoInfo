"use client";
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const plans = [
    { id: 'pro_monthly', name: 'Pro Monthly', price: '$9', cadence: '/mo', desc: '1000 extra queries per month', features: ['1000 queries', 'Priority processing', 'Email support'] },
    { id: 'pro_yearly', name: 'Pro Yearly', price: '$90', cadence: '/yr', desc: '15000 extra queries per year', features: ['15000 queries', 'Priority processing', 'Priority email support'] }
];

export default function PricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const startCheckout = async (planId: string) => {
        setLoadingPlan(planId);
        try {
            let visitorId = localStorage.getItem('visitor_id');
            if (!visitorId) {
                visitorId = crypto.randomUUID();
                localStorage.setItem('visitor_id', visitorId);
            }

            // Get return URL from localStorage (set before redirect to pricing)
            const returnUrl = localStorage.getItem('checkout_return_url') || '/chat?welcome=1';

            const res = await fetch('/api/billing/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, visitorId, returnUrl })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                // show a friendly alert if something goes wrong
                alert(data.error || 'Failed to start checkout');
            }
        } catch (e: any) {
            console.error(e);
            alert('Checkout error');
        } finally {
            setLoadingPlan(null);
        }
    };

    

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0b1020] transition-colors">
            <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">Pricing</h1>
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">You get up to 2 free queries for testing. Choose a plan to unlock more capacity and priority processing.</p>
            </div>

            <div className="max-w-5xl mx-auto mt-10 grid gap-6 md:grid-cols-2">
                {/* Basic card for each plan */}
                {plans.map((p, idx) => (
                    <div key={p.id} className={`relative rounded-2xl p-6 sm:p-8 border transition-shadow hover:shadow-2xl ${idx === 0 ? 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-[#071024]' : 'border-transparent bg-gradient-to-b from-white/60 to-white/30 dark:from-zinc-900/60 dark:to-zinc-900/40'}`}>
                        {idx === 1 && (
                            <div className="absolute -top-3 right-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">Most popular</div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</h2>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{p.desc}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{p.price}</span>
                                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{p.cadence}</span>
                                </div>
                                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Billed via Stripe</div>
                            </div>
                        </div>

                        <ul className="mt-6 space-y-3">
                            {p.features.map((f) => (
                                <li key={f} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6">
                            <button
                                onClick={() => startCheckout(p.id)}
                                disabled={loadingPlan !== null}
                                className={`w-full inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${idx === 1 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:opacity-95' : 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900'}`}
                            >
                                {loadingPlan === p.id ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                        </svg>
                                        Starting...
                                    </>
                                ) : (
                                    'Select Plan'
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="max-w-4xl mx-auto mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                <p>Questions? Contact <a className="text-zinc-800 dark:text-zinc-100 underline" href="mailto:sahrohitkumar10@gmail.com">sahrohitkumar10@gmail.com</a></p>
            </div>
        </div>
    );
}
