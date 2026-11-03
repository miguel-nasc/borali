import { query, queryOne } from '@/lib/db';
import { createSession, hashPassword } from '@/lib/auth';
import { ok, fail, readBody, str, EMAIL_RE } from '@/lib/api';

export async function POST(req) {
  const b = await readBody(req);
  const role = b.role === 'guide' ? 'guide' : 'user';
  const name = str(b.name, 100);
  const email = str(b.email, 160).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  const phone = str(b.phone, 30);
  const city = str(b.city, 100);
  const bio = str(b.bio, 1000);

  if (name.length < 2) return fail('Informe seu nome completo.');
  if (!EMAIL_RE.test(email)) return fail('Informe um e-mail válido.');
  if (password.length < 8) return fail('A senha precisa ter pelo menos 8 caracteres.');
  if (role === 'guide') {
    if (phone.length < 8) return fail('Informe um telefone/WhatsApp para contato.');
    if (city.length < 2) return fail('Informe a cidade onde você atua.');
  }

  const exists = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
  if (exists) return fail('Já existe uma conta com este e-mail.', 409);

  const hash = await hashPassword(password);
  const [user] = await query(
    `INSERT INTO users (role, name, email, password_hash, phone, city, bio)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, role`,
    [role, name, email, hash, phone || null, city || null, bio || null]
  );

  await createSession(user);
  return ok({ redirect: role === 'guide' ? '/guia' : '/' }, 201);
}
