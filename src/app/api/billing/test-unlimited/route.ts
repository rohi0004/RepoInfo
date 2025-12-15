import { NextResponse } from 'next/server';

// Grant unlimited access for a visitor after payment
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { visitorId, planId } = body;
        
        if (!visitorId) {
            return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
        }

        console.log(`🎯 Granting unlimited access for visitor ${visitorId}, plan: ${planId || 'auto'}`);

        // Initialize visitor first
        const { initVisitor, grantExtraQueries } = await import('@/lib/billing');
        await initVisitor(visitorId);
        console.log(`✅ Visitor ${visitorId} initialized`);

        // Determine plan details
        const actualPlanId = planId || 'pro_yearly';
        let grant = 15000;
        if (actualPlanId === 'pro_monthly') {
            grant = 1000;
        }

        // Grant extra queries
        if (grant > 0) {
            await grantExtraQueries(visitorId, grant);
            console.log(`✅ Granted ${grant} queries to visitor ${visitorId}`);
        }

        // Set unlimited in Redis
        if (process.env.REDIS_URL) {
            const { createClient } = await import('redis');
            const client = createClient({ url: process.env.REDIS_URL });
            await client.connect();
            try {
                const key = `billing:visitor:${visitorId}`;
                const activeUntil = '' + (Date.now() + 365 * 24 * 60 * 60 * 1000);
                const dataToSet: any = { 
                    plan: actualPlanId, 
                    extraQueries: grant.toString(), 
                    activeUntil,
                    unlimited: '1'
                };
                await client.hSet(key, dataToSet);
                console.log(`✅ Set unlimited=1 for visitor ${visitorId} in Redis`);
                
                // Verify it was set
                const verify = await client.hGetAll(key);
                console.log(`🔍 Verification:`, verify);
                
                // Double-check the billing data is readable
                const { getBillingData, checkAllowance } = await import('@/lib/billing');
                const billingCheck = await checkAllowance(visitorId);
                console.log(`🔍 Final allowance check:`, JSON.stringify(billingCheck));
                
                return NextResponse.json({ 
                    success: true, 
                    visitorId,
                    unlimited: true,
                    data: verify,
                    allowanceCheck: billingCheck
                });
            } finally {
                try { await client.disconnect(); } catch (e) {}
            }
        }

        return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    } catch (e: any) {
        console.error('Grant unlimited error', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
