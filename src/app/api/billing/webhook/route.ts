import { NextResponse } from 'next/server';
import { getStripe, grantExtraQueries } from '@/lib/billing-mongodb';

export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const stripe = getStripe();
    const sig = req.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    const buf = await req.arrayBuffer();
    const rawBody = Buffer.from(buf);

    let event: any;
    try {
        if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed.', err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const metadata = session.metadata || {};
            const visitorId = metadata.visitorId;
            const planId = metadata.planId;
            const customerEmail = session.customer_details?.email || session.customer_email || '';

            // For paid plans we will mark the billing record and give unlimited access.
            if (visitorId && planId) {
                // Determine grant and unlimited behavior
                let grant = 0;
                let setUnlimited = false;
                if (planId === 'pro_monthly') {
                    grant = 1000;
                    setUnlimited = true;
                }
                if (planId === 'pro_yearly') {
                    grant = 15000;
                    setUnlimited = true;
                }

                if (grant > 0 || setUnlimited) {
                    console.log(`🎯 Webhook processing payment for visitor ${visitorId}, plan ${planId}, unlimited=${setUnlimited}`);
                    
                    // Initialize visitor record first to ensure it exists
                    const { initVisitor, updateBillingData } = await import('@/lib/billing-mongodb');
                    await initVisitor(visitorId);
                    console.log(`✅ Visitor ${visitorId} initialized`);
                    
                    // Grant extra queries AND set unlimited flag in MongoDB
                    await grantExtraQueries(visitorId, grant, setUnlimited);
                    console.log(`✅ Granted ${grant} queries to visitor ${visitorId} with unlimited=${setUnlimited}`);
                    
                    // Update billing data with plan information
                    const activeUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                    await updateBillingData(visitorId, planId, grant, activeUntil, setUnlimited);
                    console.log(`✅ Updated billing data for visitor ${visitorId}`);
                    
                    // Verify it was set in MongoDB
                    const { checkAllowance } = await import('@/lib/billing-mongodb');
                    const verify = await checkAllowance(visitorId);
                    console.log(`🔍 MongoDB verification after webhook:`, JSON.stringify(verify));

                    // Send a billing email if SMTP is configured and we have an email
                    try {
                        if (customerEmail) {
                            const { sendBillingEmail } = await import('@/lib/billing-mongodb');
                            const amountLabel = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : '';
                            await sendBillingEmail(customerEmail, visitorId, planId, amountLabel);
                        }
                    } catch (e) {
                        console.warn('Failed to send billing email:', e);
                    }
                }
            }
        }
    } catch (err: any) {
        console.error('Webhook handler error', err);
        return new Response('Webhook handler error', { status: 500 });
    }

    return new Response('ok');
}
