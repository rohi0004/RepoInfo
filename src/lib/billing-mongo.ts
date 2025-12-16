import { getMongoClient } from './mongodb';

const FREE_QUERIES = 5;

export interface VisitorUsage {
    visitorId: string;
    queryCount: number;
    firstSeen: Date;
    lastSeen: Date;
    country?: string;
    device?: string;
    userAgent?: string;
}

export interface BillingData {
    visitorId: string;
    plan: string | null;
    extraQueries: number;
    activeUntil: Date | null;
    unlimited: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export async function getVisitorUsage(visitorId: string) {
    try {
        if (!visitorId) return { queryCount: 0, exists: false };
        
        const db = await getMongoClient();
        const visitor = await db.collection<VisitorUsage>('visitors').findOne({ visitorId });
        
        if (visitor) {
            return { 
                queryCount: visitor.queryCount || 0, 
                exists: true,
                firstSeen: visitor.firstSeen,
                lastSeen: visitor.lastSeen,
                country: visitor.country,
                device: visitor.device
            };
        }
        
        return { queryCount: 0, exists: false };
    } catch (error) {
        console.error('getVisitorUsage error:', error);
        return { queryCount: 0, exists: false };
    }
}

export async function getBillingData(visitorId: string) {
    try {
        if (!visitorId) return { plan: null, extraQueries: 0, unlimited: false, exists: false };
        
        const db = await getMongoClient();
        const billing = await db.collection<BillingData>('billing').findOne({ visitorId });
        
        if (billing) {
            return {
                plan: billing.plan,
                extraQueries: billing.extraQueries || 0,
                activeUntil: billing.activeUntil,
                unlimited: billing.unlimited || false,
                exists: true
            };
        }
        
        return { plan: null, extraQueries: 0, unlimited: false, exists: false };
    } catch (error) {
        console.error('getBillingData error:', error);
        return { plan: null, extraQueries: 0, unlimited: false, exists: false };
    }
}

export async function checkAllowance(visitorId: string) {
    const usage = await getVisitorUsage(visitorId);
    const billing = await getBillingData(visitorId);

    const visitorExists = Boolean((usage as any).exists || (billing as any).exists);
    console.log(`🔍 checkAllowance for ${visitorId}: unlimited=${(billing as any).unlimited}, exists=${visitorExists}`);
    
    if ((billing as any).unlimited) {
        console.log(`✅ Unlimited access granted for ${visitorId}`);
        return {
            allowed: true,
            remaining: -1,
            allowedTotal: Number.POSITIVE_INFINITY,
            usageCount: usage.queryCount || 0,
            billing,
            visitorExists
        };
    }

    const allowedTotal = FREE_QUERIES + (billing.extraQueries || 0);
    const remaining = Math.max(0, allowedTotal - (usage.queryCount || 0));

    console.log(`📊 Billing check for ${visitorId}: ${usage.queryCount}/${allowedTotal} queries used, ${remaining} remaining`);

    return {
        allowed: remaining > 0,
        remaining,
        allowedTotal,
        usageCount: usage.queryCount || 0,
        billing,
        visitorExists
    };
}

export async function incrementVisitorUsage(visitorId: string, metadata?: {
    country?: string;
    device?: string;
    userAgent?: string;
}) {
    try {
        const db = await getMongoClient();
        const now = new Date();
        
        await db.collection<VisitorUsage>('visitors').updateOne(
            { visitorId },
            {
                $inc: { queryCount: 1 },
                $set: {
                    lastSeen: now,
                    ...(metadata?.country && { country: metadata.country }),
                    ...(metadata?.device && { device: metadata.device }),
                    ...(metadata?.userAgent && { userAgent: metadata.userAgent })
                },
                $setOnInsert: {
                    firstSeen: now,
                    queryCount: 0
                }
            },
            { upsert: true }
        );
        
        console.log(`✅ Incremented usage for ${visitorId}`);
    } catch (error) {
        console.error('incrementVisitorUsage error:', error);
    }
}

export async function createOrUpdateBilling(
    visitorId: string,
    data: {
        plan?: string;
        extraQueries?: number;
        activeUntil?: Date;
        unlimited?: boolean;
    }
) {
    try {
        const db = await getMongoClient();
        const now = new Date();
        
        await db.collection<BillingData>('billing').updateOne(
            { visitorId },
            {
                $set: {
                    ...data,
                    updatedAt: now
                },
                $setOnInsert: {
                    visitorId,
                    plan: data.plan || null,
                    extraQueries: data.extraQueries || 0,
                    unlimited: data.unlimited || false,
                    createdAt: now
                }
            },
            { upsert: true }
        );
        
        console.log(`✅ Updated billing for ${visitorId}:`, data);
    } catch (error) {
        console.error('createOrUpdateBilling error:', error);
    }
}

export async function trackEvent(
    visitorId: string,
    eventType: 'query' | 'visit',
    metadata: {
        country?: string;
        device?: 'mobile' | 'desktop' | 'unknown';
        userAgent?: string;
        query?: string;
    }
) {
    try {
        const db = await getMongoClient();
        const now = new Date();
        
        // Track the event
        await db.collection('analytics').insertOne({
            visitorId,
            eventType,
            timestamp: now,
            ...metadata
        });
        
        // Update visitor usage if it's a query
        if (eventType === 'query') {
            await incrementVisitorUsage(visitorId, metadata);
        }
        
        console.log(`📊 Tracked ${eventType} event for ${visitorId}`);
    } catch (error) {
        console.error('trackEvent error:', error);
    }
}

export async function getAllVisitors() {
    try {
        const db = await getMongoClient();
        const visitors = await db.collection<VisitorUsage>('visitors')
            .find({})
            .sort({ lastSeen: -1 })
            .toArray();
        
        return visitors;
    } catch (error) {
        console.error('getAllVisitors error:', error);
        return [];
    }
}

export async function getAnalytics() {
    try {
        const db = await getMongoClient();
        
        const totalQueries = await db.collection('analytics')
            .countDocuments({ eventType: 'query' });
        
        const totalVisitors = await db.collection('visitors')
            .countDocuments();
        
        const countriesAgg = await db.collection<VisitorUsage>('visitors')
            .aggregate([
                { $match: { country: { $exists: true, $ne: null } } },
                { $group: { _id: '$country', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
            .toArray();
        
        const devicesAgg = await db.collection<VisitorUsage>('visitors')
            .aggregate([
                { $match: { device: { $exists: true, $ne: null } } },
                { $group: { _id: '$device', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
            .toArray();
        
        return {
            totalQueries,
            totalVisitors,
            countries: countriesAgg.map(c => ({ country: c._id, count: c.count })),
            devices: devicesAgg.map(d => ({ device: d._id, count: d.count }))
        };
    } catch (error) {
        console.error('getAnalytics error:', error);
        return {
            totalQueries: 0,
            totalVisitors: 0,
            countries: [],
            devices: []
        };
    }
}
