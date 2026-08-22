import React from 'react';
import { User, Bell, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Header: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const handleHomeClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-[64px] bg-white dark:bg-[#0F2138] border-b border-[#E2E8F0] dark:border-[#263A52] px-4 lg:px-8 flex items-center justify-between transition-colors shadow-sm">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3">
        <a href="/" onClick={handleHomeClick} className="flex items-center gap-2.5 text-decoration-none">
          <div className="w-10 h-10 rounded-[10px] bg-[#0B1F3A] dark:bg-[#162F52] border border-transparent dark:border-[#F5C400]/30 flex items-center justify-center text-[#F5C400] font-black text-lg shadow-sm">
            YR
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-[#0B1F3A] dark:text-[#F8FAFC] leading-tight">يمن ريتغ</span>
            <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] leading-none">Yemen Rating</span>
          </div>
        </a>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate && onNavigate('/directory')}
          className="hidden md:inline-flex text-xs"
          icon={<Building2 size={15} strokeWidth={1.75} />}
        >
          دليل الأنشطة
        </Button>

        {/* Unified Theme Toggle */}
        <ThemeToggle />

        <button
          type="button"
          className="w-10 h-10 rounded-[10px] border border-[#E2E8F0] dark:border-[#263A52] bg-white dark:bg-[#10263F] text-[#475569] dark:text-[#94A3B8] hover:text-[#0B1F3A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#162F52] flex items-center justify-center transition-colors relative"
          aria-label="التنبيهات"
        >
          <Bell size={18} strokeWidth={1.75} />
        </button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs h-10 px-3.5"
          icon={<User size={16} strokeWidth={1.75} />}
        >
          الحساب
        </Button>
      </div>
    </header>
  );
};
