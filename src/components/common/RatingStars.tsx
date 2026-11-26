import React from 'react';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number;
  size?: number;
  maxStars?: number;
  gapClassName?: string;
  filledColorClass?: string;
  emptyColorClass?: string;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 14,
  maxStars = 5,
  gapClassName = 'gap-0.5',
  filledColorClass = 'text-[#FFC500]',
  emptyColorClass = 'text-[#71767B]',
  className = '',
}) => {
  const numericRating = Number(rating);
  const safeRating = Number.isFinite(numericRating)
    ? Math.max(0, Math.min(maxStars, numericRating))
    : 0;

  return (
    <span
      className={`inline-flex items-center ${gapClassName} ${className}`}
      aria-label={`التقييم ${safeRating.toFixed(1)} من ${maxStars}`}
    >
      {Array.from({ length: maxStars }, (_, idx) => {
        const fillRatio = Math.max(0, Math.min(1, safeRating - idx));
        const fillPercent = Math.round(fillRatio * 1000) / 10;

        return (
          <span
            key={idx}
            className="relative inline-block shrink-0 align-middle"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              className={`${emptyColorClass} block`}
              strokeWidth={2}
            />
            {fillPercent > 0 && (
              <span
                className="absolute top-0 bottom-0 overflow-hidden pointer-events-none"
                style={{
                  width: `${fillPercent}%`,
                  insetInlineStart: 0,
                }}
              >
                <Star
                  size={size}
                  className={`${filledColorClass} fill-current block max-w-none`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    insetInlineStart: 0,
                    width: size,
                    height: size,
                    minWidth: size,
                    minHeight: size,
                  }}
                  strokeWidth={2}
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

export default RatingStars;
