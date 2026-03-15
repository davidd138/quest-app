import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'QuestMaster - Aventuras Interactivas',
  description:
    'Explora aventuras inmersivas con personajes IA, mapas profesionales y conversaciones por voz en tiempo real',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QuestMaster',
  },
  openGraph: {
    title: 'QuestMaster - Aventuras Interactivas',
    description:
      'Explora aventuras inmersivas con personajes IA, mapas profesionales y conversaciones por voz en tiempo real',
    siteName: 'QuestMaster',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'QuestMaster',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuestMaster - Aventuras Interactivas',
    description:
      'Explora aventuras inmersivas con personajes IA, mapas profesionales y conversaciones por voz en tiempo real',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-navy-950 text-slate-200 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
