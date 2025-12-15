import { NextResponse } from 'next/server';
import { generateAnswer } from '@/app/actions';

export const maxDuration = 26; // Maximum duration for Netlify free tier (26s), Pro allows 60s
export const dynamic = 'force-dynamic'; // Disable static optimization

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, visitorId } = body;
        if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not configured');
            return NextResponse.json({ 
                error: 'AI service not configured. Please check environment variables.' 
            }, { status: 503 });
        }

        // Use empty context for open chat and generic repoDetails
        const answer = await generateAnswer(query, '', { owner: 'general', repo: 'general' }, [], undefined, visitorId);
        return NextResponse.json({ answer });
    } catch (e: any) {
        console.error('❌ Open chat error:', e);
        return NextResponse.json({ 
            error: e.message || 'Failed to process chat',
            details: process.env.NODE_ENV === 'development' ? e.stack : undefined
        }, { status: 500 });
    }
}
