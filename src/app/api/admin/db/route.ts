import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Admin API for database manipulation
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get('action');
        const visitorId = url.searchParams.get('visitorId');

        const db = await getDatabase();

        switch (action) {
            case 'all-visitors': {
                // Get all visitors with their billing info
                const visitors = await db.collection('visitors').find({}).sort({ lastSeen: -1 }).limit(100).toArray();
                const billing = await db.collection('billing').find({}).toArray();
                
                // Merge visitor and billing data
                const merged = visitors.map(v => {
                    const bill = billing.find(b => b.visitorId === v.visitorId);
                    return {
                        ...v,
                        billing: bill || null
                    };
                });

                return NextResponse.json({ visitors: merged });
            }

            case 'visitor-details': {
                if (!visitorId) {
                    return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
                }

                const visitor = await db.collection('visitors').findOne({ visitorId });
                const billing = await db.collection('billing').findOne({ visitorId });

                return NextResponse.json({ 
                    visitor, 
                    billing,
                    exists: !!visitor || !!billing
                });
            }

            case 'payments': {
                // Get all payment records (if you're storing them)
                const payments = await db.collection('payments').find({}).sort({ createdAt: -1 }).limit(50).toArray();
                return NextResponse.json({ payments });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (e: any) {
        console.error('Admin API GET error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, visitorId, data } = body;

        const db = await getDatabase();

        switch (action) {
            case 'update-billing': {
                if (!visitorId) {
                    return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
                }

                const updateData: any = {
                    updatedAt: new Date()
                };

                if (data.plan !== undefined) updateData.plan = data.plan;
                if (data.extraQueries !== undefined) updateData.extraQueries = parseInt(data.extraQueries);
                if (data.unlimited !== undefined) updateData.unlimited = data.unlimited;
                if (data.activeUntil !== undefined) updateData.activeUntil = data.activeUntil ? new Date(data.activeUntil) : null;

                const result = await db.collection('billing').updateOne(
                    { visitorId },
                    { 
                        $set: updateData,
                        $setOnInsert: { 
                            visitorId, 
                            createdAt: new Date() 
                        }
                    },
                    { upsert: true }
                );

                // Get updated data
                const updated = await db.collection('billing').findOne({ visitorId });

                return NextResponse.json({ 
                    success: true, 
                    result,
                    billing: updated
                });
            }

            case 'delete-visitor': {
                if (!visitorId) {
                    return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
                }

                await db.collection('visitors').deleteOne({ visitorId });
                await db.collection('billing').deleteOne({ visitorId });

                return NextResponse.json({ success: true, message: 'Visitor deleted' });
            }

            case 'reset-usage': {
                if (!visitorId) {
                    return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
                }

                const result = await db.collection('visitors').updateOne(
                    { visitorId },
                    { $set: { queryCount: 0, lastSeen: new Date() } }
                );

                return NextResponse.json({ success: true, result });
            }

            case 'record-payment': {
                // Record a payment
                const payment = {
                    visitorId: data.visitorId,
                    amount: data.amount,
                    currency: data.currency || 'USD',
                    plan: data.plan,
                    stripeSessionId: data.stripeSessionId,
                    email: data.email,
                    status: data.status || 'completed',
                    createdAt: new Date()
                };

                const result = await db.collection('payments').insertOne(payment);

                return NextResponse.json({ success: true, paymentId: result.insertedId });
            }

            case 'delete-payment': {
                const { paymentId } = await req.json();
                
                if (!paymentId) {
                    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
                }

                const { ObjectId } = require('mongodb');
                await db.collection('payments').deleteOne({ _id: new ObjectId(paymentId) });

                return NextResponse.json({ success: true, message: 'Payment deleted' });
            }

            case 'block-visitor': {
                const { visitorId, reason } = await req.json();
                
                if (!visitorId) {
                    return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
                }

                await db.collection('billing').updateOne(
                    { visitorId },
                    { 
                        $set: { 
                            blocked: true,
                            blockedReason: reason || 'Blocked by admin',
                            blockedAt: new Date(),
                            updatedAt: new Date()
                        },
                        $setOnInsert: {
                            visitorId,
                            plan: null,
                            extraQueries: 0,
                            activeUntil: null,
                            unlimited: false,
                            createdAt: new Date()
                        }
                    },
                    { upsert: true }
                );

                return NextResponse.json({ success: true, message: 'Visitor blocked' });
            }

            case 'unblock-visitor': {
                const { visitorId } = await req.json();
                
                if (!visitorId) {
                    return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
                }

                await db.collection('billing').updateOne(
                    { visitorId },
                    { 
                        $set: { 
                            blocked: false,
                            updatedAt: new Date()
                        },
                        $unset: {
                            blockedReason: '',
                            blockedAt: ''
                        }
                    }
                );

                return NextResponse.json({ success: true, message: 'Visitor unblocked' });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (e: any) {
        console.error('Admin API POST error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const visitorId = url.searchParams.get('visitorId');

        if (!visitorId) {
            return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
        }

        const db = await getDatabase();
        
        await db.collection('visitors').deleteOne({ visitorId });
        await db.collection('billing').deleteOne({ visitorId });

        return NextResponse.json({ success: true, message: 'Visitor deleted' });
    } catch (e: any) {
        console.error('Admin API DELETE error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
