import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'VedaAI — AI Assessment Creator',
  description: 'Create AI-powered question papers for your students in minutes. Generate structured, curriculum-aligned assessments with VedaAI.',
  keywords: ['AI assessment', 'question paper generator', 'CBSE', 'teacher tools', 'VedaAI'],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'VedaAI — AI Assessment Creator',
    description: 'Create AI-powered question papers for your students in minutes.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#2f2f2f',
              color: '#ffffff',
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#4bc16c', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#c43535', secondary: '#ffffff' },
            },
          }}
        />
      </body>
    </html>
  );
}
