import React from 'react';
import { MapPin, Star, Flame, Building2 } from 'lucide-react';
import { BusinessItem } from '../../types/business';
import { Card } from '../ui/Card';

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
      className="overflow-hidden rounded-[14px] bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] cursor-pointer flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
    >
      {/* Top Media Cover with Badges */}
      <div className="relative h-[110px] sm:h-[130px] w-full overflow-hidden bg-[#F7F8FA] dark:bg-[#1A1A1A]">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
            <Building2 size={32} strokeWidth={1.5} />
          </div>
        )}

        {/* Rating Badge on Top Right */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[6px] bg-black/60 backdrop-blur-[2px] text-white flex items-center gap-1 text-[11px] font-extrabold border border-white/10">
          <Star size={11} strokeWidth={2} className="text-[#F5C400] fill-[#F5C400]" />
          <span>{business.rating.toFixed(1)}</span>
        </div>

        {/* Trend Flame Badge on Bottom Left if trending */}
        {variant === 'trending' && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-[6px] bg-black/70 backdrop-blur-[2px] text-white flex items-center gap-1 text-[11px] font-extrabold border border-[#F59E0B]/30">
            <Flame size={12} strokeWidth={2} className="text-[#F59E0B]" />
            <span>{trendCount}</span>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-3 space-y-1">
        <h3 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white leading-snug line-clamp-1">
          {business.name}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#A1A1AA]">
          <span className="truncate">{business.category}</span>
          <span className="flex items-center gap-0.5 text-[#94A3B8] dark:text-[#71717A] shrink-0">
            <MapPin size={11} strokeWidth={1.75} />
            <span>{business.city}</span>
          </span>
        </div>
      </div>
    </Card>
  );
};
