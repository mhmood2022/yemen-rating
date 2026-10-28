import React from 'react';
import { ShieldAlert, MessageSquare, Users, HardDrive, ScrollText, MessageCircle } from 'lucide-react';
import type { CommunityTab } from '../shared/types';

interface NavItem {
  id: CommunityTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface Props {
  active: CommunityTab;
  onChange: (tab: CommunityTab) => void;
  reportsCount?: number;
}

export const MobileBottomNav: React.FC<Props> = ({ active, onChange, reportsCount = 0 }) => {
  const items: NavItem[] = [
    { id: 'reports', label: 'البلاغات', icon: ShieldAlert, badge: reportsCount },
    { id: 'posts', label: 'التغريدات', icon: MessageSquare },
    { id: 'comments', label: 'التعليقات', icon: MessageCircle }, // تمت الإضافة
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'storage', label: 'التخزين', icon: HardDrive },
    { id: 'logs', label: 'السجل', icon: ScrollText },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t"
      style={{
        backgroundColor: '#000000',
        borderColor: '#2A2B30',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-6 h-16"> {/* 6 أعمدة بدلاً من 5 */}
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="relative flex flex-col items-center justify-center gap-1 transition-colors duration-150 active:opacity-70"
              style={{
                color: isActive ? '#FFC500' : '#9CA3AF',
              }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 ? (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] leading-none" style={{ fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
              {isActive && <span className="absolute top-0 w-8 h-0.5 rounded-b" style={{ backgroundColor: '#FFC500' }} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
