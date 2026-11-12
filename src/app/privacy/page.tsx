import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  Bell,
  Database,
  Mail,
  UserCheck,
  Scale,
  FileText,
  AlertCircle,
  Building2,
  Globe,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

export const metadata: Metadata = {
  title: 'Privacy Policy & DPDP Statutory Safeguards | Kalajay Craft House',
  description:
    'Comprehensive statutory privacy disclosure in strict compliance with India’s Digital Personal Data Protection Act (DPDP Act, 2023) and the DPDP Rules (2025).',
};

export default function PrivacyPage() {
  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-canvas rounded-full border border-gold/40 text-ink text-[10px] font-sans uppercase tracking-monumental font-semibold mb-4 shadow-2xs">
            <Lock className="w-3 h-3 text-gold" />
            <span>DPDP Act 2023 &amp; Rules 2025 Statutory Notice</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl text-plum font-normal tracking-tight">
            Patron Privacy &amp; Data Safeguards
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-ink-muted font-light leading-relaxed max-w-2xl mx-auto">
            At Kalajay, we treat your personal information with the same deliberate reverence that our master artisans dedicate to each strung bead. This policy governs how we collect, process, safeguard, and respect your personal data under Indian law.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-12 text-xs sm:text-sm text-ink-muted font-light leading-relaxed">
        {/* Sacred Fiduciary Guarantee */}
        <div className="p-6 sm:p-8 bg-canvas-subtle rounded-sm border border-gold/40 flex items-start gap-4 shadow-sm">
          <ShieldCheck className="w-7 h-7 text-rosewood shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h3 className="font-serif text-xl text-plum font-normal">Our Sacred Fiduciary Guarantee</h3>
            <p className="text-xs text-ink-light leading-relaxed">
              Under Section 4 and Section 6 of the Digital Personal Data Protection Act, 2023, Kalajay acts strictly as a responsible <strong>Data Fiduciary</strong>. We process only minimal personal data for lawful, specified purposes with your informed affirmative consent. We never sell, lease, barter, or monetize your contact details, purchase logs, or gifting memories to third-party ad brokers or data aggregators.
            </p>
          </div>
        </div>

        {/* Section 1: Entity & Fiduciary Identity */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-rosewood" />
            <span>1. Data Fiduciary Identity &amp; Statutory Scope</span>
          </h2>
          <p>
            This Digital Personal Data Protection Policy (&quot;Policy&quot;) governs the processing of personal data collected online via <strong>kalajay.in</strong>, its progressive mobile application, or offline atelier interactions by:
          </p>
          <div className="p-5 bg-canvas-subtle rounded-sm border border-border-subtle font-mono text-xs text-plum space-y-1.5">
            <div><strong>Legal Entity:</strong> Kalajay Creations Private Limited</div>
            <div><strong>Registered Atelier:</strong> Madhubani / Patna Craft Hub, Bihar - 800001</div>
            <div><strong>Corporate Presence:</strong> D-14 Defence Colony, New Delhi - 110024</div>
            <div><strong>GSTIN Registration:</strong> {BRAND_CONFIG.contact.gst}</div>
            <div><strong>Official Communication:</strong> {BRAND_CONFIG.contact.email}</div>
          </div>
          <p className="text-xs text-ink-light">
            In accordance with Section 5(3) of the DPDP Act 2023, this notice and our consent manager are accessible in both <strong>English</strong> and <strong>Hindi (हिन्दी)</strong>, representing an official Eighth Schedule language of the Constitution of India.
          </p>
        </section>

        {/* Section 2: Grounds of Processing & Data Collected */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Database className="w-5 h-5 text-rosewood" />
            <span>2. Categories of Personal Data &amp; Specified Purposes</span>
          </h2>
          <p>
            Under Section 6(1) of the DPDP Act 2023, personal data collected must be limited to such data as is necessary for the specified purpose. Kalajay collects and processes data strictly across three clear operational categories:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle space-y-2">
              <span className="font-serif text-base text-plum font-medium block">A. Order Fulfillment</span>
              <p className="text-xs text-ink-light">
                <strong>Data:</strong> Full legal name, shipping destination, pin code, billing address, and contact phone.
                <br /><br />
                <strong>Purpose:</strong> Handcrafting allocation, wax-sealed packaging, and Kalajay in-house courier delivery dispatch.
              </p>
            </div>

            <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle space-y-2">
              <span className="font-serif text-base text-plum font-medium block">B. Patron Authentication</span>
              <p className="text-xs text-ink-light">
                <strong>Data:</strong> Mobile number for SMS/OTP verification and email address for order receipts.
                <br /><br />
                <strong>Purpose:</strong> Passwordless login, session security, order provenance verification, and CGST tax invoice delivery.
              </p>
            </div>

            <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle space-y-2">
              <span className="font-serif text-base text-plum font-medium block">C. Artisan Concierge</span>
              <p className="text-xs text-ink-light">
                <strong>Data:</strong> WhatsApp phone number, celebration birthday, and bespoke colorway requests (Optional).
                <br /><br />
                <strong>Purpose:</strong> Live loom progress images, anniversary gifts, and real-time transit alerts.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Section 9 Protection of Children's Personal Data */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-rosewood" />
            <span>3. Processing of Children&apos;s Personal Data (Section 9)</span>
          </h2>
          <p>
            Kalajay takes stringent measures to uphold <strong>Section 9 of the DPDP Act, 2023</strong> regarding individuals under 18 years of age:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-ink-light">
            <li><strong>Verifiable Parental Consent:</strong> We do not intentionally register or collect personal data from any individual under 18 years without verifiable authorization from a parent or legal guardian. Our registration explicitly includes a mandatory age confirmation checkpoint.</li>
            <li><strong>Prohibition of Behavioral Monitoring:</strong> In strict adherence to Section 9(2), Kalajay does not engage in behavioural tracking, user-profiling, psychological modeling, or targeted behavioral advertising directed at minors.</li>
            <li><strong>Well-being Safeguards:</strong> We never process personal data in any manner likely to cause detrimental effects on the health, well-being, or moral development of a child.</li>
          </ul>
        </section>

        {/* Section 4: Storage, Security & Indian Cloud Localization */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-rosewood" />
            <span>4. Domestic Cloud Hosting, Encryption &amp; Security (Section 8)</span>
          </h2>
          <p>
            Under Section 8(5) of the DPDP Act 2023, a Data Fiduciary must implement reasonable technical and organizational security safeguards to prevent personal data breaches:
          </p>
          <div className="space-y-2 text-ink-light">
            <p>
              • <strong>Indian Data Localization:</strong> Primary customer records, authenticated sessions, and transaction ledgers are stored on resilient, secure cloud infrastructure located within the <strong>AWS Asia Pacific (Mumbai / ap-south-1)</strong> sovereign region.
            </p>
            <p>
              • <strong>PCI-DSS Level 1 Financial Security:</strong> Financial card credentials, UPI MPINs, and banking logins are never captured or stored on Kalajay servers. Transactions are handled via RBI-authorized, 256-bit encrypted payment gateways.
            </p>
            <p>
              • <strong>Breach Notification Protocol:</strong> In the rare event of an identifiable personal data breach affecting your information, Kalajay maintains an incident response protocol to notify both the <strong>Data Protection Board of India (DPBI)</strong> and impacted Data Principals in accordance with Section 8(6) of the Act and Rule 7 of the DPDP Rules 2025.
            </p>
          </div>
        </section>

        {/* Section 5: Statutory Retention & CGST Act 2017 Exemption */}
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-rosewood" />
            <span>5. Data Retention &amp; Statutory Tax Invoicing Safeguards</span>
          </h2>
          <p>
            Under Section 8(7) of the DPDP Act 2023, personal data must be erased as soon as the specified purpose is fulfilled or consent is withdrawn, <em>unless</em> retention is necessary for compliance with applicable Indian law:
          </p>
          <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle text-xs space-y-2">
            <div className="font-medium text-plum flex items-center gap-2">
              <Scale className="w-4 h-4 text-rosewood" />
              <span>Statutory Exception: Central Goods and Services Tax (CGST) Act, 2017</span>
            </div>
            <p className="text-ink-light">
              Pursuant to <strong>Section 36 of the CGST Act, 2017</strong> and Rule 56 of the CGST Rules, registered businesses are legally obligated to maintain true accounts, books, and tax invoices for a statutory period of <strong>72 months (6 to 7 years)</strong> following the filing of annual returns. When a patron exercises their Right to Erasure, all active credentials, marketing profiles, and saved shipping destinations are promptly deleted; completed financial invoices are securely archived in an isolated cold ledger exclusively for statutory GST audit compliance.
            </p>
          </div>
        </section>

        {/* Section 6: Data Principal Rights under Chapter III */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-rosewood" />
            <span>6. Your Rights as a Data Principal (Sections 11–14)</span>
          </h2>
          <p>
            Under Chapter III of the DPDP Act 2023, you hold absolute, legally enforceable rights over your digital personal data. We have built self-service tools into your <Link href="/account?tab=privacy" className="text-rosewood underline font-medium">Patron Account Hub</Link> to exercise these rights seamlessly:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle space-y-1.5">
              <div className="font-medium text-plum flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold-dark font-serif font-bold text-xs flex items-center justify-center">11</span>
                <span>Right to Access &amp; Summary (Sec 11)</span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                Obtain a comprehensive summary of personal data being processed, identity of courier processors, and download a machine-readable JSON data packet directly from your account.
              </p>
            </div>

            <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle space-y-1.5">
              <div className="font-medium text-plum flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold-dark font-serif font-bold text-xs flex items-center justify-center">12</span>
                <span>Right to Correction &amp; Erasure (Sec 12)</span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                Rectify incomplete or inaccurate shipping coordinates anytime, or trigger an account deletion request (&quot;Right to be Forgotten&quot;) subject to statutory tax exemptions.
              </p>
            </div>

            <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle space-y-1.5">
              <div className="font-medium text-plum flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold-dark font-serif font-bold text-xs flex items-center justify-center">13</span>
                <span>Right to Grievance Redressal (Sec 13)</span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                Submit an in-app grievance directly to our Data Protection Officer with a trackable ticket number, guaranteed 48-hour acknowledgment, and resolution within 30 days.
              </p>
            </div>

            <div className="p-4 bg-canvas-subtle rounded-sm border border-border-subtle space-y-1.5">
              <div className="font-medium text-plum flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold-dark font-serif font-bold text-xs flex items-center justify-center">14</span>
                <span>Right to Nominate (Sec 14)</span>
              </div>
              <p className="text-xs text-ink-light leading-relaxed">
                Designate a trusted representative who, in the unforeseen event of death or incapacity, shall be authorized to exercise your Data Principal rights.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Data Protection Officer & Grievance Redressal */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-plum font-normal flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-rosewood" />
            <span>7. Data Protection Officer (DPO) &amp; Appellate Recourse</span>
          </h2>
          <p>
            Pursuant to Rule 14 of the DPDP Rules 2025 and Rule 5 of the Consumer Protection (E-Commerce) Rules 2020, Kalajay has appointed a dedicated Custodian &amp; Grievance Officer:
          </p>

          <div className="p-6 bg-canvas-subtle rounded-sm border border-border-medium space-y-3 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-monumental text-ink-muted block font-semibold">
                  Designated Officer &amp; Title
                </span>
                <span className="font-serif text-base text-plum font-normal">
                  Soumya (Founder &amp; Principal Trustee)
                </span>
                <span className="text-xs text-ink-light block">
                  Data Protection Officer &amp; Grievance Officer
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-monumental text-ink-muted block font-semibold">
                  Electronic Grievance Coordinate
                </span>
                <a
                  href={`mailto:${BRAND_CONFIG.contact.email}`}
                  className="font-medium text-rosewood hover:underline text-sm block"
                >
                  {BRAND_CONFIG.contact.email}
                </a>
                <span className="text-ink-light text-[11px]">
                  Concierge WhatsApp: {BRAND_CONFIG.contact.phone}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-monumental text-ink-muted block font-semibold">
                  Postal Atelier Address
                </span>
                <span className="text-xs text-ink">
                  Kalajay Craft House, D-14 Defence Colony, New Delhi - 110024 &amp; Bihar Hub
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-monumental text-ink-muted block font-semibold">
                  Statutory SLA Timeframes
                </span>
                <span className="text-xs text-ink block">
                  • Ticket Acknowledgment: <strong>Within 48 hours</strong>
                  <br />
                  • Grievance Resolution: <strong>Within 30 calendar days</strong>
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border-subtle/80 flex items-start gap-2.5 text-[11px] text-ink-muted">
              <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <p>
                <strong>Appellate Recourse to the Data Protection Board of India (DPBI):</strong> If your grievance is not resolved to your satisfaction within 30 days, you retain the statutory right under Section 13(4) of the DPDP Act 2023 to file an appeal before the <strong>Data Protection Board of India</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Patron Actions Quick Jump */}
        <div className="p-6 bg-[#372921] text-[#F7F3EC] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-monumental text-[#D4AF37] font-semibold block">
              Self-Service Patron Console
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#F7F3EC]">
              Exercise Your DPDP Rights Now
            </h3>
            <p className="text-xs text-[#DED3C5] font-light max-w-md">
              Download your personal data archive, assign a legal nominee, or update consent settings.
            </p>
          </div>
          <Link
            href="/account?tab=privacy"
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#C29D26] text-[#372921] font-semibold rounded-full uppercase tracking-refined text-xs transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Visit DPDP Rights Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Navigation Footer */}
        <div className="pt-8 border-t border-border-subtle text-xs text-ink-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>DPDP Compliance Version 2025.1 · Effective November 2026</span>
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
