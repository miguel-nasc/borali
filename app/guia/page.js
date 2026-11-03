import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listTours, listGuideParticipants, getGuideRating } from '@/lib/tours';
import { brl, fmtDate } from '@/lib/format';
import ActionButton from '@/components/ActionButton';
import Stars from '@/components/Stars';

export const metadata = { title: 'Painel do guia' };

export default async function GuideDashboard() {
  const user = await getSession();
  if (!user) redirect('/login?tipo=guia');
  if (user.role !== 'guide') redirect('/');

  const [tours, participants, rating] = await Promise.all([
    listTours({ guideId: user.id }),
    listGuideParticipants(user.id),
    getGuideRating(user.id),
  ]);

  const byTour = new Map();
  for (const p of participants) {
    if (!byTour.has(p.tour_id)) byTour.set(p.tour_id, []);
    byTour.get(p.tour_id).push(p);
  }
  const seatsBooked = participants.reduce((sum, p) => sum + p.seats, 0);

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <h1>Painel do guia</h1>
          <p className="muted">Olá, {user.name}. Gerencie seus passeios e veja quem reservou.</p>
        </div>
        <Link href="/guia/novo" className="btn btn-accent">+ Cadastrar passeio</Link>
      </div>

      <div className="stats">
        <div className="card pad stat"><span className="stat-n">{tours.length}</span><span className="muted">passeios</span></div>
        <div className="card pad stat"><span className="stat-n">{seatsBooked}</span><span className="muted">vagas reservadas</span></div>
        <div className="card pad stat"><span className="stat-n"><Stars value={rating?.rating} count={rating?.total} /></span><span className="muted">nota como guia</span></div>
      </div>

      {tours.length === 0 ? (
        <div className="card pad empty">
          <p>Você ainda não cadastrou nenhum passeio.</p>
          <Link href="/guia/novo" className="btn btn-accent">Cadastrar meu primeiro passeio</Link>
        </div>
      ) : (
        <ul className="list">
          {tours.map((t) => {
            const people = byTour.get(t.id) || [];
            return (
              <li key={t.id} className="card pad guide-tour">
                <div className="guide-tour-main">
                  <span className={`badge ${t.is_open && t.upcoming ? 'badge-open' : 'badge-closed'}`}>
                    {!t.upcoming ? 'Encerrado' : t.is_open ? 'Aberto' : 'Fechado'}
                  </span>
                  <h3><Link href={`/passeios/${t.id}`}>{t.title}</Link></h3>
                  <p className="meta">📍 {t.location} · 🗓 {fmtDate(t.starts_at)}</p>
                  <p className="meta">
                    {brl(t.price_cents)} · {t.capacity - t.spots_left}/{t.capacity} vagas reservadas · <Stars value={t.tour_rating} count={t.reviews_count} />
                  </p>
                  {people.length > 0 && (
                    <details className="people">
                      <summary>Ver reservas ({people.length})</summary>
                      <ul>
                        {people.map((p, i) => (
                          <li key={i}>
                            {p.name} · {p.seats} {p.seats === 1 ? 'vaga' : 'vagas'}{p.phone ? ` · ${p.phone}` : ''}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
                <div className="booking-actions">
                  <Link href={`/guia/${t.id}/editar`} className="btn btn-primary btn-sm">Editar</Link>
                  <ActionButton
                    endpoint={`/api/tours/${t.id}`}
                    method="PATCH"
                    body={{ is_open: !t.is_open }}
                    label={t.is_open ? 'Fechar reservas' : 'Abrir reservas'}
                    className="btn btn-ghost btn-sm"
                  />
                  <ActionButton
                    endpoint={`/api/tours/${t.id}`}
                    method="DELETE"
                    label="Remover"
                    className="btn btn-danger btn-sm"
                    confirmText={`Remover o passeio "${t.title}"? As reservas e avaliações dele também serão apagadas.`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
