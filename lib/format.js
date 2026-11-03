const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const brl = (cents) => (!cents ? 'Gratuito' : BRL.format(cents / 100));

// Datas dos passeios são guardadas "como digitadas" (horário local, sem fuso),
// no formato YYYY-MM-DDTHH:MM. Formatamos sem converter fuso para não deslocar a hora.
export function fmtDate(s, { time = true } = {}) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(s));
  if (!m) return String(s);
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  return d.toLocaleString('pt-BR', {
    timeZone: 'UTC',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(time ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export const fmtRating = (n) => (n == null ? '–' : Number(n).toFixed(1).replace('.', ','));
