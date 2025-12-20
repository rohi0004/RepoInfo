import { NextResponse } from 'next/server';
import { deleteSession } from '../../../../lib/auth';

function parseCookies(cookieHeader: string | null) {
  const out: Record<string,string> = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx > -1) {
      const k = p.slice(0, idx).trim();
      const v = p.slice(idx+1).trim();
      out[k] = v;
    }
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies['session'];
    if (sessionId) {
      await deleteSession(sessionId);
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookie = `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? '; Secure' : ''}`;
    return new NextResponse(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
