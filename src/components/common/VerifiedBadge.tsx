import React from 'react';

export type BadgeType = 'blue' | 'gold' | 'gray' | 'silver' | 'yellow' | 'none' | null;

interface VerifiedBadgeProps {
  type?: BadgeType;
  variant?: BadgeType; // لدعم المكونات التي تستخدم variant
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  type, 
  variant,
  size = 16, 
  className = '' 
}) => {
  // دعم type أو variant
  const badgeType = type || variant;
  
  if (!badgeType || badgeType === 'none') return null;
  
  // خريطة الألوان (تدعم كل المسميات)
  const colors: Record<string, string> = { 
    blue: '#1D9BF0', 
    gold: '#FFC500', 
    yellow: '#FFC500',
    gray: '#9CA3AF',
    silver: '#9CA3AF'
  };
  
  const fill = colors[badgeType];
  if (!fill) return null;

  // تحديد الحجم
  let px = 16;
  if (size === 'sm') px = 16;
  else if (size === 'md') px = 18;
  else if (size === 'lg') px = 22;
  else if (typeof size === 'number') px = size;

  return (
    <svg 
      width={px} 
      height={px} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={`inline-block flex-shrink-0 align-middle ${className}`}
      style={{ marginRight: '4px' }}
    >
      <path 
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6s-2.95.875-3.6 2.148c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z" 
        fill={fill} 
      />
      <path 
        d="M9.8 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4-7 7z" 
        fill="#FFFFFF" 
      />
    </svg>
  );
};
