import React from 'react';
import {
  X,
  Building2,
  Landmark,
  Coins,
  TrendingUp,
  Heart,
  Star,
  Bell,
  Share2,
  Info,
  User,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useTheme } from '../../context/ThemeContext';
import { yrToast } from '../ui/Toast';
import { cn } from '../../lib/utils';

export const MobileMoreDrawer: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { isMoreDrawerOpen, closeMoreDrawer, openAdminLogin } = useModal();
  const { isDark, toggleTheme } = useTheme();

  if (!isMoreDrawerOpen) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'يمن ريتغ | Yemen Rating',
        text: 'دليل الأنشطة والأسعار والترند في اليمن',
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      yrToast.success('تم نسخ الرابط بنجاح');
    }
  };

  const navTo = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
    closeMoreDrawer();
  };

  const menuList = [
    { id: 'directory', label: 'دليل الأنشطة', icon: Building2, action: () => navTo('/directory') },
    { id: 'prices', label: 'الأسعار', icon: Coins, action: () => navTo('/prices') },
    { id: 'trend', label: 'الترند', icon: TrendingUp, action: () => navTo('/trend') },
    { id: 'banks', label: 'البنوك والمحافظ', icon: Landmark, action: () => navTo('/banks-wallets') },
    { id: 'favorites', label: 'المفضلة', icon: Heart, action: () => navTo('/directory') },
    { id: 'reviews', label: 'تقييماتي', icon: Star, action: () => navTo('/directory') },
    { id: 'share', label: 'مشاركة التطبيق', icon: Share2, action: handleShare },
    { id: 'about', label: 'عن يمن ريتغ', icon: Info, action: () => navTo('/') },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity"
        onClick={closeMoreDrawer}
      />

      {/* Right-Side Drawer (Width strictly less than half of screen: 48vw, max 215px) */}
      <div className="fixed top-0 bottom-0 right-0 w-[48vw] max-w-[215px] bg-[#0A0A0A] border-l border-[#222222] shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Profile / Top Header */}
        <div className="p-3 border-b border-[#222222] bg-[#000000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#F5C400]">القائمة</span>
            <button
              type="button"
              onClick={closeMoreDrawer}
              className="p-1 rounded-lg text-[#A1A1AA] hover:text-white"
              aria-label="إغلاق"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              openAdminLogin();
              closeMoreDrawer();
            }}
            className="w-full flex items-center gap-2 p-1.5 rounded-[8px] bg-[#111111] border border-[#222222] text-right"
          >
            <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#F5C400] flex items-center justify-center shrink-0">
              <User size={14} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block leading-tight truncate">الحساب</span>
              <span className="text-[9px] text-[#F5C400] block leading-none mt-0.5">تسجيل الدخول</span>
            </div>
          </button>
        </div>

        {/* Scrollable Compact Menu */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-[#181818]">
          {menuList.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="w-full p-2 flex items-center justify-between text-right rounded-[7px] hover:bg-[#141414] transition-colors select-none group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={14} strokeWidth={2} className="text-[#F5C400] shrink-0" />
                  <span className="text-[11px] font-bold text-white truncate">
                    {item.label}
                  </span>
                </div>
                <ChevronLeft size={12} className="text-[#71717A] group-hover:-translate-x-0.5 transition-transform shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer Dark Mode Toggle */}
        <div className="p-2.5 border-t border-[#222222] bg-[#000000]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
              {isDark ? <Sun size={13} className="text-[#F5C400]" /> : <Moon size={13} className="text-[#A1A1AA]" />}
              <span>الوضع الليلي</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={cn(
                'w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 outline-none',
                isDark ? 'bg-[#F5C400]' : 'bg-[#333333]'
              )}
            >
              <div
                className={cn(
                  'w-3 h-3 rounded-full bg-black transition-transform duration-200 shadow-sm',
                  isDark ? '-translate-x-4' : 'translate-x-0 bg-white'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
