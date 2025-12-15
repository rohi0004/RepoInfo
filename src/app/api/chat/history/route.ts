import { NextResponse } from 'next/server';

// GET: Load chat history for visitorId
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const visitorId = url.searchParams.get('visitorId');
        if (!visitorId) return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });

        const key = `chat:history:${visitorId}`;
        let messages: any[] = [];

        // Try KV first
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            const { kv } = await import('@vercel/kv');
            const raw = await kv.get(key);
            if (raw) messages = JSON.parse(raw as string);
        } else if (process.env.REDIS_URL) {
            // Redis fallback
            const { createClient } = await import('redis');
            const client = createClient({ url: process.env.REDIS_URL });
            await client.connect();
            try {
                const raw = await client.get(key);
                if (raw) messages = JSON.parse(raw);
            } finally {
                try { await client.disconnect(); } catch (e) {}
            }
        }

        return NextResponse.json({ messages });
    } catch (e: any) {
        console.error('chat history GET error', e);
        return NextResponse.json({ error: e.message || 'Failed to load history' }, { status: 500 });
    }
}

// POST: Save chat history for visitorId
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { visitorId, messages } = body;
        if (!visitorId || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Missing visitorId or messages' }, { status: 400 });
        }

        const key = `chat:history:${visitorId}`;
        const serialized = JSON.stringify(messages);

        // Try KV first
        if (process.env.KV_URL && process.env.KV_URL !== 'your_kv_rest_api_url' && process.env.KV_URL !== 'your_kv_url') {
            const { kv } = await import('@vercel/kv');
            await kv.set(key, serialized, { ex: 7 * 24 * 60 * 60 }); // expire in 7 days
        } else if (process.env.REDIS_URL) {
            // Redis fallback
            const { createClient } = await import('redis');
            const client = createClient({ url: process.env.REDIS_URL });
            await client.connect();
            try {
                await client.set(key, serialized, { EX: 7 * 24 * 60 * 60 });
            } finally {
                try { await client.disconnect(); } catch (e) {}
            }
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error('chat history POST error', e);
        return NextResponse.json({ error: e.message || 'Failed to save history' }, { status: 500 });
    }
}
