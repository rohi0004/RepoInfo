import { getDatabase } from './mongodb';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function parseObjectId(id: any) {
  return id; // keep raw; caller can use _id
}

export async function findUserByEmail(email: string) {
  const db = await getDatabase();
  return db.collection('users').findOne({ email });
}

export async function createUser({ email, password, name }: { email: string; password: string; name?: string }) {
  const db = await getDatabase();

  // ensure unique index (safe to call multiple times)
  try {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  } catch (err) {
    // ignore index creation errors
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const now = new Date();
  const res = await db.collection('users').insertOne({ email, passwordHash, name: name || null, createdAt: now });
  return await db.collection('users').findOne({ _id: res.insertedId });
}

export async function verifyPassword(password: string, passwordHash: string) {
  try {
    return bcrypt.compareSync(password, passwordHash);
  } catch (err) {
    return false;
  }
}

export async function createSession(userId: any) {
  const db = await getDatabase();
  const sessionId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.collection('sessions').insertOne({ sessionId, userId, createdAt: now, expiresAt });
  return { sessionId, expiresAt };
}

export async function getUserBySession(sessionId: string) {
  if (!sessionId) return null;
  const db = await getDatabase();
  const session = await db.collection('sessions').findOne({ sessionId });
  if (!session) return null;
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    // expired
    try { await db.collection('sessions').deleteOne({ sessionId }); } catch (e) {}
    return null;
  }
  const user = await db.collection('users').findOne({ _id: session.userId });
  return user || null;
}

export async function deleteSession(sessionId: string) {
  if (!sessionId) return;
  const db = await getDatabase();
  await db.collection('sessions').deleteOne({ sessionId });
}
