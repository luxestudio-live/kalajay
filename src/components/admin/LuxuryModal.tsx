'use client';

import React, { useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface LuxuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: 'info' | 'success' | 'warning' | 'danger' | 'shield';
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isDestructive?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function LuxuryModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = 'info',
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  isDestructive = false,
  maxWidth = 'md',
}: LuxuryModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  const iconConfig = {
    info: {
      icon: Info,
      bg: 'bg-[#9E5430]/10',
      text: 'text-[#9E5430]',
      border: 'border-[#9E5430]/20',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    danger: {
      icon: AlertCircle,
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    shield: {
      icon: ShieldCheck,
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
  }[icon];

  const IconComponent = iconConfig.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="luxury-modal-title"
      className="fixed inset-0 z-50 bg-[#372921]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        className={`bg-white rounded-2xl border border-[#DED3C5] shadow-2xl w-full ${maxWidthClasses} overflow-hidden my-8 animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-[#F7F3EC] border-b border-[#DED3C5] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl ${iconConfig.bg} ${iconConfig.text} ${iconConfig.border} border flex items-center justify-center shrink-0`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 id="luxury-modal-title" className="font-serif text-base font-bold text-[#372921] truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-[#76695F] truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#76695F] hover:text-[#372921] hover:bg-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {children && (
          <div className="p-6 text-xs text-[#372921] leading-relaxed max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#DED3C5] flex items-center justify-end gap-2.5">
          {cancelLabel && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 min-h-[36px] flex items-center justify-center rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#76695F] hover:text-[#372921] text-xs font-semibold transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
          )}

          {confirmLabel && (
            <button
              type="button"
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-5 py-2 min-h-[36px] flex items-center justify-center rounded-full text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer ${
                isDestructive
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : 'bg-[#9E5430] hover:bg-[#874427]'
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

