import React from 'react';
import { User, Bell, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const handleHomeClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-[64px] bg-white border-b border-[#E2E8F0] px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <a href="/" onClick={handleHomeClick} className="flex items-center gap-2.5 text-decoration-none">
          <div className="w-10 h-10 rounded-[10px] bg-[#0B1F3A] flex items-center justify-center text-[#F5C400] font-black text-lg shadow-sm">
            YR
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-[#0B1F3A] leading-tight">يمن ريتغ</span>
            <span className="text-[10px] font-semibold text-[#64748B] leading-none">Yemen Rating</span>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate && onNavigate('/directory')}
          className="hidden sm:inline-flex text-xs"
          icon={<Building2 size={15} />}
        >
          دليل الأنشطة
        </Button>

        <button
          type="button"
          className="p-2 rounded-[10px] text-[#475569] hover:text-[#0B1F3A] hover:bg-[#F1F5F9] transition-colors relative"
          aria-label="التنبيهات"
        >
          <Bell size={20} strokeWidth={1.75} />
        </button>

        <Button variant="outline" size="sm" icon={<User size={16} strokeWidth={1.75} />}>
          الحساب
        </Button>
      </div>
    </header>
  );
};
