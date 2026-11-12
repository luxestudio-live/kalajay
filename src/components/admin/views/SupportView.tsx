'use client';

import React, { useState } from 'react';
import {
  Headphones,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  User,
  ShieldCheck,
  Zap,
  Filter,
  Check,
  Phone,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { SupportTicket } from '@/data/adminTypes';

const CANNED_RESPONSES = [
  {
    title: 'Wax Seal Dispatch Notice',
    text: 'Namaste! Your bespoke piece has completed final quality inspection in our atelier and is being wax-sealed in our signature presentation box. You will receive your Kalajay in-house dispatch tracking code shortly.',
  },
  {
    title: 'Loom Craft Progress Update',
    text: 'Namaste! Your piece is actively being hand-strung on our wooden looms in Bihar. Our master women artisans are patiently aligning each bead facet. Handcrafting takes 12-14 patient hours to ensure heirloom longevity.',
  },
  {
    title: 'Pearl & Glass Care Advice',
    text: 'Namaste! We recommend storing your Kalajay creation inside its included mulberry silk drawstring pouch away from direct perfume spray or moisture. Clean gently with a dry microfibre cloth.',
  },
  {
    title: 'Address Update Confirmation',
    text: 'Namaste! We have successfully updated your delivery destination in our atelier dispatch manifest prior to label generation. Your package will reach your new address seamlessly.',
  },
];

export default function SupportView() {
  const { supportTickets, addSupportMessage, updateTicketStatus, logAction } = useAdminStore();
  const [selectedTicketId, setSelectedTicketId] = useState<string>(supportTickets[0]?.id || 'TICK-9021');
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedTicket = supportTickets.find(t => t.id === selectedTicketId) || supportTickets[0];

  const filteredTickets = supportTickets.filter(t => {
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    addSupportMessage(selectedTicket.id, replyText.trim());
    logAction('CONCIERGE_REPLY_SENT', 'support', `Sent reply on ticket ${selectedTicket.ticketNumber} to ${selectedTicket.customerName}`);
    showToast(`Replied to ${selectedTicket.customerName} via Patron Concierge`);
    setReplyText('');
  };

  const handleInsertCanned = (text: string) => {
    setReplyText(text);
  };

  const handleMarkResolved = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, 'resolved');
    logAction('TICKET_RESOLVED', 'support', `Resolved ticket ${selectedTicket.ticketNumber}`);
    showToast(`Ticket ${selectedTicket.ticketNumber} marked Resolved.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#372921] text-white px-5 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 flex items-center gap-3 text-xs animate-slide-up">
          <Sparkles className="w-4 h-4 text-[#C49A45]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Headphones className="w-3.5 h-3.5" />
            <span>Patron Concierge &amp; Care</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Support &amp; Concierge Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Direct patron communications, address updates, custom consultation follow-ups, and luxury care advice.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>WhatsApp Concierge Online (+91 97405 40847)</span>
          </span>
        </div>
      </div>

      {/* 2. SPLIT VIEW: TICKETS LIST (LEFT) & CHAT CONSOLE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* LEFT COLUMN: TICKET DIRECTORY */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-[#DED3C5] bg-[#F7F3EC] space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#76695F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search ticket, patron, or subject..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921] placeholder-[#76695F]/70 focus:outline-none focus:border-[#9E5430]"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#76695F]">
              <span>Filter:</span>
              <div className="flex gap-1">
                {(['all', 'urgent', 'high', 'medium'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2 py-0.5 rounded text-[10.5px] uppercase font-semibold cursor-pointer transition-colors ${
                      priorityFilter === p
                        ? 'bg-[#9E5430] text-white'
                        : 'bg-white text-[#76695F] hover:bg-stone-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="divide-y divide-[#EAE2D8] overflow-y-auto flex-1">
            {filteredTickets.map(ticket => {
              const isSelected = selectedTicket?.id === ticket.id;
              const isResolved = ticket.status === 'resolved';
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F4ECE3] ring-1 ring-inset ring-[#9E5430]/30 shadow-2xs' : 'hover:bg-[#FFFCF7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10.5px] font-bold text-[#9E5430]">
                          {ticket.ticketNumber}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            ticket.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : ticket.priority === 'high'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-[#372921] mt-1 line-clamp-1">
                        {ticket.subject}
                      </h4>
                      <span className="text-[11px] text-[#76695F] block">
                        {ticket.customerName} ({ticket.email})
                      </span>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-stone-100 text-stone-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[#76695F] block mt-1">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CONVERSATION */}
        {selectedTicket ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col overflow-hidden">
            {/* Conversation Header */}
            <div className="p-4 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#9E5430]">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white text-[#372921] border border-[#DED3C5] font-medium">
                    {selectedTicket.category}
                  </span>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#372921] mt-1">
                  {selectedTicket.subject}
                </h3>
                <span className="text-xs text-[#76695F]">
                  Patron: <strong className="text-[#372921]">{selectedTicket.customerName}</strong> ({selectedTicket.email})
                </span>
              </div>

              {selectedTicket.status !== 'resolved' ? (
                <button
                  type="button"
                  onClick={handleMarkResolved}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              ) : (
                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Resolved</span>
                </span>
              )}
            </div>

            {/* Message Thread */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-[380px] bg-[#FAF8F5]">
              {selectedTicket.messages.map((msg, idx) => {
                const isConcierge = msg.sender === 'concierge';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isConcierge ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10.5px] text-[#76695F]">
                      <span className="font-medium text-[#372921]">{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed shadow-xs ${
                        isConcierge
                          ? 'bg-[#372921] text-white rounded-tr-none'
                          : 'bg-white text-[#372921] border border-[#DED3C5] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Canned Responses Bar */}
            <div className="p-2.5 bg-[#F7F3EC] border-t border-[#DED3C5] flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[10px] text-[#76695F] uppercase font-bold tracking-wider flex items-center gap-1 whitespace-nowrap pl-1">
                <Zap className="w-3 h-3 text-[#9E5430]" />
                <span>Canned:</span>
              </span>
              {CANNED_RESPONSES.map((cr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertCanned(cr.text)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-stone-200 border border-[#DED3C5] text-[#372921] text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                >
                  {cr.title}
                </button>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-[#DED3C5] bg-white flex items-end gap-2">
              <textarea
                rows={2}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type luxury concierge reply or select a canned template above..."
                className="flex-1 p-2.5 bg-[#FAF8F5] border border-[#DED3C5] rounded-xl text-xs text-[#372921] placeholder-[#76695F]/70 focus:outline-none focus:border-[#9E5430] resize-none"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#9E5430] hover:bg-[#874427] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-stretch"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DED3C5] flex items-center justify-center p-8 text-center text-[#76695F]">
            Select a ticket from the left to view conversation.
          </div>
        )}
      </div>
    </div>
  );
}

