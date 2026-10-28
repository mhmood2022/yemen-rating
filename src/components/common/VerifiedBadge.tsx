import React from 'react';

export type BadgeType = 'gold' | 'blue' | 'gray' | 'none' | null;

interface VerifiedBadgeProps {
  type?: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tooltipText?: string;
}

const BADGE_COLORS: Record<string, string> = {
  gold: '#FFC500',
  blue: '#1D9BF0',
  gray: '#9CA3AF',
};

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type = null,
  size = 'sm',
  className = '',
  tooltipText
}) => {
  // ✅ إذا لا شارة → لا تعرض شيئاً
  if (!type || type === 'none') return null;

  // ✅ إذا type غير معروف → لا تعرض شيئاً
  const fill = BADGE_COLORS[type];
  if (!fill) return null;

  // ✅ console.log للتشخيص
  console.log('🎖️ VerifiedBadge rendering:', { type, fill });

  const sizeDimensions = {
    sm: { w: 14, h: 14 },
    md: { w: 18, h: 18 },
    lg: { w: 22, h: 22 }
  };

  const dim = sizeDimensions[size] || sizeDimensions.sm;

  const defaultLabel = 
    type === 'gold' ? 'موثق رسمياً (ذهبي)' : 
    type === 'blue' ? 'موثق (أزرق)' : 
    type === 'gray' ? 'موثق (فضي)' : 
    'حساب معتمد';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 align-middle ${className}`}
      title={tooltipText || defaultLabel}
      aria-label={tooltipText || defaultLabel}
    >
      <svg
        width={dim.w}
        height={dim.h}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.29 2.308a2.5 2.5 0 013.42 0l.66.626a2.5 2.5 0 002.327.624l.89-.228a2.5 2.5 0 013.064 1.768l.243.886a2.5 2.5 0 001.768 1.768l.886.243a2.5 2.5 0 011.768 3.064l-.228.89a2.5 2.5 0 00.624 2.327l.626.66a2.5 2.5 0 010 3.42l-.626.66a2.5 2.5 0 00-.624 2.327l.228.89a2.5 2.5 0 01-1.768 3.064l-.886.243a2.5 2.5 0 00-1.768 1.768l-.243.886a2.5 2.5 0 01-3.064 1.768l-.89-.228a2.5 2.5 0 00-2.327.624l-.66.626a2.5 2.5 0 01-3.42 0l-.66-.626a2.5 2.5 0 00-2.327-.624l-.89.228a2.5 2.5 0 01-3.064-1.768l-.243-.886a2.5 2.5 0 00-1.768-1.768l-.886-.243a2.5 2.5 0 01-1.768-3.064l.228-.89a2.5 2.5 0 00-.624-2.327l-.626-.66a2.5 2.5 0 010-3.42l.626-.66a2.5 2.5 0 00.624-2.327l-.228-.89a2.5 2.5 0 011.768-3.064l.886-.243a2.5 2.5 0 001.768-1.768l.243-.886a2.5 2.5 0 013.064-1.768l.89.228a2.5 2.5 0 002.327-.624l.66-.626z"
          fill={fill}
        />
        <path
          d="M8.5 12.2l2.3 2.3 4.8-4.8"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};
