import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getTour } from '@/lib/tours';
import TourForm from '@/components/TourForm';
import ActionButton from '@/components/ActionButton';

export const metadata = { title: 'Editar passeio' };

export default async function EditTourPage({ params }) {
  const user = await getSession();
  if (!user) redirect('/login?tipo=guia');
  if (user.role !== 'guide') redirect('/');

  const { id } = await params;
  const tour = await getTour(id);
  if (!tour || tour.guide_id !== user.id) notFound();

  return (
    <div className="container section narrow">
      <p className="crumb"><Link href="/guia">← Painel do guia</Link></p>
      <h1>Editar passeio</h1>
      <div className="card pad">
        <TourForm tour={tour} />
      </div>
      <div className="danger-zone">
        <ActionButton
          endpoint={`/api/tours/${tour.id}`}
          method="DELETE"
          redirectTo="/guia"
          label="Remover este passeio"
          className="btn btn-danger"
          confirmText={`Remover o passeio "${tour.title}"? As reservas e avaliações dele também serão apagadas.`}
        />
      </div>
    </div>
  );
}
