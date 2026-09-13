import React, { useState, useEffect } from 'react';
import { ExternalLink, Info, ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { PublishedAd } from '../../pages/admin/ads/AdGeneratorStudio';
import { adsDatabaseService } from '../../services/adsDatabaseService';

interface AdBannerProps {
  placementId?: string;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placementId = '1',
  className = ''
}) => {
  const [adData, setAdData] = useState<PublishedAd | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // 1. قراءة فورية من الكاش إذا توفر
    const saved = localStorage.getItem('yr_published_ads');
    if (saved) {
      try {
        const adsList: PublishedAd[] = JSON.parse(saved);
        const match = adsList.find(a => 
          a.status === 'active' && 
          String(a.placementId) === String(placementId) && 
          !a.mediaUrl?.startsWith('blob:')
        );
        if (match && isMounted) setAdData(match);
      } catch (_) {}
    }

    // 2. جلب حصري من قاعدة بيانات Supabase
    const fetchFromDatabase = async () => {
      try {
        const liveAds = await adsDatabaseService.getActiveAds(placementId);
        const validAds = (liveAds || []).filter(a => 
          String(a.placementId) === String(placementId) && 
          a.mediaUrl && 
          !a.mediaUrl.startsWith('blob:')
        );

        if (validAds.length > 0 && isMounted) {
          setAdData(validAds[0]);
          try {
            localStorage.setItem('yr_published_ads', JSON.stringify(validAds));
          } catch (_) {}
        } else if (isMounted && !saved) {
          setAdData(null);
        }
      } catch (err) {
        console.error("Google-Style AdBanner fetch error:", err);
      }
    };

    fetchFromDatabase();

    return () => {
      isMounted = false;
    };
  }, [placementId]);

  // إذا لم يكن هناك إعلان أو تم إغلاقه بواسطة الزائر
  if (!adData || isDismissed) return null;

  const isFooterSticky = placementId === '10';

  return (
    <div
      dir="rtl"
      className={`relative overflow-hidden w-full transition-all duration-200 select-none ${
        isFooterSticky 
          ? 'bg-[#0B0F17] border-t border-[#222734] shadow-[0_-4px_20px_rgba(0,0,0,0.7)]' 
          : 'bg-[#0E131F] border border-[#222734] rounded-none my-1.5'
      } ${className}`}
      style={{
        maxHeight: isFooterSticky ? '64px' : '110px',
        minHeight: isFooterSticky ? '54px' : '82px',
      }}
    >
      {/* 1. ترويسة إعلانات جوجل العلوية (شريط AdChoices + زر الإغلاق ✕) */}
      <div className="absolute top-0 left-0 right-0 z-30 px-2 py-0.5 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* شارة إعلان جوجل الرسمية */}
        <div className="flex items-center gap-1">
          <span className="text-[8.5px] font-sans tracking-wide text-zinc-400 bg-black/80 px-1 py-0.2 rounded-none border border-zinc-700/50 flex items-center gap-0.5">
            <Info size={8} className="text-zinc-400" /> إعلان YR
          </span>
        </div>

        {/* زر إغلاق الإعلان ✕ بطريقة جوجل AdChoices */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDismissed(true);
          }}
          className="w-4 h-4 rounded-none bg-black/80 hover:bg-[#DC2626] text-zinc-300 hover:text-white flex items-center justify-center text-[9px] font-bold border border-zinc-700/60 transition-colors cursor-pointer"
          title="إغلاق هذا الإعلان"
        >
          ✕
        </button>
      </div>

      {/* 2. خلفية الوسائط (فيديو أو صورة بملء الإعلان مثل Google Display) */}
      {adData.mediaUrl && adData.layoutStyle !== 'text_only' && (
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
          {adData.mediaType === 'video' ? (
            <video 
              src={adData.mediaUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover relative z-10" 
            />
          ) : (
            <img
              src={adData.mediaUrl}
              alt="Google-style ad banner"
              style={{
                objectFit: adData.imageFit || 'cover',
                objectPosition: `${adData.imgPosX ?? 50}% ${adData.imgPosY ?? 50}%`,
              }}
              className="w-full h-full object-cover relative z-10"
            />
          )}

          {/* طبقة تظليل خفيفة جداً لقراءة النصوص دون حجب الصورة */}
          {(adData.showHeadline || adData.showDescription) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent z-10" />
          )}
        </div>
      )}

      {/* 3. شريط المحتوى والنصوص التفاعلية بنمط جوجل */}
      <div className="relative z-20 h-full w-full px-3 py-2 flex items-center justify-between gap-3 min-h-[54px]">
        {/* النصوص والعناوين (إذا اختار المستخدم تفعيلها) */}
        <div className="flex-1 min-w-0 pr-1 space-y-0.5">
          {adData.showHeadline && adData.headline && (
            <h4 
              style={{ color: adData.headlineColor || '#FFFFFF' }}
              className="text-xs sm:text-sm font-bold text-white truncate leading-tight drop-shadow-md"
            >
              {adData.headline}
            </h4>
          )}
          {adData.showDescription && adData.description && (
            <p 
              style={{ color: adData.descColor || '#D1D5DB' }}
              className="text-[10.5px] text-zinc-300 truncate font-normal leading-tight drop-shadow-sm"
            >
              {adData.description}
            </p>
          )}
        </div>

        {/* زر الإجراء (CTA Button) على طريقة جوجل: مستطيل، أنيق، غير دائري */}
        {adData.showButton && (
          <a
            href={adData.targetUrl || '#'}
            target={adData.actionType === 'link' ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={() => adsDatabaseService.recordClick(adData.id)}
            style={{ 
              backgroundColor: adData.btnBgColor || '#FFC500', 
              color: adData.btnTextColor || '#000000' 
            }}
            className="shrink-0 px-3 py-1.5 rounded-none font-bold text-[11px] shadow-sm flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {adData.actionType === 'whatsapp' && <MessageCircle size={12} />}
            {adData.actionType === 'call' && <Phone size={12} />}
            <span>{adData.ctaText || 'زيارة'}</span>
            <ArrowRight size={11} className="rtl:rotate-180" />
          </a>
        )}
      </div>
    </div>
  );
};
