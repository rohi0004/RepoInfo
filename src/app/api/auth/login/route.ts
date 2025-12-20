import { NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword, createSession } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json({ ok: false, message: 'Missing credentials' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ ok: false, userNotFound: true }, { status: 404 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const { sessionId, expiresAt } = await createSession(user._id);

    const maxAge = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    const isProd = process.env.NODE_ENV === 'production';
    const cookie = `session=${sessionId}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${isProd ? '; Secure' : ''}`;

    return new NextResponse(JSON.stringify({ ok: true, user: { email: user.email, name: user.name || null } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
