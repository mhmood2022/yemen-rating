import React, { useState, useRef } from 'react';
import { 
  Sparkles, Smartphone, Tablet, Monitor, Image as ImageIcon, 
  Crop, Video, Upload, Layers, Eye, CheckCircle2, 
  ArrowRight, Trash2, Maximize2, Move, MessageCircle, Phone, 
  Link as LinkIcon, Calendar, Flame, Award, Clock, Type, Palette as PaletteIcon,
  Tag, QrCode, Star, ShieldCheck, DollarSign, Layout, Play, Sliders, Shield, AlertCircle
} from 'lucide-react';
import { YR_AD_PLACEMENTS } from '../../../utils/adGeneratorEngine';
import { adminAuditService } from '../../../services/adminService';

export interface PublishedAd {
  id: string;
  placementId: string;
  placementName: string;
  adCategoryType: 'image' | 'text_only' | 'image_text' | 'video' | 'discount' | 'service' | 'product' | 'event' | 'job';
  designTheme: 'pro' | 'modern' | 'luxury' | 'minimal' | 'bold' | 'formal' | 'youth' | 'marketing';
  layoutStyle: 'full_overlay' | 'image_left' | 'image_right' | 'image_top' | 'card' | 'text_only';
  adTier: 'basic' | 'professional' | 'premium';
  
  // الوسائط
  mediaUrl: string;
  mediaType: 'image' | 'video';
  imageFit: 'contain' | 'cover';
  useBlurBackground: boolean;
  imgPosX: number;
  imgPosY: number;
  imgScale: number;
  
  // الشعار
  showLogo: boolean;
  logoUrl: string;
  logoPosition: 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left';
  logoSize: number;

  // النصوص
  showBadge: boolean;
  badgeText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  
  showHeadline: boolean;
  headline: string;
  headlineColor: string;
  headlineFont: string;
  headlineSize: 'sm' | 'md' | 'lg' | 'xl';
  headlineWeight: 'normal' | 'medium' | 'bold';
  hasTextShadow: boolean;
  
  showDescription: boolean;
  description: string;
  descColor: string;
  descLines: 1 | 2 | 3 | 4;
  textAlign: 'right' | 'center' | 'left';
  textVerticalPos: 'top' | 'center' | 'bottom';

  // العناصر الإضافية والأسعار
  showPricing: boolean;
  currentPrice: string;
  oldPrice: string;
  discountPercentage: string;
  currency: string;
  showRating: boolean;
  ratingValue: number;
  showLocation: boolean;
  locationText: string;
  showVerifiedBadge: boolean;
  showQrCode: boolean;

  // ملصقات ترويجية
  promoSticker: 'none' | 'discount50' | 'verified_gold' | 'hot_deal' | 'limited' | 'exclusive';

  // الزر والتحويل
  showButton: boolean;
  ctaText: string;
  btnBgColor: string;
  btnTextColor: string;
  btnShape: 'rounded' | 'pill' | 'square';
  btnSize: 'sm' | 'md' | 'lg';
  btnAnimation: 'none' | 'shimmer' | 'pulse' | 'glow' | 'bounce';
  actionType: 'link' | 'whatsapp' | 'call' | 'internal';
  targetUrl: string;
  whatsappPhone: string;
  whatsappMessage: string;
  callPhone: string;

  // الاستهداف والجدولة
  targetCity: string;
  targetCategory: string;
  endDate: string;

  // الحركات المستقلة والأنماط
  motionPreset: 'calm' | 'balanced' | 'engaging' | 'custom';
  headlineMotion: 'none' | 'fadeIn' | 'slideRight' | 'slideLeft' | 'slideUp' | 'bounce' | 'pulse';
  descMotion: 'none' | 'fadeIn' | 'slideUp' | 'slideRight';
  btnMotion: 'none' | 'fadeIn' | 'slideUp' | 'bounce' | 'pulse' | 'shine';
  mediaMotion: 'none' | 'fadeIn' | 'kenBurns' | 'slowZoom';

  // شريط التمرير
  hasProgressBar: boolean;
  progressBarColor: string;
  progressDuration: number;

  // الحواف والمظهر
  hasBorder: boolean;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  hasGlow: boolean;
  bgColor: string;
  bgStyle: 'gradient' | 'solid' | 'transparent';
  brightness: number;
  contrast: number;
  imgOverlay: number;
  
  status: 'active' | 'paused' | 'archived';
  views: number;
  clicks: number;
  createdAt: string;
}

export const AdGeneratorStudio: React.FC = () => {
  // المستوى والأنماط
  const [adTier, setAdTier] = useState<'basic' | 'professional' | 'premium'>('professional');
  const [adCategoryType, setAdCategoryType] = useState<PublishedAd['adCategoryType']>('image_text');
  const [designTheme, setDesignTheme] = useState<PublishedAd['designTheme']>('modern');
  const [layoutStyle, setLayoutStyle] = useState<PublishedAd['layoutStyle']>('full_overlay');
  const [selectedPlacement, setSelectedPlacement] = useState(YR_AD_PLACEMENTS[0]);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [previewContext, setPreviewContext] = useState<'standalone' | 'home_feed' | 'search_results'>('standalone');

  // الوسائط
  const [mediaFileUrl, setMediaFileUrl] = useState<string>('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=85');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageFit, setImageFit] = useState<'contain' | 'cover'>('cover');
  const [useBlurBackground, setUseBlurBackground] = useState(true);
  const [imgPosX, setImgPosX] = useState(50);
  const [imgPosY, setImgPosY] = useState(50);
  const [imgScale, setImgScale] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [imgOverlay, setImgOverlay] = useState(25);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // الشعار
  const [showLogo, setShowLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPosition, setLogoPosition] = useState<PublishedAd['logoPosition']>('top_left');
  const [logoSize, setLogoSize] = useState(36);

  // النصوص والعناوين
  const [showBadge, setShowBadge] = useState(true);
  const [badgeText, setBadgeText] = useState('عرض خاص — يمن ريتنغ');
  const [badgeBgColor, setBadgeBgColor] = useState('rgba(255, 197, 0, 0.2)');
  const [badgeTextColor, setBadgeTextColor] = useState('#FFC500');

  const [showHeadline, setShowHeadline] = useState(true);
  const [headline, setHeadline] = useState('أحدث عروض يمن ريتنغ الحصرية');
  const [headlineColor, setHeadlineColor] = useState('#FFFFFF');
  const [headlineFont, setHeadlineFont] = useState('Cairo');
  const [headlineSize, setHeadlineSize] = useState<PublishedAd['headlineSize']>('lg');
  const [headlineWeight, setHeadlineWeight] = useState<PublishedAd['headlineWeight']>('bold');
  const [hasTextShadow, setHasTextShadow] = useState(true);

  const [showDescription, setShowDescription] = useState(true);
  const [description, setDescription] = useState('تغطية شاملة لأفضل الشركات الموثقة وخدمات رجال الأعمال مع خصومات حصرية.');
  const [descColor, setDescColor] = useState('#E5E7EB');
  const [descLines, setDescLines] = useState<PublishedAd['descLines']>(2);
  const [textAlign, setTextAlign] = useState<PublishedAd['textAlign']>('right');
  const [textVerticalPos, setTextVerticalPos] = useState<PublishedAd['textVerticalPos']>('bottom');

  // الأسعار والعناصر الإضافية
  const [showPricing, setShowPricing] = useState(false);
  const [currentPrice, setCurrentPrice] = useState('45,000');
  const [oldPrice, setOldPrice] = useState('60,000');
  const [discountPercentage, setDiscountPercentage] = useState('25%');
  const [currency, setCurrency] = useState('YER');
  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(4.9);
  const [showLocation, setShowLocation] = useState(false);
  const [locationText, setLocationText] = useState('صنعاء — شارع حدة');
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(true);
  const [showQrCode, setShowQrCode] = useState(false);
  const [promoSticker, setPromoSticker] = useState<PublishedAd['promoSticker']>('none');

  // الزر والتحويل
  const [showButton, setShowButton] = useState(true);
  const [ctaText, setCtaText] = useState('اطلب الآن');
  const [btnBgColor, setBtnBgColor] = useState('#FFC500');
  const [btnTextColor, setBtnTextColor] = useState('#000000');
  const [btnShape, setBtnShape] = useState<PublishedAd['btnShape']>('pill');
  const [btnSize, setBtnSize] = useState<PublishedAd['btnSize']>('md');
  const [btnAnimation, setBtnAnimation] = useState<PublishedAd['btnAnimation']>('shimmer');
  const [actionType, setActionType] = useState<PublishedAd['actionType']>('link');
  const [targetUrl, setTargetUrl] = useState('https://yemen-rating.com');
  const [whatsappPhone, setWhatsappPhone] = useState('967777000111');
  const [whatsappMessage, setWhatsappMessage] = useState('مرحباً، أرغب بالاستفسار عن العرض المعلن في منصة يمن ريتنغ');
  const [callPhone, setCallPhone] = useState('967777000111');

  // الاستهداف والجدولة
  const [targetCity, setTargetCity] = useState('كل المحافظات');
  const [targetCategory, setTargetCategory] = useState('الجميع');
  const [endDate, setEndDate] = useState('2026-12-31');

  // محرك الحركات
  const [motionPreset, setMotionPreset] = useState<PublishedAd['motionPreset']>('balanced');
  const [headlineMotion, setHeadlineMotion] = useState<PublishedAd['headlineMotion']>('slideRight');
  const [descMotion, setDescMotion] = useState<PublishedAd['descMotion']>('fadeIn');
  const [btnMotion, setBtnMotion] = useState<PublishedAd['btnMotion']>('bounce');
  const [mediaMotion, setMediaMotion] = useState<PublishedAd['mediaMotion']>('kenBurns');

  // شريط التمرير والحواف
  const [hasProgressBar, setHasProgressBar] = useState(true);
  const [progressBarColor, setProgressBarColor] = useState('#FFC500');
  const [progressDuration, setProgressDuration] = useState(8);
  const [hasBorder, setHasBorder] = useState(false);
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState('#FFC500');
  const [borderRadius, setBorderRadius] = useState(14);
  const [hasGlow, setHasGlow] = useState(false);
  const [bgColor, setBgColor] = useState('#0B0F17');
  const [bgStyle, setBgStyle] = useState<'gradient' | 'solid' | 'transparent'>('solid');

  const [activeTab, setActiveTab] = useState<'layout' | 'media' | 'typography' | 'pricing' | 'action' | 'motion' | 'colors' | 'border' | 'target'>('layout');
  const [publishedAlert, setPublishedAlert] = useState(false);

  // معالجة رفع الملفات
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);
      setMediaFileUrl(url);
      setMediaType(isVid ? 'video' : 'image');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUrl(URL.createObjectURL(file));
      setShowLogo(true);
    }
  };

  // تطبيق نمط الحركة المسبق
  const applyMotionPreset = (preset: 'calm' | 'balanced' | 'engaging' | 'custom') => {
    setMotionPreset(preset);
    if (preset === 'calm') {
      setHeadlineMotion('fadeIn');
      setDescMotion('fadeIn');
      setBtnMotion('none');
      setMediaMotion('none');
      setBtnAnimation('none');
    } else if (preset === 'balanced') {
      setHeadlineMotion('slideRight');
      setDescMotion('fadeIn');
      setBtnMotion('bounce');
      setMediaMotion('kenBurns');
      setBtnAnimation('shimmer');
    } else if (preset === 'engaging') {
      setHeadlineMotion('bounce');
      setDescMotion('slideUp');
      setBtnMotion('pulse');
      setMediaMotion('kenBurns');
      setBtnAnimation('pulse');
    }
  };

  // حفظ ونشر الإعلان
  const handleSaveAndPublish = () => {
    const finalTarget = actionType === 'whatsapp' 
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : actionType === 'call' ? `tel:${callPhone}` : targetUrl;

    const newAd: PublishedAd = {
      id: `AD-${Date.now()}`,
      placementId: selectedPlacement.id,
      placementName: selectedPlacement.name,
      adCategoryType,
      designTheme,
      layoutStyle,
      adTier,
      mediaUrl: mediaFileUrl,
      mediaType,
      imageFit,
      useBlurBackground,
      imgPosX,
      imgPosY,
      imgScale,
      showLogo,
      logoUrl,
      logoPosition,
      logoSize,
      showBadge,
      badgeText,
      badgeBgColor,
      badgeTextColor,
      showHeadline,
      headline,
      headlineColor,
      headlineFont,
      headlineSize,
      headlineWeight,
      hasTextShadow,
      showDescription,
      description,
      descColor,
      descLines,
      textAlign,
      textVerticalPos,
      showPricing,
      currentPrice,
      oldPrice,
      discountPercentage,
      currency,
      showRating,
      ratingValue,
      showLocation,
      locationText,
      showVerifiedBadge,
      showQrCode,
      promoSticker,
      showButton,
      ctaText,
      btnBgColor,
      btnTextColor,
      btnShape,
      btnSize,
      btnAnimation,
      actionType,
      targetUrl: finalTarget,
      whatsappPhone,
      whatsappMessage,
      callPhone,
      targetCity,
      targetCategory,
      endDate,
      motionPreset,
      headlineMotion,
      descMotion,
      btnMotion,
      mediaMotion,
      hasProgressBar,
      progressBarColor,
      progressDuration,
      hasBorder,
      borderWidth,
      borderColor,
      borderRadius,
      hasGlow,
      bgColor,
      bgStyle,
      brightness,
      contrast,
      imgOverlay,
      status: 'active',
      views: 1,
      clicks: 0,
      createdAt: new Date().toLocaleDateString('ar-YE')
    };

    const existing = JSON.parse(localStorage.getItem('yr_published_ads') || '[]');
    localStorage.setItem('yr_published_ads', JSON.stringify([newAd, ...existing]));
    adminAuditService.logAction('نشر إعلان كامل المواصفات مع الحركات والأسعار', 'ad_campaign', newAd.id, { headline, layoutStyle, adTier });

    setPublishedAlert(true);
    setTimeout(() => setPublishedAlert(false), 4000);
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif] pb-16">
      
      {/* 1. المعاينة المباشرة التفاعلية في الأعلى */}
      <div className="sticky top-16 z-30 bg-[#070A10]/95 backdrop-blur-md p-4 rounded-2xl border border-[#1F2937] shadow-2xl">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
            <span className="text-xs font-black text-white">المعاينة الحية الفورية (Live Render Studio)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              adTier === 'premium' ? 'bg-[#FFC500]/20 text-[#FFC500] border border-[#FFC500]/30' :
              adTier === 'professional' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {adTier.toUpperCase()}
            </span>
          </div>

          {/* محدد حجم الجهاز وسياق المعاينة */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#161D2B] p-1 rounded-xl">
              <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded-lg text-xs ${viewMode === 'mobile' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}><Smartphone size={14} /></button>
              <button onClick={() => setViewMode('tablet')} className={`p-1.5 rounded-lg text-xs ${viewMode === 'tablet' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}><Tablet size={14} /></button>
              <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded-lg text-xs ${viewMode === 'desktop' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}><Monitor size={14} /></button>
            </div>
          </div>
        </div>

        {/* جسم الإعلان الحي التفاعلي */}
        <div className="w-full flex justify-center overflow-x-auto py-1">
          <div className={`w-full transition-all duration-300 ${viewMode === 'mobile' ? 'max-w-[390px]' : viewMode === 'tablet' ? 'max-w-[560px]' : 'max-w-[850px]'}`}>
            <div
              style={{
                borderRadius: `${borderRadius}px`,
                border: hasBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
                backgroundColor: bgStyle === 'transparent' ? 'transparent' : bgColor,
                backgroundImage: bgStyle === 'gradient' ? `linear-gradient(135deg, ${bgColor} 0%, #161D2B 100%)` : 'none',
                boxShadow: hasGlow && hasBorder ? `0 0 25px ${borderColor}40` : 'none',
              }}
              className={`relative overflow-hidden w-full min-h-[160px] flex transition-all ${
                layoutStyle === 'image_left' ? 'flex-row-reverse items-center p-3' :
                layoutStyle === 'image_right' ? 'flex-row items-center p-3' :
                layoutStyle === 'image_top' ? 'flex-col p-3' : 'flex-col justify-between'
              }`}
            >
              {/* شريط التمرير الزمني */}
              {hasProgressBar && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
                  <div 
                    style={{ 
                      backgroundColor: progressBarColor,
                      animation: `yrAdProgress ${progressDuration}s linear infinite`
                    }}
                    className="h-full w-full origin-left"
                  />
                </div>
              )}

              {/* الوسائط مع حركات Ken Burns أو Zoom */}
              {mediaFileUrl && layoutStyle !== 'text_only' && (
                <div className={`overflow-hidden flex items-center justify-center ${
                  layoutStyle === 'image_left' || layoutStyle === 'image_right' ? 'w-1/3 h-28 rounded-xl shrink-0 relative z-10' :
                  layoutStyle === 'image_top' ? 'w-full h-36 rounded-xl shrink-0 relative z-10 mb-3' : 'absolute inset-0 z-0'
                }`}>
                  {imageFit === 'contain' && useBlurBackground && mediaType === 'image' && layoutStyle === 'full_overlay' && (
                    <img src={mediaFileUrl} alt="Blur" className="absolute inset-0 w-full h-full object-cover blur-lg scale-125 opacity-50" />
                  )}

                  {mediaType === 'video' ? (
                    <video src={mediaFileUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={mediaFileUrl} 
                      alt="Ad" 
                      style={{ 
                        objectFit: imageFit,
                        objectPosition: `${imgPosX}% ${imgPosY}%`,
                        transform: `scale(${imgScale / 100})`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        imageRendering: 'crisp-edges'
                      }}
                      className={`w-full h-full relative z-10 transition-all duration-300 ${mediaMotion === 'kenBurns' ? 'yr-anim-kenburns' : ''}`} 
                    />
                  )}
                  {imgOverlay > 0 && layoutStyle === 'full_overlay' && (
                    <div className="absolute inset-0 bg-black z-10" style={{ opacity: imgOverlay / 100 }} />
                  )}
                </div>
              )}

              {/* الشعار المرفوع (Logo) */}
              {showLogo && logoUrl && (
                <div className={`absolute z-30 p-2 ${
                  logoPosition === 'top_left' ? 'top-2 left-2' :
                  logoPosition === 'top_right' ? 'top-2 right-2' :
                  logoPosition === 'bottom_left' ? 'bottom-2 left-2' : 'bottom-2 right-2'
                }`}>
                  <img src={logoUrl} alt="Logo" style={{ width: `${logoSize}px`, height: `${logoSize}px` }} className="object-contain rounded-lg drop-shadow-md" />
                </div>
              )}

              {/* الملصق الترويجي */}
              {promoSticker !== 'none' && (
                <div className="absolute top-3 left-3 z-30 animate-bounce">
                  {promoSticker === 'discount50' && <span className="px-2.5 py-1 rounded-xl bg-[#DC2626] text-white text-[11px] font-black shadow-lg">خصم 50% 🔥</span>}
                  {promoSticker === 'verified_gold' && <span className="px-2.5 py-1 rounded-xl bg-[#FFC500] text-black text-[11px] font-black shadow-lg flex items-center gap-1"><Award size={13} /> موثق ذهبي</span>}
                  {promoSticker === 'hot_deal' && <span className="px-2.5 py-1 rounded-xl bg-orange-600 text-white text-[11px] font-black shadow-lg flex items-center gap-1"><Flame size={13} /> عرض ناري</span>}
                  {promoSticker === 'limited' && <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-black text-[11px] font-black shadow-lg flex items-center gap-1"><Clock size={13} /> لفترة محدودة</span>}
                  {promoSticker === 'exclusive' && <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-[11px] font-black shadow-lg">⭐ حصري</span>}
                </div>
              )}

              {/* كتلة المحتوى والنصوص والأسعار */}
              <div className={`relative z-20 p-4 space-y-2 flex-1 ${textAlign === 'center' ? 'text-center' : textAlign === 'left' ? 'text-left' : 'text-right'}`}>
                {showBadge && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span style={{ backgroundColor: badgeBgColor, color: badgeTextColor, borderColor: badgeTextColor }} className="px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-block backdrop-blur-sm">
                      {badgeText}
                    </span>
                    {showVerifiedBadge && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 text-[10px] font-bold">
                        <ShieldCheck size={12} /> موثّق YR
                      </span>
                    )}
                  </div>
                )}

                {showHeadline && (
                  <h3 
                    style={{ 
                      color: headlineColor, 
                      fontFamily: headlineFont,
                      textShadow: hasTextShadow ? '0 2px 10px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' : 'none'
                    }} 
                    className={`leading-tight ${
                      headlineSize === 'xl' ? 'text-lg sm:text-xl font-black' :
                      headlineSize === 'lg' ? 'text-base sm:text-lg font-black' :
                      headlineSize === 'md' ? 'text-sm sm:text-base font-bold' : 'text-xs sm:text-sm font-semibold'
                    } ${headlineMotion === 'slideRight' ? 'yr-slide-right' : headlineMotion === 'bounce' ? 'yr-bounce-soft' : ''}`}
                  >
                    {headline}
                  </h3>
                )}

                {showDescription && (
                  <p 
                    style={{ 
                      color: descColor,
                      textShadow: hasTextShadow ? '0 1px 6px rgba(0,0,0,0.9)' : 'none'
                    }} 
                    className={`text-xs text-gray-200 mt-1 leading-relaxed ${descLines === 1 ? 'line-clamp-1' : descLines === 2 ? 'line-clamp-2' : descLines === 3 ? 'line-clamp-3' : ''}`}
                  >
                    {description}
                  </p>
                )}

                {/* شريط الأسعار والتقييم */}
                {(showPricing || showRating || showLocation) && (
                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    {showPricing && (
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-sm font-black text-[#FFC500]">{currentPrice} {currency}</span>
                        {oldPrice && <span className="text-xs text-gray-400 line-through">{oldPrice}</span>}
                        {discountPercentage && <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">-{discountPercentage}</span>}
                      </div>
                    )}
                    {showRating && (
                      <span className="flex items-center gap-1 text-[11px] text-[#FFC500] font-bold">
                        <Star size={13} fill="#FFC500" /> {ratingValue}
                      </span>
                    )}
                    {showLocation && (
                      <span className="text-[10px] text-gray-300 font-medium">📍 {locationText}</span>
                    )}
                  </div>
                )}
              </div>

              {/* زر الإجراء الذكي و QR Code */}
              {(showButton || showQrCode) && (
                <div className="relative z-20 p-4 pt-0 flex justify-between items-center border-t border-white/10 mt-2">
                  {showButton ? (
                    <button 
                      style={{ backgroundColor: btnBgColor, color: btnTextColor }} 
                      className={`font-black shadow-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 ${
                        btnShape === 'pill' ? 'rounded-full' : btnShape === 'square' ? 'rounded-none' : 'rounded-xl'
                      } ${
                        btnSize === 'lg' ? 'px-5 py-2.5 text-sm' : btnSize === 'md' ? 'px-4 py-2 text-xs' : 'px-3 py-1.5 text-[11px]'
                      } ${btnAnimation === 'pulse' ? 'yr-glow-pulse' : btnAnimation === 'shimmer' ? 'yr-btn-shine' : ''}`}
                    >
                      {actionType === 'whatsapp' && <MessageCircle size={14} />}
                      {actionType === 'call' && <Phone size={14} />}
                      <span>{ctaText}</span>
                      <ArrowRight size={13} className="rtl:rotate-180" />
                    </button>
                  ) : <div />}

                  {showQrCode && (
                    <div className="bg-white p-1 rounded-lg shrink-0" title="QR Code للطلب السريع">
                      <QrCode size={28} className="text-black" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {publishedAlert && (
        <div className="p-4 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#16A34A]" />
            <span>تم حفظ ونشر الإعلان بنجاح مع كافة الخصائص والحركات المختارة!</span>
          </div>
          <a href="/admin/ads" className="px-3 py-1.5 rounded-lg bg-[#FFC500] text-black font-black text-xs">مشاهدة المعرض</a>
        </div>
      )}

      {/* 2. شريط المواضع الـ 10 ومستويات الإعلان */}
      <div className="bg-[#0B0F17] p-4 rounded-2xl border border-[#1F2937] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold text-[#FFC500]">موضع العرض في المنصة:</label>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#9CA3AF]">مستوى الإعلان:</span>
            {(['basic', 'professional', 'premium'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setAdTier(tier)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  adTier === tier ? 'bg-[#FFC500] text-black' : 'bg-[#161D2B] text-[#9CA3AF]'
                }`}
              >
                {tier === 'basic' ? 'بسيط' : tier === 'professional' ? 'احترافي' : 'فاخر VIP'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {YR_AD_PLACEMENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlacement(p)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPlacement.id === p.id ? 'bg-[#FFC500] text-black border-[#FFC500] shadow-md' : 'bg-[#161D2B] text-[#9CA3AF] border-[#1F2937]'
              }`}
            >
              #{p.id} {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. شريط أدوات الاستوديو الشامل */}
      <div className="bg-[#0B0F17] p-5 rounded-2xl border border-[#1F2937] space-y-5">
        
        {/* التبويبات المكتملة */}
        <div className="flex gap-1 overflow-x-auto pb-1 p-1 bg-[#161D2B] rounded-xl border border-[#1F2937] text-xs font-black custom-scrollbar">
          {[
            { id: 'layout', label: 'التخطيط والنوع' },
            { id: 'media', label: 'الصور والشعار' },
            { id: 'typography', label: 'النصوص والخطوط' },
            { id: 'pricing', label: 'الأسعار والتقييم' },
            { id: 'action', label: 'الزر والتحويل' },
            { id: 'motion', label: 'الحركات Animation' },
            { id: 'colors', label: 'الألوان والسمة' },
            { id: 'border', label: 'الحواف والظل' },
            { id: 'target', label: 'الاستهداف' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 px-3 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-[#FFC500] text-black shadow-md' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* تبويب 1: التخطيط والنوع والنمط */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#FFC500] block mb-1.5">نوع الإعلان (Ad Type):</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'image_text', label: 'صورة + نص' },
                  { id: 'image', label: 'إعلان صورة' },
                  { id: 'text_only', label: 'إعلان نصي' },
                  { id: 'video', label: 'إعلان فيديو' },
                  { id: 'discount', label: 'عرض / خصم' },
                  { id: 'service', label: 'إعلان خدمة' },
                  { id: 'product', label: 'إعلان منتج' },
                  { id: 'event', label: 'مناسبة وفعالية' },
                  { id: 'job', label: 'إعلان توظيف' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setAdCategoryType(type.id as any);
                      if (type.id === 'discount') setShowPricing(true);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      adCategoryType === type.id ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#161D2B] text-[#9CA3AF] border-[#1F2937]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#FFC500] block mb-1.5">تخطيط الإعلان (Layout):</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'full_overlay', label: 'صورة كاملة + نص فوقها' },
                  { id: 'image_right', label: 'صورة يمين + نص يسار' },
                  { id: 'image_left', label: 'صورة يسار + نص يمين' },
                  { id: 'image_top', label: 'صورة بالأعلى + نص أسفلها' },
                  { id: 'text_only', label: 'نص فقط وبطاقة' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLayoutStyle(l.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      layoutStyle === l.id ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#161D2B] text-[#9CA3AF] border-[#1F2937]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#FFC500] block mb-1.5">نمط التصميم (Theme):</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[
                  { id: 'pro', label: 'احترافي' },
                  { id: 'modern', label: 'عصري' },
                  { id: 'luxury', label: 'فاخر' },
                  { id: 'minimal', label: 'بسيط' },
                  { id: 'bold', label: 'جريء' },
                  { id: 'formal', label: 'رسمي' },
                  { id: 'youth', label: 'شبابي' },
                  { id: 'marketing', label: 'تسويقي' },
                ].map(th => (
                  <button
                    key={th.id}
                    onClick={() => setDesignTheme(th.id as any)}
                    className={`py-2 px-1 rounded-lg border text-[11px] font-bold transition-all ${
                      designTheme === th.id ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#161D2B] text-[#9CA3AF] border-[#1F2937]'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* تبويب 2: الوسائط والشعار */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white block mb-2">تحميل صورة أو فيديو الإعلان:</label>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 px-4 rounded-xl bg-[#161D2B] border-2 border-dashed border-[#FFC500] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={16} className="text-[#FFC500]" />
                  <span>تحميل وسائط من الهاتف</span>
                </button>
                {mediaFileUrl && (
                  <button onClick={() => setMediaFileUrl('')} className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* الشعار Logo */}
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">إظهار شعار المنشأة (Logo)</span>
                <button onClick={() => setShowLogo(!showLogo)} className={`px-3 py-1 rounded-lg text-xs font-bold ${showLogo ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {showLogo ? 'مفعل' : 'معطل'}
                </button>
              </div>
              {showLogo && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#1F2937]">
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <button onClick={() => logoInputRef.current?.click()} className="py-2 px-3 rounded-lg bg-[#0B0F17] border border-[#1F2937] text-xs text-[#FFC500] font-bold">
                    رفع الشعار
                  </button>
                  <select value={logoPosition} onChange={(e) => setLogoPosition(e.target.value as any)} className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                    <option value="top_left">أعلى اليسار</option>
                    <option value="top_right">أعلى اليمين</option>
                    <option value="bottom_left">أسفل اليسار</option>
                    <option value="bottom_right">أسفل اليمين</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[#9CA3AF]">الحجم: {logoSize}px</label>
                    <input type="range" min="20" max="64" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                  </div>
                </div>
              )}
            </div>

            {/* قص وتموضع وفلاتر */}
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setImageFit('contain'); setImgScale(100); }} className={`p-2.5 rounded-xl border text-xs font-bold ${imageFit === 'contain' ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#0B0F17] text-white border-[#1F2937]'}`}>
                  عرض كامل الصورة
                </button>
                <button onClick={() => setImageFit('cover')} className={`p-2.5 rounded-xl border text-xs font-bold ${imageFit === 'cover' ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#0B0F17] text-white border-[#1F2937]'}`}>
                  ملء واقتصاص مخصص
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#9CA3AF] block mb-1">التقريب (Zoom): {imgScale}%</label>
                  <input type="range" min="100" max="250" value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
                <div>
                  <label className="text-[11px] text-[#9CA3AF] block mb-1">إزاحة أفقية X: {imgPosX}%</label>
                  <input type="range" min="0" max="100" value={imgPosX} onChange={(e) => setImgPosX(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
                <div>
                  <label className="text-[11px] text-[#9CA3AF] block mb-1">إزاحة رأسية Y: {imgPosY}%</label>
                  <input type="range" min="0" max="100" value={imgPosY} onChange={(e) => setImgPosY(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تبويب 3: النصوص والخطوط والمحاذاة */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">العنوان الرئيسي</span>
                <button onClick={() => setShowHeadline(!showHeadline)} className={`px-2.5 py-0.5 rounded text-xs font-bold ${showHeadline ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {showHeadline ? 'مفعل' : 'معطل'}
                </button>
              </div>
              {showHeadline && (
                <div className="space-y-2">
                  <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full bg-[#0B0F17] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-bold" />
                  <div className="grid grid-cols-3 gap-2">
                    <select value={headlineSize} onChange={(e) => setHeadlineSize(e.target.value as any)} className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                      <option value="sm">حجم صغير</option>
                      <option value="md">حجم متوسط</option>
                      <option value="lg">حجم كبير</option>
                      <option value="xl">حجم ضخم</option>
                    </select>
                    <select value={headlineWeight} onChange={(e) => setHeadlineWeight(e.target.value as any)} className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                      <option value="normal">خط عادي</option>
                      <option value="medium">خط متوسط</option>
                      <option value="bold">خط عريض</option>
                    </select>
                    <div className="flex items-center gap-1 bg-[#0B0F17] border border-[#1F2937] px-2 rounded-lg">
                      <input type="color" value={headlineColor} onChange={(e) => setHeadlineColor(e.target.value)} className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer" />
                      <span className="text-[10px] text-[#9CA3AF]">لون العنوان</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">نص الوصف</span>
                <button onClick={() => setShowDescription(!showDescription)} className={`px-2.5 py-0.5 rounded text-xs font-bold ${showDescription ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {showDescription ? 'مفعل' : 'معطل'}
                </button>
              </div>
              {showDescription && (
                <div className="space-y-2">
                  <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0B0F17] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white" />
                  <div className="grid grid-cols-3 gap-2">
                    <select value={descLines} onChange={(e) => setDescLines(Number(e.target.value) as any)} className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                      <option value={1}>سطر واحد</option>
                      <option value={2}>سطران</option>
                      <option value={3}>3 أسطر</option>
                      <option value={4}>4 أسطر</option>
                    </select>
                    <select value={textAlign} onChange={(e) => setTextAlign(e.target.value as any)} className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                      <option value="right">محاذاة يمين (افتراضي)</option>
                      <option value="center">محاذاة وسط</option>
                      <option value="left">محاذاة يسار</option>
                    </select>
                    <div className="flex items-center gap-1 bg-[#0B0F17] border border-[#1F2937] px-2 rounded-lg">
                      <input type="color" value={descColor} onChange={(e) => setDescColor(e.target.value)} className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer" />
                      <span className="text-[10px] text-[#9CA3AF]">لون الوصف</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* تبويب 4: الأسعار والتقييم والعناصر الإضافية */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">عرض الأسعار ونسبة الخصم</span>
                <button onClick={() => setShowPricing(!showPricing)} className={`px-2.5 py-0.5 rounded text-xs font-bold ${showPricing ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {showPricing ? 'مفعل' : 'معطل'}
                </button>
              </div>
              {showPricing && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input type="text" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} placeholder="السعر الحالي..." className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white" />
                  <input type="text" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="السعر القديم..." className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white" />
                  <input type="text" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} placeholder="نسبة الخصم %..." className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white" />
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار (USD)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
                <span className="text-xs text-white font-bold">تقييم النجوم ⭐</span>
                <button onClick={() => setShowRating(!showRating)} className={`px-2 py-0.5 rounded text-xs font-bold ${showRating ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {showRating ? 'مفعل' : 'معطل'}
                </button>
              </div>

              <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
                <span className="text-xs text-white font-bold">شارة موثّق YR</span>
                <button onClick={() => setShowVerifiedBadge(!showVerifiedBadge)} className={`px-2 py-0.5 rounded text-xs font-bold ${showVerifiedBadge ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {showVerifiedBadge ? 'مفعل' : 'معطل'}
                </button>
              </div>

              <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
                <span className="text-xs text-white font-bold">رمز QR للطلب</span>
                <button onClick={() => setShowQrCode(!showQrCode)} className={`px-2 py-0.5 rounded text-xs font-bold ${showQrCode ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {showQrCode ? 'مفعل' : 'معطل'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* تبويب 5: زر CTA والتحويل الذكي */}
        {activeTab === 'action' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">إعدادات الزر (CTA Button)</span>
                <button onClick={() => setShowButton(!showButton)} className={`px-2.5 py-0.5 rounded text-xs font-bold ${showButton ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                  {showButton ? 'مفعل' : 'معطل'}
                </button>
              </div>
              {showButton && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <select value={btnShape} onChange={(e) => setBtnShape(e.target.value as any)} className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                      <option value="pill">شكل كبسولة دائرية</option>
                      <option value="rounded">مستطيل بحواف ناعمة</option>
                      <option value="square">مستطيل كلاسيكي</option>
                    </select>
                    <select value={btnSize} onChange={(e) => setBtnSize(e.target.value as any)} className="bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                      <option value="sm">حجم صغير</option>
                      <option value="md">حجم متوسط</option>
                      <option value="lg">حجم كبير</option>
                    </select>
                    <div className="flex items-center gap-1 bg-[#0B0F17] border border-[#1F2937] px-2 rounded-lg">
                      <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer" />
                      <span className="text-[10px] text-[#9CA3AF]">خلفية الزر</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#0B0F17] border border-[#1F2937] px-2 rounded-lg">
                      <input type="color" value={btnTextColor} onChange={(e) => setBtnTextColor(e.target.value)} className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer" />
                      <span className="text-[10px] text-[#9CA3AF]">لون النص</span>
                    </div>
                  </div>

                  {/* نصوص جاهزة سريعة */}
                  <div>
                    <label className="text-[11px] text-[#9CA3AF] block mb-1">نصوص جاهزة سريعة للزر:</label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                      {['اتصل الآن', 'واتساب', 'احجز الآن', 'اطلب الآن', 'اعرف المزيد', 'زيارة الصفحة', 'إرسال رسالة'].map(text => (
                        <button
                          key={text}
                          onClick={() => {
                            setCtaText(text);
                            if (text === 'واتساب') setActionType('whatsapp');
                            if (text === 'اتصل الآن') setActionType('call');
                          }}
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-[#0B0F17] border border-[#1F2937] text-[11px] text-white hover:border-[#FFC500]"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* تبويب 6: محرك الحركات Animation */}
        {activeTab === 'motion' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-2">
              <label className="text-xs font-bold text-[#FFC500] block">أنماط الحركات الجاهزة:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'calm', label: 'هادئ (بسيط واحترافي)' },
                  { id: 'balanced', label: 'متوازن (واضح وأنيق)' },
                  { id: 'engaging', label: 'جذاب (لفت انتباه ناعم)' },
                  { id: 'custom', label: 'مخصص (لكل عنصر)' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => applyMotionPreset(m.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      motionPreset === m.id ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#0B0F17] text-[#9CA3AF] border-[#1F2937]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* الحركات المخصصة لكل عنصر */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <div>
                <label className="text-xs text-white font-bold block mb-1">حركة العنوان الرئيسي:</label>
                <select value={headlineMotion} onChange={(e) => setHeadlineMotion(e.target.value as any)} className="w-full bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                  <option value="none">بدون حركة</option>
                  <option value="fadeIn">Fade In تدريجي</option>
                  <option value="slideRight">Slide From Right (انزلاق من اليمين)</option>
                  <option value="slideLeft">Slide From Left (انزلاق من اليسار)</option>
                  <option value="slideUp">Slide From Bottom (انزلاق من الأسفل)</option>
                  <option value="bounce">Bounce خفيف</option>
                  <option value="pulse">Pulse نبض</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white font-bold block mb-1">حركة زر الإجراء CTA:</label>
                <select value={btnAnimation} onChange={(e) => setBtnAnimation(e.target.value as any)} className="w-full bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                  <option value="none">ثابت عادي</option>
                  <option value="shimmer">لمعان متحرك (Shine / Shimmer)</option>
                  <option value="pulse">نبضة متكررة (Pulse)</option>
                  <option value="glow">إضاءة وتوهج (Glow)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white font-bold block mb-1">حركة الصورة / الخلفية:</label>
                <select value={mediaMotion} onChange={(e) => setMediaMotion(e.target.value as any)} className="w-full bg-[#0B0F17] border border-[#1F2937] rounded-lg p-2 text-xs text-white">
                  <option value="none">ثابتة بدون حركة</option>
                  <option value="kenBurns">Ken Burns (تكبير بطيء وسلس)</option>
                  <option value="fadeIn">Fade In</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white font-bold block mb-1">شريط تقدم الإعلان الزمني:</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={progressBarColor} onChange={(e) => setProgressBarColor(e.target.value)} className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer" />
                  <input type="range" min="3" max="25" value={progressDuration} onChange={(e) => setProgressDuration(Number(e.target.value))} className="flex-1 accent-[#FFC500]" />
                  <span className="text-xs font-mono text-white">{progressDuration}s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تبويب 7: الألوان والسمة */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">خلفية الإعلان</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
            </div>
            <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">لون العنوان</label>
              <input type="color" value={headlineColor} onChange={(e) => setHeadlineColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
            </div>
            <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">لون الوصف</label>
              <input type="color" value={descColor} onChange={(e) => setDescColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
            </div>
            <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">خلفية الزر</label>
              <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
            </div>
          </div>
        )}

        {/* تبويب 8: الحواف والإطار */}
        {activeTab === 'border' && (
          <div className="space-y-3">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <span className="text-xs font-bold text-white">تفعيل الإطار والحواف</span>
              <button onClick={() => setHasBorder(!hasBorder)} className={`px-3 py-1 rounded-lg text-xs font-bold ${hasBorder ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}>
                {hasBorder ? 'مفعل' : 'ملغي (صافي)'}
              </button>
            </div>
            {hasBorder && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">السماكة: {borderWidth}px</label>
                  <input type="range" min="1" max="8" value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">انحناء الحواف: {borderRadius}px</label>
                  <input type="range" min="0" max="32" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">لون الإطار</label>
                  <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* تبويب 9: الاستهداف والجدولة */}
        {activeTab === 'target' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[#9CA3AF] block mb-1 font-bold">المدينة المستهدفة</label>
              <select value={targetCity} onChange={(e) => setTargetCity(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white">
                <option value="كل المحافظات">كل المحافظات</option>
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="حضرموت">حضرموت - المكلا</option>
                <option value="تعز">تعز</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] block mb-1 font-bold">القسم المستهدف</label>
              <select value={targetCategory} onChange={(e) => setTargetCategory(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white">
                <option value="الجميع">جميع الأقسام</option>
                <option value="عقارات">عقارات</option>
                <option value="مزادات">مزادات</option>
                <option value="وظائف">وظائف</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] block mb-1 font-bold">تاريخ الانتهاء</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono" />
            </div>
          </div>
        )}

        {/* زر الحفظ والنشر النهائي */}
        <button
          onClick={handleSaveAndPublish}
          className="w-full py-4 rounded-xl bg-[#FFC500] text-black font-black text-sm hover:bg-[#FFC500]/90 transition-all shadow-xl shadow-[#FFC500]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Sparkles size={18} />
          <span>حفظ ونشر الإعلان فوراً في المعرض المرئي</span>
        </button>
      </div>

    </div>
  );
};
