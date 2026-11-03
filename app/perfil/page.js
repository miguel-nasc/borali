import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { listUserBookings, getGuideRating } from '@/lib/tours';
import { brl, fmtDate } from '@/lib/format';
import ApiForm from '@/components/ApiForm';
import ActionButton from '@/components/ActionButton';
import Stars from '@/components/Stars';
import { Field } from '@/components/Field';

export const metadata = { title: 'Meu perfil' };

export default async function ProfilePage() {
  const user = await getSession();
  if (!user) redirect('/login');
  const guide = user.role === 'guide';

  const bookings = guide ? [] : await listUserBookings(user.id);
  const rating = guide ? await getGuideRating(user.id) : null;

  return (
    <div className="container section narrow">
      <h1>Meu perfil</h1>
      <p className="muted">
        Conta de {guide ? 'guia' : 'turista'} · {user.email}
      </p>
      {guide && rating && (
        <p>
          Sua nota como guia: <Stars value={rating.rating} count={rating.total} />
        </p>
      )}

      <div className="card pad">
        <ApiForm endpoint="/api/me" method="PATCH" submitLabel="Salvar perfil" successMessage="Perfil atualizado!">
          <Field label="Nome completo" name="name" required defaultValue={user.name} autoComplete="name" />
          <Field label="E-mail" name="email" type="email" defaultValue={user.email} disabled hint="O e-mail não pode ser alterado." />
          <div className="row-2">
            <Field label="Telefone / WhatsApp" name="phone" type="tel" required={guide} defaultValue={user.phone} autoComplete="tel" />
            <Field label="Cidade" name="city" required={guide} defaultValue={user.city} autoComplete="address-level2" />
          </div>
          <Field label={guide ? 'Sobre você' : 'Sobre você (opcional)'} name="bio" type="textarea" defaultValue={user.bio} />
          <fieldset className="fieldset">
            <legend>Alterar senha (opcional)</legend>
            <div className="row-2">
              <Field label="Senha atual" name="currentPassword" type="password" autoComplete="current-password" />
              <Field label="Nova senha" name="newPassword" type="password" minLength={8} autoComplete="new-password" hint="Mínimo de 8 caracteres." />
            </div>
          </fieldset>
        </ApiForm>
      </div>

      {!guide && (
        <section id="reservas">
          <h2>Minhas reservas</h2>
          {bookings.length === 0 ? (
            <div className="card pad empty">
              <p>Você ainda não reservou nenhum passeio.</p>
              <Link href="/" className="btn btn-accent">Ver passeios</Link>
            </div>
          ) : (
            <ul className="list">
              {bookings.map((b) => (
                <li key={b.id} className="card pad booking">
                  <div>
                    <span className={`badge ${b.status === 'confirmada' ? 'badge-open' : 'badge-closed'}`}>
                      {b.status === 'confirmada' ? 'Confirmada' : 'Cancelada'}
                    </span>
                    <h3><Link href={`/passeios/${b.tour_id}`}>{b.title}</Link></h3>
                    <p className="meta">📍 {b.location} · 🗓 {fmtDate(b.starts_at)}</p>
                    <p className="meta">
                      {b.seats} {b.seats === 1 ? 'vaga' : 'vagas'}
                      {b.price_cents ? ` · ${brl(b.seats * b.price_cents)}` : ' · Gratuito'} · guia {b.guide_name}
                    </p>
                  </div>
                  <div className="booking-actions">
                    <Link href={`/passeios/${b.tour_id}#avaliacoes`} className="btn btn-ghost btn-sm">
                      {b.status === 'confirmada' ? 'Avaliar' : 'Ver passeio'}
                    </Link>
                    {b.status === 'confirmada' && (
                      <ActionButton
                        endpoint={`/api/bookings/${b.id}`}
                        method="DELETE"
                        label="Cancelar"
                        className="btn btn-danger btn-sm"
                        confirmText="Cancelar esta reserva?"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
