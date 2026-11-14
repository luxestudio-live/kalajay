'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Truck,
  ShieldCheck,
  Palette,
  Package,
  HeartHandshake,
  MessageCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/data/catalogue';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  followUps?: string[];
}

interface FAQItem {
  id: string;
  question: string;
  category: 'shipping' | 'craft' | 'custom' | 'returns' | 'care' | 'gifting' | 'payment' | 'orders';
  keywords: string[];
  patterns?: RegExp[];
  answer: string;
  action?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  followUps?: string[];
}

const FAQ_KNOWLEDGE_BASE: FAQItem[] = [
  {
    id: 'dispatch-timeline',
    question: 'How long does shipping take & when will my order ship?',
    category: 'shipping',
    keywords: ['ship', 'shipping', 'delivery', 'dispatch', 'timeline', 'time', 'when', 'days', 'how long', 'arrive', 'reach', 'kab aayega', 'kitna time'],
    patterns: [/(how long|when|time|days).*(ship|deliver|reach|arrive|dispatch)/i, /(shipping|delivery).*(time|duration|speed)/i, /(kab|kitna).*(aayega|pahonchega|din)/i],
    answer: 'Because every Kalajay piece is hand-strung one at a time by our collective of 21 master women artisans:\n\n• Standard Atelier Dispatch: 3 to 5 business days.\n• Custom Creations & Bridal Hampers: 7 to 21 business days.\n• Pan-India Transit: 2 to 4 business days once dispatched from our Mumbai studio.\n\nYou will receive real-time SMS & WhatsApp milestone tracking as soon as your parcel is wax-sealed and dispatched.',
    action: {
      label: 'Track an Existing Order',
      href: '/track',
    },
    followUps: ['Is delivery free across India?', 'Can I request express delivery?', 'What is your return guarantee?'],
  },
  {
    id: 'free-shipping-pincodes',
    question: 'What are your delivery charges and do you deliver across India?',
    category: 'shipping',
    keywords: ['free shipping', 'delivery charge', 'cost', 'rate', 'fee', 'pan india', 'pincode', '599', 'charges', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata'],
    patterns: [/(free|delivery|shipping).*(fee|charge|cost|rate|free)/i, /(pincode|pan india|all over india|doorstep)/i],
    answer: 'Yes! We deliver securely to all 19,000+ postal pincodes across India:\n\n• Free Delivery: On all orders above ₹599.\n• Flat ₹79 Delivery Fee: For orders under ₹599.\n\nAll parcels are insured and shipped via priority express courier partners in rigid keepsake packaging.',
    action: {
      label: 'Explore Collections (Free Shipping > ₹599)',
      href: '/shop',
    },
    followUps: ['How long does shipping take?', 'Is Cash on Delivery (COD) available?', 'How do I track my order?'],
  },
  {
    id: 'handmade-craft-process',
    question: 'How are Kalajay pieces made & what materials are used?',
    category: 'craft',
    keywords: ['made', 'handmade', 'machine', 'artisan', 'material', 'bead', 'pearl', 'crystal', 'wire', 'quality', 'bihar', 'women', 'loom', 'synthetic'],
    patterns: [/(how|materials).*(made|crafted|strung|created)/i, /(handmade|machine|authentic|artisan)/i, /(kaise|kisise).*(bana|banate)/i],
    answer: 'Every Kalajay piece is 100% hand-crafted by our collective of 21 master women artisans based in Bihar and our Mumbai atelier. We never use assembly-line machinery.\n\nEach glass seed bead, lustrous synthetic pearl, and faceted crystal is individually counted, balanced for tension, and anchored with reinforced wire or multi-ply thread to guarantee lifelong heirloom durability.',
    action: {
      label: 'Meet Our Artisans & Atelier',
      href: '/atelier',
    },
    followUps: ['How should I care for my beads?', 'Can I customise colors or add initials?', 'What is your 48-Hour Guarantee?'],
  },
  {
    id: 'customisation-monograms',
    question: 'Can I customise colors, dimensions, or add my name / monogram?',
    category: 'custom',
    keywords: ['custom', 'customise', 'customize', 'monogram', 'initial', 'color', 'colour', 'palette', 'name', 'bridesmaid', 'personalize', 'personalise', 'size'],
    patterns: [/(can i|want to|how to).*(custom|personalise|monogram|initial|color|palette)/i, /(customise|customize|create your own)/i],
    answer: 'Yes, absolutely! Customisation is at the very heart of Kalajay:\n\n• Palette Matching: Match bridesmaids outfits, wedding lehengas, or personal palettes.\n• Monograms & Initials: Pearl-inlaid letters on vanity boxes, clutches, and charms.\n• Interactive Studio: You can design custom pieces live using our "Create Your Own" tool!\n\nFor bespoke bridal hampers, reach out directly via WhatsApp for artisan consultations.',
    action: {
      label: 'Open "Create Your Own" Studio',
      href: '/customise',
    },
    followUps: ['Do you make wedding / bulk hampers?', 'How long does a custom piece take?', 'Chat with Artisan on WhatsApp'],
  },
  {
    id: 'returns-transit-guarantee',
    question: 'What is your return & exchange policy?',
    category: 'returns',
    keywords: ['return', 'exchange', 'damaged', 'broken', 'refund', 'transit', 'guarantee', 'protection', 'broken bead', 'wrong item', 'replace', 'paisa wapas'],
    patterns: [/(return|exchange|refund|damage|broken|transit guarantee)/i, /(can i return|policy on returns)/i],
    answer: 'Because each piece is handmade specifically for your order, we do not accept arbitrary returns. However, your purchase is 100% protected by our 48-Hour Transit Guarantee:\n\nIf your piece arrives damaged, defective, or incorrect, contact us within 48 hours of delivery with a quick photo. We will immediately dispatch a 100% complimentary remake or process a full refund without hassle.',
    action: {
      label: 'Read Full Shipping & Returns Policy',
      href: '/shipping-returns',
    },
    followUps: ['How do I contact WhatsApp Concierge?', 'How do I track my parcel?', 'How long does shipping take?'],
  },
  {
    id: 'bead-care-preservation',
    question: 'How should I clean and care for my beaded pieces?',
    category: 'care',
    keywords: ['care', 'clean', 'wash', 'perfume', 'water', 'maintain', 'protection', 'storage', 'store', 'dust', 'cloth', 'safai'],
    patterns: [/(how to|how should i).*(clean|wash|care|store|preserve|maintain)/i, /(bead care|cleaning)/i],
    answer: 'To preserve your hand-strung pieces for decades:\n\n• Avoid direct contact with perfumes, hairsprays, solvents, or water immersion.\n• For routine cleaning, gently wipe the beads with a dry, lint-free microfibre cloth.\n• When not in use, store your clutch or box in the breathable cotton dust bag provided with every parcel.',
    action: {
      label: 'Browse Keepsake Accessories',
      href: '/shop',
    },
    followUps: ['How are Kalajay pieces made?', 'Can I customise my piece?', 'What if a bead becomes loose?'],
  },
  {
    id: 'order-tracking',
    question: 'How do I track my order status?',
    category: 'orders',
    keywords: ['track', 'status', 'tracking', 'where is', 'milestone', 'awb', 'courier', 'bluedart', 'delhivery', 'order number'],
    patterns: [/(how to|where can i|want to).*(track|check status|find order)/i, /(order status|tracking link|where is my order)/i],
    answer: 'You can check real-time progress on our website using your Order ID (e.g., KJ-8421) and email/mobile number.\n\nWe also transmit automated milestone updates directly to your WhatsApp:\n1. Loom Stringing & Tension Check\n2. Wax-Seal & Packaging Verification\n3. Courier Dispatch with Live AWB tracking link.',
    action: {
      label: 'Go to Order Tracking Page',
      href: '/track',
    },
    followUps: ['How long does shipping take?', 'Can I change my delivery address?', 'Talk to WhatsApp Concierge'],
  },
  {
    id: 'wedding-corporate-gifting',
    question: 'Do you take bulk orders for weddings, celebrations & corporate gifting?',
    category: 'gifting',
    keywords: ['wedding', 'bulk', 'corporate', 'hamper', 'favours', 'favors', 'favour', 'gift', 'diwali', 'festive', 'volume', 'discount', 'quantity'],
    patterns: [/(wedding|corporate|bulk|festive).*(gift|gifting|hamper|favour|favor)/i, /(bulk order|volume discount)/i],
    answer: 'Yes! We curate luxury bespoke gifting packages for weddings, birthdays, and corporate celebrations (from 5 to 500+ units):\n\n• Bespoke Colourway Matching for bridal entourages.\n• Custom Wax-Seals & Hot-Foil Monogrammed Cards.\n• Multi-Drop Pan-India Delivery directly to guests or clients.\n• GST Invoicing with full input tax credit.',
    action: {
      label: 'Explore Gifting Packages',
      href: '/gifting',
    },
    followUps: ['Can I customise the items?', 'How long do bulk hampers take?', 'WhatsApp our Bridal Concierge'],
  },
  {
    id: 'payment-methods-cod',
    question: 'What payment options do you support, and is COD available?',
    category: 'payment',
    keywords: ['payment', 'pay', 'cod', 'cash on delivery', 'upi', 'gpay', 'phonepe', 'card', 'credit card', 'debit card', 'netbanking', 'razorpay'],
    patterns: [/(payment|pay|cod|cash on delivery|upi|card)/i, /(is cod available|can i pay cash)/i],
    answer: 'We support all major secure Indian payment methods via 256-bit encrypted gateways:\n\n• UPI: Google Pay, PhonePe, Paytm, BHIM.\n• Cards: Credit & Debit Cards (Visa, Mastercard, RuPay, Amex).\n• Net Banking across all leading Indian banks.\n\n• Cash on Delivery (COD): Because our pieces are hand-strung to order by independent women artisans, custom orders require prepaid confirmation. Selected ready catalogue pieces support COD at checkout.',
    action: {
      label: 'View Current Shop Catalogue',
      href: '/shop',
    },
    followUps: ['Is delivery free above ₹599?', 'What is your return policy?', 'How do I track my order?'],
  },
  {
    id: 'order-cancellation-change',
    question: 'Can I cancel or modify my order after placing it?',
    category: 'orders',
    keywords: ['cancel', 'cancellation', 'modify', 'change', 'address', 'wrong address', 'update order', 'stop order'],
    patterns: [/(cancel|modify|change|edit).*(order|address|item)/i],
    answer: 'Because our artisans begin selecting and stringing beads within hours of receiving an order, modifications or cancellations are accepted within 6 hours of placement.\n\nTo update your shipping address or order details, please message our studio concierge immediately on WhatsApp with your Order ID.',
    action: {
      label: 'Message WhatsApp Concierge Now',
      href: 'https://wa.me/919740540847?text=Hello%20Kalajay%2C%20I%20would%20like%20to%20modify%2Fcancel%20my%20recent%20order.',
      isExternal: true,
    },
    followUps: ['How do I track my parcel?', 'What is your return guarantee?', 'Talk to a human on WhatsApp'],
  },
  {
    id: 'human-whatsapp-handover',
    question: 'Can I speak directly with a human or artisan concierge?',
    category: 'orders',
    keywords: ['human', 'talk', 'call', 'agent', 'person', 'representative', 'whatsapp', 'phone', 'contact', 'speak', 'help', 'number', 'liaison'],
    patterns: [/(talk|speak|chat).*(human|person|agent|liaison|representative)/i, /(whatsapp number|phone number|call)/i],
    answer: 'Our Craft House studio liaisons in Mumbai are online and delighted to assist you directly!\n\n• WhatsApp Concierge: +91 97405 40847\n• Hours: Monday – Saturday, 10:00 AM – 7:30 PM IST\n• Live video previews of in-progress pieces available upon request.',
    action: {
      label: 'Chat on WhatsApp (+91 97405 40847)',
      href: 'https://wa.me/919740540847?text=Hello%20Kalajay%20Craft%20House%2C%20I%20have%20a%20question%20about%20your%20pieces.',
      isExternal: true,
    },
    followUps: ['How long does shipping take?', 'Can I customise colors?', 'What is your return guarantee?'],
  },
];

const INITIAL_SUGGESTIONS = [
  '📦 Shipping Timelines',
  '🎨 Customise & Monograms',
  '🛡️ 48-Hr Return Guarantee',
  '🚚 Free Delivery > ₹599',
  '🖐️ How Pieces Are Made',
  '💎 Bead Care & Cleaning',
  '🎁 Wedding Favours',
  '💬 WhatsApp with Artisan',
];

export default function FAQConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(true);

  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initial welcome message
  useEffect(() => {
    const welcome: ChatMessage = {
      id: 'welcome-0',
      sender: 'concierge',
      text: 'Namaste! 🙏 Welcome to Kalajay Craft House.\n\nI am your Atelier Concierge. Ask me anything about our hand-strung pieces, pan-India delivery, custom palettes, or transit guarantees.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUps: INITIAL_SUGGESTIONS.slice(0, 4),
    };
    setMessages([welcome]);

    // Show a polite floating badge prompt after 3.5s
    const timer = setTimeout(() => {
      setHasPrompted(true);
    }, 3500);

    // Global listener to open concierge from anywhere
    const handleOpen = () => {
      setIsOpen(true);
      setUnreadBadge(false);
      setHasPrompted(false);
    };
    window.addEventListener('open-faq-concierge', handleOpen);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-faq-concierge', handleOpen);
    };
  }, []);

  // Auto-scroll inside chat messages smoothly
  useEffect(() => {
    if (isOpen && chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Smart Query Matcher
  const findBestAnswer = (query: string): FAQItem | null => {
    const clean = query.toLowerCase().trim();
    if (!clean) return null;

    // Check Greetings
    if (/^(hi|hello|hey|namaste|pranam|kasa kay|kem cho|good morning|good evening)/i.test(clean)) {
      return {
        id: 'greeting',
        question: 'Greetings',
        category: 'craft',
        keywords: [],
        answer: 'Namaste! 🙏 It is a pleasure to welcome you to Kalajay. How can I assist your discovery today? You can choose any topic below or ask about dispatch, customisation, or bead care.',
        followUps: INITIAL_SUGGESTIONS.slice(0, 4),
      };
    }

    // Check Thank you
    if (/^(thank|thanks|shukriya|dhanyawad|great|awesome|helpful)/i.test(clean)) {
      return {
        id: 'thanks',
        question: 'Thank you',
        category: 'craft',
        keywords: [],
        answer: 'You are most welcome! ✨ Each of our creations is woven with patience and love. If you need any assistance curating a bridal hamper or customising a palette, I am always right here.',
        action: {
          label: 'Explore New Arrivals',
          href: '/shop',
        },
        followUps: ['📦 Shipping Timelines', '🎨 Customise & Monograms', '💬 WhatsApp with Artisan'],
      };
    }

    let bestMatch: FAQItem | null = null;
    let highestScore = 0;

    for (const item of FAQ_KNOWLEDGE_BASE) {
      let score = 0;

      // 1. Regex pattern matches (High weight)
      if (item.patterns) {
        for (const pattern of item.patterns) {
          if (pattern.test(clean)) {
            score += 10;
          }
        }
      }

      // 2. Keyword matches
      for (const kw of item.keywords) {
        if (clean.includes(kw)) {
          score += 3;
        }
      }

      // 3. Question text similarity
      const itemQ = item.question.toLowerCase();
      if (itemQ.includes(clean) || clean.includes(itemQ)) {
        score += 8;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    return highestScore >= 3 ? bestMatch : null;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Realistic concierge thinking delay (400ms)
    setTimeout(() => {
      const match = findBestAnswer(text);

      let botMsg: ChatMessage;

      if (match) {
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'concierge',
          text: match.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: match.action,
          followUps: match.followUps,
        };
      } else {
        // Polite Fallback with WhatsApp handoff
        const encodedText = encodeURIComponent(`Hello Kalajay, I had a question on the website: "${text}"`);
        botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'concierge',
          text: `I want to make sure you get the exact details for that!\n\nWhile I am trained on our handmade crafting, shipping, returns, and customisation, our Craft House liaisons in Mumbai are online right now on WhatsApp to answer your query directly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: {
            label: 'Ask on WhatsApp (+91 97405 40847)',
            href: `https://wa.me/919740540847?text=${encodedText}`,
            isExternal: true,
          },
          followUps: [
            '📦 Shipping Timelines',
            '🎨 Customise & Monograms',
            '🛡️ 48-Hr Return Guarantee',
            '🚚 Free Delivery > ₹599',
          ],
        };
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 420);
  };

  const handleReset = () => {
    const welcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'concierge',
      text: 'Conversation refreshed. How may I assist your Kalajay journey today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUps: INITIAL_SUGGESTIONS.slice(0, 4),
    };
    setMessages([welcome]);
  };

  return (
    <>
      {/* Floating Trigger Button Stack (Sits right above WhatsApp at bottom-[84px] sm:bottom-[92px]) */}
      {!isOpen && (
        <div className="fixed bottom-[84px] sm:bottom-[92px] right-4 sm:right-6 z-40 flex flex-col items-end animate-fade-in">
          {/* Polite Tooltip Bubble on first visit */}
          {hasPrompted && (
            <div className="mb-2 mr-1 animate-fade-in bg-[#372921] text-[#FAF7F2] text-[11px] font-sans px-3 py-1.5 rounded-full shadow-lg border border-[#D4AF37]/40 flex items-center gap-2 max-w-[210px] leading-tight select-none">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>Have a question? Ask FAQ Bot</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasPrompted(false);
                }}
                className="text-[#FAF7F2]/60 hover:text-white ml-auto"
                aria-label="Dismiss tooltip"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setUnreadBadge(false);
              setHasPrompted(false);
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#372921] hover:bg-[#503A2E] text-[#FAF7F2] shadow-[0_8px_30px_rgba(55,41,33,0.35)] hover:shadow-[0_10px_35px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center p-2.5 border border-[#D4AF37]/45 cursor-pointer relative group"
            aria-label="Open Kalajay FAQ Concierge"
            title="Instant FAQ & Craft Concierge"
          >
            <div className="flex flex-col items-center justify-center relative">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#FAF7F2] transition-transform group-hover:scale-110" />
              <span className="text-[8px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold -mt-0.5">
                FAQ
              </span>
            </div>

            {/* Unread / Active Status Dot */}
            {unreadBadge && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37] border-2 border-[#372921]"></span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat Window Drawer / Modal */}
      {isOpen && (
        <>
          {/* Subtle mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs sm:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Kalajay Atelier FAQ Concierge"
            data-lenis-prevent="true"
            className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] max-h-[min(88vh,660px)] h-[580px] sm:h-[620px] bg-[#FAF7F2] text-[#372921] rounded-2xl border border-[#D4AF37]/40 shadow-[0_20px_60px_rgba(55,41,33,0.35)] flex flex-col overflow-hidden animate-fade-in"
          >
          {/* Header */}
          <div className="bg-[#372921] text-[#FAF7F2] px-4 py-3.5 sm:px-5 sm:py-4 border-b border-[#D4AF37]/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Kalajay Brand Avatar */}
              <div className="relative w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#D4AF37] flex items-center justify-center overflow-hidden p-1 shadow-xs">
                <img
                  src="/icon.png"
                  alt="Kalajay"
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#372921]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-kalajay text-lg sm:text-xl font-normal leading-tight text-[#FAF7F2]">
                    Kalajay Concierge
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold font-mono">
                    FAQ BOT
                  </span>
                </div>
                <p className="text-[10px] text-[#DED3C5] font-light">
                  Instant answers · 24/7 Atelier Guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Reset Chat */}
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 text-[#DED3C5] hover:text-[#FAF7F2] hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#DED3C5] hover:text-[#FAF7F2] hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Close Concierge"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick WhatsApp Banner within header */}
          <div className="bg-[#2A1F19] px-4 py-1.5 border-b border-[#DED3C5]/20 flex items-center justify-between text-[10px] text-[#DED3C5] shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              <span>Need live human advice?</span>
            </span>
            <a
              href="https://wa.me/919740540847?text=Hello%20Kalajay%20Craft%20House%2C%20I%20am%20exploring%20your%20pieces%20and%20would%20love%20human%20concierge%20advice."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4AF37] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>WhatsApp Us (+91 97405 40847)</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Scrollable Chat Area */}
          <div
            ref={chatScrollContainerRef}
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 bg-[#FAF7F2]"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } space-y-1`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#372921] text-[#FAF7F2] rounded-br-xs'
                      : 'bg-white text-[#372921] border border-[#DED3C5] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line font-light">{msg.text}</p>

                  {/* Contextual Action Button */}
                  {msg.action && (
                    <div className="mt-3 pt-2.5 border-t border-[#DED3C5]/50">
                      {msg.action.isExternal ? (
                        <a
                          href={msg.action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-[11px] font-medium transition-colors shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{msg.action.label}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ) : (
                        <Link
                          href={msg.action.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#372921] hover:bg-[#503A2E] text-[#FAF7F2] text-[11px] font-medium transition-colors shadow-xs"
                        >
                          <span>{msg.action.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-[#76695F] px-1 font-mono">
                  {msg.timestamp}
                </span>

                {/* Follow-up question chips */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 max-w-[92%]">
                    {msg.followUps.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="px-2.5 py-1 text-[10px] bg-white hover:bg-[#F0EAE1] text-[#503A2E] border border-[#DED3C5] rounded-full transition-all cursor-pointer shadow-2xs hover:border-[#9E5430]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-white border border-[#DED3C5] rounded-2xl rounded-bl-xs w-24 shadow-2xs animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E5430] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#372921] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div className="h-1" />
          </div>

          {/* Quick Category Chips Strip */}
          <div className="px-3 py-2 bg-[#F0EAE1]/80 border-t border-[#DED3C5] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-[10px]">
            <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-[#76695F] shrink-0 mr-1">
              Top Topics:
            </span>
            <button
              type="button"
              onClick={() => handleSendMessage('How long does shipping take?')}
              className="px-2 py-0.5 bg-white text-[#372921] rounded-full border border-[#DED3C5] whitespace-nowrap hover:border-[#9E5430] cursor-pointer"
            >
              📦 Dispatch
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Can I customise the colors or add my name?')}
              className="px-2 py-0.5 bg-white text-[#372921] rounded-full border border-[#DED3C5] whitespace-nowrap hover:border-[#9E5430] cursor-pointer"
            >
              🎨 Customise
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('What is your return and exchange policy?')}
              className="px-2 py-0.5 bg-white text-[#372921] rounded-full border border-[#DED3C5] whitespace-nowrap hover:border-[#9E5430] cursor-pointer"
            >
              🛡️ Returns
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('How are Kalajay pieces made?')}
              className="px-2 py-0.5 bg-white text-[#372921] rounded-full border border-[#DED3C5] whitespace-nowrap hover:border-[#9E5430] cursor-pointer"
            >
              🖐️ Craft
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('How do I track my order?')}
              className="px-2 py-0.5 bg-white text-[#372921] rounded-full border border-[#DED3C5] whitespace-nowrap hover:border-[#9E5430] cursor-pointer"
            >
              🚚 Track
            </button>
          </div>

          {/* Input Box Footer */}
          <div className="p-3 sm:p-3.5 bg-white border-t border-[#DED3C5] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about shipping, returns, customisation..."
                className="flex-1 px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DED3C5] text-[#372921] placeholder:text-[#76695F]/70 text-xs rounded-full focus:outline-none focus:border-[#9E5430] focus:ring-1 focus:ring-[#9E5430]/20 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-9 h-9 rounded-full bg-[#372921] hover:bg-[#9E5430] disabled:opacity-40 text-[#FAF7F2] flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#76695F] px-1 font-sans">
              <span>Trained on Kalajay FAQ & Craft House Data</span>
              <button
                type="button"
                onClick={() => handleSendMessage('I want to talk to a human on WhatsApp')}
                className="text-[#9E5430] hover:underline cursor-pointer"
              >
                Need Human Help?
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </>
  );
}
