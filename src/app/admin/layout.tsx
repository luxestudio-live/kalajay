import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operations Console | Kalajay Luxury Management',
  description: 'Unified administrative console for Kalajay Handcrafted Luxuries ecommerce and Bihar atelier operations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

