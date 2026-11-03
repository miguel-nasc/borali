import Link from 'next/link';
import { getSession } from '@/lib/auth';
import ActionButton from './ActionButton';

export default async function Header() {
  const user = await getSession();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Borali - página inicial">
          <img src="/logo-icon.svg" alt="" width="30" height="38" />
          <img src="/logo-wordmark.svg" alt="Borali" width="91" height="30" />
        </Link>
        <nav className="nav" aria-label="Principal">
          <Link href="/">Passeios</Link>
          {!user && (
            <>
              <Link href="/login">Entrar</Link>
              <Link href="/cadastro?tipo=guia">Sou guia</Link>
              <Link href="/cadastro" className="btn btn-primary btn-sm">Criar conta</Link>
            </>
          )}
          {user?.role === 'user' && <Link href="/perfil">Perfil e reservas</Link>}
          {user?.role === 'guide' && (
            <>
              <Link href="/guia">Meu painel</Link>
              <Link href="/perfil">Perfil</Link>
            </>
          )}
          {user && (
            <>
              <span className="hello">Olá, {user.name.split(' ')[0]}</span>
              <ActionButton endpoint="/api/auth/logout" label="Sair" className="btn btn-ghost btn-sm" />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
