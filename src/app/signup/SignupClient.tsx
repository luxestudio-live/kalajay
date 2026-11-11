'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Gem,
  Smartphone,
  Mail,
  User as UserIcon,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Gift,
  RefreshCw,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const { signup, sendOtp, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
  });

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState('482910');
  const [resendTimer, setResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(formData.phone);
      setDemoCode(res.demoOtp);
      setStep('verify');
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setErrorMsg('');

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (digit && index === 5 && newDigits.every((d) => d !== '')) {
      finalizeSignup(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const finalizeSignup = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of the passcode.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await signup({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      });
      router.push(redirectTo);
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoFillDemoOtp = () => {
    const digits = demoCode.split('');
    setOtpDigits(digits);
    finalizeSignup(demoCode);
  };

  return (
    <div className="bg-canvas min-h-screen py-4 sm:py-10 lg:py-16 px-3 sm:px-6 lg:px-8 selection:bg-champagne selection:text-ink relative overflow-hidden flex flex-col justify-center">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-champagne/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl w-full mx-auto">
        <div className="bg-canvas-subtle rounded-2xl sm:rounded-3xl border border-border-gold shadow-xl sm:shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[700px] relative">
          
          {/* Left Column: Exclusive Atelier Invitation & Privilege Card (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-[#372921] text-canvas p-10 lg:p-12 flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none bg-[radial-gradient(#9E5430_1px,transparent_1px)] [background-size:24px_24px]" />
            <div
              className="absolute inset-0 opacity-35 pointer-events-none bg-cover bg-center transition-transform duration-1000 scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#372921] via-[#372921]/80 to-[#372921]/50 pointer-events-none" />

            {/* Top Brand & Seal */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#503A2E] to-[#372921] border-2 border-[#9E5430] flex items-center justify-center shadow-lg relative group">
                  <div className="w-9 h-9 rounded-full border border-[#9E5430]/40 flex items-center justify-center">
                    <Gem className="w-5 h-5 text-champagne" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#9E5430] text-[#F7F3EC] text-[8px] font-bold flex items-center justify-center">
                    ★
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-monumental text-champagne font-sans font-semibold block">
                    Craft House Membership
                  </span>
                  <span className="font-serif text-lg tracking-[0.18em] text-canvas font-normal">
                    THE KALAJAY CIRCLE
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <span className="text-xs text-gold font-sans tracking-wide block">
                  An Invitation to Slow Luxury
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-canvas font-normal tracking-tight leading-snug">
                  Crafted by human hands, <br />
                  <span className="italic font-light text-champagne">cherished for years.</span>
                </h2>
                <p className="mt-3 text-xs text-canvas/75 font-light leading-relaxed">
                  Join our patron circle to claim an inaugural creation honour, receive hand-crafted birthday charms, and enjoy priority access to custom studio creations.
                </p>
              </div>
            </div>

            {/* Middle: Luxury Patron Privileges Foil Card */}
            <div className="relative z-10 my-8 p-5 rounded-2xl bg-gradient-to-br from-canvas/15 via-canvas/10 to-transparent backdrop-blur-md border border-gold/35 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-gold/20">
                <span className="text-[11px] uppercase tracking-monumental text-champagne font-sans font-bold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-gold" />
                  <span>Inaugural Patron Privileges</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider bg-gold/20 text-champagne px-2 py-0.5 rounded-full font-bold">
                  Complimentary
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-canvas/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gold/25 flex items-center justify-center text-gold shrink-0">
                    <Gift className="w-3 h-3" />
                  </div>
                  <span>₹300 Inaugural credit applied automatically to your bag</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gold/25 flex items-center justify-center text-gold shrink-0">
                    <Gem className="w-3 h-3" />
                  </div>
                  <span>Surprise hand-strung bead charm sent on your birthday</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gold/25 flex items-center justify-center text-gold shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <span>Lifetime complimentary restringing & preservation warranty</span>
                </div>
              </div>
            </div>

            {/* Bottom Quote */}
            <div className="relative z-10 pt-5 border-t border-canvas/15 text-xs text-canvas/70 italic font-serif">
              “Every bead placed is a heartbeat of patience.”
              <span className="block not-italic font-sans text-[10px] tracking-refined uppercase text-champagne font-semibold mt-1">
                Kalajay Craft House · 100% Handcrafted
              </span>
            </div>
          </div>

          {/* Right Column: Creative Registration Console */}
          <div className="lg:col-span-7 bg-canvas p-5 sm:p-8 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-border-subtle">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-canvas-subtle border border-gold/30 text-[10px] uppercase tracking-monumental text-gold-dark font-semibold">
                    <Crown className="w-3 h-3 text-gold" />
                    <span>Circle Membership</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-normal tracking-tight">
                    Create Your Account
                  </h1>
                </div>

                <Link
                  href="/"
                  className="font-serif text-xl sm:text-2xl tracking-[0.2em] text-ink hover:text-gold-dark transition-colors hidden sm:block"
                >
                  KALAJAY
                </Link>
              </div>

              {/* Mobile Patron Privilege Pill (Visible on mobile only) */}
              <div className="mt-3.5 p-2.5 bg-blush/30 border border-gold/30 rounded-xl flex items-center gap-2 text-[11px] text-plum lg:hidden">
                <Gift className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="font-medium">Inaugural Privilege: ₹300 credit preloaded onto your account</span>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Personal Details */}
              {step === 'details' ? (
                <form onSubmit={handleDetailsSubmit} className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="e.g. Sonali Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-3.5 sm:pr-4 py-3 sm:py-3.5 bg-canvas border border-border-medium rounded-xl sm:rounded-2xl text-xs sm:text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-2xs"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                      Mobile Number (For Instant Passcode) *
                    </label>
                    <div className="flex items-center rounded-xl sm:rounded-2xl border border-border-medium bg-canvas focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 transition-all overflow-hidden shadow-2xs">
                      <div className="px-3.5 sm:px-4 py-3 sm:py-3.5 bg-canvas-subtle border-r border-border-subtle flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-ink shrink-0">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
                        }
                        className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 sm:pr-4 py-3 sm:py-3.5 bg-canvas border border-border-medium rounded-xl sm:rounded-2xl text-xs sm:text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs uppercase tracking-refined font-semibold text-ink">
                        Birthday (Optional)
                      </label>
                      <span className="text-[11px] text-gold-dark font-medium">For surprise birthday gift</span>
                    </div>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="DD / MM (e.g. 14 November)"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                        className="w-full pl-10 pr-3.5 sm:pr-4 py-3 sm:py-3.5 bg-canvas border border-border-medium rounded-xl sm:rounded-2xl text-xs sm:text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 sm:mt-3 py-3.5 px-6 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 group"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-gold" />
                        <span>Transmitting Passcode...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Passcode Verification</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Creative OTP Verification with Bead Pedestals */
                <div className="mt-5 sm:mt-6 space-y-5 sm:space-y-6 animate-fade-in">
                  <div className="bg-canvas-subtle p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-ink-muted block">Verifying mobile number:</span>
                      <span className="text-sm font-semibold text-ink font-mono tracking-wide">+91 {formData.phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="text-xs text-gold-dark hover:underline font-semibold cursor-pointer"
                    >
                      Edit Details
                    </button>
                  </div>

                  {/* Passcode Auto-Fill Helper Chip */}
                  <button
                    type="button"
                    onClick={autoFillDemoOtp}
                    className="w-full py-2.5 px-3.5 sm:px-4 bg-gradient-to-r from-canvas-subtle via-champagne/15 to-canvas-subtle border border-gold/40 hover:border-gold rounded-xl flex items-center justify-between text-xs transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-ink">
                      <div className="w-5 h-5 rounded-full bg-ink flex items-center justify-center text-gold shadow-2xs">
                        <Gem className="w-3 h-3" />
                      </div>
                      <span className="font-sans text-left">
                        Craft House Passcode: <strong className="font-mono font-bold tracking-widest text-ink">{demoCode}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-gold-dark group-hover:text-ink flex items-center gap-1 transition-colors shrink-0">
                      <span>One-Tap Fill</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>

                  {/* 6 Bead Pedestals */}
                  <div>
                    <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-3 text-center">
                      Enter 6-Digit Passcode
                    </label>
                    <div className="flex items-center justify-center gap-1.5 sm:gap-3.5">
                      {otpDigits.map((digit, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5 sm:gap-2">
                          <span
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                              digit
                                ? 'bg-gold ring-2 sm:ring-4 ring-gold/25 scale-125 shadow-xs'
                                : 'bg-border-medium'
                            }`}
                          />
                          <input
                            key={idx}
                            ref={(el) => {
                              otpInputsRef.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className={`w-10 h-13 sm:w-13 sm:h-16 text-center font-serif text-lg sm:text-2xl text-ink font-semibold rounded-xl sm:rounded-2xl border transition-all shadow-xs ${
                              digit
                                ? 'border-gold bg-canvas-subtle ring-2 ring-gold/25'
                                : 'border-border-medium bg-canvas hover:border-border-strong focus:border-gold focus:ring-2 focus:ring-gold/30'
                            } focus:outline-none`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-ink-muted">
                      {resendTimer > 0 ? (
                        <span>Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDetailsSubmit(new Event('submit') as unknown as React.FormEvent)}
                          className="text-gold-dark hover:underline font-semibold cursor-pointer"
                        >
                          Resend Passcode
                        </button>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => finalizeSignup()}
                      disabled={isSubmitting}
                      className="px-5 sm:px-6 py-2.5 bg-ink text-canvas hover:bg-gold hover:text-ink rounded-full uppercase tracking-refined font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Complete Registration
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Login Link */}
            <div className="mt-6 sm:mt-8 pt-4 border-t border-border-subtle text-center text-xs text-ink-muted">
              <span>Already a member of the Kalajay Circle? </span>
              <Link
                href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="font-semibold text-rosewood hover:text-ink transition-colors underline"
              >
                Sign In to Your Account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
