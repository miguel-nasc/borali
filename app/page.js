import Link from 'next/link';
import { listTours } from '@/lib/tours';
import { getSession } from '@/lib/auth';
import TourCard from '@/components/TourCard';

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const q = (typeof sp?.q === 'string' ? sp.q : '').trim();
  const [tours, user] = await Promise.all([listTours({ q, upcomingOnly: true }), getSession()]);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1>
              Bora pra <span className="mark">lá</span>?
            </h1>
            <p className="lead">
              Encontre passeios com guias locais, reserve sua vaga, avalie a experiência e compartilhe com quem vai junto.
            </p>
            <div className="hero-actions">
              {!user && (
                <>
                  <Link href="/cadastro" className="btn btn-accent">Criar conta de turista</Link>
                  <Link href="/cadastro?tipo=guia" className="btn btn-light">Quero ser guia</Link>
                </>
              )}
              {user?.role === 'guide' && <Link href="/guia/novo" className="btn btn-accent">Cadastrar passeio</Link>}
              {user?.role === 'user' && <Link href="/perfil" className="btn btn-accent">Minhas reservas</Link>}
            </div>
          </div>
          <img className="hero-pin" src="/pin-hero.svg" alt="" width="220" height="277" />
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>{q ? `Resultados para “${q}”` : 'Próximos passeios'}</h2>
          <form action="/" className="search" role="search">
            <label htmlFor="q" className="sr-only">Buscar passeios</label>
            <input id="q" name="q" defaultValue={q} placeholder="Buscar por passeio, lugar ou guia" />
            <button className="btn btn-primary" type="submit">Buscar</button>
          </form>
        </div>

        {tours.length === 0 ? (
          <div className="card empty">
            <p>{q ? 'Nenhum passeio encontrado para essa busca.' : 'Ainda não há passeios cadastrados.'}</p>
            {q && <Link href="/" className="btn btn-ghost">Limpar busca</Link>}
          </div>
        ) : (
          <div className="grid">
            {tours.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
