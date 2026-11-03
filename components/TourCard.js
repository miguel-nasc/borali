import Link from 'next/link';
import Stars from './Stars';
import { brl, fmtDate, fmtDuration } from '@/lib/format';

export default function TourCard({ tour }) {
  const full = tour.spots_left <= 0;
  const open = tour.is_open && tour.upcoming && !full;
  return (
    <Link href={`/passeios/${tour.id}`} className="card tour-card">
      <div className="tour-card-top">
        <span className={`badge ${open ? 'badge-open' : 'badge-closed'}`}>
          {!tour.upcoming ? 'Encerrado' : !tour.is_open ? 'Fechado' : full ? 'Esgotado' : 'Aberto'}
        </span>
        <span className="price">{brl(tour.price_cents)}</span>
      </div>
      <h3>{tour.title}</h3>
      <p className="meta">📍 {tour.location}</p>
      <p className="meta">🗓 {fmtDate(tour.starts_at)} · {fmtDuration(tour.duration_minutes)}</p>
      <div className="tour-card-foot">
        <span className="guide-line">com <strong>{tour.guide_name}</strong></span>
        <Stars value={tour.tour_rating} count={tour.reviews_count} />
      </div>
    </Link>
  );
}
