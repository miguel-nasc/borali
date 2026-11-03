import Link from 'next/link';
import ApiForm from './ApiForm';
import { Field } from './Field';

export function RoleTabs({ base, role }) {
  return (
    <div className="tabs" role="navigation" aria-label="Tipo de conta">
      <Link href={base} aria-current={role === 'user' ? 'page' : undefined}>Sou turista</Link>
      <Link href={`${base}?tipo=guia`} aria-current={role === 'guide' ? 'page' : undefined}>Sou guia</Link>
    </div>
  );
}

// Formulário de login ou cadastro (turista ou guia).
export default function AuthForm({ mode, role }) {
  const guide = role === 'guide';
  const login = mode === 'login';
  return (
    <ApiForm
      endpoint={login ? '/api/auth/login' : '/api/auth/register'}
      submitLabel={login ? 'Entrar' : guide ? 'Criar conta de guia' : 'Criar conta'}
    >
      <input type="hidden" name="role" value={role} />
      {!login && <Field label="Nome completo" name="name" required autoComplete="name" />}
      <Field label="E-mail" name="email" type="email" required autoComplete="email" />
      <Field
        label="Senha"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete={login ? 'current-password' : 'new-password'}
        hint={login ? undefined : 'Mínimo de 8 caracteres.'}
      />
      {!login && (
        <>
          <Field label="Telefone / WhatsApp" name="phone" type="tel" required={guide} autoComplete="tel" />
          <Field label={guide ? 'Cidade onde você atua' : 'Cidade'} name="city" required={guide} autoComplete="address-level2" />
          {guide && (
            <Field
              label="Sobre você"
              name="bio"
              type="textarea"
              placeholder="Conte sua experiência, idiomas e o que torna seus passeios especiais."
            />
          )}
        </>
      )}
    </ApiForm>
  );
}
