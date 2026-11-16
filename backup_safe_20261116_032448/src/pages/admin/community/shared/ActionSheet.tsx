import React, { useEffect } from 'react';

export interface ActionSheetItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  destructive?: boolean;
  onClick: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  items: ActionSheetItem[];
}

export const ActionSheet: React.FC<Props> = ({ open, onClose, title, items }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" style={{ animation: 'fade-in 200ms' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{
          background: 'var(--yr-surface-elevated)',
          border: '1px solid var(--yr-border-dark)',
          borderBottom: 'none',
          animation: 'sheet-slide-up 250ms ease-out',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--yr-border-dark)' }}>
          <div className="flex-1">
            <div className="w-10 h-1 rounded-full mx-auto mb-2" style={{ background: 'var(--yr-border-dark)' }} />
            {title && (
              <h3 className="text-sm font-semibold text-center" style={{ color: 'var(--yr-text-primary)' }}>
                {title}
              </h3>
            )}
          </div>
        </div>
        <div className="py-2 max-h-[60vh] overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-right transition active:opacity-60"
                style={{ color: item.destructive ? 'var(--yr-danger)' : 'var(--yr-text-primary)' }}
              >
                {Icon && (
                  <Icon
                    className="w-5 h-5 shrink-0"
                    style={{ color: item.destructive ? 'var(--yr-danger)' : 'var(--yr-text-secondary)' }}
                  />
                )}
                <span className="flex-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="px-4 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold transition active:opacity-70"
            style={{
              background: 'var(--yr-surface-card)',
              color: 'var(--yr-text-primary)',
              border: '1px solid var(--yr-border-dark)',
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheet-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
