'use client';

import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Instagram, Check, Send } from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <div className="bg-canvas-subtle/80 border-b border-border-subtle py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] uppercase tracking-refined text-rosewood font-sans font-semibold block mb-3">
            Craft House Coordinates & Conversations
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-plum font-normal tracking-tight leading-[1.05]">
            Connect with Kalajay
          </h1>
          <p className="mt-6 text-sm sm:text-base text-ink-muted font-light leading-relaxed max-w-2xl mx-auto">
            Whether inquiring about a bespoke colorway, ordering bridal favors, or checking an existing order—our team is here to help with personal attention.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Contact Info & Ateliers (Span 5) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[11px] uppercase tracking-refined text-rosewood font-bold block mb-1">
                Immediate Channels
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-plum">
                We Are One Message Away
              </h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <a
                href={BRAND_CONFIG.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 p-4 bg-canvas-subtle rounded-sm border border-border-subtle hover:border-emerald-700/50 transition-colors group"
              >
                <MessageCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-plum block group-hover:text-emerald-800">
                    WhatsApp Craft House Line (Fastest)
                  </span>
                  <span className="text-ink-muted">{BRAND_CONFIG.contact.phone}</span>
                  <p className="text-[11px] text-ink-light mt-0.5">
                    Monday to Saturday · 10:00 AM – 8:00 PM IST
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${BRAND_CONFIG.contact.email}`}
                className="flex items-start gap-3.5 p-4 bg-canvas-subtle rounded-sm border border-border-subtle hover:border-rosewood/50 transition-colors group"
              >
                <Mail className="w-5 h-5 text-rosewood shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-plum block group-hover:text-rosewood">
                    Email Correspondence
                  </span>
                  <span className="text-ink-muted">{BRAND_CONFIG.contact.email}</span>
                  <span className="text-ink-light block text-[11px]">{BRAND_CONFIG.contact.altEmail}</span>
                </div>
              </a>

              <a
                href={BRAND_CONFIG.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 p-4 bg-canvas-subtle rounded-sm border border-border-subtle hover:border-rosewood/50 transition-colors group"
              >
                <Instagram className="w-5 h-5 text-rosewood shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-plum block group-hover:text-rosewood">
                    Instagram Craft House Journal
                  </span>
                  <span className="text-ink-muted">{BRAND_CONFIG.contact.instagram}</span>
                  <p className="text-[11px] text-ink-light mt-0.5">
                    Follow behind-the-scenes bead stringing and craft house drops
                  </p>
                </div>
              </a>
            </div>

            {/* Craft House Physical Hubs */}
            <div className="pt-4 border-t border-border-subtle space-y-4">
              <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block">
                Craft House Hubs & Verification
              </span>

              <div className="p-4 bg-canvas rounded-sm border border-border-subtle space-y-1 text-xs">
                <span className="font-semibold text-plum flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rosewood" />
                  <span>Mumbai Studio (Dispatch & Client Curation)</span>
                </span>
                <p className="text-ink-muted font-light pl-5.5">
                  Mumbai, Maharashtra, India · Order dispatches and bespoke appointments
                </p>
              </div>

              <div className="p-4 bg-canvas rounded-sm border border-border-subtle space-y-1 text-xs">
                <span className="font-semibold text-plum flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rosewood" />
                  <span>Bihar Production Collective (Weaving & Looms)</span>
                </span>
                <p className="text-ink-muted font-light pl-5.5">
                  Bihar, India · 21 master women artisans handcrafting each piece
                </p>
              </div>

              <div className="text-[11px] text-ink-light">
                GSTIN: <span className="font-mono text-plum">{BRAND_CONFIG.contact.gst}</span>
              </div>
            </div>
          </div>

          {/* Right: Clean Inquiry Form (Span 7) */}
          <div className="lg:col-span-7 bg-canvas-subtle p-8 sm:p-12 rounded-sm border border-border-medium shadow-md">
            {sent ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-blush text-rosewood flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-3xl text-plum">
                  Message Sent
                </h4>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-sm mx-auto">
                  Thank you for writing to Kalajay, {name}. Our Craft House concierge will review your message and respond within one business day.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setMessage('');
                    }}
                    className="text-xs text-rosewood font-medium hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
                <div>
                  <span className="text-[10px] uppercase tracking-monumental text-rosewood font-bold block mb-1">
                    Send a Note
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-plum">
                    Write to the Studio
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ink-light font-medium mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radhika Kapoor"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3.5 py-3 bg-canvas border border-border-medium rounded-sm text-plum text-xs focus:outline-none focus:border-rosewood"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-light font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="radhika@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-3 bg-canvas border border-border-medium rounded-sm text-plum text-xs focus:outline-none focus:border-rosewood"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-ink-light font-medium mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3.5 py-3 bg-canvas border border-border-medium rounded-sm text-plum text-xs focus:outline-none focus:border-rosewood"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-light font-medium mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3.5 py-3 bg-canvas border border-border-medium rounded-sm text-plum text-xs focus:outline-none focus:border-rosewood cursor-pointer"
                    >
                      <option value="General Enquiry">General Question</option>
                      <option value="Custom Order Inquiry">Custom Creation Request</option>
                      <option value="Wedding Favours">Wedding Favours & Gifting</option>
                      <option value="Corporate Orders">Corporate Bulk Enquiry</option>
                      <option value="Order Tracking">Existing Order Status</option>
                      <option value="Press & Collaboration">Press & Styling Collaboration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-ink-light font-medium mb-1">How can we help you?</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us about the piece you have in mind, target dates, or your inquiry details..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-3.5 py-3 bg-canvas border border-border-medium rounded-sm text-plum text-xs focus:outline-none focus:border-rosewood"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-plum hover:bg-rosewood text-canvas text-xs uppercase tracking-monumental font-semibold rounded-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Note to Studio</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

