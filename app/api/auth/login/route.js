import { queryOne } from '@/lib/db';
import { createSession, verifyPassword } from '@/lib/auth';
import { ok, fail, readBody, str } from '@/lib/api';

export async function POST(req) {
  const b = await readBody(req);
  const email = str(b.email, 160).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  if (!email || !password) return fail('Informe e-mail e senha.');

  const user = await queryOne('SELECT id, role, password_hash FROM users WHERE email = $1', [email]);
  const valid = user && (await verifyPassword(password, user.password_hash));
  if (!valid) return fail('E-mail ou senha incorretos.', 401);

  // A aba usada no login (turista ou guia) precisa bater com o tipo da conta.
  if (b.role && b.role !== user.role) {
    return fail(
      user.role === 'guide'
        ? 'Esta conta é de guia. Use a aba "Sou guia" para entrar.'
        : 'Esta conta é de turista. Use a aba "Sou turista" para entrar.',
      403
    );
  }

  await createSession(user);
  return ok({ redirect: user.role === 'guide' ? '/guia' : '/' });
}
