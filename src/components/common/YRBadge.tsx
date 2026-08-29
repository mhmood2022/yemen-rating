import React from 'react';

export type BadgeType = 'gold' | 'blue' | 'gray' | 'none';

interface YRBadgeProps {
  type: BadgeType;
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

export const YRBadge: React.FC<YRBadgeProps> = ({ 
  type, 
  size = 20, 
  className = '',
  showTooltip = false 
}) => {
  if (type === 'none' || !type) return null;

  // ألوان الشارات المطابقة للصورة المعتمدة
  const badgeConfig = {
    blue: {
      color: '#2EA5FF',
      title: 'نشاط موثق رسمياً (Blue)',
      bgLight: 'rgba(46, 165, 255, 0.15)',
    },
    gold: {
      color: '#F5B800',
      title: 'نشاط متميز ذهبي (Gold Premium)',
      bgLight: 'rgba(245, 184, 0, 0.15)',
    },
    gray: {
      color: '#9CA3AF',
      title: 'نشاط قياسي معتمد (Gray)',
      bgLight: 'rgba(156, 163, 175, 0.15)',
    },
  }[type];

  if (!badgeConfig) return null;

  return (
    <span 
      className={`inline-flex items-center justify-center relative group cursor-pointer ${className}`}
      title={showTooltip ? badgeConfig.title : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200 hover:scale-110"
      >
        {/* إطار الشارة متعدد الفصوص المطابق للصورة */}
        <path
          d="M10.5 1.8a1.7 1.7 0 0 1 3 0l.9 1.4a1.7 1.7 0 0 0 1.5.8h1.7a1.7 1.7 0 0 1 1.7 1.7v1.7a1.7 1.7 0 0 0 .8 1.5l1.4.9a1.7 1.7 0 0 1 0 3l-1.4.9a1.7 1.7 0 0 0-.8 1.5v1.7a1.7 1.7 0 0 1-1.7 1.7h-1.7a1.7 1.7 0 0 0-1.5.8l-.9 1.4a1.7 1.7 0 0 1-3 0l-.9-1.4a1.7 1.7 0 0 0-1.5-.8H6.8a1.7 1.7 0 0 1-1.7-1.7v-1.7a1.7 1.7 0 0 0-.8-1.5l-1.4-.9a1.7 1.7 0 0 1 0-3l1.4-.9a1.7 1.7 0 0 0 .8-1.5V5.7A1.7 1.7 0 0 1 6.8 4h1.7a1.7 1.7 0 0 0 1.5-.8l.9-1.4z"
          fill={badgeConfig.color}
        />
        {/* علامة الصح البيضاء المستديرة */}
        <path
          d="M8 12l2.8 2.8 5.4-5.6"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};
