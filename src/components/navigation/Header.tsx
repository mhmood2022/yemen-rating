import React from 'react';
import { Bell, Star } from 'lucide-react';

export const Header: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const handleHomeClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-[58px] bg-white dark:bg-[#000000] border-b border-[#E2E8F0] dark:border-[#1E1E1E] px-4 flex items-center justify-between transition-colors">
      {/* Right Side: Logo with Star Icon */}
      <a href="/" onClick={handleHomeClick} className="flex items-center gap-2 text-decoration-none">
        <div className="w-8 h-8 rounded-[8px] bg-[#0B1F3A] dark:bg-[#141414] border border-transparent dark:border-[#F5C400]/40 flex items-center justify-center text-[#F5C400] shrink-0 shadow-sm">
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

      {/* Left Side: Notification Bell only */}
      <button
        type="button"
        onClick={() => onNavigate && onNavigate('/more')}
        className="w-9 h-9 rounded-full border border-[#E2E8F0] dark:border-[#222222] bg-white dark:bg-[#141414] text-[#475569] dark:text-[#F5C400] hover:text-[#0B1F3A] dark:hover:text-white flex items-center justify-center transition-colors relative"
        aria-label="التنبيهات"
      >
        <Bell size={17} strokeWidth={1.75} />
      </button>
    </header>
  );
};
