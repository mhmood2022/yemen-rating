import React from 'react';
import {
  X,
  Building2,
  Landmark,
  Wallet,
  Coins,
  Smartphone,
  Star,
  Megaphone,
  UserCircle2,
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';

export const MobileMoreDrawer: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { isMoreDrawerOpen, closeMoreDrawer } = useModal();

  if (!isMoreDrawerOpen) return null;

  const moreItems = [
    { id: 'directory', label: 'دليل الأنشطة', icon: Building2, href: '/directory' },
    { id: 'banks', label: 'البنوك', icon: Landmark, href: '/banks' },
    { id: 'wallets', label: 'المحافظ الإلكترونية', icon: Wallet, href: '/wallets' },
    { id: 'prices', label: 'الأسعار', icon: Coins, href: '/directory' },
    { id: 'phones', label: 'سوق الجوالات', icon: Smartphone, href: '/directory?category=محلات الجوالات والإلكترونيات' },
    { id: 'rating', label: 'التقييم', icon: Star, href: '/directory' },
    { id: 'ads', label: 'الإعلانات', icon: Megaphone, href: '/directory' },
    { id: 'account', label: 'الحساب', icon: UserCircle2, href: '/directory' },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-[2px]"
        onClick={closeMoreDrawer}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0A] border-t border-[#E2E8F0] dark:border-[#222222] rounded-t-[16px] p-5 shadow-2xl z-10 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#222222] mb-4">
          <h3 className="font-bold text-[#0B1F3A] dark:text-white text-base">الأقسام الإضافية</h3>
          <button
            type="button"
            onClick={closeMoreDrawer}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0B1F3A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#161616]"
            aria-label="إغلاق القائمة"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-6">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(item.href);
                  }
                  closeMoreDrawer();
                }}
                className="flex items-center gap-3 p-3 rounded-[10px] bg-[#F7F8FA] dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] text-sm font-semibold text-[#0B1F3A] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <Icon size={18} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
