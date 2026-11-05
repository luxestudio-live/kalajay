import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Sign In · Enter the Kalajay Circle | OTP & Patron Access',
  description:
    'Sign in to your Kalajay Craft House account using instant Mobile OTP or email. Track your hand-strung bead pieces from our looms to wax-sealed dispatch, access heirloom invoices, and unlock custom studio designs.',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'Patron Sign In | Kalajay Craft House',
    description: 'Enter the Kalajay Circle with instant Mobile OTP or password.',
    url: 'https://www.kalajay.in/login',
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm font-serif">Opening Kalajay Portal...</div>}>
      <LoginClient />
    </Suspense>
  );
}

