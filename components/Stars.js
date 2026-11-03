import { fmtRating } from '@/lib/format';

export default function Stars({ value, count }) {
  if (value == null) return <span className="muted">Sem avaliações</span>;
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`Nota ${fmtRating(value)} de 5`}>
      <span aria-hidden="true">
        {'★'.repeat(full)}
        {'☆'.repeat(5 - full)}
      </span>{' '}
      <strong>{fmtRating(value)}</strong>
      {count != null && <span className="muted"> ({count})</span>}
    </span>
  );
}
