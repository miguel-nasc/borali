import { query, queryOne } from '@/lib/db';
import { ok, fail, readBody, guard, toInt } from '@/lib/api';
import { validateTour } from '@/lib/tours';

async function ownTour(user, params) {
  const { id } = await params;
  const n = toInt(id);
  if (!Number.isInteger(n)) return null;
  return queryOne(
    `SELECT id, title, description, location,
            to_char(starts_at, 'YYYY-MM-DD"T"HH24:MI') AS starts_at,
            duration_minutes, price_cents, capacity, is_open
     FROM tours WHERE id = $1 AND guide_id = $2`,
    [n, user.id]
  );
}

// Guia atualiza o próprio passeio (edição completa ou parcial, ex.: abrir/fechar).
export async function PATCH(req, { params }) {
  const { user, res } = await guard('guide');
  if (res) return res;

  const tour = await ownTour(user, params);
  if (!tour) return fail('Passeio não encontrado.', 404);

  const { error, value: v } = validateTour(await readBody(req), tour);
  if (error) return fail(error);

  const booked = await queryOne(
    `SELECT COALESCE(SUM(seats), 0)::int AS n FROM bookings WHERE tour_id = $1 AND status = 'confirmada'`,
    [tour.id]
  );
  if (v.capacity < booked.n) {
    return fail(`Já existem ${booked.n} vagas reservadas. O limite não pode ser menor que isso.`);
  }

  await query(
    `UPDATE tours SET title = $1, description = $2, location = $3, starts_at = $4,
            duration_minutes = $5, price_cents = $6, capacity = $7, is_open = $8 WHERE id = $9`,
    [v.title, v.description, v.location, v.starts_at, v.duration_minutes, v.price_cents, v.capacity, v.is_open, tour.id]
  );
  return ok({ redirect: undefined });
}

// Guia remove o próprio passeio (reservas e avaliações dele são removidas junto).
export async function DELETE(_req, { params }) {
  const { user, res } = await guard('guide');
  if (res) return res;

  const tour = await ownTour(user, params);
  if (!tour) return fail('Passeio não encontrado.', 404);

  await query('DELETE FROM tours WHERE id = $1', [tour.id]);
  return ok();
}
