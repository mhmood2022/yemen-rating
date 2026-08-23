import React from 'react';
import {
  User,
  Building2,
  Star,
  Heart,
  Bell,
  Share2,
  Info,
  Settings,
  HelpCircle,
  ChevronLeft,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useModal } from '../context/ModalContext';
import { useTheme } from '../context/ThemeContext';
import { yrToast } from '../components/ui/Toast';
import { cn } from '../lib/utils';

export const MoreMenuPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { openAdminLogin } = useModal();
  const { isDark, toggleTheme } = useTheme();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'يمن ريتغ | Yemen Rating',
        text: 'دليل الأنشطة والأسعار والترند في اليمن',
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      yrToast.success('تم نسخ رابط المنصة بنجاح');
    }
  };

  const menuSections = [
    {
      items: [
        { id: 'my-businesses', label: 'نشاطاتي', icon: Building2, action: () => onNavigate('/directory') },
        { id: 'my-reviews', label: 'تقييماتي', icon: Star, action: () => onNavigate('/directory') },
        { id: 'favorites', label: 'المفضلة', icon: Heart, action: () => onNavigate('/directory') },
        { id: 'notifications', label: 'الإشعارات', icon: Bell, action: () => yrToast.info('لا توجد إشعارات جديدة حاليًا') },
        { id: 'share', label: 'مشاركة التطبيق', icon: Share2, action: handleShare },
        { id: 'about', label: 'عن يمن ريتغ', icon: Info, action: () => onNavigate('/') },
        { id: 'settings', label: 'الإعدادات', icon: Settings, action: () => yrToast.info('الإعدادات العامة متاحة قريباً') },
        { id: 'support', label: 'المساعدة والدعم', icon: HelpCircle, action: () => yrToast.info('فريق الدعم متاح عبر قنوات التواصل الرسمية') },
      ],
    },
  ];

  return (
    <div className="space-y-4 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#222222]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="p-1 rounded-lg text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-white"
            aria-label="الرجوع للرئيسية"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>
          <h1 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">
            المزيد
          </h1>
        </div>
      </div>

      {/* User Profile Card */}
      <Card
        hoverable
        onClick={openAdminLogin}
        className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0B1F3A]/5 dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#222222] flex items-center justify-center text-[#94A3B8] dark:text-[#A1A1AA] shrink-0">
            <User size={24} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#0B1F3A] dark:text-white">
              الملف الشخصي
            </h2>
            <p className="text-xs text-[#F5C400] font-semibold">
              سجل الدخول / إنشاء حساب
            </p>
          </div>
        </div>

        <ChevronLeft size={16} strokeWidth={1.75} className="text-[#94A3B8] dark:text-[#71717A]" />
      </Card>

      {/* Menu List */}
      <div className="rounded-[14px] bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] overflow-hidden divide-y divide-[#F1F5F9] dark:divide-[#1C1C1C]">
        {menuSections[0].items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="w-full p-3.5 flex items-center justify-between text-right hover:bg-[#F7F8FA] dark:hover:bg-[#161616] transition-colors select-none group"
            >
              <div className="flex items-center gap-3">
                <Icon size={17} strokeWidth={1.75} className="text-[#F5C400] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-[#0B1F3A] dark:text-white">
                  {item.label}
                </span>
              </div>

              <ChevronLeft size={15} strokeWidth={1.75} className="text-[#94A3B8] dark:text-[#71717A] group-hover:translate-x-[-2px] transition-transform" />
            </button>
          );
        })}

        {/* Dark Mode Switch Row */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Sun size={17} strokeWidth={1.75} className="text-[#F5C400]" />
            ) : (
              <Moon size={17} strokeWidth={1.75} className="text-[#475569]" />
            )}
            <span className="text-xs sm:text-sm font-semibold text-[#0B1F3A] dark:text-white">
              الوضع الليلي
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 outline-none',
              isDark ? 'bg-[#F5C400]' : 'bg-[#CBD5E1]'
            )}
            aria-label="تبديل الوضع الليلي"
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full bg-black dark:bg-black transition-transform duration-200 shadow-md',
                isDark ? 'translate-x-[-20px]' : 'translate-x-0 bg-white'
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
