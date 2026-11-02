import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Bell, Database, Mail } from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Safeguards | Kalajay Atelier',
  description:
    'Our commitment to patron privacy, encrypted payment handling, transactional WhatsApp updates, and responsible data custody.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[10px] font-sans uppercase tracking-monumental font-semibold mb-4 shadow-2xs">
            <Lock className="w-3 h-3 text-gold" />
            <span>Patron Custody & Trust</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-plum font-normal tracking-tight">
            Privacy & Data Safeguards
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-xl mx-auto">
            At Kalajay, we treat your personal information with the same deliberate care and patience that our artisans dedicate to each bead.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-12 text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
        {/* Guiding Principle */}
        <div className="p-6 sm:p-8 bg-canvas-subtle rounded-sm border border-gold/30 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-rosewood shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-plum font-normal">Our Sacred Guarantee</h3>
            <p className="text-xs text-ink-light leading-relaxed">
              We never sell, lease, or monetize your contact information, shopping habits, or gifting history to advertising aggregators or third-party marketing brokers.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Database className="w-4 h-4 text-rosewood" />
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you interact with the Kalajay digital storefront, create a patron account, or place a bespoke creation order, we collect only the necessary details required to fulfill and deliver your handcrafted pieces:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-ink-light">
            <li><strong>Patron Identification:</strong> Full name, billing and physical delivery addresses.</li>
            <li><strong>Communication Coordinates:</strong> Mobile number for OTP authentication and courier transit dispatch, and email address for digital tax invoices.</li>
            <li><strong>Bespoke Custom Specifications:</strong> Colorway selections, monogram initials, or wedding gift notes provided during customization.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-rosewood" />
            <span>2. Payment Security & Encryption</span>
          </h2>
          <p>
            Financial transactions on Kalajay are executed through RBI-regulated, PCI-DSS Level 1 compliant payment gateways (such as Razorpay, UPI, and major Indian banking switches). 
          </p>
          <p>
            Kalajay does not store, process, or have access to your full credit/debit card numbers, CVVs, net banking credentials, or UPI MPINs. All transactions utilize 256-bit bank-grade SSL encryption end-to-end.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-rosewood" />
            <span>3. WhatsApp &amp; Courier Transit Updates</span>
          </h2>
          <p>
            Because each Kalajay treasure is individually tensioned and hand-strung, we provide transparent craft progress updates via WhatsApp and SMS:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-ink-light">
            <li>Instant confirmation upon order booking.</li>
            <li>Notification when bead stringing commences on our artisan looms.</li>
            <li>Wax-sealed packaging verification and BlueDart / Delhivery tracking link upon dispatch.</li>
          </ul>
          <p className="text-[11px] text-ink-light">
            You may opt out of WhatsApp dispatch alerts at any time by replying &quot;STOP&quot; to our atelier line.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-rosewood" />
            <span>4. Cookies &amp; Local Storage</span>
          </h2>
          <p>
            We use essential local storage cookies strictly to maintain your active shopping bag, preserve your patron login state, and record your preferred filter parameters on the catalogue. We do not use invasive tracking pixels that monitor your browsing activities outside kalajay.in.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-rosewood" />
            <span>5. Patron Rights &amp; Grievance Redressal</span>
          </h2>
          <p>
            In compliance with the Digital Personal Data Protection (DPDP) Act of India and Information Technology Rules, you retain full rights over your data. You may request an export of your order history or petition for account deletion by writing to our concierge team at:
          </p>
          <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle font-mono text-xs text-plum space-y-1">
            <div>Data Grievance Officer: Concierge Custodian, Kalajay Atelier</div>
            <div>Email: <a href={`mailto:${BRAND_CONFIG.contact.email}`} className="text-rosewood underline">{BRAND_CONFIG.contact.email}</a></div>
            <div>Registered GSTIN: {BRAND_CONFIG.contact.gst}</div>
            <div>Response SLA: Within 24 business hours</div>
          </div>
        </section>

        {/* Navigation Footer */}
        <div className="pt-8 border-t border-border-subtle text-xs text-ink-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Last revised: November 2026</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-rosewood hover:underline">
              Terms of Service →
            </Link>
            <Link href="/contact" className="text-rosewood hover:underline">
              Contact Concierge →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

