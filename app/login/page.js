import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AuthForm, { RoleTabs } from '@/components/AuthForm';

export const metadata = { title: 'Entrar' };

export default async function LoginPage({ searchParams }) {
  const user = await getSession();
  if (user) redirect(user.role === 'guide' ? '/guia' : '/');

  const sp = await searchParams;
  const role = sp?.tipo === 'guia' ? 'guide' : 'user';

  return (
    <div className="auth">
      <h1>Entrar</h1>
      <RoleTabs base="/login" role={role} />
      <div className="card pad">
        <AuthForm mode="login" role={role} />
      </div>
      <p className="auth-foot">
        Ainda não tem conta?{' '}
        <Link href={role === 'guide' ? '/cadastro?tipo=guia' : '/cadastro'}>Cadastre-se</Link>
      </p>
    </div>
  );
}
