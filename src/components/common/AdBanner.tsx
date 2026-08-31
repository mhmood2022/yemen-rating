import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, MessageCircle, Phone, Award, Flame, Clock, ShieldCheck, Star, QrCode, ExternalLink } from 'lucide-react';
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
      className={`relative overflow-hidden transition-all duration-300 w-full shadow-2xl ${className}`}
      style={{
        borderRadius: `${adData.borderRadius || 18}px`,
        border: adData.hasBorder ? `${adData.borderWidth || 2}px solid ${adData.borderColor || '#FFC500'}` : '1px solid rgba(255,197,0,0.25)',
        backgroundColor: adData.bgColor || '#0B0F17',
        backgroundImage: adData.bgStyle === 'gradient' ? `linear-gradient(135deg, ${adData.bgColor || '#0B0F17'} 0%, #161D2B 100%)` : 'none',
        boxShadow: adData.hasGlow ? `0 0 30px ${adData.borderColor || '#FFC500'}40` : '0 10px 30px rgba(0,0,0,0.8)',
        minHeight: '145px'
      }}
    >
      {/* تضمين محرك الحركات الإعلانية */}
      <style>{`
        @keyframes yrContinuousSlideRight {
          0% { opacity: 0; transform: translateX(25px); }
          15% { opacity: 1; transform: translateX(0); }
          85% { opacity: 1; transform: translateX(0); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes yrContinuousSlideUp {
          0% { opacity: 0; transform: translateY(15px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes yrPulseGlowActive {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,197,0,0.3); }
          50% { transform: scale(1.04); box-shadow: 0 0 25px rgba(255,197,0,0.8); }
        }
        @keyframes yrShineContinuous {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes yrKenBurnsMotion {
          0% { transform: scale(1); }
          50% { transform: scale(1.15) translate(-1%, -1%); }
          100% { transform: scale(1); }
        }

        .yr-live-slide-right { animation: yrContinuousSlideRight 6s ease-in-out infinite; }
        .yr-live-slide-up { animation: yrContinuousSlideUp 6s ease-in-out infinite; }
        .yr-live-pulse { animation: yrPulseGlowActive 2.5s infinite ease-in-out; }
        .yr-live-shimmer {
          background-size: 200% 100% !important;
          background-image: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%) !important;
          animation: yrShineContinuous 2.8s infinite linear !important;
        }
        .yr-live-kenburns { animation: yrKenBurnsMotion 18s ease-in-out infinite alternate !important; }
      `}</style>

      {/* شريط التمرير الزمني العلوي */}
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

      {/* وسائط الإعلان (صورة ناصعة أو فيديو تجاري حقيقي) */}
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
              className={`w-full h-full relative z-10 ${adData.mediaMotion === 'kenBurns' ? 'yr-live-kenburns' : ''}`}
            />
          )}
          
          {/* طبقة التباين الإعلانية لقراءة النصوص */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" 
            style={{ opacity: Math.max((adData.imgOverlay ?? 30) / 100, 0.4) }} 
          />
        </div>
      )}

      {/* شريط الإعلان التجاري وشارة الرعاية */}
      <div className="relative z-20 p-4 sm:p-5 flex flex-col justify-between h-full min-h-[145px]">
        
        {/* الجزء العلوي: شارة الإعلان الممول المعتمد */}
        <div className="flex items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {adData.showBadge && (
              <span
                style={{ backgroundColor: adData.badgeBgColor || 'rgba(255,197,0,0.25)', color: adData.badgeTextColor || '#FFC500', borderColor: adData.badgeTextColor || '#FFC500' }}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9.5px] font-black border tracking-wide whitespace-nowrap shadow-md backdrop-blur-md"
              >
                {adData.badgeText || 'إعلان ممول'}
              </span>
            )}
            {adData.showVerifiedBadge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#16A34A]/25 text-[#16A34A] border border-[#16A34A]/40 text-[9.5px] font-black whitespace-nowrap">
                <ShieldCheck size={12} /> موثّق YR
              </span>
            )}
          </div>

          <span className="text-[9px] text-white/70 font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10 backdrop-blur-md flex items-center gap-1">
            <ExternalLink size={10} /> YR Ads
          </span>
        </div>

        {/* جسم الإعلان والنصوص البارزة */}
        <div className="space-y-1.5 max-w-lg my-1">
          {adData.showHeadline && (
            <h3 
              style={{ 
                color: adData.headlineColor || '#FFFFFF',
                fontFamily: adData.headlineFont || 'Cairo',
                textShadow: '0 2px 12px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)'
              }} 
              className={`leading-snug font-black text-sm sm:text-base md:text-lg ${
                adData.headlineMotion === 'slideRight' ? 'yr-live-slide-right' :
                adData.headlineMotion === 'slideUp' ? 'yr-live-slide-up' : ''
              }`}
            >
              {adData.headline}
            </h3>
          )}

          {adData.showDescription && (
            <p 
              style={{ 
                color: adData.descColor || '#E5E7EB',
                textShadow: '0 1px 8px rgba(0,0,0,0.95)'
              }} 
              className="text-xs text-gray-200 line-clamp-2 leading-relaxed font-medium"
            >
              {adData.description}
            </p>
          )}
        </div>

        {/* زر الإجراء التجاري الصريح والأسعار إن وجدت */}
        <div className="pt-2 flex items-center justify-between border-t border-white/15 mt-1 flex-wrap gap-2">
          {adData.showPricing && (
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs sm:text-sm font-black text-[#FFC500] drop-shadow">{adData.currentPrice} {adData.currency || 'YER'}</span>
              {adData.oldPrice && <span className="text-[10px] text-gray-400 line-through">{adData.oldPrice}</span>}
              {adData.discountPercentage && <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">-{adData.discountPercentage}</span>}
            </div>
          )}

          {adData.showButton && (
            <a
              href={adData.targetUrl || '#'}
              target={adData.actionType === 'link' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              style={{ backgroundColor: adData.btnBgColor || '#FFC500', color: adData.btnTextColor || '#000000' }}
              className={`px-4 py-2 rounded-xl font-black text-xs shadow-2xl flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                adData.btnAnimation === 'pulse' ? 'yr-live-pulse' :
                adData.btnAnimation === 'shimmer' ? 'yr-live-shimmer' : ''
              }`}
            >
              {adData.actionType === 'whatsapp' && <MessageCircle size={14} />}
              {adData.actionType === 'call' && <Phone size={14} />}
              <span>{adData.ctaText || 'اطلب الآن'}</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </a>
          )}
        </div>

      </div>
    </div>
  );
};
