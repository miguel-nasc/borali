import { query, queryOne } from './db.js';
import { str, toInt } from './api.js';

const NOW_LOCAL = "(now() AT TIME ZONE 'America/Fortaleza')";

const TOUR_SELECT = `
  SELECT t.id, t.title, t.description, t.location,
    to_char(t.starts_at, 'YYYY-MM-DD"T"HH24:MI') AS starts_at,
    t.duration_minutes, t.price_cents, t.capacity, t.is_open,
    (t.starts_at >= ${NOW_LOCAL}) AS upcoming,
    u.id AS guide_id, u.name AS guide_name, u.city AS guide_city, u.bio AS guide_bio,
    (t.capacity - COALESCE((SELECT SUM(b.seats) FROM bookings b
        WHERE b.tour_id = t.id AND b.status = 'confirmada'), 0))::int AS spots_left,
    (SELECT ROUND(AVG(r.tour_rating)::numeric, 1)::float8 FROM reviews r WHERE r.tour_id = t.id) AS tour_rating,
    (SELECT COUNT(*)::int FROM reviews r WHERE r.tour_id = t.id) AS reviews_count,
    (SELECT ROUND(AVG(r.guide_rating)::numeric, 1)::float8
       FROM reviews r JOIN tours t2 ON t2.id = r.tour_id WHERE t2.guide_id = t.guide_id) AS guide_rating
  FROM tours t JOIN users u ON u.id = t.guide_id
`;

export async function listTours({ q = '', guideId = null, upcomingOnly = false } = {}) {
  const term = q ? q.slice(0, 80) : null;
  return query(
    `${TOUR_SELECT}
     WHERE ($1::int IS NULL OR t.guide_id = $1::int)
       AND ($2::text IS NULL OR t.title ILIKE '%' || $2::text || '%'
            OR t.location ILIKE '%' || $2::text || '%' OR u.name ILIKE '%' || $2::text || '%')
       AND (NOT $3::boolean OR t.starts_at >= ${NOW_LOCAL})
     ORDER BY t.is_open DESC, t.starts_at ASC`,
    [guideId, term, upcomingOnly]
  );
}

export async function getTour(id) {
  const n = toInt(id);
  if (!Number.isInteger(n)) return null;
  return queryOne(`${TOUR_SELECT} WHERE t.id = $1`, [n]);
}

export function listReviews(tourId) {
  return query(
    `SELECT r.id, r.user_id, r.tour_rating, r.guide_rating, r.comment,
            to_char(r.created_at AT TIME ZONE 'America/Fortaleza', 'DD/MM/YYYY') AS created,
            u.name AS author
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.tour_id = $1 ORDER BY r.created_at DESC`,
    [tourId]
  );
}

export function getMyBooking(tourId, userId) {
  return queryOne(
    `SELECT id, seats FROM bookings WHERE tour_id = $1 AND user_id = $2 AND status = 'confirmada'`,
    [tourId, userId]
  );
}

export function getMyReview(tourId, userId) {
  return queryOne(
    `SELECT tour_rating, guide_rating, comment FROM reviews WHERE tour_id = $1 AND user_id = $2`,
    [tourId, userId]
  );
}

export function listUserBookings(userId) {
  return query(
    `SELECT b.id, b.seats, b.status, t.id AS tour_id, t.title, t.location,
            to_char(t.starts_at, 'YYYY-MM-DD"T"HH24:MI') AS starts_at,
            t.price_cents, u.name AS guide_name
     FROM bookings b JOIN tours t ON t.id = b.tour_id JOIN users u ON u.id = t.guide_id
     WHERE b.user_id = $1 ORDER BY b.status ASC, t.starts_at DESC`,
    [userId]
  );
}

export function listGuideParticipants(guideId) {
  return query(
    `SELECT b.tour_id, b.seats, u.name, u.phone
     FROM bookings b JOIN tours t ON t.id = b.tour_id JOIN users u ON u.id = b.user_id
     WHERE t.guide_id = $1 AND b.status = 'confirmada' ORDER BY b.created_at`,
    [guideId]
  );
}

export async function getGuideRating(guideId) {
  const r = await queryOne(
    `SELECT ROUND(AVG(r.guide_rating)::numeric, 1)::float8 AS rating, COUNT(*)::int AS total
     FROM reviews r JOIN tours t ON t.id = r.tour_id WHERE t.guide_id = $1`,
    [guideId]
  );
  return r;
}

// Valida os dados de um passeio. `base` traz os valores atuais (em edições parciais).
export function validateTour(input, base = {}) {
  const has = (k) => Object.prototype.hasOwnProperty.call(input, k);
  const v = {
    title: has('title') ? str(input.title, 120) : base.title,
    location: has('location') ? str(input.location, 160) : base.location,
    description: has('description') ? str(input.description, 2000) : base.description ?? '',
    starts_at: has('starts_at') ? str(input.starts_at, 20) : base.starts_at,
    duration_minutes: has('duration_minutes') ? toInt(input.duration_minutes) : base.duration_minutes ?? 120,
    capacity: has('capacity') ? toInt(input.capacity) : base.capacity ?? 10,
    is_open: has('is_open') ? input.is_open === true || input.is_open === 'true' : base.is_open ?? true,
  };

  if (has('price')) {
    const p = Number(String(input.price).replace(',', '.'));
    if (!Number.isFinite(p) || p < 0 || p > 100000) return { error: 'Informe um preço válido (use 0 para gratuito).' };
    v.price_cents = Math.round(p * 100);
  } else {
    v.price_cents = base.price_cents ?? 0;
  }

  if (!v.title || v.title.length < 3) return { error: 'Dê um título ao passeio (mínimo de 3 letras).' };
  if (!v.location || v.location.length < 2) return { error: 'Informe o local de encontro ou destino.' };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v.starts_at || '')) return { error: 'Informe a data e a hora do passeio.' };
  if (!(v.duration_minutes >= 15 && v.duration_minutes <= 1440)) return { error: 'A duração deve ficar entre 15 minutos e 24 horas.' };
  if (!(v.capacity >= 1 && v.capacity <= 500)) return { error: 'O número de vagas deve ficar entre 1 e 500.' };
  return { value: v };
}

// Horário atual em Fortaleza (UTC-3, sem horário de verão) no formato dos passeios.
export const nowLocalString = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 16);
