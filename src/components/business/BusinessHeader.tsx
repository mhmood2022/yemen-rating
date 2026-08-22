import React from 'react';
import {
  ArrowRight,
  MoreVertical,
  MapPin,
  CheckCircle2,
  Phone,
  MessageCircle,
  Navigation,
  Star,
  Building2,
} from 'lucide-react';
import { BusinessItem } from '../../types/business';
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
      yrToast.info('رقم الهاتف غير مسجل حاليًا');
    }
  };

  const handleWhatsapp = () => {
    if (business.whatsapp || business.phone) {
      const num = (business.whatsapp || business.phone || '').replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${num}`, '_blank');
    } else {
      yrToast.info('رقم التواصل غير متوفر حاليًا');
    }
  };

  const handleMap = () => {
    if (business.mapUrl) {
      window.open(business.mapUrl, '_blank');
    } else {
      yrToast.info(`موقع النشاط: ${business.city} - ${business.address || 'اليمن'}`);
    }
  };

  const defaultCover =
    business.coverUrl ||
    'https://images.unsplash.com/photo-1578895210405-907db486c111?w=1000&auto=format&fit=crop&q=80';

  return (
    <div className="relative bg-white dark:bg-[#000000] border-b border-[#E2E8F0] dark:border-[#222222]">
      {/* 1. Top Cover Section with Action Buttons (Arrow & Options) */}
      <div className="relative h-[160px] sm:h-[200px] w-full overflow-hidden bg-[#0A0A0A]">
        <img
          src={defaultCover}
          alt={business.name}
          className="w-full h-full object-cover opacity-50 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />

        {/* Top Floating Actions: Back Arrow + Options Dots */}
        <div className="absolute top-3 left-0 right-0 px-4 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/directory')}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-[4px] text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="الرجوع"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => yrToast.info('خيارات المشاركة والحفظ متاحة')}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-[4px] text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="المزيد من الخيارات"
          >
            <MoreVertical size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* 2. Overlapping Centered Logo Box */}
      <div className="relative px-4 pb-4 -mt-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[16px] bg-white dark:bg-[#111111] p-1 border-2 border-white dark:border-[#222222] shadow-2xl overflow-hidden shrink-0 z-10">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="w-full h-full object-cover rounded-[13px]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F7F8FA] dark:bg-[#1A1A1A] text-[#F5C400]">
              <Building2 size={36} strokeWidth={1.75} />
            </div>
          )}
        </div>

        {/* Name & Title */}
        <div className="mt-2.5 space-y-1">
          <h1 className="text-lg sm:text-2xl font-black text-[#0B1F3A] dark:text-white leading-tight">
            {business.name}
          </h1>

          {/* Badges Strip (Verified + YR Score + Location) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1 text-xs">
            {/* Verified Badge */}
            {business.isVerified && (
              <span className="inline-flex items-center gap-1 font-bold text-[#F5C400] bg-[#F5C400]/10 px-2.5 py-0.5 rounded-full border border-[#F5C400]/30">
                <span>موثّق</span>
                <CheckCircle2 size={13} strokeWidth={2.5} />
              </span>
            )}

            {/* YR Score */}
            <span className="inline-flex items-center gap-1 font-black text-white bg-[#0B1F3A] dark:bg-[#161616] px-2.5 py-0.5 rounded-full border border-[#E2E8F0] dark:border-[#262626]">
              <Star size={12} strokeWidth={2.5} className="text-[#F5C400] fill-[#F5C400]" />
              <span>{business.yrScore} YR Score</span>
            </span>

            {/* Location */}
            <span className="inline-flex items-center gap-1 text-[#64748B] dark:text-[#A1A1AA] font-semibold">
              <MapPin size={13} className="text-[#F5C400] shrink-0" />
              <span>{business.city}، اليمن</span>
            </span>
          </div>
        </div>

        {/* 3. Three Main Quick Action Buttons [اتصال] [تواصل] [موقع] */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm mt-4 pt-3 border-t border-[#F1F5F9] dark:border-[#1E1E1E]">
          <button
            type="button"
            onClick={handleCall}
            className="h-[38px] rounded-[10px] bg-[#F7F8FA] dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] text-[#0B1F3A] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:border-[#F5C400]/50 active:scale-95 transition-all"
          >
            <Phone size={14} strokeWidth={2} className="text-[#16A34A] dark:text-[#22C55E]" />
            <span>اتصال</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsapp}
            className="h-[38px] rounded-[10px] bg-[#F7F8FA] dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] text-[#0B1F3A] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:border-[#F5C400]/50 active:scale-95 transition-all"
          >
            <MessageCircle size={14} strokeWidth={2} className="text-[#2563EB] dark:text-[#60A5FA]" />
            <span>تواصل</span>
          </button>

          <button
            type="button"
            onClick={handleMap}
            className="h-[38px] rounded-[10px] bg-[#F7F8FA] dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] text-[#0B1F3A] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:border-[#F5C400]/50 active:scale-95 transition-all"
          >
            <Navigation size={14} strokeWidth={2} className="text-[#F5C400]" />
            <span>موقع</span>
          </button>
        </div>
      </div>
    </div>
  );
};
