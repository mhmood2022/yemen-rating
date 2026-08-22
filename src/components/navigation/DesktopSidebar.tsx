import React from 'react';
import {
  Home,
  Building2,
  Landmark,
  Coins,
  TrendingUp,
  Briefcase,
  Smartphone,
  Star,
  Megaphone,
  BarChart3,
  UserCircle2,
} from 'lucide-react';
import { NavItem } from '../../types/navigation';
import { cn } from '../../lib/utils';

export const sidebarItems: NavItem[] = [
  { id: 'home', label: 'الرئيسية', href: '/', icon: Home },
  { id: 'directory', label: 'دليل الأنشطة', href: '/directory', icon: Building2 },
  { id: 'phones', label: 'سوق الجوالات', href: '/phones', icon: Smartphone },
  { id: 'prices', label: 'الأسعار', href: '/prices', icon: Coins },
  { id: 'banks-wallets', label: 'البنوك والمحافظ', href: '/banks-wallets', icon: Landmark },
  { id: 'trend', label: 'الترند', href: '/trend', icon: TrendingUp },
  { id: 'jobs', label: 'الوظائف', href: '/directory', icon: Briefcase },
  { id: 'rating', label: 'التقييم والتصنيف', href: '/directory', icon: Star },
  { id: 'ads', label: 'الإعلانات', href: '/directory', icon: Megaphone },
  { id: 'stats', label: 'الإحصائيات', href: '/directory', icon: BarChart3 },
  { id: 'account', label: 'الحساب', href: '/more', icon: UserCircle2 },
];

export const DesktopSidebar: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const currentPath = window.location.pathname;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-white dark:bg-[#000000] border-l border-[#E2E8F0] dark:border-[#222222] min-h-[calc(100vh-64px)] p-4 shrink-0 transition-colors">
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
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
                'flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold transition-all',
                isActive
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#111111] dark:text-[#F5C400] dark:border dark:border-[#F5C400]/40'
                  : 'text-[#475569] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414] hover:text-[#0B1F3A] dark:hover:text-white'
              )}
            >
              <Icon size={18} strokeWidth={1.75} className={isActive ? 'text-current' : 'text-[#64748B] dark:text-[#71717A]'} />
              <span className="flex-1">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
};
