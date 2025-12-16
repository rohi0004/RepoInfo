import { NextResponse } from 'next/server';
import { initVisitor } from '@/lib/billing-mongodb';

export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { visitorId } = body;
        if (!visitorId) return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });

        const ok = await initVisitor(visitorId);
        if (!ok) return NextResponse.json({ error: 'Failed to init visitor' }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('register visitor error', e);
        return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
    }
}
