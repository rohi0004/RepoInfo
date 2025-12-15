import { NextResponse } from 'next/server';

// Health check endpoint to verify environment configuration
export async function GET() {
    const config = {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
        stripe: {
            configured: !!process.env.STRIPE_SECRET_KEY,
            keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 12) || 'MISSING',
            hasPublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE,
            hasProMonthly: !!process.env.STRIPE_PRICE_PRO_MONTHLY,
            hasProYearly: !!process.env.STRIPE_PRICE_PRO_YEARLY,
            hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
        },
        apis: {
            hasGemini: !!process.env.GEMINI_API_KEY,
            hasDeepSeek: !!process.env.DEEPSEEK_API_KEY,
            hasGitHub: !!process.env.GITHUB_TOKEN
        },
        email: {
            configured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
            host: process.env.EMAIL_HOST || 'NOT_SET',
            user: process.env.EMAIL_USER || 'NOT_SET'
        },
        cache: {
            hasRedis: !!process.env.REDIS_URL,
            hasKV: !!(process.env.KV_URL && process.env.KV_URL !== 'your_kv_url')
        }
    };

    return NextResponse.json(config, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
    });
}
