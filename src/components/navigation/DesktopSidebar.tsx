import React from 'react';
import {
  Home,
  Building2,
  Landmark,
  Briefcase,
  Star,
  TrendingUp,
  Coins,
  Smartphone,
  Megaphone,
  BarChart3,
  UserCircle2,
} from 'lucide-react';
import { NavItem } from '../../types/navigation';
import { cn } from '../../lib/utils';

export const sidebarItems: NavItem[] = [
  { id: 'home', label: 'الرئيسية', href: '/', icon: Home },
  { id: 'directory', label: 'دليل الأنشطة', href: '#directory', icon: Building2 },
  { id: 'banks-wallets', label: 'البنوك والمحافظ', href: '#banks-wallets', icon: Landmark },
  { id: 'jobs', label: 'الوظائف', href: '#jobs', icon: Briefcase },
  { id: 'rating', label: 'التقييم والتصنيف', href: '#rating', icon: Star },
  { id: 'trend', label: 'الترند', href: '#trend', icon: TrendingUp },
  { id: 'prices', label: 'الأسعار', href: '#prices', icon: Coins },
  { id: 'phones', label: 'سوق الجوالات', href: '#phones', icon: Smartphone },
  { id: 'ads', label: 'الإعلانات', href: '#ads', icon: Megaphone },
  { id: 'stats', label: 'الإحصائيات', href: '#stats', icon: BarChart3 },
  { id: 'account', label: 'الحساب', href: '#account', icon: UserCircle2 },
];

export const DesktopSidebar: React.FC<{ activeId?: string }> = ({ activeId = 'home' }) => {
  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-white border-l border-[#E2E8F0] min-h-[calc(100vh-64px)] p-4 shrink-0">
      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold transition-all',
                isActive
                  ? 'bg-[#0B1F3A] text-white'
                  : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B1F3A]'
              )}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5C400] text-[#0B1F3A] font-bold">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};
