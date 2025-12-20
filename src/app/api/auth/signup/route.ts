import { NextResponse } from 'next/server';
import { findUserByEmail, createUser, createSession } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // log incoming request for debugging
    console.log('[auth/signup] body:', JSON.stringify(body));
    const { email, password, name } = body || {};
    if (!email || !password) {
      return NextResponse.json({ ok: false, message: 'Missing fields' }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ ok: false, message: 'User already exists' }, { status: 409 });
    }

    let user;
    try {
      user = await createUser({ email, password, name });
    } catch (createErr: any) {
      console.error('[auth/signup] createUser error:', createErr);
      // duplicate key error from MongoDB
      if (createErr?.code === 11000 || (createErr?.message || '').includes('E11000')) {
        return NextResponse.json({ ok: false, message: 'User already exists' }, { status: 409 });
      }
      throw createErr;
    }

    const { sessionId, expiresAt } = await createSession(user._id);

    const maxAge = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    const isProd = process.env.NODE_ENV === 'production';
    const cookie = `session=${sessionId}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${isProd ? '; Secure' : ''}`;

    return new NextResponse(JSON.stringify({ ok: true, user: { email: user.email, name: user.name || null } }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
    });
  } catch (err: any) {
    console.error('[auth/signup] unexpected error:', err);
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
