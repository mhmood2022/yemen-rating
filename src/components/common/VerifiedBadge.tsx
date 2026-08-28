import React from 'react';

interface VerifiedBadgeProps {
  type?: 'gold' | 'blue' | 'gray';
  size?: number;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ type = 'gold', size = 18, className = '' }) => {
  const colors = {
    gold: '#FFB800',
    blue: '#1DA1F2',
    gray: '#AAB8C2'
  };

  const badgeColor = colors[type] || colors.gold;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block shrink-0 align-middle ${className}`}
    >
      <path
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.15.2-1.42-.25-2.85-1.25-3.85-1-1-2.43-1.45-3.85-1.25C14.48 2.44 13.24 1.56 11.81 1.56c-1.43 0-2.67.88-3.15 2.19-1.42-.2-2.85.25-3.85 1.25-1 1-1.45 2.43-1.25 3.85C2.25 9.33 1.37 10.57 1.37 12c0 1.43.88 2.67 2.19 3.15-.2 1.42.25 2.85 1.25 3.85 1 1 2.43 1.45 3.85 1.25 1.48 1.31 2.72 2.19 4.15 2.19 1.43 0 2.67-.88 3.15-2.19 1.42.2 2.85-.25 3.85-1.25 1-1 1.45-2.43 1.25-3.85 1.31-.48 2.19-1.72 2.19-3.15z"
        fill={badgeColor}
      />
      <path
        d="M9.8 15.6l-3.3-3.3 1.4-1.4 1.9 1.9 5.9-5.9 1.4 1.4-7.3 7.3z"
        fill="#000000"
      />
    </svg>
  );
};
