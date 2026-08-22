import React from 'react';
import { Home, Search, TrendingUp, Briefcase, Menu } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { cn } from '../../lib/utils';

export const MobileBottomNav: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { openMoreDrawer } = useModal();
  const currentPath = window.location.pathname;

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home, href: '/' },
    { id: 'search', label: 'البحث', icon: Search, href: '/directory' },
    { id: 'trend', label: 'الترند', icon: TrendingUp, href: '/directory' },
    { id: 'jobs', label: 'الوظائف', icon: Briefcase, href: '/directory' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0A0A0A] border-t border-[#E2E8F0] dark:border-[#222222] shadow-lg pb-[env(safe-area-inset-bottom,0px)] transition-colors">
      <div className="grid grid-cols-5 h-[62px] items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(item.href);
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-1 h-full text-xs font-semibold transition-colors',
                isActive
                  ? 'text-[#0B1F3A] dark:text-[#F5C400]'
                  : 'text-[#94A3B8] dark:text-[#71717A] hover:text-[#475569] dark:hover:text-[#A1A1AA]'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
              <span className="text-[11px]">{item.label}</span>
            </a>
          );
        })}

        <button
          type="button"
          onClick={openMoreDrawer}
          className="flex flex-col items-center justify-center gap-1 h-full text-xs font-semibold text-[#94A3B8] dark:text-[#71717A] hover:text-[#0B1F3A] dark:hover:text-white transition-colors"
        >
          <Menu size={20} strokeWidth={1.75} />
          <span className="text-[11px]">المزيد</span>
        </button>
      </div>
    </div>
  );
};
