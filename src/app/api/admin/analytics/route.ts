import { getAnalyticsData } from "@/lib/analytics";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // No key validation needed - just return data
        // Authentication is handled on client side via hash
        const data = await getAnalyticsData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}