'use client';

import { useEffect, useState } from 'react';

// Compartilhar o passeio: menu nativo do celular, WhatsApp, e-mail ou copiar o link.
export default function ShareButtons({ path, title }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const url = () => window.location.origin + path;
  const text = `Bora pra lá? Olha esse passeio no Borali: ${title}`;

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url: url() });
    } catch {
      /* usuário cancelou */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Copie o link do passeio:', url());
    }
  }

  const whatsapp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`, '_blank', 'noopener');

  const email = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n${url()}`)}`;
  };

  return (
    <div className="share">
      <p className="share-title">Compartilhar com alguém</p>
      <div className="share-row">
        {canShare && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={nativeShare}>
            Compartilhar
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-sm" onClick={whatsapp}>
          WhatsApp
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={email}>
          E-mail
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
          {copied ? 'Link copiado!' : 'Copiar link'}
        </button>
      </div>
    </div>
  );
}
