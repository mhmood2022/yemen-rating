import React from 'react';
import { Home, Compass, Plus, Heart, Grid } from 'lucide-react';
import { cn } from '../../lib/utils';
import { yrToast } from '../ui/Toast';

export const MobileBottomNav: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const currentPath = window.location.pathname;

  const handleAddClick = () => {
    yrToast.info('خدمة إضافة نشاط جديد ستكون متاحة قريباً');
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#000000] border-t border-[#E2E8F0] dark:border-[#222222] shadow-lg pb-[env(safe-area-inset-bottom,0px)] transition-colors">
      <div className="grid grid-cols-5 h-[62px] items-center max-w-md mx-auto">
        {/* 1. الرئيسية */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 h-full text-xs font-semibold transition-colors',
            currentPath === '/'
              ? 'text-[#0B1F3A] dark:text-[#F5C400]'
              : 'text-[#94A3B8] dark:text-[#71717A] hover:text-[#475569] dark:hover:text-white'
          )}
        >
          <Home size={19} strokeWidth={currentPath === '/' ? 2.2 : 1.75} />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        {/* 2. الدليل */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/directory')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 h-full text-xs font-semibold transition-colors',
            currentPath.startsWith('/directory')
              ? 'text-[#0B1F3A] dark:text-[#F5C400]'
              : 'text-[#94A3B8] dark:text-[#71717A] hover:text-[#475569] dark:hover:text-white'
          )}
        >
          <Compass size={19} strokeWidth={currentPath.startsWith('/directory') ? 2.2 : 1.75} />
          <span className="text-[10px] font-bold">الدليل</span>
        </button>

        {/* 3. زر الإضافة المركزي المرتفع + */}
        <div className="flex flex-col items-center justify-center -mt-4">
          <button
            type="button"
            onClick={handleAddClick}
            className="w-11 h-11 rounded-full bg-[#F5C400] text-[#000000] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-2 border-white dark:border-[#000000]"
            aria-label="أضف نشاط"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
          <span className="text-[9px] font-bold text-[#64748B] dark:text-[#A1A1AA] mt-0.5">
            أضف نشاط
          </span>
        </div>

        {/* 4. المفضلة */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/directory')}
          className="flex flex-col items-center justify-center gap-1 h-full text-xs font-semibold text-[#94A3B8] dark:text-[#71717A] hover:text-[#475569] dark:hover:text-white transition-colors"
        >
          <Heart size={19} strokeWidth={1.75} />
          <span className="text-[10px] font-bold">المفضلة</span>
        </button>

        {/* 5. المزيد */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/more')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 h-full text-xs font-semibold transition-colors',
            currentPath === '/more'
              ? 'text-[#0B1F3A] dark:text-[#F5C400]'
              : 'text-[#94A3B8] dark:text-[#71717A] hover:text-[#475569] dark:hover:text-white'
          )}
        >
          <Grid size={19} strokeWidth={currentPath === '/more' ? 2.2 : 1.75} />
          <span className="text-[10px] font-bold">المزيد</span>
        </button>
      </div>
    </div>
  );
};
