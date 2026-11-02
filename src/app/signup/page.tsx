import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: 'Join the Circle · Create Your Atelier Account | Kalajay',
  description:
    'Join the Kalajay Circle and enjoy an inaugural ₹300 welcome gift, live artisan order tracking from loom to doorstep, and exclusive vault access to handcrafted bead drops.',
  alternates: {
    canonical: '/signup',
  },
  openGraph: {
    title: 'Create Account | Kalajay Atelier',
    description: 'Join the Kalajay Circle and claim your ₹300 welcome gift.',
    url: 'https://www.kalajay.in/signup',
  },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm font-serif">Opening Kalajay Registration...</div>}>
      <SignupClient />
    </Suspense>
  );
}

