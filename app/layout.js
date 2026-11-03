import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import './globals.css';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: { default: 'Borali – bora pra lá', template: '%s · Borali' },
  description: 'Encontre passeios com guias locais, reserve, avalie e compartilhe com quem vai junto.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">Borali · bora pra lá 🧭</div>
        </footer>
      </body>
    </html>
  );
}
