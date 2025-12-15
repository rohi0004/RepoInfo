import { NextResponse } from 'next/server';
import { generateAnswer } from '@/app/actions';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, visitorId } = body;
        if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

        // Use empty context for open chat and generic repoDetails
        const answer = await generateAnswer(query, '', { owner: 'general', repo: 'general' }, [], undefined, visitorId);
        return NextResponse.json({ answer });
    } catch (e: any) {
        console.error('open chat error', e);
        return NextResponse.json({ error: e.message || 'Failed to process chat' }, { status: 500 });
    }
}
