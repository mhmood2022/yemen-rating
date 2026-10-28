import React, { useState } from 'react';
import { ArrowRight, Search, RefreshCw, X } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onRefresh?: () => void;
  onBack?: () => void;
  showSearch?: boolean;
  refreshing?: boolean;
}

export const MobileHeader: React.FC<Props> = ({
  title,
  subtitle,
  searchValue = '',
  onSearchChange,
  onRefresh,
  onBack,
  showSearch = false,
  refreshing = false,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchVisible = showSearch && (searchOpen || searchValue.length > 0);

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        background: 'var(--yr-bg-black)',
        borderColor: 'var(--yr-border-dark)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-center gap-3 px-4 h-14">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 -mr-1 rounded-lg flex items-center justify-center active:opacity-60"
            style={{ color: 'var(--yr-text-primary)' }}
            aria-label="رجوع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1
            className="text-base font-semibold truncate leading-tight"
            style={{ color: 'var(--yr-text-primary)' }}
          >
            {title}
          </h1>
          {subtitle && !searchVisible && (
            <p
              className="text-xs truncate leading-tight mt-0.5"
              style={{ color: 'var(--yr-text-secondary)' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {showSearch && (
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="w-9 h-9 rounded-lg flex items-center justify-center active:opacity-60"
            style={{ color: 'var(--yr-text-primary)' }}
            aria-label="بحث"
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-9 h-9 rounded-lg flex items-center justify-center active:opacity-60 disabled:opacity-40"
            style={{ color: 'var(--yr-text-primary)' }}
            aria-label="تحديث"
          >
            <RefreshCw className={'w-5 h-5 ' + (refreshing ? 'animate-spin' : '')} />
          </button>
        )}
      </div>

      {searchVisible && (
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2 h-10 px-3 rounded-xl"
            style={{
              background: 'var(--yr-surface-elevated)',
              border: '1px solid var(--yr-border-dark)',
            }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--yr-text-secondary)' }} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="ابحث..."
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--yr-text-primary)' }}
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.('')}
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--yr-surface-card)' }}
                aria-label="مسح"
              >
                <X className="w-3 h-3" style={{ color: 'var(--yr-text-secondary)' }} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
