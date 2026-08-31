import React, { useState, useRef } from 'react';
import { 
  Sparkles, Smartphone, Tablet, Monitor, Image as ImageIcon, 
  Crop, Video, Upload, Layers, Eye, CheckCircle2, 
  ArrowRight, Trash2, Maximize2, Move, MessageCircle, Phone, 
  Link as LinkIcon, Calendar, Flame, Award, Clock, Type, Palette as PaletteIcon
} from 'lucide-react';
import { YR_AD_PLACEMENTS } from '../../../utils/adGeneratorEngine';
import { adminAuditService } from '../../../services/adminService';

export interface PublishedAd {
  id: string;
  placementId: string;
  placementName: string;
  adType: 'image' | 'video' | 'animated' | 'ticker';
  mediaUrl: string;
  mediaType: 'image' | 'video';
  imageFit: 'contain' | 'cover';
  useBlurBackground: boolean;
  imgPosX: number;
  imgPosY: number;
  imgScale: number;
  // عناصر الإعلان
  showBadge: boolean;
  badgeText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  showHeadline: boolean;
  headline: string;
  headlineColor: string;
  headlineFont: string;
  hasTextShadow: boolean;
  showDescription: boolean;
  description: string;
  descColor: string;
  // ملصقات ترويجية
  promoSticker: 'none' | 'discount50' | 'verified_gold' | 'hot_deal' | 'limited' | 'exclusive';
  // التحويل والزر الذكي
  showButton: boolean;
  ctaText: string;
  btnBgColor: string;
  btnTextColor: string;
  btnAnimation: 'none' | 'shimmer' | 'pulse' | 'glow';
  actionType: 'link' | 'whatsapp' | 'call' | 'internal';
  targetUrl: string;
  whatsappPhone: string;
  whatsappMessage: string;
  callPhone: string;
  // الاستهداف والجدولة
  targetCity: string;
  targetCategory: string;
  endDate: string;
  // شريط التمرير
  hasProgressBar: boolean;
  progressBarColor: string;
  progressDuration: number;
  // الحواف
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
  const [selectedPlacement, setSelectedPlacement] = useState(YR_AD_PLACEMENTS[0]);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [adType, setAdType] = useState<'image' | 'video' | 'animated' | 'ticker'>('image');

  // الوسائط والقص
  const [mediaFileUrl, setMediaFileUrl] = useState<string>('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=85');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageFit, setImageFit] = useState<'contain' | 'cover'>('cover');
  const [useBlurBackground, setUseBlurBackground] = useState(true);
  const [imgPosX, setImgPosX] = useState(50);
  const [imgPosY, setImgPosY] = useState(50);
  const [imgScale, setImgScale] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [imgOverlay, setImgOverlay] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // العناصر
  const [showBadge, setShowBadge] = useState(false);
  const [badgeText, setBadgeText] = useState('إعلان ممول');
  const [badgeBgColor, setBadgeBgColor] = useState('rgba(255, 197, 0, 0.2)');
  const [badgeTextColor, setBadgeTextColor] = useState('#FFC500');

  const [showHeadline, setShowHeadline] = useState(true);
  const [headline, setHeadline] = useState('أحدث عروض يمن ريتنغ الحصرية');
  const [headlineColor, setHeadlineColor] = useState('#FFFFFF');
  const [headlineFont, setHeadlineFont] = useState('Cairo');
  const [hasTextShadow, setHasTextShadow] = useState(true);

  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState('تخفيضات كبرى على جميع الخدمات والأنشطة التجارية في اليمن.');
  const [descColor, setDescColor] = useState('#E5E7EB');

  // ملصقات وشارات ترويجية
  const [promoSticker, setPromoSticker] = useState<'none' | 'discount50' | 'verified_gold' | 'hot_deal' | 'limited' | 'exclusive'>('none');

  // الزر والتحويل الذكي
  const [showButton, setShowButton] = useState(true);
  const [ctaText, setCtaText] = useState('اطلب الآن');
  const [btnBgColor, setBtnBgColor] = useState('#FFC500');
  const [btnTextColor, setBtnTextColor] = useState('#000000');
  const [btnAnimation, setBtnAnimation] = useState<'none' | 'shimmer' | 'pulse' | 'glow'>('shimmer');
  const [actionType, setActionType] = useState<'link' | 'whatsapp' | 'call' | 'internal'>('link');
  const [targetUrl, setTargetUrl] = useState('https://yemen-rating.com');
  const [whatsappPhone, setWhatsappPhone] = useState('967777000111');
  const [whatsappMessage, setWhatsappMessage] = useState('مرحباً، أرغب بالاستفسار عن العرض المعلن في منصة يمن ريتنغ');
  const [callPhone, setCallPhone] = useState('967777000111');

  // الاستهداف والجدولة
  const [targetCity, setTargetCity] = useState('كل المحافظات');
  const [targetCategory, setTargetCategory] = useState('الجميع');
  const [endDate, setEndDate] = useState('2026-12-31');

  // شريط التمرير
  const [hasProgressBar, setHasProgressBar] = useState(true);
  const [progressBarColor, setProgressBarColor] = useState('#FFC500');
  const [progressDuration, setProgressDuration] = useState(8);

  // الحواف
  const [hasBorder, setHasBorder] = useState(false);
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState('#FFC500');
  const [borderRadius, setBorderRadius] = useState(12);
  const [hasGlow, setHasGlow] = useState(false);
  const [bgColor, setBgColor] = useState('#0B0F17');
  const [bgStyle, setBgStyle] = useState<'gradient' | 'solid' | 'transparent'>('solid');

  const [activeTab, setActiveTab] = useState<'crop' | 'elements' | 'action' | 'stickers' | 'timer' | 'colors' | 'border' | 'target' | 'templates'>('crop');
  const [publishedAlert, setPublishedAlert] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);
      setMediaFileUrl(url);
      setMediaType(isVid ? 'video' : 'image');
      if (isVid) setAdType('video');
    }
  };

  // تطبيق قوالب القطاعات الجاهزة
  const applyTemplate = (tpl: string) => {
    if (tpl === 'realestate') {
      setHeadline('فرصة عقارية فاخرة — شقق وفلل في أرقى أحياء صنعاء');
      setShowHeadline(true);
      setShowDescription(true);
      setDescription('عقارات مباشرة من المالك وموثقة رسمياً في المنصة مع تسهيلات ميسرة.');
      setCtaText('استكشف العقار');
      setBtnBgColor('#FFC500');
      setBtnTextColor('#000000');
      setPromoSticker('exclusive');
      setMediaFileUrl('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=85');
    } else if (tpl === 'auto') {
      setHeadline('مزاد حي مباشر على سيارات حديثة ومعدات ثقيلة');
      setShowHeadline(true);
      setShowDescription(true);
      setDescription('مزايدة شفافة بعمولة 5% معتمدة وضمان فحص معتمد.');
      setCtaText('دخول المزاد الآن');
      setBtnBgColor('#DC2626');
      setBtnTextColor('#FFFFFF');
      setPromoSticker('hot_deal');
      setMediaFileUrl('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=85');
    } else if (tpl === 'tech') {
      setHeadline('تخفيضات الهواتف الذكية والأجهزة الأصلية مع الضمان');
      setShowHeadline(true);
      setShowDescription(true);
      setDescription('أحدث الأجهزة بأسعار منافسة مع خدمة التوصيل المباشر.');
      setCtaText('اطلب عبر واتساب');
      setActionType('whatsapp');
      setBtnBgColor('#2EA5FF');
      setBtnTextColor('#FFFFFF');
      setPromoSticker('discount50');
      setMediaFileUrl('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=85');
    }
  };

  const handleSaveAndPublish = () => {
    const finalTarget = actionType === 'whatsapp' 
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : actionType === 'call' ? `tel:${callPhone}` : targetUrl;

    const newAd: PublishedAd = {
      id: `AD-${Date.now()}`,
      placementId: selectedPlacement.id,
      placementName: selectedPlacement.name,
      adType,
      mediaUrl: mediaFileUrl,
      mediaType,
      imageFit,
      useBlurBackground,
      imgPosX,
      imgPosY,
      imgScale,
      showBadge,
      badgeText,
      badgeBgColor,
      badgeTextColor,
      showHeadline,
      headline,
      headlineColor,
      headlineFont,
      hasTextShadow,
      showDescription,
      description,
      descColor,
      promoSticker,
      showButton,
      ctaText,
      btnBgColor,
      btnTextColor,
      btnAnimation,
      actionType,
      targetUrl: finalTarget,
      whatsappPhone,
      whatsappMessage,
      callPhone,
      targetCity,
      targetCategory,
      endDate,
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
    adminAuditService.logAction('نشر إعلان متطور باستهداف وإجراء ذكي', 'ad_campaign', newAd.id, { headline, actionType });

    setPublishedAlert(true);
    setTimeout(() => setPublishedAlert(false), 4000);
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif] pb-16">
      
      {/* 1. المعاينة الحية المباشرة في الأعلى */}
      <div className="sticky top-16 z-30 bg-[#070A10]/95 backdrop-blur-md p-4 rounded-2xl border border-[#1F2937] shadow-2xl">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
            <span className="text-xs font-black text-white">المعاينة الحية الفورية (Live Studio)</span>
          </div>

          <div className="flex items-center gap-1 bg-[#161D2B] p-1 rounded-xl">
            <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded-lg text-xs ${viewMode === 'mobile' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}><Smartphone size={14} /></button>
            <button onClick={() => setViewMode('tablet')} className={`p-1.5 rounded-lg text-xs ${viewMode === 'tablet' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}><Tablet size={14} /></button>
            <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded-lg text-xs ${viewMode === 'desktop' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}><Monitor size={14} /></button>
          </div>
        </div>

        {/* جسم الإعلان الحي */}
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
              className="relative overflow-hidden w-full min-h-[150px] flex flex-col justify-between"
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

              {/* الوسائط مع دعم الخلفية الضبابية الذكية */}
              {mediaFileUrl && (
                <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
                  {/* طبقة الخلفية الضبابية عند اختيار كامل الصورة */}
                  {imageFit === 'contain' && useBlurBackground && mediaType === 'image' && (
                    <img 
                      src={mediaFileUrl} 
                      alt="Blur background" 
                      className="absolute inset-0 w-full h-full object-cover blur-lg scale-125 opacity-50"
                    />
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
                      className="w-full h-full relative z-10 transition-all duration-150" 
                    />
                  )}
                  {imgOverlay > 0 && (
                    <div className="absolute inset-0 bg-black z-10" style={{ opacity: imgOverlay / 100 }} />
                  )}
                </div>
              )}

              {/* الملصقات الترويجية (Stickers Overlay) */}
              {promoSticker !== 'none' && (
                <div className="absolute top-3 left-3 z-20 animate-bounce">
                  {promoSticker === 'discount50' && (
                    <span className="px-2.5 py-1 rounded-xl bg-[#DC2626] text-white text-xs font-black shadow-lg border border-white/20 flex items-center gap-1">
                      خصم 50% 🔥
                    </span>
                  )}
                  {promoSticker === 'verified_gold' && (
                    <span className="px-2.5 py-1 rounded-xl bg-[#FFC500] text-black text-xs font-black shadow-lg flex items-center gap-1">
                      <Award size={14} /> موثق ذهبي YR
                    </span>
                  )}
                  {promoSticker === 'hot_deal' && (
                    <span className="px-2.5 py-1 rounded-xl bg-orange-600 text-white text-xs font-black shadow-lg flex items-center gap-1">
                      <Flame size={14} /> عرض ناري
                    </span>
                  )}
                  {promoSticker === 'limited' && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-black text-xs font-black shadow-lg flex items-center gap-1">
                      <Clock size={14} /> لفترة محدودة
                    </span>
                  )}
                  {promoSticker === 'exclusive' && (
                    <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-xs font-black shadow-lg flex items-center gap-1">
                      ⭐ حصري للمشتركين
                    </span>
                  )}
                </div>
              )}

              {/* المحتوى النصي */}
              {(showBadge || showHeadline || showDescription) && (
                <div className="relative z-20 p-4 space-y-2">
                  {showBadge && (
                    <span style={{ backgroundColor: badgeBgColor, color: badgeTextColor, borderColor: badgeTextColor }} className="px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-block backdrop-blur-sm">
                      {badgeText}
                    </span>
                  )}
                  {showHeadline && (
                    <h3 
                      style={{ 
                        color: headlineColor, 
                        fontFamily: headlineFont,
                        textShadow: hasTextShadow ? '0 2px 10px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)' : 'none'
                      }} 
                      className="text-base font-black leading-tight"
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
                      className="text-xs line-clamp-2 leading-relaxed"
                    >
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* زر الإجراء الذكي */}
              {showButton && (
                <div className="relative z-20 p-4 pt-0 flex justify-between items-center">
                  <button 
                    style={{ backgroundColor: btnBgColor, color: btnTextColor }} 
                    className={`px-4 py-2 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5 cursor-pointer ${
                      btnAnimation === 'pulse' ? 'animate-pulse' : btnAnimation === 'glow' ? 'shadow-[#FFC500]/50 shadow-lg' : ''
                    }`}
                  >
                    {actionType === 'whatsapp' && <MessageCircle size={14} />}
                    {actionType === 'call' && <Phone size={14} />}
                    <span>{ctaText}</span>
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </button>
                  <span className="text-[9px] text-white/80 font-mono bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                    {selectedPlacement.name.split(' ')[0]}
                  </span>
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
            <span>تم حفظ ونشر الإعلان بنجاح مع الإجراء الذكي والاستهداف!</span>
          </div>
          <a href="/admin/ads" className="px-3 py-1.5 rounded-lg bg-[#FFC500] text-black font-black text-xs">
            مشاهدة في المعرض المرئي
          </a>
        </div>
      )}

      {/* 2. شريط المواضع الـ 10 */}
      <div className="bg-[#0B0F17] p-3 rounded-2xl border border-[#1F2937] space-y-2">
        <label className="text-xs font-bold text-[#FFC500]">موضع العرض (10 مواضع معتمدة):</label>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
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

      {/* 3. شريط أدوات الاستوديو المطورة */}
      <div className="bg-[#0B0F17] p-5 rounded-2xl border border-[#1F2937] space-y-5">
        
        {/* أزرار التبويبات الموسعة */}
        <div className="flex gap-1 overflow-x-auto pb-1 p-1 bg-[#161D2B] rounded-xl border border-[#1F2937] text-xs font-black custom-scrollbar">
          {[
            { id: 'crop', label: 'قص وتموضع' },
            { id: 'elements', label: 'العناصر/صافي' },
            { id: 'action', label: 'الزر والتحويل' },
            { id: 'stickers', label: 'الملصقات' },
            { id: 'timer', label: 'شريط التمرير' },
            { id: 'colors', label: 'الألوان' },
            { id: 'border', label: 'الحواف' },
            { id: 'target', label: 'الاستهداف' },
            { id: 'templates', label: 'قوالب جاهزة' },
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

        {/* تبويب 1: قص وتموضع (الخيارات الأصلية + خلفية ضبابية ذكية) */}
        {activeTab === 'crop' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white block mb-2">تحميل صورة أو فيديو من هاتفك:</label>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 px-4 rounded-xl bg-[#161D2B] border-2 border-dashed border-[#FFC500] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={16} className="text-[#FFC500]" />
                  <span>تحميل من الهاتف</span>
                </button>
                {mediaFileUrl && (
                  <button onClick={() => setMediaFileUrl('')} className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-3">
              <label className="text-xs font-bold text-[#FFC500] block">نمط عرض الصورة:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setImageFit('contain'); setImgScale(100); setImgPosX(50); setImgPosY(50); }}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    imageFit === 'contain' ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#0B0F17] text-white border-[#1F2937]'
                  }`}
                >
                  <Maximize2 size={15} />
                  <span>عرض كامل الصورة (بدون قص)</span>
                </button>
                <button
                  onClick={() => setImageFit('cover')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    imageFit === 'cover' ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#0B0F17] text-white border-[#1F2937]'
                  }`}
                >
                  <Crop size={15} />
                  <span>ملء الإطار وتحديد موضع القص</span>
                </button>
              </div>

              {imageFit === 'contain' && (
                <div className="flex items-center justify-between pt-2 border-t border-[#1F2937]">
                  <span className="text-xs text-[#D1D5DB]">خلفية ضبابية ذكية لتعبئة الفراغات (Smart Blur)</span>
                  <button
                    onClick={() => setUseBlurBackground(!useBlurBackground)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${useBlurBackground ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    {useBlurBackground ? 'مفعلة' : 'معطلة'}
                  </button>
                </div>
              )}
            </div>

            {imageFit === 'cover' && (
              <div className="p-4 bg-[#161D2B] rounded-xl border border-[#1F2937] space-y-4">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Move size={15} className="text-[#FFC500]" />
                  <span>تحديد الجزء المعروض من الصورة:</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[
                    { label: 'الوسط', x: 50, y: 50 },
                    { label: 'أعلى الصورة', x: 50, y: 0 },
                    { label: 'أسفل الصورة', x: 50, y: 100 },
                    { label: 'يمين الصورة', x: 100, y: 50 },
                    { label: 'يسار الصورة', x: 0, y: 50 },
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => { setImgPosX(p.x); setImgPosY(p.y); }}
                      className="px-3 py-1 rounded-lg bg-[#0B0F17] text-[11px] font-bold text-gray-300 border border-[#1F2937] hover:border-[#FFC500]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-[#9CA3AF] block mb-1">التقريب (Zoom): {imgScale}%</label>
                    <input type="range" min="100" max="250" value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#9CA3AF] block mb-1">إزاحة أفقية (X): {imgPosX}%</label>
                    <input type="range" min="0" max="100" value={imgPosX} onChange={(e) => setImgPosX(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#9CA3AF] block mb-1">إزاحة رأسية (Y): {imgPosY}%</label>
                    <input type="range" min="0" max="100" value={imgPosY} onChange={(e) => setImgPosY(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <div>
                <label className="text-[11px] text-[#9CA3AF] block mb-1">السطوع والنقاء: {brightness}%</label>
                <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-[#FFC500]" />
              </div>
              <div>
                <label className="text-[11px] text-[#9CA3AF] block mb-1">التباين اللوني: {contrast}%</label>
                <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-[#FFC500]" />
              </div>
              <div>
                <label className="text-[11px] text-[#9CA3AF] block mb-1">تعتيم الخلفية: {imgOverlay}%</label>
                <input type="range" min="0" max="90" value={imgOverlay} onChange={(e) => setImgOverlay(Number(e.target.value))} className="w-full accent-[#FFC500]" />
              </div>
            </div>
          </div>
        )}

        {/* تبويب 2: العناصر/صافي + الخطوط والظلال */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <span className="text-xs font-bold text-white">شارة الإعلان (Badge)</span>
              <button onClick={() => setShowBadge(!showBadge)} className={`px-3 py-1 rounded-lg text-xs font-bold ${showBadge ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}>
                {showBadge ? 'ظاهر' : 'مخفي'}
              </button>
            </div>
            {showBadge && <input type="text" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none" />}

            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <span className="text-xs font-bold text-white">العنوان الرئيسي</span>
              <button onClick={() => setShowHeadline(!showHeadline)} className={`px-3 py-1 rounded-lg text-xs font-bold ${showHeadline ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}>
                {showHeadline ? 'ظاهر' : 'مخفي (صافي)'}
              </button>
            </div>
            {showHeadline && (
              <div className="space-y-2">
                <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={headlineFont} onChange={(e) => setHeadlineFont(e.target.value)} className="bg-[#161D2B] border border-[#1F2937] rounded-xl p-2 text-xs text-white">
                    <option value="Cairo">خط Cairo الرسمي</option>
                    <option value="Tajawal">خط Tajawal الحديث</option>
                    <option value="Almarai">خط Almarai الأنيق</option>
                  </select>
                  <button onClick={() => setHasTextShadow(!hasTextShadow)} className={`p-2 rounded-xl text-xs font-bold border ${hasTextShadow ? 'border-[#FFC500] text-[#FFC500]' : 'border-[#1F2937] text-[#9CA3AF]'}`}>
                    {hasTextShadow ? 'الظل العميق مفعل' : 'بدون ظل'}
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <span className="text-xs font-bold text-white">نص الوصف</span>
              <button onClick={() => setShowDescription(!showDescription)} className={`px-3 py-1 rounded-lg text-xs font-bold ${showDescription ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}>
                {showDescription ? 'ظاهر' : 'مخفي (صافي)'}
              </button>
            </div>
            {showDescription && <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none" />}
          </div>
        )}

        {/* تبويب 3: الزر والتحويل الذكي (واتساب / اتصال / رابط) */}
        {activeTab === 'action' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <span className="text-xs font-bold text-white">زر الإجراء (CTA Button)</span>
              <button onClick={() => setShowButton(!showButton)} className={`px-3 py-1 rounded-lg text-xs font-bold ${showButton ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}>
                {showButton ? 'مفعل' : 'معطل'}
              </button>
            </div>

            {showButton && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#FFC500] block mb-1">نوع الإجراء عند نقر الزائر:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { setActionType('link'); setCtaText('زيارة الرابط'); }} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${actionType === 'link' ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-[#161D2B] text-white border-[#1F2937]'}`}>
                      <LinkIcon size={14} /> رابط ويب
                    </button>
                    <button onClick={() => { setActionType('whatsapp'); setCtaText('محادثة واتساب'); }} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${actionType === 'whatsapp' ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-[#161D2B] text-white border-[#1F2937]'}`}>
                      <MessageCircle size={14} /> واتساب مباشر
                    </button>
                    <button onClick={() => { setActionType('call'); setCtaText('اتصل الآن'); }} className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${actionType === 'call' ? 'bg-[#2EA5FF] text-white border-[#2EA5FF]' : 'bg-[#161D2B] text-white border-[#1F2937]'}`}>
                      <Phone size={14} /> اتصال فوري
                    </button>
                  </div>
                </div>

                {actionType === 'link' && (
                  <input type="text" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://..." className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono" />
                )}

                {actionType === 'whatsapp' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="رقم الواتساب: 967777..." className="bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono" />
                    <input type="text" value={whatsappMessage} onChange={(e) => setWhatsappMessage(e.target.value)} placeholder="نص الرسالة الجاهزة..." className="bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white" />
                  </div>
                )}

                {actionType === 'call' && (
                  <input type="text" value={callPhone} onChange={(e) => setCallPhone(e.target.value)} placeholder="رقم الهاتف للاتصال: 96777..." className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono" />
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-[#9CA3AF] block mb-1">نص الزر</label>
                    <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2 text-xs text-white font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#9CA3AF] block mb-1">حركة وتفاعل الزر</label>
                    <select value={btnAnimation} onChange={(e) => setBtnAnimation(e.target.value as any)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2 text-xs text-white">
                      <option value="none">ثابت عادي</option>
                      <option value="shimmer">بريق ولمعان (Shimmer)</option>
                      <option value="pulse">نبض تفاعلي (Pulse)</option>
                      <option value="glow">توهج ذهبي (Glow)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* تبويب 4: الملصقات الترويجية (Stickers) */}
        {activeTab === 'stickers' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#FFC500] block">اختر ملصقاً أو ختماً ترويجياً يظهر فوق الإعلان:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'بدون ملصق' },
                { id: 'discount50', label: 'خصم 50% 🔥' },
                { id: 'verified_gold', label: 'موثق ذهبي YR ⭐' },
                { id: 'hot_deal', label: 'عرض ناري 💥' },
                { id: 'limited', label: 'لفترة محدودة ⏳' },
                { id: 'exclusive', label: 'حصري للمشتركين 👑' },
              ].map(stk => (
                <button
                  key={stk.id}
                  onClick={() => setPromoSticker(stk.id as any)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    promoSticker === stk.id ? 'bg-[#FFC500] text-black border-[#FFC500] shadow-md' : 'bg-[#161D2B] text-white border-[#1F2937]'
                  }`}
                >
                  {stk.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* تبويب 5: شريط التمرير */}
        {activeTab === 'timer' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">شريط التمرير والتقدم الزمني</span>
                <span className="text-[10px] text-[#9CA3AF]">يتحرك من بداية الإعلان لنهايته</span>
              </div>
              <button onClick={() => setHasProgressBar(!hasProgressBar)} className={`px-3 py-1 rounded-lg text-xs font-bold ${hasProgressBar ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}>
                {hasProgressBar ? 'مفعل' : 'معطل'}
              </button>
            </div>
            {hasProgressBar && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <div>
                  <label className="text-[11px] text-[#9CA3AF] block mb-1">مدة الإعلان: {progressDuration} ثوانٍ</label>
                  <input type="range" min="3" max="30" value={progressDuration} onChange={(e) => setProgressDuration(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
                <div>
                  <label className="text-[11px] text-[#9CA3AF] block mb-1">لون شريط التمرير</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={progressBarColor} onChange={(e) => setProgressBarColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                    <span className="text-xs font-mono text-white">{progressBarColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* تبويب 6: الألوان */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">خلفية الزر</label>
              <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
            </div>
            <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">نص الزر</label>
              <input type="color" value={btnTextColor} onChange={(e) => setBtnTextColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
            </div>
            <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">لون العنوان</label>
              <input type="color" value={headlineColor} onChange={(e) => setHeadlineColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
            </div>
            <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">خلفية الإعلان</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
            </div>
          </div>
        )}

        {/* تبويب 7: الحواف */}
        {activeTab === 'border' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">تفعيل الإطار والحواف</span>
                <span className="text-[10px] text-[#9CA3AF]">إلغاؤه يجعل الإعلان صافياً مفتوحاً</span>
              </div>
              <button onClick={() => setHasBorder(!hasBorder)} className={`px-3 py-1 rounded-lg text-xs font-bold ${hasBorder ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}>
                {hasBorder ? 'مفعل' : 'ملغي (بدون حواف)'}
              </button>
            </div>
            {hasBorder && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">السماكة: {borderWidth}px</label>
                  <input type="range" min="1" max="8" value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">انحناء الزوايا: {borderRadius}px</label>
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

        {/* تبويب 8: الاستهداف والجدولة */}
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
                <option value="الحديدة">الحديدة</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] block mb-1 font-bold">التصنيف المستهدف</label>
              <select value={targetCategory} onChange={(e) => setTargetCategory(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white">
                <option value="الجميع">جميع الأنشطة</option>
                <option value="عقارات">عقارات وإنشاءات</option>
                <option value="سيارات">سيارات ومزادات</option>
                <option value="هواتف">هواتف وإلكترونيات</option>
                <option value="وظائف">وظائف وتوظيف</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#9CA3AF] block mb-1 font-bold">تاريخ انتهاء الحملة</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-mono" />
            </div>
          </div>
        )}

        {/* تبويب 9: قوالب جاهزة سريعة */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#FFC500] block">تطبيق قالب فخم بنقرة زر:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button onClick={() => applyTemplate('realestate')} className="p-3 rounded-xl bg-[#161D2B] border border-[#1F2937] hover:border-[#FFC500] text-right">
                <div className="text-xs font-bold text-[#FFC500]">🏰 قالب العقارات VIP</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">ألوان ذهبية وشارة حصرية</div>
              </button>
              <button onClick={() => applyTemplate('auto')} className="p-3 rounded-xl bg-[#161D2B] border border-[#1F2937] hover:border-red-500 text-right">
                <div className="text-xs font-bold text-red-400">🚗 قالب المزادات والسيارات</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">طابع ناري وزر مباشر</div>
              </button>
              <button onClick={() => applyTemplate('tech')} className="p-3 rounded-xl bg-[#161D2B] border border-[#1F2937] hover:border-blue-400 text-right">
                <div className="text-xs font-bold text-blue-400">📱 قالب الهواتف والتخفيضات</div>
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">شارة خصم 50% وتحويل واتساب</div>
              </button>
            </div>
          </div>
        )}

        {/* زر النشر النهائي */}
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
