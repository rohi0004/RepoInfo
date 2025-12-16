import { NextResponse } from 'next/server';
import { checkAllowance } from '@/lib/billing-mongodb';

export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const visitorId = url.searchParams.get('visitorId') || '';
        const result = await checkAllowance(visitorId);
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to check billing' }, { status: 500 });
    }
}
