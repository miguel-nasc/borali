import { queryOne } from '@/lib/db';
import { ok, fail, readBody, guard } from '@/lib/api';
import { validateTour, nowLocalString } from '@/lib/tours';

// Guia cadastra um novo passeio.
export async function POST(req) {
  const { user, res } = await guard('guide');
  if (res) return res;

  const b = await readBody(req);
  const { error, value: v } = validateTour(b);
  if (error) return fail(error);
  if (v.starts_at <= nowLocalString()) return fail('A data do passeio precisa ser no futuro.');

  const tour = await queryOne(
    `INSERT INTO tours (guide_id, title, description, location, starts_at, duration_minutes, price_cents, capacity, is_open)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [user.id, v.title, v.description, v.location, v.starts_at, v.duration_minutes, v.price_cents, v.capacity, v.is_open]
  );
  return ok({ id: tour.id, redirect: '/guia' }, 201);
}
