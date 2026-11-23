import React, { useState } from 'react';
import { VerifiedBadge } from '../../ui/VerifiedBadge';
import {
  AccountModerationStatus,
  AdsCoverageKind,
  BadgeKind,
  PageKind,
  PageStatusKind,
  PeriodPreset,
  ProfileKind,
  SubscriptionCycle,
  SubscriptionStatusKind,
} from '../../../types/adminAccountsPages';
import { Calendar, AlertTriangle, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useBackClose } from './AndroidAdminKit';

export const formatDateAr = (d?: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTimeAr = (d?: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('ar-YE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const BadgePill: React.FC<{ badge: BadgeKind }> = ({ badge }) => {
  if (!badge || badge === 'none') {
    return <span className="px-2 py-0.5 rounded-full text-[11px] bg-zinc-900 text-zinc-500 border border-[#2F3336]">بدون</span>;
  }
  const map: Record<string, { label: string; cls: string; v: 'blue' | 'silver' | 'gold' }> = {
    blue: { label: 'أزرق', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/30', v: 'blue' },
    silver: { label: 'فضي', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30', v: 'silver' },
    gray: { label: 'فضي', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30', v: 'silver' },
    gold: { label: 'ذهبي', cls: 'bg-amber-500/15 text-[#FFC500] border-amber-500/30', v: 'gold' },
  };
  const cfg = map[badge] || map.blue;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.cls}`}>
      <VerifiedBadge variant={cfg.v} size={13} />
      <span>{cfg.label}</span>
    </span>
  );
};

export const AccountKindPill: React.FC<{ kind: ProfileKind }> = ({ kind }) => {
  const map: Record<ProfileKind, { label: string; cls: string }> = {
    personal: { label: 'شخصي', cls: 'bg-[#0B0B0B] text-zinc-200 border-[#2F3336]' },
    business_owner: { label: 'صاحب منشأة', cls: 'bg-amber-500/10 text-[#FFC500] border-amber-500/30' },
    businessman: { label: 'رجل أعمال', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  };
  const c = map[kind] || map.personal;
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${c.cls}`}>{c.label}</span>;
};

export const AccountStatusPill: React.FC<{ status: AccountModerationStatus }> = ({ status }) => {
  const map: Record<AccountModerationStatus, { label: string; cls: string }> = {
    active: { label: 'نشط', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    restricted: { label: 'مقيّد', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    suspended: { label: 'موقوف مؤقتاً', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    banned: { label: 'محظور', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  };
  const c = map[status] || map.active;
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${c.cls}`}>{c.label}</span>;
};

export const PageKindPill: React.FC<{ kind: PageKind }> = ({ kind }) => {
  const map: Record<PageKind, { label: string; cls: string }> = {
    business: { label: 'منشأة', cls: 'bg-amber-500/10 text-[#FFC500] border-amber-500/30' },
    company: { label: 'شركة', cls: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    businessman: { label: 'رجل أعمال', cls: 'bg-zinc-500/15 text-zinc-200 border-zinc-500/30' },
  };
  const c = map[kind] || map.business;
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${c.cls}`}>{c.label}</span>;
};

export const PageStatusPill: React.FC<{ status: PageStatusKind }> = ({ status }) => {
  const map: Record<PageStatusKind, { label: string; cls: string }> = {
    active: { label: 'نشطة', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    pending: { label: 'معلقة', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    hidden: { label: 'مخفية', cls: 'bg-zinc-700/30 text-zinc-300 border-zinc-600/40' },
    suspended: { label: 'موقوفة', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  };
  const c = map[status] || map.active;
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${c.cls}`}>{c.label}</span>;
};

export const SubCyclePill: React.FC<{ cycle: SubscriptionCycle }> = ({ cycle }) => {
  const map: Record<SubscriptionCycle, string> = {
    free: 'مجاني',
    monthly: 'شهري',
    yearly: 'سنوي',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${
      cycle === 'free' ? 'bg-zinc-900 text-zinc-400 border-[#2F3336]' : 'bg-[#FFC500]/10 text-[#FFC500] border-[#FFC500]/30'
    }`}>
      {map[cycle]}
    </span>
  );
};

export const SubStatusPill: React.FC<{ status: SubscriptionStatusKind }> = ({ status }) => {
  const map: Record<SubscriptionStatusKind, { label: string; cls: string }> = {
    active: { label: 'نشط', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    expired: { label: 'منتهٍ', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    cancelled: { label: 'ملغي', cls: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
    pending: { label: 'قيد الانتظار', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    none: { label: '—', cls: 'bg-transparent text-zinc-500 border-transparent' },
  };
  const c = map[status] || map.none;
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${c.cls}`}>{c.label}</span>;
};

export const AdsCoveragePill: React.FC<{ coverage: AdsCoverageKind }> = ({ coverage }) => {
  const map: Record<AdsCoverageKind, { label: string; cls: string }> = {
    none: { label: 'بدون', cls: 'bg-[#0B0B0B] text-[#9CA3AF] border-[#2F3336]' },
    banner: { label: 'بانر', cls: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
    text: { label: 'نصي', cls: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
    both: { label: 'كلاهما', cls: 'bg-[#FFC500]/15 text-[#FFC500] border-[#FFC500]/30' },
  };
  const c = map[coverage] || map.none;
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${c.cls}`}>{c.label}</span>;
};

export const StatMiniCard: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
  growthPct?: number;
  subText?: string;
}> = ({ label, value, icon, accent = 'text-white', growthPct, subText }) => (
  <div className="bg-black border border-[#2F3336] rounded-lg p-3 flex flex-col justify-between gap-2">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-bold text-[#71767B] truncate">{label}</span>
      <span className="p-1.5 rounded-lg bg-[#0B0B0B] border border-[#2F3336] text-[#FFC500] shrink-0">{icon}</span>
    </div>
    <div className="flex items-end justify-between gap-2">
      <span className={`text-base font-black tabular-nums leading-none ${accent}`}>{value}</span>
      {typeof growthPct === 'number' && (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          growthPct >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {growthPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`}
        </span>
      )}
    </div>
    {subText && <span className="text-[10px] text-[#71767B]">{subText}</span>}
  </div>
);

export const PeriodFilterBar: React.FC<{
  period: PeriodPreset;
  onPeriodChange: (p: PeriodPreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
}> = ({ period, onPeriodChange, customFrom, customTo, onCustomFromChange, onCustomToChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="inline-flex items-center gap-1 bg-[#0B0B0B] border border-[#2F3336] rounded-lg p-1">
      <Calendar size={14} className="text-[#FFC500] mx-1.5" />
      {[
        { id: '7d', label: '7 أيام' },
        { id: '30d', label: '30 يوماً' },
        { id: '90d', label: '90 يوماً' },
        { id: 'all', label: 'الكل' },
        { id: 'custom', label: 'مخصص' },
      ].map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPeriodChange(p.id as PeriodPreset)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
            period === p.id ? 'bg-[#FFC500] text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
    {period === 'custom' && (
      <div className="flex items-center gap-2 text-xs">
        <input
          type="date"
          value={customFrom}
          onChange={(e) => onCustomFromChange(e.target.value)}
          className="bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-2 py-1 text-xs text-white outline-none caret-white"
        />
        <span className="text-[#71767B]">إلى</span>
        <input
          type="date"
          value={customTo}
          onChange={(e) => onCustomToChange(e.target.value)}
          className="bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-2 py-1 text-xs text-white outline-none caret-white"
        />
      </div>
    )}
  </div>
);

export const ReasonConfirmModal: React.FC<{
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  requireDate?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string, extraDate?: string) => Promise<void> | void;
}> = ({ open, title, description, confirmLabel = 'تأكيد التنفيذ', danger, requireDate, onCancel, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [extraDate, setExtraDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useBackClose(open, onCancel);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim(), extraDate || undefined);
      setReason('');
      setExtraDate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4" dir="rtl" onClick={onCancel}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-black border-t sm:border border-[#2F3336] rounded-t-md sm:rounded-lg p-4 sm:p-5 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#2F3336] pb-3">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <AlertTriangle size={17} className={danger ? 'text-rose-400' : 'text-[#FFC500]'} />
            <span>{title}</span>
          </div>
          <button type="button" onClick={onCancel} className="p-1 text-zinc-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">{description}</p>

        {requireDate && (
          <div>
            <label className="block text-[11px] font-bold text-[#71767B] mb-1">تاريخ انتهاء الإيقاف / الصلاحية (اختياري)</label>
            <input
              type="date"
              value={extraDate}
              onChange={(e) => setExtraDate(e.target.value)}
              className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 py-2 text-xs text-white outline-none caret-white"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-[#71767B] mb-1">السبب / الملاحظة الإدارية (إلزامي للتدقيق) *</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب السبب الواضح لهذا الإجراء..."
            className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg p-3 text-xs text-white outline-none caret-white resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-[#0B0B0B] border border-[#2F3336] text-xs font-bold text-zinc-300 hover:text-white cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting || !reason.trim()}
            className={`px-4 py-2 rounded-lg text-xs font-black cursor-pointer disabled:opacity-50 ${
              danger ? 'bg-rose-600 text-white hover:bg-rose-500' : 'bg-[#FFC500] text-black hover:opacity-90'
            }`}
          >
            {submitting ? 'جارٍ التنفيذ...' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
