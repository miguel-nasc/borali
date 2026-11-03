import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AuthForm, { RoleTabs } from '@/components/AuthForm';

export const metadata = { title: 'Criar conta' };

export default async function RegisterPage({ searchParams }) {
  const user = await getSession();
  if (user) redirect(user.role === 'guide' ? '/guia' : '/');

  const sp = await searchParams;
  const role = sp?.tipo === 'guia' ? 'guide' : 'user';

  return (
    <div className="auth">
      <h1>{role === 'guide' ? 'Cadastro de guia' : 'Criar conta'}</h1>
      <RoleTabs base="/cadastro" role={role} />
      <p className="muted">
        {role === 'guide'
          ? 'Cadastre seus passeios, receba reservas e seja avaliado pelos turistas.'
          : 'Reserve passeios, avalie guias e compartilhe com quem vai junto.'}
      </p>
      <div className="card pad">
        <AuthForm mode="register" role={role} />
      </div>
      <p className="auth-foot">
        Já tem conta?{' '}
        <Link href={role === 'guide' ? '/login?tipo=guia' : '/login'}>Entrar</Link>
      </p>
    </div>
  );
}
