import { NextResponse } from 'next/server';
import { getUserBySession } from '../../../../lib/auth';

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

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const sessionId = cookies['session'];
    if (!sessionId) return NextResponse.json({ ok: false }, { status: 401 });

    const user = await getUserBySession(sessionId);
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({ ok: true, user: { email: user.email, name: user.name || null } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
