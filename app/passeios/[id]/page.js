import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getTour, listReviews, getMyBooking, getMyReview } from '@/lib/tours';
import { brl, fmtDate, fmtDuration } from '@/lib/format';
import Stars from '@/components/Stars';
import BookBox from '@/components/BookBox';
import ShareButtons from '@/components/ShareButtons';
import ActionButton from '@/components/ActionButton';
import ApiForm from '@/components/ApiForm';
import StarInput from '@/components/StarInput';
import { Field } from '@/components/Field';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const tour = await getTour(id);
  if (!tour) return { title: 'Passeio não encontrado' };
  const description = `${tour.location} · ${fmtDate(tour.starts_at)} · com ${tour.guide_name}`;
  return { title: tour.title, description, openGraph: { title: `${tour.title} · Borali`, description } };
}

export default async function TourPage({ params }) {
  const { id } = await params;
  const tour = await getTour(id);
  if (!tour) notFound();

  const user = await getSession();
  const isUser = user?.role === 'user';
  const isOwner = user?.role === 'guide' && user.id === tour.guide_id;

  const [reviews, myBooking, myReview] = await Promise.all([
    listReviews(tour.id),
    isUser ? getMyBooking(tour.id, user.id) : null,
    isUser ? getMyReview(tour.id, user.id) : null,
  ]);

  const full = tour.spots_left <= 0;
  const bookable = tour.is_open && tour.upcoming && !full;

  return (
    <div className="container section">
      <p className="crumb"><Link href="/">← Todos os passeios</Link></p>
      <div className="two-col">
        <div>
          <span className={`badge ${bookable ? 'badge-open' : 'badge-closed'}`}>
            {!tour.upcoming ? 'Encerrado' : !tour.is_open ? 'Fechado' : full ? 'Esgotado' : 'Aberto'}
          </span>
          <h1 className="tour-title">{tour.title}</h1>
          <ul className="facts">
            <li>📍 {tour.location}</li>
            <li>🗓 {fmtDate(tour.starts_at)}</li>
            <li>⏱ {fmtDuration(tour.duration_minutes)}</li>
          </ul>
          <div className="ratings">
            <div><span className="muted">Passeio</span> <Stars value={tour.tour_rating} count={tour.reviews_count} /></div>
            <div><span className="muted">Guia</span> <Stars value={tour.guide_rating} /></div>
          </div>

          {tour.description && (
            <>
              <h2>Sobre o passeio</h2>
              <p className="prose">{tour.description}</p>
            </>
          )}

          <div className="card pad guide-card">
            <h2>Seu guia</h2>
            <p><strong>{tour.guide_name}</strong>{tour.guide_city ? ` · ${tour.guide_city}` : ''}</p>
            {tour.guide_bio && <p className="prose">{tour.guide_bio}</p>}
          </div>

          <section id="avaliacoes">
            <h2>Avaliações</h2>

            {isUser && myBooking && (
              <div className="card pad review-form">
                <h3>{myReview ? 'Editar sua avaliação' : 'Avalie o passeio e o guia'}</h3>
                <ApiForm
                  endpoint={`/api/tours/${tour.id}/reviews`}
                  submitLabel={myReview ? 'Atualizar avaliação' : 'Enviar avaliação'}
                  successMessage="Avaliação enviada. Obrigado!"
                >
                  <StarInput name="tour_rating" label="Nota do passeio" defaultValue={myReview?.tour_rating ?? 0} />
                  <StarInput name="guide_rating" label="Nota do guia" defaultValue={myReview?.guide_rating ?? 0} />
                  <Field label="Comentário" name="comment" type="textarea" defaultValue={myReview?.comment} placeholder="Conte como foi a experiência." />
                </ApiForm>
              </div>
            )}
            {isUser && !myBooking && (
              <p className="muted">Reserve este passeio para poder avaliá-lo.</p>
            )}

            {reviews.length === 0 ? (
              <p className="muted">Ainda não há avaliações.</p>
            ) : (
              <ul className="reviews">
                {reviews.map((r) => (
                  <li key={r.id} className="card pad">
                    <div className="review-head">
                      <strong>{r.author}</strong>
                      <span className="muted">{r.created}</span>
                    </div>
                    <div className="ratings">
                      <div><span className="muted">Passeio</span> <Stars value={r.tour_rating} /></div>
                      <div><span className="muted">Guia</span> <Stars value={r.guide_rating} /></div>
                    </div>
                    {r.comment && <p className="prose">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="sidebar card pad">
          <p className="price-big">{brl(tour.price_cents)}{tour.price_cents ? <span className="muted"> /pessoa</span> : null}</p>

          {isUser && myBooking ? (
            <div>
              <p className="alert alert-ok">
                Reserva confirmada: {myBooking.seats} {myBooking.seats === 1 ? 'vaga' : 'vagas'}
                {tour.price_cents ? ` · ${brl(myBooking.seats * tour.price_cents)}` : ''}
              </p>
              <ActionButton
                endpoint={`/api/bookings/${myBooking.id}`}
                method="DELETE"
                label="Cancelar reserva"
                className="btn btn-danger"
                confirmText="Cancelar sua reserva neste passeio?"
              />
            </div>
          ) : !tour.upcoming ? (
            <p className="muted">Este passeio já aconteceu.</p>
          ) : !tour.is_open ? (
            <p className="muted">As reservas foram encerradas pelo guia.</p>
          ) : full ? (
            <p className="muted">Todas as vagas foram reservadas.</p>
          ) : !user ? (
            <div className="stack">
              <p className="muted">Entre na sua conta para reservar.</p>
              <Link href="/login" className="btn btn-accent">Entrar para reservar</Link>
              <Link href="/cadastro" className="btn btn-ghost">Criar conta</Link>
            </div>
          ) : isOwner ? (
            <Link href={`/guia/${tour.id}/editar`} className="btn btn-primary">Gerenciar passeio</Link>
          ) : !isUser ? (
            <p className="muted">Contas de guia não fazem reservas.</p>
          ) : (
            <BookBox tourId={tour.id} priceCents={tour.price_cents} spotsLeft={tour.spots_left} />
          )}

          <hr />
          <ShareButtons path={`/passeios/${tour.id}`} title={tour.title} />
        </aside>
      </div>
    </div>
  );
}
