import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, MessageCircle, Phone, Award, Flame, Clock } from 'lucide-react';
import { PublishedAd } from '../../pages/admin/ads/AdGeneratorStudio';

interface AdBannerProps {
  placementId?: string;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  placementId = '1', 
  className = '' 
}) => {
  const [adData, setAdData] = useState<PublishedAd | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('yr_published_ads');
    if (saved) {
      try {
        const adsList: PublishedAd[] = JSON.parse(saved);
        const match = adsList.find(a => a.status === 'active' && String(a.placementId) === String(placementId)) || adsList.find(a => a.status === 'active');
        if (match) setAdData(match);
      } catch (e) {
        console.error(e);
      }
    }
  }, [placementId]);

  if (!adData) return null;

  return (
    <div 
      dir="rtl"
      className={`relative overflow-hidden transition-all duration-300 w-full ${className}`}
      style={{
        borderRadius: `${adData.borderRadius}px`,
        border: adData.hasBorder ? `${adData.borderWidth}px solid ${adData.borderColor}` : 'none',
        backgroundColor: adData.bgColor,
        backgroundImage: adData.bgStyle === 'gradient' ? `linear-gradient(135deg, ${adData.bgColor} 0%, #161D2B 100%)` : 'none',
        boxShadow: adData.hasGlow && adData.hasBorder ? `0 0 25px ${adData.borderColor}35` : 'none',
        minHeight: '140px'
      }}
    >
      {/* شريط التمرير الزمني */}
      {adData.hasProgressBar && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
          <div 
            style={{ 
              backgroundColor: adData.progressBarColor,
              animation: `yrAdProgress ${adData.progressDuration}s linear infinite`
            }}
            className="h-full w-full origin-left"
          />
        </div>
      )}

      {/* الوسائط مع الخلفية الضبابية الذكية */}
      {adData.mediaUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
          {adData.imageFit === 'contain' && adData.useBlurBackground && adData.mediaType === 'image' && (
            <img 
              src={adData.mediaUrl} 
              alt="Blur fill" 
              className="absolute inset-0 w-full h-full object-cover blur-lg scale-125 opacity-50"
            />
          )}

          {adData.mediaType === 'video' ? (
            <video src={adData.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img 
              src={adData.mediaUrl} 
              alt="Ad" 
              style={{ 
                objectFit: adData.imageFit || 'cover',
                objectPosition: `${adData.imgPosX ?? 50}% ${adData.imgPosY ?? 50}%`,
                transform: `scale(${(adData.imgScale ?? 100) / 100})`,
                filter: `brightness(${adData.brightness}%) contrast(${adData.contrast}%)`,
                imageRendering: 'crisp-edges'
              }}
              className="w-full h-full relative z-10"
            />
          )}
          {adData.imgOverlay > 0 && (
            <div className="absolute inset-0 bg-black z-10" style={{ opacity: adData.imgOverlay / 100 }} />
          )}
        </div>
      )}

      {/* الملصق الترويجي */}
      {adData.promoSticker && adData.promoSticker !== 'none' && (
        <div className="absolute top-3 left-3 z-20">
          {adData.promoSticker === 'discount50' && (
            <span className="px-2.5 py-1 rounded-xl bg-[#DC2626] text-white text-[11px] font-black shadow-lg">
              خصم 50% 🔥
            </span>
          )}
          {adData.promoSticker === 'verified_gold' && (
            <span className="px-2.5 py-1 rounded-xl bg-[#FFC500] text-black text-[11px] font-black shadow-lg flex items-center gap-1">
              <Award size={13} /> موثق ذهبي YR
            </span>
          )}
          {adData.promoSticker === 'hot_deal' && (
            <span className="px-2.5 py-1 rounded-xl bg-orange-600 text-white text-[11px] font-black shadow-lg flex items-center gap-1">
              <Flame size={13} /> عرض ناري
            </span>
          )}
          {adData.promoSticker === 'limited' && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-black text-[11px] font-black shadow-lg flex items-center gap-1">
              <Clock size={13} /> لفترة محدودة
            </span>
          )}
          {adData.promoSticker === 'exclusive' && (
            <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-[11px] font-black shadow-lg">
              ⭐ حصري
            </span>
          )}
        </div>
      )}

      {/* المحتوى والنصوص */}
      <div className="relative z-20 p-4 sm:p-5 flex flex-col justify-between h-full min-h-[140px]">
        {(adData.showBadge || adData.showHeadline || adData.showDescription) && (
          <div className="space-y-2 max-w-xl">
            {adData.showBadge && (
              <span
                style={{ backgroundColor: adData.badgeBgColor, color: adData.badgeTextColor, borderColor: adData.badgeTextColor }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-block backdrop-blur-sm"
              >
                {adData.badgeText}
              </span>
            )}

            {adData.showHeadline && (
              <h3 
                style={{ 
                  color: adData.headlineColor,
                  fontFamily: adData.headlineFont || 'Cairo',
                  textShadow: adData.hasTextShadow ? '0 2px 10px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' : 'none'
                }} 
                className="text-sm sm:text-base md:text-lg font-black leading-snug"
              >
                {adData.headline}
              </h3>
            )}

            {adData.showDescription && (
              <p 
                style={{ 
                  color: adData.descColor,
                  textShadow: adData.hasTextShadow ? '0 1px 6px rgba(0,0,0,0.9)' : 'none'
                }} 
                className="text-xs text-gray-200 mt-1 line-clamp-2 leading-relaxed"
              >
                {adData.description}
              </p>
            )}
          </div>
        )}

        {/* زر الإجراء الذكي */}
        {adData.showButton && (
          <div className="pt-3 flex items-center justify-between border-t border-white/10 mt-2">
            <a
              href={adData.targetUrl || '#'}
              target={adData.actionType === 'link' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              style={{ backgroundColor: adData.btnBgColor, color: adData.btnTextColor }}
              className={`px-4 py-2 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all ${
                adData.btnAnimation === 'pulse' ? 'animate-pulse' : adData.btnAnimation === 'glow' ? 'shadow-[#FFC500]/50 shadow-lg' : ''
              }`}
            >
              {adData.actionType === 'whatsapp' && <MessageCircle size={14} />}
              {adData.actionType === 'call' && <Phone size={14} />}
              <span>{adData.ctaText}</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </a>

            <span className="text-[10px] text-white/80 font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
              إعلان يمن ريتنغ #{placementId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
