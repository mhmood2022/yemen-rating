import React from 'react';
import { Bell, Menu, Star } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useModal } from '../../context/ModalContext';

export const Header: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { openMoreDrawer } = useModal();

  const handleHomeClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-[60px] sm:h-[64px] bg-white dark:bg-[#000000] border-b border-[#E2E8F0] dark:border-[#222222] px-3 sm:px-6 flex items-center justify-between transition-colors shadow-sm">
      {/* Right Side: Logo with Star Icon */}
      <div className="flex items-center gap-2">
        <a href="/" onClick={handleHomeClick} className="flex items-center gap-2 text-decoration-none">
          <div className="w-8 h-8 rounded-[8px] bg-[#0B1F3A] dark:bg-[#111111] border border-transparent dark:border-[#F5C400]/40 flex items-center justify-center text-[#F5C400] shrink-0 shadow-sm">
            <Star size={16} strokeWidth={2.5} className="fill-[#F5C400]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base text-[#0B1F3A] dark:text-white leading-tight">
              يمن ريتغ
            </span>
            <span className="text-[9px] font-bold text-[#64748B] dark:text-[#A1A1AA] tracking-wider leading-none">
              YEMEN RATING
            </span>
          </div>
        </a>
      </div>

      {/* Left Side: Theme Toggle, Notifications, Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle />

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/more')}
          className="w-9 h-9 rounded-[9px] border border-[#E2E8F0] dark:border-[#222222] bg-white dark:bg-[#111111] text-[#475569] dark:text-[#F5C400] hover:text-[#0B1F3A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] flex items-center justify-center transition-colors relative"
          aria-label="التنبيهات"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={openMoreDrawer}
          className="w-9 h-9 rounded-[9px] border border-[#E2E8F0] dark:border-[#222222] bg-white dark:bg-[#111111] text-[#475569] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] flex items-center justify-center transition-colors lg:hidden"
          aria-label="القائمة"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
};
