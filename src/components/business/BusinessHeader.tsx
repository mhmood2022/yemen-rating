import React from 'react';
import {
  ArrowRight,
  MoreVertical,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Star,
  Building2,
} from 'lucide-react';
import { BusinessItem } from '../../types/business';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { yrToast } from '../ui/Toast';

interface BusinessHeaderProps {
  business: BusinessItem;
  onNavigate?: (path: string) => void;
}

export const BusinessHeader: React.FC<BusinessHeaderProps> = ({ business, onNavigate }) => {
  const handleCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone}`;
    } else {
      yrToast.info('رقم الهاتف غير مسجل');
    }
  };

  const handleWhatsapp = () => {
    if (business.whatsapp || business.phone) {
      const num = (business.whatsapp || business.phone || '').replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${num}`, '_blank');
    } else {
      yrToast.info('رقم الواتساب غير متوفر');
    }
  };

  const handleMap = () => {
    if (business.mapUrl) {
      window.open(business.mapUrl, '_blank');
    } else {
      yrToast.info(`الموقع: ${business.city} - ${business.address || 'اليمن'}`);
    }
  };

  const defaultCover =
    business.coverUrl ||
    'https://images.unsplash.com/photo-1578895210405-907db486c111?w=1000&auto=format&fit=crop&q=80';

  return (
    <div className="relative bg-white dark:bg-[#000000]">
      {/* Cover Image */}
      <div className="relative h-[160px] sm:h-[220px] md:h-[260px] w-full overflow-hidden bg-[#0A0A0A]">
        <img
          src={defaultCover}
          alt={business.name}
          className="w-full h-full object-cover opacity-80 dark:opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />

        {/* Top Actions */}
        <div className="absolute top-3.5 left-0 right-0 px-4 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/directory')}
            className="w-9 h-9 rounded-full bg-black/65 backdrop-blur-[3px] text-white flex items-center justify-center hover:bg-black/90 transition-colors shadow-md border-0"
            aria-label="الرجوع"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => yrToast.info('تم حفظ ومشاركة النشاط')}
            className="w-9 h-9 rounded-full bg-black/65 backdrop-blur-[3px] text-white flex items-center justify-center hover:bg-black/90 transition-colors shadow-md border-0"
            aria-label="خيارات إضافية"
          >
            <MoreVertical size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Logo & Identity Info */}
      <div className="relative px-4 pb-5 -mt-12 sm:-mt-14 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 text-center sm:text-right">
          {/* Logo Frame */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[18px] bg-white dark:bg-[#111111] shadow-2xl overflow-hidden shrink-0 z-10 border-0">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0B1F3A]/5 dark:bg-[#1A1A1A] text-[#F5C400]">
                <Building2 size={40} strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Business Name with Verified Badge directly beside it */}
          <div className="space-y-1.5">
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-[6px] bg-[#0B1F3A]/10 text-[#0B1F3A] dark:bg-[#181818] dark:text-[#A1A1AA]">
                {business.category}
              </span>
            </div>

            {/* Name + Badge in the Exact Natural Inline Position */}
            <h1 className="text-lg sm:text-2xl font-black text-[#0B1F3A] dark:text-white leading-tight flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
              <span>{business.name}</span>
              {business.isVerified && (
                <VerifiedBadge
                  variant={business.verifiedBadgeType || 'gold'}
                  size={20}
                />
              )}
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-[#64748B] dark:text-[#A1A1AA] pt-0.5">
              <span className="flex items-center gap-1 font-semibold">
                <MapPin size={13} className="text-[#F5C400] shrink-0" />
                <span>{business.city}{business.address ? ` · ${business.address}` : ''}</span>
              </span>

              <span className="inline-flex items-center gap-1 font-black text-[#0B1F3A] dark:text-white bg-[#F7F8FA] dark:bg-[#141414] px-2 py-0.5 rounded-[6px]">
                <Star size={11} className="text-[#F5C400] fill-[#F5C400]" />
                <span>{business.yrScore} YR Score</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 w-full sm:w-auto pt-1">
          {business.phone && (
            <button
              type="button"
              onClick={handleCall}
              className="h-[38px] px-4 rounded-[10px] bg-[#F7F8FA] dark:bg-[#111111] text-[#0B1F3A] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm border-0"
            >
              <Phone size={14} className="text-[#16A34A] dark:text-[#22C55E]" />
              <span>اتصال</span>
            </button>
          )}

          {(business.whatsapp || business.phone) && (
            <button
              type="button"
              onClick={handleWhatsapp}
              className="h-[38px] px-4 rounded-[10px] bg-[#F7F8FA] dark:bg-[#111111] text-[#0B1F3A] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm border-0"
            >
              <MessageCircle size={14} className="text-[#2563EB] dark:text-[#60A5FA]" />
              <span>تواصل</span>
            </button>
          )}

          {business.businessType !== 'WALLET' && (
            <button
              type="button"
              onClick={handleMap}
              className="h-[38px] px-4 rounded-[10px] bg-[#F7F8FA] dark:bg-[#111111] text-[#0B1F3A] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm border-0"
            >
              <Navigation size={14} className="text-[#F5C400]" />
              <span>موقع</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
