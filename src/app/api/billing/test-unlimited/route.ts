import { NextResponse } from 'next/server';

// Grant unlimited access for a visitor after payment
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { visitorId, planId, durationDays } = body;
        
        if (!visitorId) {
            return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
        }

        console.log(`🎯 Granting unlimited access for visitor ${visitorId}, plan: ${planId || 'auto'}`);

        // Initialize visitor first
        const { initVisitor, grantExtraQueries } = await import('@/lib/billing-mongodb');
        await initVisitor(visitorId);
        console.log(`✅ Visitor ${visitorId} initialized`);

        // Determine plan details
        const actualPlanId = planId || 'pro_yearly';
        let grant = 15000;
        if (actualPlanId === 'pro_monthly') {
            grant = 1000;
        }

        // Grant extra queries AND set unlimited flag
        if (grant > 0) {
            await grantExtraQueries(visitorId, grant, true); // true = set unlimited
            console.log(`✅ Granted ${grant} queries to visitor ${visitorId} with unlimited=true`);
        }

        // Update billing data with plan information in MongoDB
        const { updateBillingData, checkAllowance } = await import('@/lib/billing-mongodb');
        // Allow callers to request a custom duration (in days). Default to 365 days when not provided.
        const days = Number(durationDays) && Number(durationDays) > 0 ? Number(durationDays) : 365;
        const activeUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        await updateBillingData(visitorId, actualPlanId, grant, activeUntil, true);
        console.log(`✅ Updated billing data for visitor ${visitorId}`);

        // Verify MongoDB was updated
        const billingCheck = await checkAllowance(visitorId);
        console.log(`🔍 MongoDB billing check:`, JSON.stringify(billingCheck));

        return NextResponse.json({ 
            success: true, 
            visitorId,
            unlimited: true,
            expiresAt: activeUntil.toISOString(),
            allowanceCheck: billingCheck
        });
    } catch (e: any) {
        console.error('Grant unlimited error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
