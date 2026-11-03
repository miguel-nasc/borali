import { queryOne, query } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { ok, fail, readBody, str, guard } from '@/lib/api';

// Atualizar o próprio perfil (turista ou guia).
export async function PATCH(req) {
  const { user, res } = await guard();
  if (res) return res;

  const b = await readBody(req);
  const name = str(b.name, 100);
  const phone = str(b.phone, 30);
  const city = str(b.city, 100);
  const bio = str(b.bio, 1000);

  if (name.length < 2) return fail('Informe seu nome completo.');
  if (user.role === 'guide') {
    if (phone.length < 8) return fail('Informe um telefone/WhatsApp para contato.');
    if (city.length < 2) return fail('Informe a cidade onde você atua.');
  }

  const newPassword = typeof b.newPassword === 'string' ? b.newPassword : '';
  if (newPassword) {
    if (newPassword.length < 8) return fail('A nova senha precisa ter pelo menos 8 caracteres.');
    const current = typeof b.currentPassword === 'string' ? b.currentPassword : '';
    const row = await queryOne('SELECT password_hash FROM users WHERE id = $1', [user.id]);
    if (!current || !(await verifyPassword(current, row.password_hash))) {
      return fail('A senha atual está incorreta.', 403);
    }
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [await hashPassword(newPassword), user.id]);
  }

  await query('UPDATE users SET name = $1, phone = $2, city = $3, bio = $4 WHERE id = $5', [
    name,
    phone || null,
    city || null,
    bio || null,
    user.id,
  ]);
  return ok({ message: 'Perfil atualizado!' });
}
