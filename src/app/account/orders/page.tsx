import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Order History & Artisan Provenance | Kalajay Craft House',
  description: 'View your hand-strung bead orders, live artisan dispatches, and tax invoices.',
};

export default function OrdersRedirectPage() {
  redirect('/account?tab=orders');
}

