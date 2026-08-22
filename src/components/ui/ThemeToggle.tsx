import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'w-10 h-10 rounded-[10px] flex items-center justify-center transition-all outline-none border',
        'border-[#E2E8F0] dark:border-[#263A52]',
        'bg-white dark:bg-[#10263F] text-[#475569] dark:text-[#F5C400]',
        'hover:bg-[#F1F5F9] dark:hover:bg-[#162F52] hover:text-[#0B1F3A]',
        'focus-visible:ring-2 focus-visible:ring-[#0B1F3A] dark:focus-visible:ring-[#F5C400]',
        className
      )}
      title={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
      aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
    >
      {isDark ? (
        <Sun size={18} strokeWidth={1.75} className="transition-transform rotate-0 scale-100" />
      ) : (
        <Moon size={18} strokeWidth={1.75} className="transition-transform rotate-0 scale-100" />
      )}
    </button>
  );
};
