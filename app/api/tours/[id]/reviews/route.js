import { query, queryOne } from '@/lib/db';
import { ok, fail, readBody, str, guard, toInt } from '@/lib/api';

// Turista avalia o passeio e o guia (só quem reservou). Enviar de novo atualiza a avaliação.
export async function POST(req, { params }) {
  const { user, res } = await guard('user');
  if (res) return res;

  const { id } = await params;
  const tourId = toInt(id);
  if (!Number.isInteger(tourId)) return fail('Passeio não encontrado.', 404);

  const b = await readBody(req);
  const tourRating = toInt(b.tour_rating);
  const guideRating = toInt(b.guide_rating);
  const comment = str(b.comment, 1000);
  if (!(tourRating >= 1 && tourRating <= 5)) return fail('Dê uma nota de 1 a 5 para o passeio.');
  if (!(guideRating >= 1 && guideRating <= 5)) return fail('Dê uma nota de 1 a 5 para o guia.');

  const booking = await queryOne(
    `SELECT id FROM bookings WHERE tour_id = $1 AND user_id = $2 AND status = 'confirmada'`,
    [tourId, user.id]
  );
  if (!booking) return fail('Só quem reservou este passeio pode avaliá-lo.', 403);

  await query(
    `INSERT INTO reviews (tour_id, user_id, tour_rating, guide_rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tour_id, user_id) DO UPDATE
       SET tour_rating = EXCLUDED.tour_rating, guide_rating = EXCLUDED.guide_rating,
           comment = EXCLUDED.comment, created_at = now()`,
    [tourId, user.id, tourRating, guideRating, comment]
  );
  return ok({ message: 'Avaliação enviada. Obrigado!' }, 201);
}
