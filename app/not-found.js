import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container section narrow empty-page">
      <h1>Opa, esse caminho não existe</h1>
      <p className="muted">A página que você procura não foi encontrada ou foi removida.</p>
      <Link href="/" className="btn btn-accent">Voltar para os passeios</Link>
    </div>
  );
}
