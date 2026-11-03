import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import TourForm from '@/components/TourForm';

export const metadata = { title: 'Cadastrar passeio' };

export default async function NewTourPage() {
  const user = await getSession();
  if (!user) redirect('/login?tipo=guia');
  if (user.role !== 'guide') redirect('/');

  return (
    <div className="container section narrow">
      <p className="crumb"><Link href="/guia">← Painel do guia</Link></p>
      <h1>Cadastrar passeio</h1>
      <div className="card pad">
        <TourForm />
      </div>
    </div>
  );
}
