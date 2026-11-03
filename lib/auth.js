import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { queryOne } from './db.js';

const COOKIE = 'borali_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET não configurada. Defina a variável de ambiente (veja o README).');
    }
    return new TextEncoder().encode('borali-dev-secret-apenas-para-desenvolvimento-local');
  }
  return new TextEncoder().encode(s);
}

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

export async function createSession(user) {
  const token = await new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

// Retorna o usuário logado (sem o hash da senha) ou null.
export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return await queryOne(
      'SELECT id, role, name, email, phone, city, bio FROM users WHERE id = $1',
      [payload.uid]
    );
  } catch {
    return null;
  }
}
