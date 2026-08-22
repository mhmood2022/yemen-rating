import React from 'react';
import { Home, Search, TrendingUp, Briefcase, Menu } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { cn } from '../../lib/utils';

export const MobileBottomNav: React.FC<{ activeTab?: string }> = ({ activeTab = 'home' }) => {
  const { openMoreDrawer } = useModal();

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Home, href: '/' },
    { id: 'search', label: 'البحث', icon: Search, href: '#search' },
    { id: 'trend', label: 'الترند', icon: TrendingUp, href: '#trend' },
    { id: 'jobs', label: 'الوظائف', icon: Briefcase, href: '#jobs' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-lg safe-area-pb">
      <div className="grid grid-cols-5 h-[60px] items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 h-full text-xs font-semibold transition-colors',
                isActive ? 'text-[#0B1F3A]' : 'text-[#94A3B8] hover:text-[#475569]'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.75} />
              <span className="text-[11px]">{item.label}</span>
            </a>
          );
        })}

        <button
          type="button"
          onClick={openMoreDrawer}
          className="flex flex-col items-center justify-center gap-1 h-full text-xs font-semibold text-[#94A3B8] hover:text-[#0B1F3A] transition-colors"
        >
          <Menu size={20} strokeWidth={1.75} />
          <span className="text-[11px]">المزيد</span>
        </button>
      </div>
    </div>
  );
};
