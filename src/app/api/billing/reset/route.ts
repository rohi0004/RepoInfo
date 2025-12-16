import { NextResponse } from 'next/server';
import { resetVisitor } from '@/lib/billing-mongodb';

export async function POST(req: Request) {
    try {
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
        }

        const body = await req.json();
        const { visitorId } = body;
        if (!visitorId) return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });

        const ok = await resetVisitor(visitorId);
        if (!ok) return NextResponse.json({ error: 'Failed to reset visitor' }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('reset visitor error', e);
        return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
    }
}
