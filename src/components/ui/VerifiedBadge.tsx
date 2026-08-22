import React from 'react';
import { cn } from '../../lib/utils';

export type VerifiedBadgeVariant = 'gold' | 'yellow' | 'blue' | 'gray' | 'silver';

interface VerifiedBadgeProps {
  variant?: VerifiedBadgeVariant;
  size?: number;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  variant = 'gold',
  size = 18,
  className,
}) => {
  const getColor = (v: VerifiedBadgeVariant) => {
    switch (v) {
      case 'blue':
        return '#1D9BF0'; // الأزرق
      case 'gray':
      case 'silver':
        return '#8E8E93'; // الرمادي
      case 'gold':
      case 'yellow':
      default:
        return '#F5C400'; // الذهبي
    }
  };

  const badgeColor = getColor(variant);

  const getTitle = () => {
    if (variant === 'blue') return 'حساب معتمد وموثق';
    if (variant === 'gray' || variant === 'silver') return 'جهة رسمية موثقة';
    return 'نشاط تجاري موثق رسمياً';
  };

  return (
    <span
      className={cn('inline-flex items-center justify-center select-none shrink-0 align-middle', className)}
      title={getTitle()}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Rosette Scalloped Background */}
        <path
          d="M22.25 12C22.25 10.57 21.37 9.33 20.06 8.66C20.52 7.27 20.26 5.76 19.25 4.75C18.24 3.74 16.73 3.48 15.34 3.94C14.67 2.63 13.43 1.75 12 1.75C10.57 1.75 9.33 2.63 8.67 3.94C7.27 3.48 5.76 3.74 4.75 4.75C3.74 5.76 3.48 7.27 3.94 8.66C2.63 9.33 1.75 10.57 1.75 12C1.75 13.43 2.63 14.67 3.94 15.34C3.48 16.73 3.74 18.24 4.75 19.25C5.76 20.26 7.27 20.52 8.66 20.06C9.33 21.37 10.57 22.25 12 22.25C13.43 22.25 14.67 21.37 15.34 20.06C16.73 20.52 18.24 20.26 19.25 19.25C20.26 18.24 20.52 16.73 20.06 15.34C21.37 14.67 22.25 13.43 22.25 12Z"
          fill={badgeColor}
        />
        {/* Crisp White Checkmark */}
        <path
          d="M10.2 15.8L6.4 12L7.8 10.6L10.2 13L16.2 7L17.6 8.4L10.2 15.8Z"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  );
};
