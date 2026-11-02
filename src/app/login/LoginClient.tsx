'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Gem,
  Smartphone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const { loginWithOtp, sendOtp, loginWithEmail, quickDemoLogin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState('482910');
  const [resendTimer, setResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Time-based greeting
  const [greeting, setGreeting] = useState('Welcome, Collector of Wonders');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning · Patron of the Arts');
    else if (hour < 18) setGreeting('Good afternoon · Collector of Wonders');
    else setGreeting('Good evening · Atelier Patron');
  }, []);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpStep === 'verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(phoneNumber);
      setDemoCode(res.demoOtp);
      setOtpStep('verify');
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
      verifyOtpCode(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const verifyOtpCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await loginWithOtp(phoneNumber, code);
      if (res.success) {
        router.push(redirectTo);
      } else {
        setErrorMsg(res.error || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoFillDemoOtp = () => {
    const digits = demoCode.split('');
    setOtpDigits(digits);
    verifyOtpCode(demoCode);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        router.push(redirectTo);
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    quickDemoLogin();
    router.push(redirectTo);
  };

  return (
    <div className="bg-canvas min-h-screen py-8 sm:py-16 selection:bg-champagne selection:text-ink relative overflow-hidden">
      {/* Ambient background atmosphere glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-champagne/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Creative Container */}
        <div className="bg-canvas-subtle rounded-3xl border border-border-gold shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[700px] relative">
          
          {/* Left Column: Atmospheric Atelier World & Editorial Showcase (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-[#141312] text-canvas p-10 lg:p-12 flex-col justify-between overflow-hidden">
            {/* Texture & Image Overlays */}
            <div className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px]" />
            <div
              className="absolute inset-0 opacity-35 pointer-events-none bg-cover bg-center transition-transform duration-1000 scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/80 to-[#141312]/50 pointer-events-none" />

            {/* Top Brand & Wax-Seal Motif */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                {/* Wax Seal Emblem */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D2A28] to-[#141312] border-2 border-gold/60 flex items-center justify-center shadow-lg relative group">
                  <div className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center">
                    <Gem className="w-5 h-5 text-champagne" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gold text-[#141312] text-[8px] font-bold flex items-center justify-center">
                    K
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-monumental text-champagne font-sans font-semibold block">
                    Kalajay Digital Flagship
                  </span>
                  <span className="font-serif text-lg tracking-[0.18em] text-canvas font-normal">
                    ATELIER SANCTUM
                  </span>
                </div>
              </div>

              {/* Dynamic Greeting & Heading */}
              <div className="mt-8 space-y-2">
                <span className="text-xs text-gold font-sans tracking-wide block">
                  {greeting}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-canvas font-normal tracking-tight leading-snug">
                  Step into a world of <br />
                  <span className="italic font-light text-champagne">patient wonders.</span>
                </h2>
                <p className="mt-3 text-xs text-canvas/75 font-light leading-relaxed">
                  Enter to monitor live handcrafting dispatches, preview bespoke engravings, and unlock exclusive private vault bead releases.
                </p>
              </div>
            </div>

            {/* Middle: Membership Honours List */}
            <div className="relative z-10 my-8 p-5 rounded-2xl bg-canvas/10 backdrop-blur-md border border-gold/25 space-y-3.5">
              <span className="text-[11px] uppercase tracking-monumental text-champagne font-sans font-bold flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-gold" />
                <span>Circle Patron Privileges</span>
              </span>

              <div className="space-y-3 text-xs text-canvas/80">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5 text-gold">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-canvas block font-medium">Loom-to-Doorstep Chronicle</strong>
                    <span className="text-[11px] text-canvas/65">
                      Watch your piece advance from individual bead selection to signature wax-sealing.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5 text-gold">
                    <Gem className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-canvas block font-medium">Inaugural ₹300 Welcome Honour</strong>
                    <span className="text-[11px] text-canvas/65">
                      Preloaded onto your patron account for your first handcrafted creation.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5 text-gold">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-canvas block font-medium">Curated Vault Access</strong>
                    <span className="text-[11px] text-canvas/65">
                      48-hour priority reservation on limited-edition seasonal bead drops.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Founder Quote */}
            <div className="relative z-10 pt-5 border-t border-canvas/15 text-xs text-canvas/70 italic font-serif">
              “Every bead placed is a heartbeat of patience.”
              <span className="block not-italic font-sans text-[10px] tracking-refined uppercase text-champagne font-semibold mt-1">
                Kalajay Atelier · 100% Handcrafted
              </span>
            </div>
          </div>

          {/* Right Column: Creative Interactive Auth Portal */}
          <div className="lg:col-span-7 bg-canvas p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Header with Monogram and Mode Switcher */}
              <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-canvas-subtle border border-gold/30 text-[10px] uppercase tracking-monumental text-gold-dark font-semibold">
                    <Gem className="w-3 h-3 text-gold" />
                    <span>Patron Access</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                    Enter the Circle
                  </h1>
                </div>

                <Link
                  href="/"
                  className="font-serif text-2xl tracking-[0.2em] text-ink hover:text-gold-dark transition-colors hidden sm:block"
                >
                  KALAJAY
                </Link>
              </div>

              {/* Creative Pill Switcher: Instant Mobile OTP vs Email & Password */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-canvas-subtle border border-border-subtle rounded-2xl mt-6 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('otp');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'otp'
                      ? 'bg-ink text-canvas shadow-xs font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-gold" />
                  <span>Instant Mobile OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-ink text-canvas shadow-xs font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email & Password</span>
                </button>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* --- 1. INSTANT MOBILE OTP LOGIN FLOW --- */}
              {authMethod === 'otp' && (
                <div className="mt-6">
                  {otpStep === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                      <div>
                        <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-2">
                          Your Mobile Number
                        </label>
                        <div className="flex items-center rounded-2xl border border-border-medium bg-canvas focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 transition-all overflow-hidden shadow-2xs">
                          <div className="px-4 py-3.5 bg-canvas-subtle border-r border-border-subtle flex items-center gap-2 text-xs font-semibold text-ink">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="Enter 10-digit mobile number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-3.5 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                            autoFocus
                          />
                        </div>
                        <p className="mt-2 text-[11px] text-ink-muted flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                          <span>We will transmit an instant 6-digit passcode to verify your phone.</span>
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-6 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 group"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-gold" />
                            <span>Transmitting Artisan Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* OTP Verification Screen with Bead Pedestals */
                    <div className="space-y-6 animate-fade-in">
                      <div className="bg-canvas-subtle p-4 rounded-2xl border border-border-subtle flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-ink-muted block">Code sent to phone:</span>
                          <span className="text-sm font-semibold text-ink font-mono tracking-wide">
                            +91 {phoneNumber || '98765 43210'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpStep('phone')}
                          className="text-xs text-gold-dark hover:underline font-semibold cursor-pointer"
                        >
                          Change Number
                        </button>
                      </div>

                      {/* Creative Auto-Fill Passcode Chip */}
                      <button
                        type="button"
                        onClick={autoFillDemoOtp}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-canvas-subtle via-champagne/15 to-canvas-subtle border border-gold/40 hover:border-gold rounded-xl flex items-center justify-between text-xs transition-all shadow-2xs group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-ink">
                          <div className="w-5 h-5 rounded-full bg-ink flex items-center justify-center text-gold shadow-2xs">
                            <Gem className="w-3 h-3" />
                          </div>
                          <span className="font-sans">
                            Atelier Passcode: <strong className="font-mono font-bold tracking-widest text-ink">{demoCode}</strong>
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-gold-dark group-hover:text-ink flex items-center gap-1 transition-colors">
                          <span>One-Tap Fill</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </button>

                      {/* 6 Bead Pedestals with Circular Pins */}
                      <div>
                        <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-3 text-center">
                          Enter 6-Digit Passcode
                        </label>
                        <div className="flex items-center justify-center gap-2 sm:gap-3.5">
                          {otpDigits.map((digit, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                              {/* Bead status orb */}
                              <span
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  digit
                                    ? 'bg-gold ring-4 ring-gold/25 scale-125 shadow-xs'
                                    : 'bg-border-medium'
                                }`}
                              />
                              <input
                                ref={(el) => {
                                  otpInputsRef.current[idx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                className={`w-11 h-14 sm:w-13 sm:h-16 text-center font-serif text-xl sm:text-2xl text-ink font-semibold rounded-2xl border transition-all shadow-xs ${
                                  digit
                                    ? 'border-gold bg-canvas-subtle ring-2 ring-gold/25'
                                    : 'border-border-medium bg-canvas hover:border-border-strong focus:border-gold focus:ring-2 focus:ring-gold/30'
                                } focus:outline-none`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-ink-muted">
                          {resendTimer > 0 ? (
                            <span>Resend in {resendTimer}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSendOtp()}
                              className="text-gold-dark hover:underline font-semibold cursor-pointer"
                            >
                              Resend Passcode
                            </button>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() => verifyOtpCode()}
                          disabled={isSubmitting}
                          className="px-6 py-2.5 bg-ink text-canvas hover:bg-gold hover:text-ink rounded-full uppercase tracking-refined font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          Verify & Enter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- 2. EMAIL & PASSWORD FLOW --- */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-refined font-semibold text-ink block mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs uppercase tracking-refined font-semibold text-ink">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset instructions sent to your email.')}
                        className="text-[11px] text-gold-dark hover:underline cursor-pointer font-medium"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-canvas border border-border-medium rounded-xl text-xs sm:text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-6 rounded-full bg-ink hover:bg-gold hover:text-ink text-canvas text-xs uppercase tracking-refined font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-gold" />
                        <span>Entering Atelier...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 1-Click Demo Evaluation Shortcut */}
              <div className="mt-6 pt-5 border-t border-border-subtle flex items-center justify-between gap-3 text-xs">
                <span className="text-ink-muted">Reviewing the flagship?</span>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="px-3.5 py-1.5 rounded-full bg-canvas-subtle hover:bg-border-medium border border-border-subtle text-ink font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Gem className="w-3.5 h-3.5 text-gold" />
                  <span>1-Click Demo Sign In</span>
                </button>
              </div>
            </div>

            {/* Bottom Register Callout */}
            <div className="mt-8 pt-5 border-t border-border-subtle text-center text-xs text-ink-muted">
              <span>New to Kalajay Atelier? </span>
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
                className="font-semibold text-ink hover:text-gold-dark transition-colors underline"
              >
                Join the Circle & Claim ₹300 Welcome Gift →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
