'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendJson } from '@/lib/client';

// Botão que dispara uma chamada à API (cancelar reserva, remover passeio, abrir/fechar, sair...).
export default function ActionButton({
  endpoint,
  method = 'POST',
  body,
  label,
  confirmText,
  className = 'btn btn-ghost',
  redirectTo,
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onClick() {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError('');
    const { ok, json } = await sendJson(endpoint, method, body);
    setBusy(false);
    if (!ok) {
      setError(json.error || 'Algo deu errado.');
      return;
    }
    const target = json.redirect || redirectTo;
    if (target) router.push(target);
    router.refresh();
  }

  return (
    <span className="action">
      <button type="button" className={className} onClick={onClick} disabled={busy}>
        {busy ? 'Aguarde…' : label}
      </button>
      {error && (
        <span className="error-text" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
