import React, { useState } from 'react';
import { BusinessEntity } from '../../types/database.types';

interface Props {
  business: BusinessEntity;
  onOpenProfile?: (slug: string) => void;
  onClaimOwnership?: (business: BusinessEntity) => void;
}

export const BusinessCard: React.FC<Props> = ({
  business,
  onOpenProfile,
  onClaimOwnership,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/businesses/${business.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTier1 = business.tier_level === 1;
  const isTier2 = business.tier_level === 2;

  return (
    <div
      onClick={() => onOpenProfile && onOpenProfile(business.slug)}
      className={`relative bg-[#1A1A1A] border rounded-2xl overflow-hidden transition duration-200 cursor-pointer group hover:-translate-y-1 ${
        isTier1
          ? 'border-[#FFC107] shadow-lg shadow-amber-500/10'
          : isTier2
          ? 'border-[#2A2A2A] hover:border-amber-400/50'
          : 'border-[#222222] hover:border-neutral-700'
      }`}
      dir="rtl"
    >
      {/* صورة الغلاف */}
      <div className="relative h-32 sm:h-36 w-full bg-[#121217] overflow-hidden">
        {business.cover_url ? (
          <img
            src={business.cover_url}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-[#141418]">
            <i className="fa-solid fa-image text-3xl"></i>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-black/50" />

        {/* شارة المستوى والتقييم العلوية */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isTier1 && (
            <span className="bg-[#FFC107] text-neutral-950 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <i className="fa-solid fa-crown text-[9px]"></i>
              مميز وموثق
            </span>
          )}
          {business.is_verified && (
            <span className="bg-emerald-500/90 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md">
              <i className="fa-solid fa-circle-check text-[9px]"></i>
              موثق
            </span>
          )}
        </div>

        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg text-amber-400 font-black text-xs flex items-center gap-1">
          <i className="fa-solid fa-star text-[10px]"></i>
          <span>{business.rating ? business.rating.toFixed(1) : '5.0'}</span>
        </div>

        {/* الشعار العائم */}
        <div className="absolute -bottom-4 right-4">
          <div className="w-14 h-14 rounded-xl border-2 border-[#1A1A1A] bg-black shadow-md overflow-hidden flex items-center justify-center">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-building text-amber-400 text-xl"></i>
            )}
          </div>
        </div>
      </div>

      {/* تفاصيل المنشأة */}
      <div className="p-4 pt-6">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="text-sm font-black text-[#E6E6E6] group-hover:text-[#FFC107] transition line-clamp-1 flex items-center gap-1.5">
              {business.name}
              {business.badge_type === 'gold' && <i className="fa-solid fa-certificate text-amber-400 text-xs" title="شارة ذهبية"></i>}
              {business.badge_type === 'blue' && <i className="fa-solid fa-certificate text-blue-400 text-xs" title="شارة زرقاء"></i>}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
              {business.sub_category || 'نشاط تجاري'} • {business.city}
            </p>
          </div>

          <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0">
            YR {business.yr_score ? business.yr_score.toFixed(0) : '90'}
          </span>
        </div>

        <p className="text-xs text-neutral-400 line-clamp-2 my-2.5 leading-relaxed">
          {business.description || 'لا يوجد وصف متاح لهذا النشاط حالياً.'}
        </p>

        {/* حالة الملكية وأزرار التواصل الفعالة */}
        <div className="pt-3 border-t border-[#2A2A2A] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            {business.claim_status === 'CLAIMED' ? (
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <i className="fa-solid fa-shield-halved text-[9px]"></i>
                تم إثبات الملكية
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimOwnership && onClaimOwnership(business);
                }}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
              >
                <i className="fa-solid fa-circle-dot text-[8px] text-rose-500 animate-pulse"></i>
                أثبت ملكيتك لهذا النشاط
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[10px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition"
              title="نسخ الرابط المخصص"
            >
              <i className="fa-solid fa-copy text-[10px]"></i>
              <span>{copied ? 'تم النسخ!' : 'مشاركة'}</span>
            </button>
          </div>

          {/* أزرار الاتصال المباشر */}
          <div className="grid grid-cols-3 gap-1.5" onClick={(e) => e.stopPropagation()}>
            <a
              href={`tel:${business.phone}`}
              className="py-1.5 rounded-lg bg-[#141414] hover:bg-amber-400 hover:text-black text-neutral-300 text-[11px] font-bold flex items-center justify-center gap-1 border border-[#2A2A2A] transition"
              title="اتصال هاتفي"
            >
              <i className="fa-solid fa-phone text-[10px]"></i>
              <span>اتصال</span>
            </a>

            <a
              href={business.whatsapp ? `https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}` : `tel:${business.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 rounded-lg bg-[#141414] hover:bg-emerald-500 hover:text-white text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1 border border-[#2A2A2A] transition"
              title="واتساب"
            >
              <i className="fa-brands fa-whatsapp text-[12px]"></i>
              <span>واتساب</span>
            </a>

            <a
              href={business.website_url || `https://maps.google.com/?q=${encodeURIComponent(business.name + ' ' + business.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 rounded-lg bg-[#141414] hover:bg-blue-500 hover:text-white text-blue-400 text-[11px] font-bold flex items-center justify-center gap-1 border border-[#2A2A2A] transition"
              title="الموقع أو الخريطة"
            >
              <i className="fa-solid fa-location-dot text-[10px]"></i>
              <span>الموقع</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
