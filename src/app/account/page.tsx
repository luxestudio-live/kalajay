import type { Metadata } from 'next';
import { Suspense } from 'react';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'My Craft House Portfolio · Orders, Provenance & Addresses | Kalajay',
  description:
    'Manage your Kalajay Patron profile, track live hand-strung bead milestones from our looms to wax-sealed dispatch, review heirloom tax invoices, and manage saved delivery addresses.',
  alternates: {
    canonical: '/account',
  },
  openGraph: {
    title: 'Patron Account & Order Chronicle | Kalajay Craft House',
    description: 'Track orders, artisan provenance signatures, and saved destinations.',
    url: 'https://www.kalajay.in/account',
  },
};

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm font-serif">Opening Kalajay Portfolio...</div>}>
      <AccountClient />
    </Suspense>
  );
}

