import { query, queryOne } from '@/lib/db';
import { ok, fail, readBody, guard, toInt } from '@/lib/api';

// Turista reserva vagas em um passeio.
export async function POST(req, { params }) {
  const { user, res } = await guard('user');
  if (res) return res;

  const { id } = await params;
  const tourId = toInt(id);
  if (!Number.isInteger(tourId)) return fail('Passeio não encontrado.', 404);

  const b = await readBody(req);
  const seats = toInt(b.seats);
  if (!(seats >= 1 && seats <= 50)) return fail('Informe quantas vagas deseja reservar.');

  const tour = await queryOne(
    `SELECT is_open, (starts_at >= (now() AT TIME ZONE 'America/Fortaleza')) AS upcoming FROM tours WHERE id = $1`,
    [tourId]
  );
  if (!tour) return fail('Passeio não encontrado.', 404);
  if (!tour.is_open || !tour.upcoming) return fail('Este passeio não está aberto para reservas.', 409);

  const existing = await queryOne(
    `SELECT id FROM bookings WHERE tour_id = $1 AND user_id = $2 AND status = 'confirmada'`,
    [tourId, user.id]
  );
  if (existing) return fail('Você já tem uma reserva neste passeio. Cancele-a para reservar de novo.', 409);

  const rows = await query(
    `INSERT INTO bookings (tour_id, user_id, seats)
     SELECT $1::int, $2::int, $3::int
     WHERE $3::int <= (
       SELECT t.capacity - COALESCE((SELECT SUM(b.seats) FROM bookings b
                                     WHERE b.tour_id = t.id AND b.status = 'confirmada'), 0)
       FROM tours t WHERE t.id = $1::int)
     RETURNING id`,
    [tourId, user.id, seats]
  );
  if (!rows.length) return fail('Não há vagas suficientes para essa quantidade.', 409);

  return ok({ message: 'Reserva confirmada! Boa viagem 🎒' }, 201);
}
