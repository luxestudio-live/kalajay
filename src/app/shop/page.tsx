import type { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'All Creations · Handcrafted Beaded Objects of Affection',
  description:
    'Explore all 69 hand-strung beaded creations by Kalajay Atelier. Handcrafted pearl jewellery boxes, crystal clutches, everyday totes, and AirPod jewel cases by 21 master women artisans.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'All Handcrafted Pieces · Kalajay Digital Flagship',
    description:
      'Explore all 69 hand-strung beaded creations by Kalajay Atelier. Filter by category, color palette, or bespoke colorway.',
    url: 'https://www.kalajay.in/shop',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Kalajay Atelier — All Handcrafted Creations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Handcrafted Pieces · Kalajay Digital Flagship',
    description:
      'Explore all 69 hand-strung beaded creations by Kalajay Atelier.',
    images: ['/icon.png'],
  },
};

export default function ShopPage() {
  return <ShopClient />;
}
