'use client';

import { useState } from 'react';

// Seletor de nota de 1 a 5 estrelas. O valor vai num input escondido (name) para o formulário.
export default function StarInput({ name, label, defaultValue = 0 }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="field">
      <span className="label-like" id={`lbl-${name}`}>
        {label} <span className="req" aria-hidden="true">*</span>
      </span>
      <div className="star-input" role="group" aria-labelledby={`lbl-${name}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={n <= value ? 'on' : ''}
            aria-pressed={n === value}
            aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
            onClick={() => setValue(n)}
          >
            ★
          </button>
        ))}
        <span className="star-value">{value ? `${value} de 5` : 'Escolha uma nota'}</span>
      </div>
      <input type="hidden" name={name} value={value || ''} />
    </div>
  );
}
