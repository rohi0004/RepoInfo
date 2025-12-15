import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/billing';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { planId, visitorId, returnUrl } = body;

        if (!planId || !visitorId) {
            return NextResponse.json({ error: 'Missing planId or visitorId' }, { status: 400 });
        }

        const stripe = getStripe();

        // Map planId to Stripe price ID via env vars
        const PRICE_MAP: Record<string, string | undefined> = {
            'pro_monthly': process.env.STRIPE_PRICE_PRO_MONTHLY,
            'pro_yearly': process.env.STRIPE_PRICE_PRO_YEARLY,
        };

        const priceId = PRICE_MAP[planId];
        if (!priceId) {
            return NextResponse.json({ error: 'Unknown planId or missing price configuration' }, { status: 400 });
        }

        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [ { price: priceId, quantity: 1 } ],
            payment_method_types: ['card'],
            success_url: `${origin}/billing/success?checkout=success&session_id={CHECKOUT_SESSION_ID}&visitorId=${encodeURIComponent(visitorId)}`,
            cancel_url: `${origin}/billing/success?checkout=cancel&visitorId=${encodeURIComponent(visitorId)}`,
            metadata: {
                visitorId: visitorId,
                planId: planId,
                returnUrl: returnUrl || '/chat?welcome=1'
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (e: any) {
        console.error('create-checkout error', e);
        return NextResponse.json({ error: e.message || 'Failed to create checkout' }, { status: 500 });
    }
}
