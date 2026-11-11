import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KALAJAY — A World of Little Wonders',
    short_name: 'Kalajay',
    description:
      'Handcrafted beaded jewellery boxes, luminous evening clutches, and tactile daily charms by 21 master women artisans in India.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#F7F3EC',
    theme_color: '#F7F3EC',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-IN',
    categories: ['shopping', 'lifestyle'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

