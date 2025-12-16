import { NextResponse } from 'next/server';
import { getStripe, grantExtraQueries, initVisitor, checkAllowance } from '@/lib/billing-mongodb';

// Process a completed checkout session and grant unlimited access
export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const sessionId = url.searchParams.get('session_id');
        const visitorId = url.searchParams.get('visitorId');

        if (!sessionId || !visitorId) {
            return NextResponse.json({ 
                error: 'Missing session_id or visitorId' 
            }, { status: 400 });
        }

        console.log(`🎯 Processing checkout completion for visitor ${visitorId}, session ${sessionId}`);

        // Verify the session
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ 
                error: 'Payment not completed',
                payment_status: session.payment_status
            }, { status: 400 });
        }

        // Get plan info from metadata
        const planId = session.metadata?.planId || 'pro_yearly';
        
        // Initialize visitor
        await initVisitor(visitorId);
        console.log(`✅ Visitor ${visitorId} initialized`);

        // Determine grant amount
        let grant = 15000; // yearly default
        if (planId === 'pro_monthly') {
            grant = 1000;
        }

        // Grant unlimited access
        await grantExtraQueries(visitorId, grant, true); // true = unlimited
        console.log(`✅ Granted unlimited access to visitor ${visitorId}`);

        // Verify
        const billingCheck = await checkAllowance(visitorId);
        console.log(`🔍 Verification:`, JSON.stringify(billingCheck));

        return NextResponse.json({
            success: true,
            visitorId,
            planId,
            unlimited: true,
            verification: billingCheck
        });

    } catch (e: any) {
        console.error('Process checkout error:', e);
        return NextResponse.json({ 
            error: e.message 
        }, { status: 500 });
    }
}
