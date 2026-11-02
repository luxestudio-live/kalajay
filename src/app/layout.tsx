import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.kalajay.in'),
  title: {
    default: 'KALAJAY — A World of Little Wonders | Handcrafted Luxury Accessories',
    template: '%s | Kalajay Atelier',
  },
  description:
    'Handcrafted beaded jewellery boxes, clutches, slings, AirPod jewel cases, and curated table pieces. Hand-strung one bead at a time with patience and love by 21 master women artisans in India.',
  keywords: [
    'Kalajay',
    'handcrafted luxury accessories',
    'beaded bags',
    'pearl jewellery box',
    'crystal clutch',
    'beaded airpod case',
    'wedding favours India',
    'luxury handcrafted gifts',
    'artisanal beadwork India',
    'heirloom jewellery box',
  ],
  authors: [{ name: 'Kalajay Atelier', url: 'https://www.kalajay.in' }],
  creator: 'Kalajay Atelier',
  publisher: 'Kalajay Atelier',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.webmanifest',
  other: {
    'mobile-web-app-capable': 'yes',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kalajay',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon.png' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'KALAJAY — A World of Little Wonders | Handcrafted Luxury Accessories',
    description:
      'Small wonders. Patiently made. Hand-strung beaded jewellery boxes, luminous evening clutches, and tactile daily charms by 21 master women artisans in India.',
    url: 'https://www.kalajay.in',
    siteName: 'Kalajay Atelier',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'KALAJAY — Handcrafted Beaded Objects of Affection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KALAJAY — A World of Little Wonders',
    description:
      'Handcrafted beaded jewellery boxes, luminous evening clutches, and tactile daily charms by 21 master women artisans.',
    images: ['/icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF9F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-canvas text-ink antialiased">
      <body className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-champagne selection:text-plum">
        <AuthProvider>
          <CartProvider>
            <AppShell>{children}</AppShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

