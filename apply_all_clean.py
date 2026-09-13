import re

# ========================================================
# 1. إصلاح AdBanner.tsx (حذف شارة عرض خاص + زر الإغلاق للفوتر الثابت فقط)
# ========================================================
ad_banner_clean = '''import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, MessageCircle, Phone, Award, Flame, Clock, ShieldCheck, Star, QrCode, ExternalLink, Info } from 'lucide-react';
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
      } catch (e) {
        console.error(e);
      }
    }

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
        console.error("AdBanner database fetch error:", err);
      }
    };

    fetchFromDatabase();

    return () => {
      isMounted = false;
    };
  }, [placementId]);

  if (!adData || isDismissed) return null;

  const isFooterSticky = placementId === '10';

  const getBtnRadius = () => {
    if (adData.btnShape === 'pill') return '9999px';
    if (adData.btnShape === 'square') return '0px';
    return `${adData.borderRadius ? Math.min(adData.borderRadius, 12) : 8}px`;
  };

  return (
    <div
      dir="rtl"
      className={`relative overflow-hidden transition-all duration-300 w-full shadow-lg ${
        isFooterSticky ? 'border-t' : 'border my-1.5'
      } ${className}`}
      style={{
        borderRadius: '0px',
        border: adData.hasBorder ? `${adData.borderWidth || 1}px solid ${adData.borderColor || '#FFC500'}` : '1px solid #1F2937',
        backgroundColor: adData.bgColor || '#0B0F17',
        backgroundImage: adData.bgStyle === 'gradient' ? `linear-gradient(135deg, ${adData.bgColor || '#0B0F17'} 0%, #161D2B 100%)` : 'none',
        boxShadow: adData.hasGlow && adData.hasBorder ? `0 0 20px ${adData.borderColor || '#FFC500'}35` : '0 4px 15px rgba(0,0,0,0.6)',
        minHeight: isFooterSticky ? '54px' : '82px'
      }}
    >
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
          0%, 100% { transform: scale(1); box-shadow: 0 0 8px rgba(255,197,0,0.3); }
          50% { transform: scale(1.03); box-shadow: 0 0 20px rgba(255,197,0,0.8); }
        }
        @keyframes yrShineContinuous {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes yrKenBurnsMotion {
          0% { transform: scale(1); }
          50% { transform: scale(1.12) translate(-1%, -1%); }
          100% { transform: scale(1); }
        }
        @keyframes yrAdProgress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
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

      {adData.hasProgressBar && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-30 overflow-hidden">
          <div
            style={{
              backgroundColor: adData.progressBarColor || '#FFC500',
              animation: `yrAdProgress ${adData.progressDuration || 8}s linear infinite`
            }}
            className="h-full w-full origin-left"
          />
        </div>
      )}

      {adData.mediaUrl && adData.layoutStyle !== 'text_only' && (
        <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
          {adData.imageFit === 'contain' && adData.useBlurBackground && adData.mediaType === 'image' && (
            <img
              src={adData.mediaUrl}
              alt="Blur fill"
              className="absolute inset-0 w-full h-full object-cover blur-lg scale-125 opacity-45"
            />
          )}

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

          {(adData.showHeadline || adData.showDescription) && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10"
              style={{ opacity: Math.max((adData.imgOverlay ?? 30) / 100, 0.4) }}
            />
          )}
        </div>
      )}

      <div className="relative z-20 p-2.5 sm:p-3 flex flex-col justify-between h-full min-h-[54px]">
        {/* شارة التوثيق وشارة جوجل الرسمية + زر الإغلاق ✕ حصراً في الفوتر الثابت */}
        <div className="flex items-center justify-between gap-2 pb-0.5">
          <div className="flex items-center gap-1 flex-wrap">
            {adData.showVerifiedBadge && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-none bg-[#16A34A]/25 text-[#16A34A] border border-[#16A34A]/40 text-[8.5px] font-bold whitespace-nowrap">
                <ShieldCheck size={10} /> موثّق YR
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 pointer-events-auto">
            <span className="text-[8px] text-zinc-300 font-mono bg-black/70 px-1.5 py-0.2 rounded-none border border-white/10 backdrop-blur-sm flex items-center gap-0.5">
              <Info size={8} /> إعلان YR
            </span>
            {isFooterSticky && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsDismissed(true);
                }}
                className="w-4 h-4 rounded-none bg-black/80 hover:bg-red-600 text-zinc-300 hover:text-white flex items-center justify-center text-[8.5px] font-bold border border-white/15 transition-colors cursor-pointer"
                title="إغلاق هذا الإعلان"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="space-y-0.5 max-w-lg my-0.5">
          {adData.showHeadline && adData.headline && (
            <h3
              style={{
                color: adData.headlineColor || '#FFFFFF',
                fontFamily: adData.headlineFont || 'Cairo',
                textShadow: '0 2px 10px rgba(0,0,0,0.95)'
              }}
              className={`leading-tight font-black text-xs truncate ${
                adData.headlineMotion === 'slideRight' ? 'yr-live-slide-right' :
                adData.headlineMotion === 'slideUp' ? 'yr-live-slide-up' : ''
              }`}
            >
              {adData.headline}
            </h3>
          )}

          {adData.showDescription && adData.description && (
            <p
              style={{
                color: adData.descColor || '#E5E7EB',
                textShadow: '0 1px 6px rgba(0,0,0,0.95)'
              }}
              className="text-[9.5px] text-gray-200 line-clamp-1 leading-normal font-normal"
            >
              {adData.description}
            </p>
          )}
        </div>

        <div className="pt-1 flex items-center justify-between border-t border-white/10 mt-0.5 flex-wrap gap-2 shrink-0">
          {adData.showPricing && (
            <div className="flex items-center gap-1 font-mono">
              <span className="text-xs font-black text-[#FFC500] drop-shadow">{adData.currentPrice} {adData.currency || 'YER'}</span>
              {adData.oldPrice && <span className="text-[9px] text-gray-400 line-through">{adData.oldPrice}</span>}
              {adData.discountPercentage && <span className="text-[8px] px-1 rounded bg-red-600 text-white font-bold">-{adData.discountPercentage}</span>}
            </div>
          )}

          {adData.showButton && (
            <a
              href={adData.targetUrl || '#'}
              target={adData.actionType === 'link' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              onClick={() => adsDatabaseService.recordClick(adData.id)}
              style={{
                backgroundColor: adData.btnBgColor || '#FFC500',
                color: adData.btnTextColor || '#000000',
                borderRadius: getBtnRadius()
              }}
              className={`px-3 py-1 font-black text-[11px] shadow-lg flex items-center gap-1 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 ${
                adData.btnAnimation === 'pulse' ? 'yr-live-pulse' :
                adData.btnAnimation === 'shimmer' ? 'yr-live-shimmer' : ''
              }`}
            >
              {adData.actionType === 'whatsapp' && <MessageCircle size={12} />}
              {adData.actionType === 'call' && <Phone size={12} />}
              <span>{adData.ctaText || 'اطلب الآن'}</span>
              <ArrowRight size={11} className="rtl:rotate-180" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
'''

with open("src/components/common/AdBanner.tsx", "w", encoding="utf-8") as f:
    f.write(ad_banner_clean)
print("✅ 1. تم تنظيف وبناء AdBanner.tsx بالكامل.")

# ========================================================
# 2. تحديث AdsManager.tsx (زر التعديل ✏️ ورسالة نجاح الحذف)
# ========================================================
with open("src/pages/admin/ads/AdsManager.tsx", "r", encoding="utf-8") as f:
    mgr = f.read()

# التأكد من استيراد useNavigate و Pencil
if "useNavigate" not in mgr:
    mgr = mgr.replace("import React,", "import { useNavigate } from 'react-router-dom';\nimport React,")
if "Pencil" not in mgr:
    mgr = mgr.replace("Trash2,", "Trash2, Pencil,")

# استدعاء useNavigate
if "const navigate = useNavigate();" not in mgr:
    mgr = re.sub(
        r'(export const AdsManager:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{)',
        r'\1\n  const navigate = useNavigate();',
        mgr
    )

# كود دالة الحذف ورسالة النجاح
old_del = r'const deleteAd = async \(id: string\) => \{.*?setDeleteSuccess\(null\), \d+\);\s*\};'
new_del = """const deleteAd = async (id: string) => {
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);
    try {
      localStorage.setItem('yr_published_ads', JSON.stringify(updated));
    } catch (_) {}
    try {
      await adsDatabaseService.deleteAd(id);
    } catch (e) {
      console.error(e);
    }
    setDeleteSuccess('✅ تم حذف الإعلان بنجاح من قاعدة البيانات ومن المنصة بالكامل!');
    setTimeout(() => setDeleteSuccess(null), 3500);
  };"""

mgr = re.sub(r'const deleteAd = async \(id: string\) => \{[\s\S]*?setDeleteSuccess\(null\), \d+\);\s*\};', new_del, mgr)

# إضافة زر التعديل ✏️ بجانب زر الحذف
edit_btn = """                    {/* زر تعديل الإعلان */}
                    <button
                      onClick={() => navigate(`/admin/ads/generator?editId=${ad.id}`)}
                      className="p-1.5 rounded-lg bg-[#FFC500]/15 text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all"
                      title="تعديل هذا الإعلان"
                    >
                      <Pencil size={15} />
                    </button>"""

if "editId=" not in mgr:
    mgr = mgr.replace(
        '<button onClick={() => deleteAd(ad.id)}',
        edit_btn + '\n                    <button onClick={() => deleteAd(ad.id)}'
    )

with open("src/pages/admin/ads/AdsManager.tsx", "w", encoding="utf-8") as f:
    f.write(mgr)
print("✅ 2. تم إضافة زر التعديل ✏️ ورسالة الحذف في AdsManager.tsx.")

# ========================================================
# 3. تحديث AdGeneratorStudio.tsx (معاينة الأزرار كاملة + خروج تلقائي + وضع التعديل)
# ========================================================
with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    std = f.read()

# التأكد من استيراد useNavigate و useSearchParams
if "useSearchParams" not in std:
    std = std.replace("import React,", "import { useNavigate, useSearchParams } from 'react-router-dom';\nimport React,")

# استدعاء useNavigate و searchParams
if "const [searchParams] = useSearchParams();" not in std:
    std = re.sub(
        r'(export const AdGeneratorStudio:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{)',
        r'\1\n  const navigate = useNavigate();\n  const [searchParams] = useSearchParams();\n  const editId = searchParams.get("editId");',
        std
    )

# كود جلب بيانات الإعلان عند التعديل
edit_fetch_code = """  useEffect(() => {
    if (editId) {
      const fetchAdDataForEdit = async () => {
        try {
          const allAds = await adsDatabaseService.getActiveAds();
          const target = allAds.find(a => String(a.id) === String(editId));
          if (target) {
            if (target.headline) setHeadline(target.headline);
            if (target.description) setDescription(target.description);
            if (target.mediaUrl) setMediaFileUrl(target.mediaUrl);
            if (target.mediaType) setMediaType(target.mediaType);
            if (target.ctaText) setCtaText(target.ctaText);
            if (target.targetUrl) setTargetUrl(target.targetUrl);
            if (target.btnBgColor) setBtnBgColor(target.btnBgColor);
            if (target.btnTextColor) setBtnTextColor(target.btnTextColor);
            if (target.btnShape) setBtnShape(target.btnShape);
            if (target.btnAnimation) setBtnAnimation(target.btnAnimation);
            if (target.currentPrice) setCurrentPrice(target.currentPrice);
            if (target.oldPrice) setOldPrice(target.oldPrice);
            if (target.showPricing !== undefined) setShowPricing(target.showPricing);
          }
        } catch (e) {
          console.error("Error loading ad:", e);
        }
      };
      fetchAdDataForEdit();
    }
  }, [editId]);"""

if "fetchAdDataForEdit" not in std:
    std = re.sub(
        r'(const editId = searchParams\.get\("editId"\);)',
        r'\1\n' + edit_fetch_code,
        std
    )

# استخدام نفس الـ ID عند التعديل + الخروج التلقائي بعد الحفظ
std = std.replace("id: `AD-${Date.now()}`", "id: editId || `AD-${Date.now()}`")

save_and_exit = """    setPublishedAlert(true);
    setTimeout(() => {
      setPublishedAlert(false);
      navigate('/admin/ads');
    }, 1500);"""

std = re.sub(
    r'setPublishedAlert\(true\);[\s\S]*?setTimeout\(\(\) => setPublishedAlert\(false\), \d+\);',
    save_and_exit,
    std
)

# ضبط حاوية المعاينة في الاستوديو بدون قص (min-h-[90px] h-auto مع shrink-0 على شريط الأزرار)
std = re.sub(r'min-h-\[[^\]]+\]\s*max-h-\[[^\]]+\]', 'min-h-[90px] h-auto', std)
std = std.replace(
    'className="relative z-20 pt-3 mt-2 flex justify-between items-center border-t border-white/10"',
    'className="relative z-20 pt-2 mt-1.5 flex justify-between items-center border-t border-white/10 shrink-0"'
)

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(std)
print("✅ 3. تم تحديث AdGeneratorStudio.tsx بنجاح.")
