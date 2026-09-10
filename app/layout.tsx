import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
});

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
);

// oxlint-disable-next-line react/only-export-components
export const metadata: Metadata = {
  metadataBase,
  title: 'NOVA — Build Better. Work Smarter.',
  description:
    'NOVA is an AI-powered productivity platform for teams to manage projects, automate work, and collaborate efficiently.',
  openGraph: {
    title: 'NOVA — Build Better. Work Smarter.',
    description:
      'NOVA is an AI-powered productivity platform for teams to manage projects, automate work, and collaborate efficiently.',
    type: 'website',
    siteName: 'NOVA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOVA — Build Better. Work Smarter.',
    description:
      'NOVA is an AI-powered productivity platform for teams to manage projects, automate work, and collaborate efficiently.',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

// oxlint-disable-next-line react/only-export-components
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
};

// Apply the saved theme to <html> before first paint to avoid a flash of
// the wrong theme. Mirrors the logic in lib/hooks/useTheme.ts.
const themeInitScript = `(function(){try{var t=localStorage.getItem('nova-theme')||'dark';var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',dark);r.classList.toggle('light',!dark);r.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark scroll-smooth ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased min-h-screen overflow-x-hidden transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}