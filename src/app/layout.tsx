import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Silvio Financeiro - Gestão de Empréstimos',
  description: 'Controle simplificado de empréstimos e amortizações com juros a cada 30 dias',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Silvio Finanças',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="antialiased min-h-screen bg-slate-950 pt-safe pb-safe">
        {children}
      </body>
    </html>
  );
}
