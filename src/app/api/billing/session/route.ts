import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/billing-mongodb';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const sessionId = url.searchParams.get('session_id') || '';
        if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer_details'] });
        return NextResponse.json({ session });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to retrieve session' }, { status: 500 });
    }
}
