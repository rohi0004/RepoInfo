import { createClient } from 'redis';

// Dynamic import for Vercel KV to avoid initialization issues
let kvClient: any = null;

async function getKVClient() {
    if (!kvClient && process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
        const { kv } = await import("@vercel/kv");
        kvClient = kv;
    }
    return kvClient;
}

// Redis client for local development
let redisClient: ReturnType<typeof createClient> | null = null;

// Simple local storage fallback for development
let localAnalyticsData: {
    visitors: Set<string>;
    visitorData: Map<string, any>;
    queries: { total: number };
} = {
    visitors: new Set(),
    visitorData: new Map(),
    queries: { total: 0 }
};

// Save/load from file for persistence
const ANALYTICS_FILE = './analytics.json';

async function getRedisClient() {
    if (!redisClient && process.env.REDIS_URL) {
        redisClient = createClient({ url: process.env.REDIS_URL });
        await redisClient.connect();
    }
    return redisClient;
}

async function loadLocalAnalytics() {
    try {
        const fs = await import('fs');
        if (fs.existsSync(ANALYTICS_FILE)) {
            const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
            localAnalyticsData.visitors = new Set(data.visitors || []);
            localAnalyticsData.visitorData = new Map(data.visitorData || []);
            localAnalyticsData.queries = data.queries || { total: 0 };
        }
    } catch (e) {
        console.log('No local analytics file found, starting fresh');
    }
}

async function saveLocalAnalytics() {
    try {
        const fs = await import('fs');
        const data = {
            visitors: Array.from(localAnalyticsData.visitors),
            visitorData: Array.from(localAnalyticsData.visitorData.entries()),
            queries: localAnalyticsData.queries
        };
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Failed to save analytics:', e);
    }
}

// Load on module init
if (typeof window === 'undefined') { // Server-side only
    loadLocalAnalytics();
}

export interface AnalyticsData {
    totalVisitors: number;
    totalQueries: number;
    activeUsers24h: number;
    deviceStats: Record<string, number>;
    countryStats: Record<string, number>;
    recentVisitors: VisitorData[];
}

export interface VisitorData {
    id: string;
    country: string;
    device: string;
    lastSeen: number;
    queryCount: number;
    firstSeen: number;
}

/**
 * Track a user event (e.g., query)
 */
export async function trackEvent(
    visitorId: string,
    eventType: 'query' | 'visit',
    metadata: {
        country?: string;
        device?: 'mobile' | 'desktop' | 'unknown';
        userAgent?: string;
    }
) {
    try {
        // Try Vercel KV first (production)
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            const kv = await getKVClient();
            if (!kv) return;

            const timestamp = Date.now();
            const pipeline = kv.pipeline();

            // 1. Add to global visitors set
            pipeline.sadd("visitors", visitorId);

            // 2. Update visitor metadata
            const visitorKey = `visitor:${visitorId}`;

            // Only set static data if not already present (to avoid overwriting firstSeen)
            const exists = await kv.exists(visitorKey);
            if (!exists) {
                pipeline.hset(visitorKey, {
                    firstSeen: timestamp,
                    country: metadata.country || 'Unknown',
                    device: metadata.device || 'unknown',
                    userAgent: metadata.userAgent || ''
                });
            }

            // Always update dynamic data
            pipeline.hset(visitorKey, {
                lastSeen: timestamp,
                // Update country/device if they changed (optional, but good for accuracy)
                ...(metadata.country && { country: metadata.country }),
                ...(metadata.device && { device: metadata.device })
            });

            // 3. Increment counters
            if (eventType === 'query') {
                pipeline.incr("queries:total");
                pipeline.hincrby(visitorKey, "queryCount", 1);
            }

            // 4. Update global stats
            if (metadata.country) {
                pipeline.incr(`stats:country:${metadata.country}`);
            }
            if (metadata.device) {
                pipeline.incr(`stats:device:${metadata.device}`);
            }

            await pipeline.exec();
        } else if (process.env.REDIS_URL) {
            // Use local Redis for development
            const client = await getRedisClient();
            if (!client) return;

            const timestamp = Date.now();
            const visitorKey = `visitor:${visitorId}`;

            // Check if visitor exists
            const exists = await client.exists(visitorKey);
            if (!exists) {
                await client.hSet(visitorKey, {
                    firstSeen: timestamp,
                    country: metadata.country || 'Unknown',
                    device: metadata.device || 'unknown',
                    userAgent: metadata.userAgent || '',
                    queryCount: 0
                });
            }

            // Always update dynamic data
            await client.hSet(visitorKey, {
                lastSeen: timestamp,
                ...(metadata.country && { country: metadata.country }),
                ...(metadata.device && { device: metadata.device })
            });

            // Add to visitors set
            await client.sAdd("visitors", visitorId);

            // Increment counters
            if (eventType === 'query') {
                await client.incr("queries:total");
                await client.hIncrBy(visitorKey, "queryCount", 1);
            }

            // Update global stats
            if (metadata.country) {
                await client.incr(`stats:country:${metadata.country}`);
            }
            if (metadata.device) {
                await client.incr(`stats:device:${metadata.device}`);
            }
        } else {
            // Fallback to local storage
            const timestamp = Date.now();
            
            // Add visitor
            localAnalyticsData.visitors.add(visitorId);
            
            // Update visitor data
            const existing = localAnalyticsData.visitorData.get(visitorId) || {};
            if (!existing.firstSeen) {
                existing.firstSeen = timestamp;
                existing.country = metadata.country || 'Unknown';
                existing.device = metadata.device || 'unknown';
                existing.userAgent = metadata.userAgent || '';
                existing.queryCount = 0;
            }
            existing.lastSeen = timestamp;
            if (metadata.country) existing.country = metadata.country;
            if (metadata.device) existing.device = metadata.device;
            
            if (eventType === 'query') {
                localAnalyticsData.queries.total = (localAnalyticsData.queries.total || 0) + 1;
                existing.queryCount = (existing.queryCount || 0) + 1;
            }
            
            localAnalyticsData.visitorData.set(visitorId, existing);
            await saveLocalAnalytics();
        }
    } catch (error) {
        console.error("Failed to track analytics event:", error);
        // Don't throw, analytics shouldn't break the app
    }
}

/**
 * Fetch aggregated analytics data for the dashboard
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
    try {
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            // Use Vercel KV (production)
            const kv = await getKVClient();
            if (!kv) {
                return {
                    totalVisitors: 0,
                    totalQueries: 0,
                    activeUsers24h: 0,
                    deviceStats: {},
                    countryStats: {},
                    recentVisitors: []
                };
            }

            // Parallelize fetching independent data
            const [
                totalVisitors,
                totalQueries,
                visitorIds
            ] = await Promise.all([
                kv.scard("visitors"),
                kv.get("queries:total") as Promise<number | null>,
                kv.smembers("visitors")
            ]);

            // Fetch details for all visitors
            if (visitorIds.length === 0) {
                return {
                    totalVisitors: 0,
                    totalQueries: totalQueries || 0,
                    activeUsers24h: 0,
                    deviceStats: {},
                    countryStats: {},
                    recentVisitors: []
                };
            }

            const pipeline = kv.pipeline();
            visitorIds.forEach((id: string) => pipeline.hgetall(`visitor:${id}`));
            const visitorsDetails = await pipeline.exec() as Array<Record<string, any>>;

            // Process visitors to build the report
            const recentVisitors: VisitorData[] = [];
            let activeUsers24h = 0;
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

            // Re-calculate stats from visitor data to ensure consistency (or fetch from stats: keys)
            // Fetching from stats keys is faster but let's aggregate from visitor data for the table
            const deviceStats: Record<string, number> = { mobile: 0, desktop: 0, unknown: 0 };
            const countryStats: Record<string, number> = {};

            visitorsDetails.forEach((details: Record<string, any>, index: number) => {
                if (!details) return;

                const visitor: VisitorData = {
                    ...details,
                    id: visitorIds[index],
                    country: details.country || 'Unknown',
                    device: details.device || 'unknown',
                    lastSeen: parseInt(details.lastSeen || '0'),
                    queryCount: parseInt(details.queryCount || '0'),
                    firstSeen: parseInt(details.firstSeen || '0')
                };

                recentVisitors.push(visitor);

                // Active users
                if (visitor.lastSeen > oneDayAgo) {
                    activeUsers24h++;
                }

                // Stats aggregation
                const device = visitor.device || 'unknown';
                deviceStats[device] = (deviceStats[device] || 0) + 1;

                const country = visitor.country || 'Unknown';
                countryStats[country] = (countryStats[country] || 0) + 1;
            });

            // Sort visitors by last seen (descending)
            recentVisitors.sort((a, b) => b.lastSeen - a.lastSeen);

            return {
                totalVisitors: totalVisitors || 0,
                totalQueries: totalQueries || 0,
                activeUsers24h,
                deviceStats,
                countryStats,
                recentVisitors
            };
        } else if (process.env.REDIS_URL) {
            // Use local Redis for development
            const client = await getRedisClient();
            if (!client) {
                return {
                    totalVisitors: 0,
                    totalQueries: 0,
                    activeUsers24h: 0,
                    deviceStats: {},
                    countryStats: {},
                    recentVisitors: []
                };
            }

            // Get all visitor IDs
            const visitorIds = await client.sMembers("visitors");
            const totalVisitors = visitorIds.length;
            const totalQueries = parseInt(await client.get("queries:total") || "0");

            if (visitorIds.length === 0) {
                return {
                    totalVisitors: 0,
                    totalQueries: 0,
                    activeUsers24h: 0,
                    deviceStats: {},
                    countryStats: {},
                    recentVisitors: []
                };
            }

            // Fetch details for all visitors
            const visitorsDetails = await Promise.all(
                visitorIds.map(id => client.hGetAll(`visitor:${id}`))
            );

            // Process visitors to build the report
            const recentVisitors: VisitorData[] = [];
            let activeUsers24h = 0;
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            const deviceStats: Record<string, number> = { mobile: 0, desktop: 0, unknown: 0 };
            const countryStats: Record<string, number> = {};

            visitorsDetails.forEach((details, index) => {
                if (!details) return;

                const visitor = {
                    id: visitorIds[index],
                    firstSeen: parseInt(details.firstSeen || '0'),
                    lastSeen: parseInt(details.lastSeen || '0'),
                    country: details.country || 'Unknown',
                    device: details.device || 'unknown',
                    userAgent: details.userAgent || '',
                    queryCount: parseInt(details.queryCount || '0')
                };

                recentVisitors.push(visitor);

                // Active users
                if (visitor.lastSeen > oneDayAgo) {
                    activeUsers24h++;
                }

                // Stats aggregation
                const device = visitor.device || 'unknown';
                deviceStats[device] = (deviceStats[device] || 0) + 1;

                const country = visitor.country || 'Unknown';
                countryStats[country] = (countryStats[country] || 0) + 1;
            });

            // Sort visitors by last seen (descending)
            recentVisitors.sort((a, b) => b.lastSeen - a.lastSeen);

            return {
                totalVisitors,
                totalQueries,
                activeUsers24h,
                deviceStats,
                countryStats,
                recentVisitors
            };
        } else {
            // Use local storage
            const visitors = Array.from(localAnalyticsData.visitors);
            const totalVisitors = visitors.length;
            const totalQueries = localAnalyticsData.queries.total || 0;
            
            if (visitors.length === 0) {
                return {
                    totalVisitors: 0,
                    totalQueries: 0,
                    activeUsers24h: 0,
                    deviceStats: {},
                    countryStats: {},
                    recentVisitors: []
                };
            }

            const recentVisitors: VisitorData[] = [];
            let activeUsers24h = 0;
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            const deviceStats: Record<string, number> = { mobile: 0, desktop: 0, unknown: 0 };
            const countryStats: Record<string, number> = {};

            visitors.forEach(visitorId => {
                const details = localAnalyticsData.visitorData.get(visitorId);
                if (!details) return;

                const visitor = {
                    ...details,
                    id: visitorId
                };

                recentVisitors.push(visitor);

                // Active users
                if (visitor.lastSeen > oneDayAgo) {
                    activeUsers24h++;
                }

                // Stats aggregation
                const device = visitor.device || 'unknown';
                deviceStats[device] = (deviceStats[device] || 0) + 1;

                const country = visitor.country || 'Unknown';
                countryStats[country] = (countryStats[country] || 0) + 1;
            });

            // Sort visitors by last seen (descending)
            recentVisitors.sort((a, b) => b.lastSeen - a.lastSeen);

            return {
                totalVisitors,
                totalQueries,
                activeUsers24h,
                deviceStats,
                countryStats,
                recentVisitors
            };
        }

    } catch (error) {
        console.error("Failed to fetch analytics data:", error);
        return {
            totalVisitors: 0,
            totalQueries: 0,
            activeUsers24h: 0,
            deviceStats: {},
            countryStats: {},
            recentVisitors: []
        };
    }
}
