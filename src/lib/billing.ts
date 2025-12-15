import Stripe from 'stripe';

// Dynamic import for Vercel KV to avoid initialization issues (similar pattern to analytics.ts)
let kvClient: any = null;
async function getKVClient() {
    if (!kvClient && process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
        const { kv } = await import('@vercel/kv');
        kvClient = kv;
    }
    return kvClient;
}

// Temporary testing override: set free queries to 2 for payment gateway testing
const FREE_QUERIES = 5;

export async function getVisitorUsage(visitorId: string) {
    try {
        if (!visitorId) return { queryCount: 0, exists: false };
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            const kv = await getKVClient();
            if (!kv) return { queryCount: 0, exists: false };
            const data = await kv.hgetall(`visitor:${visitorId}`) as any;
            const queryCount = parseInt(data?.queryCount || '0');
            const exists = Object.keys(data || {}).length > 0;
            return { queryCount, exists };
        }
        // If KV isn't configured but REDIS_URL is present, we expect analytics to be in Redis
        if (process.env.REDIS_URL) {
            const { createClient } = await import('redis');
            const client = createClient({ url: process.env.REDIS_URL });
            await client.connect();
            try {
                const data = await client.hGetAll(`visitor:${visitorId}`);
                const queryCount = parseInt(data?.queryCount || '0');
                const exists = Object.keys(data || {}).length > 0;
                return { queryCount, exists };
            } finally {
                try { await client.disconnect(); } catch (e) { /* ignore */ }
            }
        }

        // Fallback: try reading the local analytics file (used by analytics.ts fallback)
        try {
            const fs = await import('fs');
            const ANALYTICS_FILE = './analytics.json';
            if (fs.existsSync(ANALYTICS_FILE)) {
                const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
                const data = JSON.parse(raw);
                const entries: Array<[string, any]> = data.visitorData || [];
                for (const [id, info] of entries) {
                    if (id === visitorId) {
                        return { queryCount: parseInt(info?.queryCount || '0'), exists: true };
                    }
                }
            }
        } catch (e) {
            // ignore fallback read errors
        }
    } catch (e) {
        console.warn('getVisitorUsage failed', e);
    }
    return { queryCount: 0, exists: false };
}

export async function getBillingData(visitorId: string) {
    try {
        if (!visitorId) return { plan: null, extraQueries: 0 };
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            const kv = await getKVClient();
            if (!kv) return { plan: null, extraQueries: 0, unlimited: false, exists: false };
            const data = await kv.hgetall(`billing:visitor:${visitorId}`) as any;
            const exists = Object.keys(data || {}).length > 0;
            const result = {
                plan: data?.plan || null,
                extraQueries: parseInt(data?.extraQueries || '0') || 0,
                activeUntil: data?.activeUntil ? parseInt(data.activeUntil) : null,
                // support an 'unlimited' flag stored as '1' in KV
                unlimited: data?.unlimited === '1' || false,
                exists
            };
            console.log(`📊 getBillingData(${visitorId}):`, JSON.stringify(result));
            return result;
        }
        // Redis fallback
        if (process.env.REDIS_URL) {
            const { createClient } = await import('redis');
            const client = createClient({ url: process.env.REDIS_URL });
            await client.connect();
            try {
                const data = await client.hGetAll(`billing:visitor:${visitorId}`);
                const exists = Object.keys(data || {}).length > 0;
                const result = {
                    plan: data?.plan || null,
                    extraQueries: parseInt(data?.extraQueries || '0') || 0,
                    activeUntil: data?.activeUntil ? parseInt(data.activeUntil) : null,
                    unlimited: data?.unlimited === '1' || false,
                    exists
                };
                console.log(`📊 getBillingData(${visitorId}) [Redis]:`, JSON.stringify(result));
                return result;
            } finally {
                try { await client.disconnect(); } catch (e) { /* ignore */ }
            }
        }
    } catch (e) {
        console.warn('getBillingData failed', e);
    }
    return { plan: null, extraQueries: 0, unlimited: false, exists: false };
}

export async function checkAllowance(visitorId: string) {
    const usage = await getVisitorUsage(visitorId);
    const billing = await getBillingData(visitorId);

    // If billing indicates unlimited access, grant unlimited allowance
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

    return {
        allowed: remaining > 0,
        remaining,
        allowedTotal,
        usageCount: usage.queryCount || 0,
        billing,
        visitorExists
    };
}

// Send a simple billing email if SMTP is configured. Uses dynamic import of nodemailer.
export async function sendBillingEmail(toEmail: string, visitorId: string, planId: string, amountLabel = '') {
    try {
        if (!toEmail) return false;
        // Support both SMTP_* env names and EMAIL_* fallbacks (see project env settings)
        const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
        if (!host) return false; // SMTP not configured

        const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
        const user = process.env.SMTP_USER || process.env.EMAIL_USER || '';
        const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
        const from = process.env.FROM_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER || `no-reply@${process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost'}`;

        // nodemailer may not be installed in some environments; treat it as optional
        // @ts-ignore - dynamically import optional dependency
        const imported = await import('nodemailer').catch(() => null);
        if (!imported) return false;
        // support both ESM default and CommonJS export shapes
        const mailer: any = (imported && (imported.default || imported)) as any;
        const transporter = mailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: user && pass ? { user, pass } : undefined,
        } as any);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/chat';
        const html = `<p>Thank you for your purchase. Plan: <strong>${planId}</strong></p>
            <p>Visitor ID: <code>${visitorId}</code></p>
            <p>Amount: ${amountLabel}</p>
            <p>You can now access the chat here: <a href="${appUrl}/chat">${appUrl}/chat</a></p>`;

        await transporter.sendMail({
            from,
            to: toEmail,
            subject: `Your ${planId} subscription receipt`,
            html,
        });

        return true;
    } catch (e) {
        console.warn('sendBillingEmail failed', e);
        return false;
    }
}

export async function grantExtraQueries(visitorId: string, amount: number) {
    try {
        if (!visitorId) return false;
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            const kv = await getKVClient();
            if (!kv) return false;
            const key = `billing:visitor:${visitorId}`;
            const current = parseInt((await kv.hget(key, 'extraQueries')) || '0');
            await kv.hset(key, { extraQueries: (current + amount).toString() });
            return true;
        }
    } catch (e) {
        console.warn('grantExtraQueries failed', e);
    }
    return false;
}

export async function initVisitor(visitorId: string) {
    try {
        if (!visitorId) return false;
        const timestamp = Date.now();
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            const kv = await getKVClient();
            if (!kv) return false;
            const visitorKey = `visitor:${visitorId}`;
            const exists = await kv.exists(visitorKey);
            if (!exists) {
                await kv.hset(visitorKey, {
                    firstSeen: timestamp.toString(),
                    lastSeen: timestamp.toString(),
                    country: 'Unknown',
                    device: 'unknown',
                    userAgent: '',
                    queryCount: '0'
                });
                await kv.sadd('visitors', visitorId);
            }
            // ensure billing record exists
            const billingKey = `billing:visitor:${visitorId}`;
            const billingExists = await kv.exists(billingKey);
            if (!billingExists) {
                await kv.hset(billingKey, { plan: '', extraQueries: '0' });
            }
            return true;
        }

        if (process.env.REDIS_URL) {
            const { createClient } = await import('redis');
            const client = createClient({ url: process.env.REDIS_URL });
            await client.connect();
            try {
                const visitorKey = `visitor:${visitorId}`;
                const exists = await client.exists(visitorKey);
                if (!exists) {
                    await client.hSet(visitorKey, {
                        firstSeen: timestamp.toString(),
                        lastSeen: timestamp.toString(),
                        country: 'Unknown',
                        device: 'unknown',
                        userAgent: '',
                        queryCount: '0'
                    });
                    await client.sAdd('visitors', visitorId);
                }
                const billingKey = `billing:visitor:${visitorId}`;
                const billingExists = await client.exists(billingKey);
                if (!billingExists) {
                    await client.hSet(billingKey, { plan: '', extraQueries: '0' });
                }
                return true;
            } finally {
                try { await client.disconnect(); } catch (e) {}
            }
        }

        // Fallback: update analytics.json
        try {
            const fs = await import('fs');
            const ANALYTICS_FILE = './analytics.json';
            let data: any = { visitors: [], visitorData: [], queries: { total: 0 } };
            if (fs.existsSync(ANALYTICS_FILE)) {
                data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
            }
            data.visitors = data.visitors || [];
            data.visitorData = data.visitorData || [];
            if (!data.visitors.includes(visitorId)) data.visitors.push(visitorId);
            const existingIndex = (data.visitorData || []).findIndex((e: any) => e[0] === visitorId);
            if (existingIndex === -1) {
                data.visitorData.push([visitorId, { firstSeen: timestamp, lastSeen: timestamp, country: 'Unknown', device: 'unknown', userAgent: '', queryCount: 0 }]);
            }
            // billing stored in KV; we won't add it to analytics fallback
            fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
            return true;
        } catch (e) {
            console.warn('initVisitor fallback failed', e);
        }

    } catch (e) {
        console.warn('initVisitor failed', e);
    }
    return false;
}

export async function resetVisitor(visitorId: string) {
    try {
        if (!visitorId) return false;
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            const kv = await getKVClient();
            if (!kv) return false;
            const visitorKey = `visitor:${visitorId}`;
            await kv.hset(visitorKey, { queryCount: '0', lastSeen: Date.now().toString() });
            const billingKey = `billing:visitor:${visitorId}`;
            await kv.hset(billingKey, { extraQueries: '0', plan: '' });
            return true;
        }

        if (process.env.REDIS_URL) {
            const { createClient } = await import('redis');
            const client = createClient({ url: process.env.REDIS_URL });
            await client.connect();
            try {
                const visitorKey = `visitor:${visitorId}`;
                await client.hSet(visitorKey, { queryCount: '0', lastSeen: Date.now().toString() });
                const billingKey = `billing:visitor:${visitorId}`;
                await client.hSet(billingKey, { extraQueries: '0', plan: '' });
                return true;
            } finally {
                try { await client.disconnect(); } catch (e) {}
            }
        }

        // Fallback: edit analytics.json
        try {
            const fs = await import('fs');
            const ANALYTICS_FILE = './analytics.json';
            if (!fs.existsSync(ANALYTICS_FILE)) return false;
            const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
            data.visitorData = data.visitorData || [];
            const idx = data.visitorData.findIndex((e: any) => e[0] === visitorId);
            if (idx !== -1) {
                data.visitorData[idx][1].queryCount = 0;
                data.visitorData[idx][1].lastSeen = Date.now();
            }
            fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
            return true;
        } catch (e) {
            console.warn('resetVisitor fallback failed', e);
        }

    } catch (e) {
        console.warn('resetVisitor failed', e);
    }
    return false;
}

// Helper to create Stripe Checkout, used by API route
export function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
    return stripe;
}
