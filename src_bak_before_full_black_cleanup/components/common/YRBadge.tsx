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

  const badgeConfig = {
    blue: {
      color: '#2EA5FF',
      title: 'نشاط موثق رسمياً (Blue)',
    },
    gold: {
      color: '#F5B800',
      title: 'نشاط متميز ذهبي (Gold Premium)',
    },
    gray: {
      color: '#9CA3AF',
      title: 'نشاط قياسي معتمد (Gray)',
    },
  }[type];

  if (!badgeConfig) return null;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none align-middle relative group ${className}`}
      title={showTooltip ? badgeConfig.title : undefined}
    >
      <svg
        style={{ width: `${size}px`, height: `${size}px` }}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-110"
      >
        {/* جسم الشارة السحابي الدائري الأصلي المعتمد في صفحة البنك */}
        <path
          d="M512 268c0 17.9-4.3 34.5-12.9 49.7s-20.1 27.1-34.6 35.4c.4 2.7.6 6.9.6 12.6 0 27.1-9.1 50.1-27.1 69.1-18.1 19.1-39.9 28.6-65.4 28.6-11.4 0-22.3-2.1-32.6-6.3-8 16.4-19.5 29.6-34.6 39.7-15 10.2-31.5 15.2-49.4 15.2-18.3 0-34.9-4.9-49.7-14.9-14.9-9.9-26.3-23.2-34.3-40-10.3 4.2-21.1 6.3-32.6 6.3-25.5 0-47.4-9.5-65.7-28.6-18.3-19-27.4-42.1-27.4-69.1 0-3 .4-7.2 1.1-12.6-14.5-8.4-26-20.2-34.6-35.4-8.5-15.2-12.8-31.8-12.8-49.7 0-19 4.8-36.5 14.3-52.3s22.3-27.5 38.3-35.1c-4.2-11.4-6.3-22.9-6.3-34.3 0-27 9.1-50.1 27.4-69.1s40.2-28.6 65.7-28.6c11.4 0 22.3 2.1 32.6 6.3 8-16.4 19.5-29.6 34.6-39.7 15-10.1 31.5-15.2 49.4-15.2s34.4 5.1 49.4 15.1c15 10.1 26.6 23.3 34.6 39.7 10.3-4.2 21.1-6.3 32.6-6.3 25.5 0 47.3 9.5 65.4 28.6s27.1 42.1 27.1 69.1c0 12.6-1.9 24-5.7 34.3 16 7.6 28.8 19.3 38.3 35.1 9.5 15.9 14.3 33.4 14.3 52.4z"
          fill={badgeConfig.color}
        />
        {/* علامة الصح البيضاء الأصلية */}
        <path
          d="M245.1 345.1l105.7-158.3c2.7-4.2 3.5-8.8 2.6-13.7-1-4.9-3.5-8.8-7.7-11.4-4.2-2.7-8.8-3.6-13.7-2.9-5 .8-9 3.2-12 7.4l-93.1 140-42.9-42.8c-3.8-3.8-8.2-5.6-13.1-5.4-5 .2-9.3 2-13.1 5.4-3.4 3.4-5.1 7.7-5.1 12.9 0 5.1 1.7 9.4 5.1 12.9l58.9 58.9 2.9 2.3c3.4 2.3 6.9 3.4 10.3 3.4 6.7-.1 11.8-2.9 15.2-8.7z"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  );
};
