import React from 'react';
import { MapPin, Star, Flame, Building2 } from 'lucide-react';
import { BusinessItem } from '../../types/business';
import { Card } from '../ui/Card';
import { VerifiedBadge } from '../ui/VerifiedBadge';

interface BusinessCardProps {
  business: BusinessItem;
  variant?: 'topRated' | 'trending' | 'compact' | 'standard';
  trendCount?: number;
  onNavigate?: (id: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  variant = 'standard',
  trendCount = 98,
  onNavigate,
}) => {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate(business.id);
    } else {
      window.location.href = `/business/${business.id}`;
    }
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      noPadding
      className="overflow-hidden rounded-[14px] bg-[#111111] border border-[#222222] cursor-pointer flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-sm text-right"
    >
      {/* Top Cover Media */}
      <div className="relative h-[105px] sm:h-[125px] w-full overflow-hidden bg-[#181818]">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#71717A]">
            <Building2 size={28} strokeWidth={1.5} />
          </div>
        )}

        {/* Rating Badge (4.8 ★) on top corner */}
        {variant === 'topRated' && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-[5px] bg-black/75 backdrop-blur-[2px] text-white flex items-center gap-1 text-[10px] font-black border border-white/10">
            <span>{business.rating.toFixed(1)}</span>
            <Star size={10} strokeWidth={2.5} className="text-[#F5C400] fill-[#F5C400]" />
          </div>
        )}

        {/* Trend Flame Badge (🔥 125) on bottom corner */}
        {variant === 'trending' && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-[5px] bg-black/80 backdrop-blur-[2px] text-white flex items-center gap-1 text-[10px] font-black border border-[#F59E0B]/30">
            <Flame size={11} strokeWidth={2.5} className="text-[#F59E0B]" />
            <span>{trendCount}</span>
          </div>
        )}
      </div>

      {/* Info Body with Verified Badge */}
      <div className="p-2.5 space-y-0.5">
        <h3 className="font-bold text-xs text-white leading-snug truncate flex items-center gap-1">
          <span className="truncate">{business.name}</span>
          {business.isVerified && <VerifiedBadge variant="gold" size={13} />}
        </h3>

        <div className="space-y-0.5 text-[10px] text-[#A1A1AA]">
          <span className="block truncate">{business.category}</span>
          <div className="flex items-center gap-0.5 text-[#71717A]">
            <MapPin size={10} className="text-[#71717A]" />
            <span>{business.city}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
