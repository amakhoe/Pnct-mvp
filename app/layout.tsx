import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Gestão de Tuberculose | PNCT Moçambique',
  description:
    'Sistema de vigilância epidemiológica e gestão de tuberculose em Moçambique (MISAU/PNCT), abrangendo as 11 províncias, distritos municipais, unidades sanitárias e análise de zonas de risco.',
  openGraph: {
    title: 'Gestão de Tuberculose | PNCT Moçambique',
    description:
      'Sistema de vigilância epidemiológica e gestão de tuberculose em Moçambique (MISAU/PNCT), abrangendo as 11 províncias, distritos municipais, unidades sanitárias e análise de zonas de risco.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body suppressHydrationWarning className="bg-slate-100 min-h-screen text-slate-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
