'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendJson } from '@/lib/client';
import { brl } from '@/lib/format';

// Caixa de reserva: escolhe as vagas, mostra o total e confirma.
export default function BookBox({ tourId, priceCents, spotsLeft }) {
  const router = useRouter();
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const max = Math.min(spotsLeft, 20);
  const total = seats * priceCents;

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { ok, json } = await sendJson(`/api/tours/${tourId}/book`, 'POST', { seats });
    setBusy(false);
    if (!ok) {
      setError(json.error || 'Não foi possível reservar.');
      return;
    }
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="seats">Quantas vagas?</label>
        <input
          id="seats"
          type="number"
          min={1}
          max={max}
          value={seats}
          onChange={(e) => setSeats(Math.max(1, Math.min(max, parseInt(e.target.value, 10) || 1)))}
        />
        <p className="hint">{spotsLeft} {spotsLeft === 1 ? 'vaga restante' : 'vagas restantes'}</p>
      </div>
      <p className="total">
        Total <strong>{priceCents ? brl(total) : 'Gratuito'}</strong>
      </p>
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-accent" type="submit" disabled={busy}>
        {busy ? 'Reservando…' : 'Confirmar reserva'}
      </button>
      <p className="hint">O pagamento é combinado diretamente com o guia.</p>
    </form>
  );
}
