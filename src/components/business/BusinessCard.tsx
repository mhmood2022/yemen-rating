import React from 'react';
import { Building2, MapPin, Star, CheckCircle2, Flame, ArrowLeft } from 'lucide-react';
import { BusinessItem } from '../../types/business';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BusinessScore } from './BusinessScore';

interface BusinessCardProps {
  business: BusinessItem;
  onNavigate?: (id: string) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onNavigate }) => {
  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(business.id);
    } else {
      window.location.href = `/business/${business.id}`;
    }
  };

  return (
    <Card
      hoverable
      className="flex flex-col justify-between border-[#E2E8F0] p-4 sm:p-5 transition-all duration-200 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="neutral" size="sm">
              {business.category}
            </Badge>
            {business.isTrending && (
              <Badge variant="yellow" size="sm" className="gap-1">
                <Flame size={12} className="text-[#0B1F3A]" />
                ترند
              </Badge>
            )}
          </div>
          <BusinessScore score={business.yrScore} size="sm" showLabel={false} />
        </div>

        <div className="flex items-start gap-3 mb-2.5">
          <div className="w-11 h-11 rounded-[10px] bg-[#0B1F3A]/5 border border-[#E2E8F0] flex items-center justify-center text-[#0B1F3A] font-bold shrink-0 group-hover:border-[#0B1F3A]/30 transition-colors">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover rounded-[10px]" />
            ) : (
              <Building2 size={22} strokeWidth={1.75} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-[#0B1F3A] leading-snug line-clamp-1 group-hover:text-[#162F52] transition-colors flex items-center gap-1.5">
              <span className="truncate">{business.name}</span>
              {business.isVerified && (
                <CheckCircle2
                  size={16}
                  className="text-[#16A34A] shrink-0"
                  strokeWidth={2.5}
                  title="نشاط موثق رسمياً"
                />
              )}
            </h3>
            <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
              <MapPin size={13} strokeWidth={1.75} className="shrink-0 text-[#94A3B8]" />
              <span>{business.city}</span>
              {business.address && <span className="truncate opacity-75">· {business.address}</span>}
            </p>
          </div>
        </div>

        {business.description && (
          <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed mb-3">
            {business.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-xs font-bold text-[#0B1F3A]">
            <Star size={14} className="text-[#F5C400] fill-[#F5C400]" />
            <span>{business.rating.toFixed(1)}</span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">({business.reviewCount} تقييم)</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-[#0B1F3A] group-hover:bg-[#0B1F3A] group-hover:text-white transition-all h-[32px] px-2.5"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <span>عرض النشاط</span>
          <ArrowLeft size={13} />
        </Button>
      </div>
    </Card>
  );
};
