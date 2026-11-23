import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Info,
  RotateCcw,
  Search,
  X,
  XCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// 1. ترجمة أخطاء قاعدة البيانات والشبكة إلى رسائل عربية واضحة
// ---------------------------------------------------------------------------
export function toArabicErrorMessage(err: unknown, fallback = 'تعذر إتمام العملية، يرجى المحاولة مرة أخرى.'): string {
  const raw =
    typeof err === 'string'
      ? err
      : (err as any)?.message || (err as any)?.error_description || '';
  const msg = String(raw || '').trim();
  const code = String((err as any)?.code || '');

  if (!msg) return fallback;
  if (code === '23505' || /duplicate key|already exists|unique/i.test(msg)) {
    return 'هذه البيانات مسجلة أو مرتبطة بالفعل.';
  }
  if (code === '42501' || /row-level security|permission denied|not authorized|unauthorized/i.test(msg)) {
    return 'لا تملك الصلاحية الكافية لتنفيذ هذه العملية، تأكد من تسجيل الدخول بحساب الإدارة.';
  }
  if (/failed to fetch|networkerror|network request failed|timeout/i.test(msg)) {
    return 'تعذر الاتصال بالخادم، تحقق من اتصال الإنترنت وحاول مجدداً.';
  }
  if (/jwt|session|not authenticated/i.test(msg)) {
    return 'انتهت جلسة الدخول، يرجى إعادة تسجيل الدخول بحساب الإدارة.';
  }
  // إذا كانت الرسالة عربية واضحة بالفعل نُبقيها كما هي
  if (/[\u0600-\u06FF]/.test(msg)) return msg;
  return fallback;
}

// ---------------------------------------------------------------------------
// 2. دعم زر الرجوع في Android والمتصفح لإغلاق النوافذ دون الخروج من القسم
// ---------------------------------------------------------------------------
let __yrScrollLockCount = 0;
let __yrPrevBodyOverflow = '';
let __yrPrevHtmlOverflow = '';

function lockBodyScroll() {
  if (typeof document === 'undefined') return () => {};
  if (__yrScrollLockCount === 0) {
    __yrPrevBodyOverflow = document.body.style.overflow;
    __yrPrevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  __yrScrollLockCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    __yrScrollLockCount = Math.max(0, __yrScrollLockCount - 1);
    if (__yrScrollLockCount === 0) {
      document.body.style.overflow = __yrPrevBodyOverflow;
      document.documentElement.style.overflow = __yrPrevHtmlOverflow;
    }
  };
}

export function useBackClose(isOpen: boolean, onClose: () => void) {
  const sheetIdRef = useRef(`yr-sheet-${Math.random().toString(36).slice(2, 10)}`);
  const pushedRef = useRef(false);
  const closedByPopRef = useRef(false);
  const backTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const unlockScroll = lockBodyScroll();
    const sheetId = sheetIdRef.current;

    if (backTimerRef.current) {
      clearTimeout(backTimerRef.current);
      backTimerRef.current = null;
    }

    closedByPopRef.current = false;
    if (!pushedRef.current || window.history.state?.yrSheetId !== sheetId) {
      try {
        window.history.pushState({ yrAdminSheet: true, yrSheetId: sheetId }, '');
        pushedRef.current = true;
      } catch {
        pushedRef.current = false;
      }
    }

    const handlePop = () => {
      if (window.history.state?.yrSheetId === sheetId) return;
      if (pushedRef.current) {
        pushedRef.current = false;
        closedByPopRef.current = true;
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePop);
    return () => {
      unlockScroll();
      window.removeEventListener('popstate', handlePop);
      if (pushedRef.current && !closedByPopRef.current) {
        backTimerRef.current = setTimeout(() => {
          backTimerRef.current = null;
          if (pushedRef.current && !closedByPopRef.current) {
            pushedRef.current = false;
            try {
              if (window.history.state?.yrSheetId === sheetId) {
                window.history.back();
              }
            } catch {}
          }
        }, 60);
      }
    };
  }, [isOpen]);
}

// ---------------------------------------------------------------------------
// 3. حفظ البحث والفلاتر وموضع التمرير عند التنقل والرجوع
// ---------------------------------------------------------------------------
export function useSectionViewState<T extends Record<string, any>>(
  storageKey: string,
  defaults: T,
  options?: { ready?: boolean }
) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...defaults, ...parsed };
        }
      }
    } catch {}
    return defaults;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [storageKey, state]);

  const scrollKey = `${storageKey}__scroll`;

  useEffect(() => {
    // handled when ready below

    let timer: any = null;
    const onScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          sessionStorage.setItem(scrollKey, String(Math.round(window.scrollY)));
        } catch {}
      }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [scrollKey]);

  const restoredRef = useRef(false);
  const isReady = options?.ready !== false;
  useEffect(() => {
    if (!isReady || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const savedY = Number(sessionStorage.getItem(scrollKey) || '0');
      if (savedY > 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => window.scrollTo(0, savedY));
        });
      }
    } catch {}
  }, [isReady, scrollKey]);

  const patchState = useCallback((patch: Partial<T>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  return [state, patchState, setState] as const;
}

// ---------------------------------------------------------------------------
// 4. نظام الإشعارات الموحد (نجاح / خطأ / تحذير / معلومات)
// ---------------------------------------------------------------------------
export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  message: string;
  onRetry?: () => void;
}

interface AdminFeedbackContextValue {
  notify: (type: FeedbackType, message: string, options?: { onRetry?: () => void; durationMs?: number }) => void;
  showSuccess: (message: string) => void;
  showError: (message: string, onRetry?: () => void) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  clearFeedback: () => void;
}

const AdminFeedbackContext = createContext<AdminFeedbackContextValue | null>(null);

export const AdminFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const lastShownRef = useRef<{ key: string; at: number }>({ key: '', at: 0 });

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (type: FeedbackType, message: string, options?: { onRetry?: () => void; durationMs?: number }) => {
      const clean = String(message || '').trim();
      if (!clean) return;
      const now = Date.now();
      const dedupeKey = `${type}::${clean}`;
      if (lastShownRef.current.key === dedupeKey && now - lastShownRef.current.at < 1500) {
        return;
      }
      lastShownRef.current = { key: dedupeKey, at: now };

      const id = `fb-${now}-${Math.random().toString(36).slice(2, 6)}`;
      setItems((prev) => [...prev.slice(-2), { id, type, message: clean, onRetry: options?.onRetry }]);

      const ttl = options?.durationMs ?? (type === 'error' ? 5500 : 3500);
      if (ttl > 0) {
        setTimeout(() => {
          setItems((prev) => prev.filter((x) => x.id !== id));
        }, ttl);
      }
    },
    []
  );

  const value = useMemo<AdminFeedbackContextValue>(
    () => ({
      notify,
      showSuccess: (msg) => notify('success', msg),
      showError: (msg, onRetry) => notify('error', msg, { onRetry }),
      showWarning: (msg) => notify('warning', msg),
      showInfo: (msg) => notify('info', msg),
      clearFeedback: () => setItems([]),
    }),
    [notify]
  );

  return (
    <AdminFeedbackContext.Provider value={value}>
      {children}
      {items.length > 0 && (
        <div
          dir="rtl"
          aria-live="polite"
          className="fixed top-[68px] inset-x-0 z-[260] px-3 sm:px-4 flex flex-col items-center gap-2 pointer-events-none"
        >
          {items.map((item) => {
            const cfg =
              item.type === 'success'
                ? {
                    wrap: 'bg-[#15241D] border-[#10B981]/50 text-[#D1FAE5]',
                    icon: <CheckCircle2 size={17} className="text-[#10B981] shrink-0" />,
                  }
                : item.type === 'error'
                  ? {
                      wrap: 'bg-[#281619] border-[#EF4444]/60 text-[#FEE2E2]',
                      icon: <XCircle size={17} className="text-[#EF4444] shrink-0" />,
                    }
                  : item.type === 'warning'
                    ? {
                        wrap: 'bg-[#272112] border-[#FFC500]/60 text-[#FEF3C7]',
                        icon: <AlertTriangle size={17} className="text-[#FFC500] shrink-0" />,
                      }
                    : {
                        wrap: 'bg-[#17212B] border-[#38BDF8]/50 text-[#E0F2FE]',
                        icon: <Info size={17} className="text-[#38BDF8] shrink-0" />,
                      };

            return (
              <div
                key={item.id}
                className={`pointer-events-auto w-full max-w-md rounded border px-3.5 py-2.5 shadow-lg flex items-center justify-between gap-2.5 text-xs font-bold ${cfg.wrap}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {cfg.icon}
                  <span className="leading-snug break-words">{item.message}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.onRetry && (
                    <button
                      type="button"
                      onClick={() => {
                        dismiss(item.id);
                        item.onRetry?.();
                      }}
                      className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={11} />
                      <span>إعادة</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => dismiss(item.id)}
                    className="p-1 text-white/70 hover:text-white cursor-pointer"
                    aria-label="إغلاق"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminFeedbackContext.Provider>
  );
};

export function useAdminFeedback(): AdminFeedbackContextValue {
  const ctx = useContext(AdminFeedbackContext);
  if (!ctx) {
    return {
      notify: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      clearFeedback: () => {},
    };
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// 5. الأزرار الموحدة
// ---------------------------------------------------------------------------
export type AdminButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  type = 'button',
  ...rest
}) => {
  const sizeCls = size === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 px-4 text-xs';
  const variantCls: Record<AdminButtonVariant, string> = {
    primary: 'bg-[#FFC500] hover:bg-[#eab308] text-black font-black border border-[#FFC500]',
    secondary: 'bg-[#0B0B0B] hover:bg-[#141414] text-white font-bold border border-[#2F3336]',
    danger: 'bg-[#35181C] hover:bg-[#491F25] text-[#FCA5A5] font-bold border border-[#EF4444]/40',
    warning: 'bg-[#2B2413] hover:bg-[#3A3018] text-[#FFC500] font-bold border border-[#FFC500]/40',
    ghost: 'bg-transparent hover:bg-white/[0.06] text-[#CBD5E1] font-bold border border-transparent',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded transition active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap ${sizeCls} ${variantCls[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

// ---------------------------------------------------------------------------
// 6. القائمة المنسدلة الموحدة (تمنع قوائم أندرويد/المتصفح الافتراضية)
// ---------------------------------------------------------------------------
export interface AdminSelectOption {
  value: string;
  label: string;
  hint?: string;
  avatarUrl?: string | null;
}

interface AdminSelectProps {
  value: string;
  options: AdminSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  disabled?: boolean;
  searchable?: boolean;
  compact?: boolean;
  className?: string;
}

export const AdminSelect: React.FC<AdminSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'اختر...',
  title = 'اختر من القائمة',
  disabled = false,
  searchable,
  compact = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useBackClose(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const showSearch = searchable ?? options.length >= 6;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !showSearch) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.hint && o.hint.toLowerCase().includes(q))
    );
  }, [options, query, showSearch]);

  const selected = options.find((o) => o.value === value);

  const listMarkup = (
    <>
      {showSearch && (
        <div className="p-2 border-b border-[#2F3336] bg-[#0B0B0B] flex items-center gap-2 shrink-0">
          <Search size={14} className="text-[#8B919A] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث سريع..."
            className="w-full bg-transparent text-xs text-white placeholder-[#8B919A] outline-none caret-white py-1"
          />
        </div>
      )}
      <div className="overflow-y-auto divide-y divide-[#2F3336]/60 max-h-[55dvh] sm:max-h-60">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-[#8B919A]">لا توجد خيارات مطابقة</div>
        ) : (
          filtered.map((opt) => {
            const isSel = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setQuery('');
                }}
                className={`w-full min-h-[44px] px-3.5 py-2.5 text-right text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                  isSel
                    ? 'bg-[#FFC500]/15 text-[#FFC500] font-black'
                    : 'text-[#E5E7EB] hover:bg-[#141414] font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {opt.avatarUrl !== undefined && (
                    <div className="w-7 h-7 rounded bg-[#14171C] border border-[#2F3336] overflow-hidden flex items-center justify-center text-[11px] font-black text-[#FFC500] shrink-0">
                      {opt.avatarUrl ? <img src={opt.avatarUrl} alt="" className="w-full h-full object-cover" /> : (opt.label?.[0] || '؟')}
                    </div>
                  )}
                  <div className="min-w-0 text-right">
                    <div className="truncate">{opt.label}</div>
                    {opt.hint && <div className="text-[10px] text-[#8B919A] truncate mt-0.5">{opt.hint}</div>}
                  </div>
                </div>
                {isSel && <Check size={15} className="text-[#FFC500] shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <div ref={wrapRef} className={`relative ${className}`} dir="rtl">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setQuery('');
          setOpen((v) => !v);
        }}
        className={`w-full flex items-center justify-between gap-2 bg-[#0B0B0B] border text-right font-bold transition cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
          open ? 'border-white' : 'border-[#2F3336] hover:border-[#4B525E]'
        } ${compact ? 'h-9 px-2.5 text-[11.5px] rounded' : 'h-10 px-3 text-xs rounded'} text-white`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#8B919A] transition-transform duration-150 ${open ? 'rotate-180 text-white' : ''}`}
        />
      </button>

      {open && (
        <>
          {/* Mobile Bottom Sheet */}
          <div
            className="sm:hidden fixed inset-0 z-[240] bg-black/70 flex items-end"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-black border-t border-[#2F3336] rounded-t-md overflow-hidden flex flex-col max-h-[75dvh]"
            >
              <div className="w-10 h-1 bg-[#3A404B] rounded-full mx-auto mt-2 shrink-0" />
              <div className="px-4 py-2.5 border-b border-[#2F3336] flex items-center justify-between shrink-0">
                <span className="text-xs font-black text-white">{title}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 text-[#8B919A] hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              {listMarkup}
            </div>
          </div>

          {/* Desktop Popover */}
          <div className="hidden sm:flex flex-col absolute right-0 top-[calc(100%+4px)] min-w-[210px] w-full max-w-[calc(100vw-2rem)] z-[240] bg-black border border-[#2F3336] rounded shadow-xl overflow-hidden">
            {listMarkup}
          </div>
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 7. النافذة الموحدة (Bottom Sheet على الهاتف + Dialog مسطح على الكمبيوتر)
// ---------------------------------------------------------------------------
interface AdminSheetModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidthClass?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export const AdminSheetModal: React.FC<AdminSheetModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  maxWidthClass = 'sm:max-w-lg',
  headerActions,
  children,
}) => {
  useBackClose(open, onClose);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[180] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthClass} bg-black border-t sm:border border-[#2F3336] rounded-t-md sm:rounded overflow-hidden text-white max-h-[92dvh] flex flex-col`}
      >
        <div className="w-10 h-1 bg-[#3A404B] rounded-full mx-auto mt-2 sm:hidden shrink-0" />
        <div className="px-4 py-3 border-b border-[#2F3336] flex items-center justify-between gap-2 shrink-0 bg-[#0B0B0B]">
          <div className="flex items-center gap-2 min-w-0">
            {icon}
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white truncate">{title}</h2>
              {subtitle && <p className="text-[11px] text-[#8B919A] truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-[#8B919A] hover:text-white hover:bg-white/[0.06] cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={17} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 8. نافذة التأكيد التحذيرية الموحدة (بديل window.confirm)
// ---------------------------------------------------------------------------
interface AdminConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  requireReason?: boolean;
  requireDate?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string, extraDate?: string) => Promise<void> | void;
}

export const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'تأكيد التنفيذ',
  cancelLabel = 'إلغاء',
  variant = 'warning',
  requireReason = false,
  requireDate = false,
  onCancel,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [extraDate, setExtraDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useBackClose(open, onCancel);

  useEffect(() => {
    if (!open) {
      setReason('');
      setExtraDate('');
    }
  }, [open]);

  if (!open) return null;

  const isDanger = variant === 'danger';
  const canSubmit = !requireReason || reason.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim() || 'تأكيد إداري', extraDate || undefined);
      setReason('');
      setExtraDate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[220] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir="rtl"
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-black border-t sm:border border-[#2F3336] rounded-t-md sm:rounded p-4 sm:p-5 space-y-4 text-white"
      >
        <div className="w-10 h-1 bg-[#3A404B] rounded-full mx-auto -mt-1 sm:hidden" />
        <div className="flex items-center justify-between border-b border-[#2F3336] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className={isDanger ? 'text-[#EF4444]' : 'text-[#FFC500]'} />
            <h3 className="text-sm font-black text-white">{title}</h3>
          </div>
          <button type="button" onClick={onCancel} className="p-1 text-[#8B919A] hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-[#D1D5DB] leading-relaxed">{description}</p>

        {requireDate && (
          <div>
            <label className="block text-[11px] font-bold text-[#8B919A] mb-1">
              تاريخ انتهاء الإجراء (اختياري)
            </label>
            <input
              type="date"
              value={extraDate}
              onChange={(e) => setExtraDate(e.target.value)}
              className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded px-3 text-xs text-white outline-none caret-white"
            />
          </div>
        )}

        {requireReason && (
          <div>
            <label className="block text-[11px] font-bold text-[#8B919A] mb-1">
              السبب / الملاحظة الإدارية *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب السبب الواضح لهذا الإجراء..."
              className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded p-3 text-xs text-white placeholder-[#8B919A] outline-none caret-white resize-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2F3336]">
          <AdminButton variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            type="submit"
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            loading={submitting}
            disabled={!canSubmit}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </form>
    </div>
  );
};
