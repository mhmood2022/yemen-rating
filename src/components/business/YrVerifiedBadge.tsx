import React from 'react';
import { VerifiedBadge, VerifiedBadgeVariant } from '../ui/VerifiedBadge';

interface YrVerifiedBadgeProps {
  variant?: VerifiedBadgeVariant;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const YrVerifiedBadge: React.FC<YrVerifiedBadgeProps> = ({
  variant = 'gold',
  text = 'موثّق',
  size = 'md',
  showText = false,
  className,
}) => {
  const pixelSizes = {
    sm: 15,
    md: 18,
    lg: 22,
  };

  return (
    <VerifiedBadge
      variant={variant}
      size={pixelSizes[size]}
      text={text}
      showText={showText}
      className={className}
    />
  );
};
