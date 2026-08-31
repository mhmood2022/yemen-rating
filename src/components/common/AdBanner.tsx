import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, MessageCircle, Phone, Award, Flame, Clock, ShieldCheck, Star, QrCode } from 'lucide-react';
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
        borderRadius: `${adData.borderRadius || 14}px`,
        border: adData.hasBorder ? `${adData.borderWidth || 2}px solid ${adData.borderColor || '#FFC500'}` : 'none',
        backgroundColor: adData.bgColor || '#0B0F17',
        backgroundImage: adData.bgStyle === 'gradient' ? `linear-gradient(135deg, ${adData.bgColor || '#0B0F17'} 0%, #161D2B 100%)` : 'none',
        boxShadow: adData.hasGlow && adData.hasBorder ? `0 0 25px ${adData.borderColor || '#FFC500'}35` : 'none',
        minHeight: '140px'
      }}
    >
      {/* شريط التمرير الزمني */}
      {adData.hasProgressBar && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
          <div 
            style={{ 
              backgroundColor: adData.progressBarColor || '#FFC500',
              animation: `yrAdProgress ${adData.progressDuration || 8}s linear infinite`
            }}
            className="h-full w-full origin-left"
          />
        </div>
      )}

      {/* الوسائط مع تأثير Ken Burns والخلفية الضبابية */}
      {adData.mediaUrl && adData.layoutStyle !== 'text_only' && (
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
                filter: `brightness(${adData.brightness ?? 100}%) contrast(${adData.contrast ?? 100}%)`,
                imageRendering: 'crisp-edges'
              }}
              className={`w-full h-full relative z-10 ${adData.mediaMotion === 'kenBurns' ? 'yr-anim-kenburns' : ''}`}
            />
          )}
          {adData.imgOverlay > 0 && (
            <div className="absolute inset-0 bg-black z-10" style={{ opacity: (adData.imgOverlay ?? 25) / 100 }} />
          )}
        </div>
      )}

      {/* الشعار Logo */}
      {adData.showLogo && adData.logoUrl && (
        <div className={`absolute z-30 p-2 ${
          adData.logoPosition === 'top_left' ? 'top-2 left-2' :
          adData.logoPosition === 'top_right' ? 'top-2 right-2' :
          adData.logoPosition === 'bottom_left' ? 'bottom-2 left-2' : 'bottom-2 right-2'
        }`}>
          <img src={adData.logoUrl} alt="Logo" style={{ width: `${adData.logoSize || 36}px`, height: `${adData.logoSize || 36}px` }} className="object-contain rounded-lg drop-shadow-md" />
        </div>
      )}

      {/* الملصقات الترويجية */}
      {adData.promoSticker && adData.promoSticker !== 'none' && (
        <div className="absolute top-3 left-3 z-30 animate-bounce">
          {adData.promoSticker === 'discount50' && <span className="px-2.5 py-1 rounded-xl bg-[#DC2626] text-white text-[11px] font-black shadow-lg">خصم 50% 🔥</span>}
          {adData.promoSticker === 'verified_gold' && <span className="px-2.5 py-1 rounded-xl bg-[#FFC500] text-black text-[11px] font-black shadow-lg flex items-center gap-1"><Award size={13} /> موثق ذهبي YR</span>}
          {adData.promoSticker === 'hot_deal' && <span className="px-2.5 py-1 rounded-xl bg-orange-600 text-white text-[11px] font-black shadow-lg flex items-center gap-1"><Flame size={13} /> عرض ناري</span>}
          {adData.promoSticker === 'limited' && <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-black text-[11px] font-black shadow-lg flex items-center gap-1"><Clock size={13} /> لفترة محدودة</span>}
          {adData.promoSticker === 'exclusive' && <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-[11px] font-black shadow-lg">⭐ حصري</span>}
        </div>
      )}

      {/* المحتوى والنصوص والأسعار */}
      <div className={`relative z-20 p-4 sm:p-5 flex flex-col justify-between h-full min-h-[140px] ${
        adData.textAlign === 'center' ? 'text-center' : adData.textAlign === 'left' ? 'text-left' : 'text-right'
      }`}>
        <div className="space-y-2 max-w-xl">
          {adData.showBadge && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                style={{ backgroundColor: adData.badgeBgColor || 'rgba(255,197,0,0.2)', color: adData.badgeTextColor || '#FFC500', borderColor: adData.badgeTextColor || '#FFC500' }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-block backdrop-blur-sm"
              >
                {adData.badgeText || 'إعلان ممول'}
              </span>
              {adData.showVerifiedBadge && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 text-[10px] font-bold">
                  <ShieldCheck size={12} /> موثّق
                </span>
              )}
            </div>
          )}

          {adData.showHeadline && (
            <h3 
              style={{ 
                color: adData.headlineColor || '#FFFFFF',
                fontFamily: adData.headlineFont || 'Cairo',
                textShadow: adData.hasTextShadow ? '0 2px 10px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' : 'none'
              }} 
              className={`leading-tight ${
                adData.headlineSize === 'xl' ? 'text-lg sm:text-xl font-black' :
                adData.headlineSize === 'lg' ? 'text-base sm:text-lg font-black' :
                adData.headlineSize === 'md' ? 'text-sm sm:text-base font-bold' : 'text-xs sm:text-sm font-semibold'
              } ${adData.headlineMotion === 'slideRight' ? 'yr-slide-right' : adData.headlineMotion === 'bounce' ? 'yr-bounce-soft' : ''}`}
            >
              {adData.headline}
            </h3>
          )}

          {adData.showDescription && (
            <p 
              style={{ 
                color: adData.descColor || '#E5E7EB',
                textShadow: adData.hasTextShadow ? '0 1px 6px rgba(0,0,0,0.9)' : 'none'
              }} 
              className={`text-xs text-gray-200 mt-1 leading-relaxed ${
                adData.descLines === 1 ? 'line-clamp-1' : adData.descLines === 2 ? 'line-clamp-2' : adData.descLines === 3 ? 'line-clamp-3' : ''
              }`}
            >
              {adData.description}
            </p>
          )}

          {/* شريط الأسعار والتقييم */}
          {(adData.showPricing || adData.showRating || adData.showLocation) && (
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              {adData.showPricing && (
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-sm font-black text-[#FFC500]">{adData.currentPrice} {adData.currency || 'YER'}</span>
                  {adData.oldPrice && <span className="text-xs text-gray-400 line-through">{adData.oldPrice}</span>}
                  {adData.discountPercentage && <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">-{adData.discountPercentage}</span>}
                </div>
              )}
              {adData.showRating && (
                <span className="flex items-center gap-1 text-[11px] text-[#FFC500] font-bold">
                  <Star size={13} fill="#FFC500" /> {adData.ratingValue || 5.0}
                </span>
              )}
              {adData.showLocation && (
                <span className="text-[10px] text-gray-300 font-medium">📍 {adData.locationText}</span>
              )}
            </div>
          )}
        </div>

        {/* زر الإجراء الذكي و QR */}
        {(adData.showButton || adData.showQrCode) && (
          <div className="pt-3 flex items-center justify-between border-t border-white/10 mt-2">
            {adData.showButton ? (
              <a
                href={adData.targetUrl || '#'}
                target={adData.actionType === 'link' ? '_blank' : '_self'}
                rel="noopener noreferrer"
                style={{ backgroundColor: adData.btnBgColor || '#FFC500', color: adData.btnTextColor || '#000000' }}
                className={`font-black shadow-xl flex items-center gap-1.5 hover:scale-105 transition-all ${
                  adData.btnShape === 'pill' ? 'rounded-full' : adData.btnShape === 'square' ? 'rounded-none' : 'rounded-xl'
                } ${
                  adData.btnSize === 'lg' ? 'px-5 py-2.5 text-sm' : adData.btnSize === 'md' ? 'px-4 py-2 text-xs' : 'px-3 py-1.5 text-[11px]'
                } ${adData.btnAnimation === 'pulse' ? 'yr-glow-pulse' : adData.btnAnimation === 'shimmer' ? 'yr-btn-shine' : ''}`}
              >
                {adData.actionType === 'whatsapp' && <MessageCircle size={14} />}
                {adData.actionType === 'call' && <Phone size={14} />}
                <span>{adData.ctaText || 'زيارة الرابط'}</span>
                <ArrowRight size={13} className="rtl:rotate-180" />
              </a>
            ) : <div />}

            {adData.showQrCode ? (
              <div className="bg-white p-1 rounded-lg shrink-0">
                <QrCode size={24} className="text-black" />
              </div>
            ) : (
              <span className="text-[10px] text-white/80 font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                إعلان يمن ريتنغ #{placementId}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
