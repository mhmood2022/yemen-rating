import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const iconFor = (type: ToastType) => {
    if (type === 'success') return CheckCircle2;
    if (type === 'error') return XCircle;
    return Info;
  };

  // الألوان المطلوبة: أخضر للنجاح، أحمر للخطأ، ذهبي للمعلومات
  const bgColor = (type: ToastType) => {
    if (type === 'success') return '#22C55E'; // أخضر
    if (type === 'error') return '#EF4444';   // أحمر
    return '#FFC500';                          // ذهبي
  };

  // لون النص: أبيض للنجاح والخطأ، أسود للمعلومات (لتباين أفضل)
  const textColor = (type: ToastType) => {
    if (type === 'info') return '#000000';
    return '#FFFFFF';
  };

  const iconColor = (type: ToastType) => {
    if (type === 'info') return '#000000';
    return '#FFFFFF';
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-3 inset-x-3 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = iconFor(t.type);
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
              style={{
                backgroundColor: bgColor(t.type),
                animation: 'toast-slide-in 250ms ease-out',
              }}
            >
              <Icon className="w-5 h-5 shrink-0" style={{ color: iconColor(t.type) }} />
              <span
                className="flex-1 text-sm font-semibold"
                style={{ color: textColor(t.type) }}
              >
                {t.message}
              </span>
              <button
                onClick={() => dismiss(t.id)}
                className="w-6 h-6 flex items-center justify-center rounded active:opacity-60"
                style={{ color: textColor(t.type) }}
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {} };
  return ctx;
};
