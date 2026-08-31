import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PublishedAd } from '../../pages/admin/ads/AdGeneratorStudio';

interface AdBannerProps {
  placementId?: string; // موضع الإعلان (1 إلى 10)
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placementId = '1',
  className = ''
}) => {
  const [activeAd, setActiveAd] = useState<PublishedAd | null>(null);

  useEffect(() => {
    // 1. جلب الإعلانات المنشورة من التخزين
    const saved = localStorage.getItem('yr_published_ads');
    if (saved) {
      try {
        const adsList: PublishedAd[] = JSON.parse(saved);
        // البحث عن إعلان نشط مخصص لهذا الموضع أو أول إعلان نشط
        const match = adsList.find(a => a.status === 'active' && (a.placementId === placementId || !placementId)) || adsList.find(a => a.status === 'active');
        if (match) {
          setActiveAd(match);
        }
      } catch (e) {
        console.error('Error loading published ad:', e);
      }
    }
  }, [placementId]);

  // إذا لم يقم المدير بنشر أي إعلان بعد، اعرض إعلان منصة يمن ريتنغ الافتراضي
  if (!activeAd) {
    return (
      <div
        dir="rtl"
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B0F17] via-[#161D2B] to-[#0B0F17] border border-[#FFC500]/30 p-4 sm:p-5 shadow-lg ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-[#FFC500]/15 flex items-center justify-center text-[#FFC500] shrink-0 font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-white text-sm sm:text-base font-black mt-1">
                وثّق شركتك ونشاطك التجاري الآن في الدليل الوطني
              </h4>
              <p className="text-[#9CA3AF] text-xs mt-0.5">
                احصل على الشارة المعتمدة وزيادة وصولك لآلاف العملاء في كافة المحافظات.
              </p>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/admin'}
            className="px-4 py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-md shadow-[#FFC500]/20 shrink-0 cursor-pointer"
          >
            انضم للأنشطة الموثقة
          </button>
        </div>
      </div>
    );
  }

  // 2. عرض الإعلان المنشور الحقيقي بدون خط داخلي وبدون شارة إعلان يمن ريتنغ
  return (
    <div
      dir="rtl"
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        borderRadius: `${activeAd.borderRadius || 16}px`,
        border: activeAd.hasBorder ? `${activeAd.borderWidth}px solid ${activeAd.borderColor}` : 'none',
        backgroundColor: activeAd.bgColor || '#0B0F17',
        backgroundImage: activeAd.bgStyle === 'gradient' ? `linear-gradient(135deg, ${activeAd.bgColor} 0%, #161D2B 100%)` : 'none',
        boxShadow: activeAd.hasGlow && activeAd.hasBorder ? `0 0 25px ${activeAd.borderColor}40` : 'none',
        minHeight: '140px'
      }}
    >
      {/* شريط التمرير الزمني المتحرك */}
      {activeAd.hasProgressBar && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
          <div
            style={{
              backgroundColor: activeAd.progressBarColor,
              animation: `yrAdProgress ${activeAd.progressDuration || 5}s linear infinite`
            }}
            className="h-full w-full origin-left"
          />
        </div>
      )}

      {/* الوسائط */}
      {activeAd.mediaUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
          {activeAd.mediaType === 'video' ? (
            <video
              src={activeAd.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={activeAd.mediaUrl}
              alt="Ad media"
              style={{
                objectFit: activeAd.imageFit || 'cover',
                objectPosition: `${activeAd.imgPosX ?? 50}% ${activeAd.imgPosY ?? 50}%`,
                transform: `scale(${(activeAd.imgScale ?? 100) / 100})`,
                filter: `brightness(${activeAd.brightness ?? 100}%) contrast(${activeAd.contrast ?? 100}%)`,
                imageRendering: 'crisp-edges'
              }}
              className="w-full h-full"
            />
          )}
          {activeAd.imgOverlay > 0 && (
            <div className="absolute inset-0 bg-black" style={{ opacity: activeAd.imgOverlay / 100 }} />
          )}
        </div>
      )}

      {/* محتوى الإعلان */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-between h-full min-h-[140px]">
        {/* النصوص العلوية */}
        {(activeAd.showBadge || activeAd.showHeadline || activeAd.showDescription) && (
          <div className="space-y-2 max-w-xl">
            {activeAd.showBadge && (
              <span
                style={{
                  backgroundColor: activeAd.badgeBgColor,
                  color: activeAd.badgeTextColor,
                  borderColor: activeAd.badgeTextColor
                }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-block backdrop-blur-sm shadow-sm"
              >
                {activeAd.badgeText}
              </span>
            )}

            {activeAd.showHeadline && (
              <h3
                style={{ color: activeAd.headlineColor || '#FFFFFF' }}
                className="text-sm sm:text-base md:text-lg font-black leading-snug drop-shadow-md"
              >
                {activeAd.headline}
              </h3>
            )}

            {activeAd.showDescription && (
              <p
                style={{ color: activeAd.descColor || '#E5E7EB' }}
                className="text-xs text-gray-200 mt-1 line-clamp-2 drop-shadow leading-relaxed"
              >
                {activeAd.description}
              </p>
            )}
          </div>
        )}

        {/* زر التحويل فقط (بدون خط فاصل وبدون شارة سفلية) */}
        {activeAd.showButton && (
          <div className="pt-2 flex items-center justify-end mt-2">
            <a
              href={activeAd.targetUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: activeAd.btnBgColor || '#FFC500',
                color: activeAd.btnTextColor || '#000000'
              }}
              className="px-4 py-2 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
            >
              <span>{activeAd.ctaText || 'اطلب الآن'}</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
