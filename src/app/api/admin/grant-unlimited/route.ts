import { NextResponse } from 'next/server';
import { grantExtraQueries, initVisitor, updateBillingData, checkAllowance } from '@/lib/billing-mongodb';

export const maxDuration = 26;
export const dynamic = 'force-dynamic';

// Admin endpoint to manually grant unlimited access
// Use this to fix stuck users after payment
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { visitorId, adminKey } = body;
        
        // Basic security check
        const expectedKey = process.env.ADMIN_KEY || 'change-me-in-production';
        if (adminKey !== expectedKey) {
            return NextResponse.json({ 
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        if (!visitorId) {
            return NextResponse.json({ 
                error: 'Missing visitorId' 
            }, { status: 400 });
        }

        console.log(`🔧 Manual grant for visitor ${visitorId}`);

        // Initialize visitor
        await initVisitor(visitorId);
        console.log(`✅ Visitor initialized`);

        // Grant unlimited with 15000 queries
        await grantExtraQueries(visitorId, 15000, true);
        console.log(`✅ Granted unlimited access`);

        // Update billing data
        const activeUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await updateBillingData(visitorId, 'pro_yearly', 15000, activeUntil, true);
        console.log(`✅ Updated billing data`);

        // Verify
        const check = await checkAllowance(visitorId);
        console.log(`✅ Verification:`, JSON.stringify(check));

        return NextResponse.json({
            success: true,
            visitorId,
            unlimited: true,
            verification: check
        });

    } catch (e: any) {
        console.error('Manual grant error:', e);
        return NextResponse.json({ 
            error: e.message 
        }, { status: 500 });
    }
}
