import { NextResponse } from 'next/server';
import { getStripe, sendBillingEmail } from '@/lib/billing-mongodb';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const sessionId = body?.session_id;
        if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer_details'] });
        const email = session.customer_details?.email || session.customer_email || '';
        const metadata = session.metadata || {};
        const visitorId = metadata.visitorId || body.visitorId || '';
        const planId = metadata.planId || '';
        const amountLabel = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : '';

        if (!email) return NextResponse.json({ error: 'No customer email available' }, { status: 400 });

        const ok = await sendBillingEmail(email, visitorId, planId, amountLabel);
        return NextResponse.json({ ok });
    } catch (e: any) {
        console.error('send-receipt error', e);
        return NextResponse.json({ error: e.message || 'Failed to send receipt' }, { status: 500 });
    }
}
