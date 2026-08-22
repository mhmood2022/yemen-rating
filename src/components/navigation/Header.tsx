import React from 'react';
import { Bell, Menu, Star } from 'lucide-react';
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
    <header className="sticky top-0 z-30 w-full h-[56px] bg-black px-3.5 flex items-center justify-between transition-colors shadow-sm border-0">
      {/* Right: Hamburger Menu + Borderless Star Logo */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={openMoreDrawer}
          className="p-1 rounded-lg text-white hover:text-[#F5C400] transition-colors border-0"
          aria-label="القائمة"
        >
          <Menu size={22} strokeWidth={2} />
        </button>

        <a href="/" onClick={handleHomeClick} className="flex items-center gap-2 text-decoration-none">
          <div className="w-8 h-8 rounded-[9px] bg-[#111111] flex items-center justify-center text-[#F5C400] shrink-0 shadow-sm border-0">
            <Star size={18} strokeWidth={2} className="text-[#F5C400]" />
          </div>
          <div className="flex flex-col text-right justify-center">
            <span className="font-black text-sm text-white leading-none mb-1 tracking-tight">
              يمن ريتغ
            </span>
            <span className="text-[8px] font-bold text-[#A1A1AA] tracking-widest leading-none">
              YEMEN RATING
            </span>
          </div>
        </a>
      </div>

      {/* Left: Notification Bell */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/more')}
          className="w-9 h-9 rounded-full bg-[#111111] text-[#F5C400] hover:text-white flex items-center justify-center transition-colors relative border-0"
          aria-label="التنبيهات"
        >
          <Bell size={17} strokeWidth={2} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F5C400]" />
        </button>
      </div>
    </header>
  );
};
