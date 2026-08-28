import React from 'react';

export type BadgeType = 'gold' | 'blue' | 'gray' | 'none';

interface VerifiedBadgeProps {
  type?: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tooltipText?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type = 'gold',
  size = 'md',
  className = '',
  tooltipText
}) => {
  if (type === 'none') return null;

  // أبعاد الشارة
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6'
  };

  // ألوان الشارات الثلاث كما في الصورة
  const colorFills = {
    blue: '#1D9BF0',  // أزرق توثيق رسمي
    gold: '#EAB308',  // أصفر ذهبي هوية يمن ريتينغ
    gray: '#71717A'   // رمادي / فضي جهات معتمدة
  };

  const defaultTooltips = {
    blue: 'منشأة موثقة رسمياً',
    gold: 'شريك ذهبي معتمد - يمن ريتينغ',
    gray: 'جهة معتمدة'
  };

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 align-middle ${className}`}
      title={tooltipText || defaultTooltips[type]}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} drop-shadow-sm transition-transform hover:scale-110`}
      >
        {/* الشكل الدائري المسنن المخصص (12 سن متناسق) */}
        <path
          d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.475 9.55.6 10.92.6 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
          fill={colorFills[type]}
        />
        {/* علامة الصح البيضاء */}
        <path
          d="M10.2 16.2L6 12l1.4-1.4 2.8 2.8 6.4-6.4 1.4 1.4z"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  );
};
