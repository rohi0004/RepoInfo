import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';

// Helper to get visitor ID from request
async function getVisitorId(req: NextRequest): Promise<string | null> {
  // Try to get from FingerprintJS first (if available in headers)
  const visitorId = req.headers.get('x-visitor-id');
  if (visitorId) return visitorId;

  // Fallback: Generate from IP + User Agent
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Create a simple hash (in production, you might want to use FingerprintJS)
  const identifier = `${ip}-${userAgent}`;
  return Buffer.from(identifier).toString('base64');
}

// GET: Retrieve theme preference
export async function GET(req: NextRequest) {
  try {
    const visitorId = await getVisitorId(req);
    if (!visitorId) {
      return NextResponse.json({ theme: 'system' }, { status: 200 });
    }

    const db = await getMongoClient();
    const preferences = db.collection('user_preferences');

    const userPrefs = await preferences.findOne({ visitorId });
    
    return NextResponse.json({
      theme: userPrefs?.theme || 'system',
      lastUpdated: userPrefs?.updatedAt || null
    });
  } catch (error) {
    console.error('Error fetching theme preference:', error);
    return NextResponse.json({ theme: 'system' }, { status: 200 });
  }
}

// POST: Save theme preference
export async function POST(req: NextRequest) {
  try {
    const { theme, visitorId: clientVisitorId } = await req.json();
    
    // Use client-provided visitorId (from FingerprintJS) or generate one
    const visitorId = clientVisitorId || await getVisitorId(req);
    
    if (!visitorId) {
      return NextResponse.json(
        { error: 'Could not identify user' },
        { status: 400 }
      );
    }

    if (!['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme value' },
        { status: 400 }
      );
    }

    const db = await getMongoClient();
    const preferences = db.collection('user_preferences');

    await preferences.updateOne(
      { visitorId },
      {
        $set: {
          theme,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      theme,
      message: 'Theme preference saved'
    });
  } catch (error) {
    console.error('Error saving theme preference:', error);
    return NextResponse.json(
      { error: 'Failed to save theme preference' },
      { status: 500 }
    );
  }
}
