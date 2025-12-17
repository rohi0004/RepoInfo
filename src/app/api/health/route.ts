import { NextResponse } from 'next/server';

// Health check endpoint to verify environment configuration
export async function GET() {
    // Check MongoDB connection
    let mongoStatus = 'not_configured';
    let mongoError = null;
    if (process.env.MONGODB_URI) {
        try {
            const { getDatabase } = await import('@/lib/mongodb');
            const db = await getDatabase();
            // Test the connection with a simple operation
            await db.admin().ping();
            mongoStatus = 'connected';
        } catch (e: any) {
            mongoStatus = 'error';
            mongoError = e.message;
        }
    }

    const config = {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
        database: {
            hasMongoDB: !!process.env.MONGODB_URI,
            mongoStatus,
            mongoError
        },
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
        }
    };

    const status = mongoStatus === 'connected' ? 200 : 503;
    return NextResponse.json(config, {
        status,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
    });
}
