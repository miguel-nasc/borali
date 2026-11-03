import { query, queryOne } from '@/lib/db';
import { ok, fail, guard, toInt } from '@/lib/api';

// Turista cancela a própria reserva (as vagas voltam para o passeio).
export async function DELETE(_req, { params }) {
  const { user, res } = await guard('user');
  if (res) return res;

  const { id } = await params;
  const n = toInt(id);
  if (!Number.isInteger(n)) return fail('Reserva não encontrada.', 404);

  const booking = await queryOne(
    `SELECT id FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'confirmada'`,
    [n, user.id]
  );
  if (!booking) return fail('Reserva não encontrada.', 404);

  await query(`UPDATE bookings SET status = 'cancelada' WHERE id = $1`, [n]);
  return ok();
}
