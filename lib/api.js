import { NextResponse } from 'next/server';
import { getSession } from './auth.js';

export const ok = (data = {}, status = 200) => NextResponse.json({ ok: true, ...data }, { status });
export const fail = (error, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function readBody(req) {
  try {
    const b = await req.json();
    return b && typeof b === 'object' ? b : {};
  } catch {
    return {};
  }
}

export const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function toInt(v) {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? '').trim(), 10);
  return Number.isInteger(n) ? n : NaN;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Exige login (e, opcionalmente, um tipo de conta). Uso:
//   const { user, res } = await guard('guide'); if (res) return res;
export async function guard(role) {
  const user = await getSession();
  if (!user) return { res: fail('Faça login para continuar.', 401) };
  if (role && user.role !== role) {
    return { res: fail('Esta ação não está disponível para o seu tipo de conta.', 403) };
  }
  return { user };
}
