import React from 'react';

interface BadgeIconProps {
  type: 'blue' | 'gold' | 'gray' | 'yellow' | null;
  size?: number;
  className?: string;
}

const BADGE_COLORS: Record<string, { fill: string; check: string }> = {
  blue: { fill: '#1D9BF0', check: '#FFFFFF' },
  gold: { fill: '#FFC500', check: '#FFFFFF' },
  yellow: { fill: '#FFC500', check: '#FFFFFF' },
  gray: { fill: '#9CA3AF', check: '#FFFFFF' },
};

export const BadgeIcon: React.FC<BadgeIconProps> = ({ type, size = 16, className = '' }) => {
  if (!type) return null;
  const colors = BADGE_COLORS[type] || BADGE_COLORS.blue;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        d="M12 2C13 2 14 3 14 4C15 3.5 16 3.5 17 4C18 4.5 18.5 5.5 18.5 6.5C19.5 7 20 8 20 9C21 9.5 22 10.5 22 11.5C22 12.5 21.5 13.5 20.5 14C21 15 21 16 20.5 17C20 18 19 18.5 18 18.5C17.5 19.5 16.5 20 15.5 20C15 21 14 22 12 22C10 22 9 21 8.5 20C7.5 20 6.5 19.5 6 18.5C5 18.5 4 18 3.5 17C3 16 3 15 3.5 14C2.5 13.5 2 12.5 2 11.5C2 10.5 3 9.5 4 9C4 8 4.5 7 5.5 6.5C5.5 5.5 6 4.5 7 4C8 3.5 9 3.5 10 4C10 3 11 2 12 2Z"
        fill={colors.fill}
      />
      <path
        d="M7.5 12L10.5 15L16.5 9"
        stroke={colors.check}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
