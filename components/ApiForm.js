'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendJson } from '@/lib/client';

// Formulário genérico: coleta os campos (atributo name), envia como JSON para a API
// e mostra erro/sucesso. Se a API devolver { redirect }, navega para lá.
export default function ApiForm({
  endpoint,
  method = 'POST',
  redirectTo,
  submitLabel = 'Salvar',
  successMessage = 'Salvo com sucesso!',
  resetOnSuccess = false,
  className = 'form',
  children,
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {};
    for (const el of form.elements) {
      if (!el.name || el.disabled) continue;
      if (el.type === 'checkbox') data[el.name] = el.checked;
      else if (el.type === 'radio') {
        if (el.checked) data[el.name] = el.value;
      } else data[el.name] = el.value;
    }

    setBusy(true);
    setError('');
    setMessage('');
    const { ok, json } = await sendJson(endpoint, method, data);
    setBusy(false);

    if (!ok) {
      setError(json.error || 'Algo deu errado. Tente novamente.');
      return;
    }
    const target = json.redirect || redirectTo;
    if (target) {
      router.push(target);
      router.refresh();
      return;
    }
    setMessage(json.message || successMessage);
    if (resetOnSuccess) form.reset();
    router.refresh();
  }

  return (
    <form className={className} onSubmit={onSubmit}>
      {children}
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="alert alert-ok" role="status">
          {message}
        </p>
      )}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? 'Aguarde…' : submitLabel}
      </button>
    </form>
  );
}
