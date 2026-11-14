import React from 'react';
import {
  VerifiedBadge as UnifiedBadge,
  VerifiedBadgeVariant,
} from '../ui/VerifiedBadge';

export type BadgeType =
  | VerifiedBadgeVariant
  | 'none'
  | null;

interface VerifiedBadgeProps {
  type?: BadgeType | boolean;
  variant?: BadgeType;
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  type,
  variant,
  size = 16,
  className = '',
}) => {
  const badgeType = type ?? variant;

  if (!badgeType || badgeType === 'none') {
    return null;
  }

  const normalizedType =
    badgeType === true ? 'blue' : badgeType;

  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
        ? 16
        : size === 'md'
          ? 18
          : 22;

  return (
    <UnifiedBadge
      variant={normalizedType}
      size={pixelSize}
      className={className}
    />
  );
};

export default VerifiedBadge;
