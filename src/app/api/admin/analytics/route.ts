import { getAnalyticsData } from "@/lib/analytics";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // No key validation needed - just return data
        // Authentication is handled on client side via hash
        const data = await getAnalyticsData();
        
        // Ensure data is properly serialized
        return NextResponse.json(data || {
            totalVisitors: 0,
            totalQueries: 0,
            activeUsers24h: 0,
            deviceStats: {},
            countryStats: {},
            recentVisitors: []
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            totalVisitors: 0,
            totalQueries: 0,
            activeUsers24h: 0,
            deviceStats: {},
            countryStats: {},
            recentVisitors: []
        }, { status: 500 });
    }
}