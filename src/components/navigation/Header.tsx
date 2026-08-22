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
    <header className="sticky top-0 z-30 w-full h-[64px] bg-white dark:bg-[#0A0A0A] border-b border-[#E2E8F0] dark:border-[#222222] px-4 lg:px-8 flex items-center justify-between transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        <a href="/" onClick={handleHomeClick} className="flex items-center gap-2.5 text-decoration-none">
          <div className="w-10 h-10 rounded-[10px] bg-[#0B1F3A] dark:bg-[#111111] border border-transparent dark:border-[#F5C400]/40 flex items-center justify-center text-[#F5C400] font-black text-lg shadow-sm">
            YR
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-[#0B1F3A] dark:text-white leading-tight">يمن ريتغ</span>
            <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#A1A1AA] leading-none">Yemen Rating</span>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate && onNavigate('/directory')}
          className="hidden md:inline-flex text-xs text-[#0B1F3A] dark:text-[#A1A1AA] dark:hover:text-white"
          icon={<Building2 size={15} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />}
        >
          دليل الأنشطة
        </Button>

        <ThemeToggle />

        <button
          type="button"
          className="w-10 h-10 rounded-[10px] border border-[#E2E8F0] dark:border-[#222222] bg-white dark:bg-[#111111] text-[#475569] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] flex items-center justify-center transition-colors relative"
          aria-label="التنبيهات"
        >
          <Bell size={18} strokeWidth={1.75} />
        </button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs h-10 px-3.5 text-[#0B1F3A] dark:text-white"
          icon={<User size={16} strokeWidth={1.75} className="text-[#475569] dark:text-[#A1A1AA]" />}
        >
          الحساب
        </Button>
      </div>
    </header>
  );
};
