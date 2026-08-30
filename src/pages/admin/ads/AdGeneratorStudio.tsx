import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Smartphone, Tablet, Monitor, Image as ImageIcon, 
  Palette, Video, Upload, Layers, Eye, CheckCircle2, 
  ArrowRight, Sliders, Trash2, Clock, ToggleLeft, ToggleRight, List
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
  // عناصر اختيارية تماماً
  showBadge: boolean;
  badgeText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  showHeadline: boolean;
  headline: string;
  headlineColor: string;
  showDescription: boolean;
  description: string;
  descColor: string;
  showButton: boolean;
  ctaText: string;
  btnBgColor: string;
  btnTextColor: string;
  targetUrl: string;
  // شريط التمرير الزمني
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
  // 1. النوع والموضع والمحاكاة
  const [selectedPlacement, setSelectedPlacement] = useState(YR_AD_PLACEMENTS[0]);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [adType, setAdType] = useState<'image' | 'video' | 'animated' | 'ticker'>('image');

  // 2. الوسائط (رفع حقيقي)
  const [mediaFileUrl, setMediaFileUrl] = useState<string>('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=85');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [imgOverlay, setImgOverlay] = useState(0); // افتراضياً صافي 0%
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 3. مفاتيح إظهار/إخفاء النصوص (حرية تامة لنشر إعلان صافي)
  const [showBadge, setShowBadge] = useState(false);
  const [badgeText, setBadgeText] = useState('إعلان ممول');
  const [badgeBgColor, setBadgeBgColor] = useState('rgba(255, 197, 0, 0.2)');
  const [badgeTextColor, setBadgeTextColor] = useState('#FFC500');

  const [showHeadline, setShowHeadline] = useState(true);
  const [headline, setHeadline] = useState('أحدث عروض يمن ريتنغ الحصرية');
  const [headlineColor, setHeadlineColor] = useState('#FFFFFF');

  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState('تخفيضات كبرى على جميع الخدمات والأنشطة التجارية في اليمن.');
  const [descColor, setDescColor] = useState('#E5E7EB');

  const [showButton, setShowButton] = useState(true);
  const [ctaText, setCtaText] = useState('اطلب الآن');
  const [btnBgColor, setBtnBgColor] = useState('#FFC500');
  const [btnTextColor, setBtnTextColor] = useState('#000000');
  const [targetUrl, setTargetUrl] = useState('https://yemen-rating.com');

  // 4. شريط تمرير الإعلان الزمني (Progress Bar)
  const [hasProgressBar, setHasProgressBar] = useState(true);
  const [progressBarColor, setProgressBarColor] = useState('#FFC500');
  const [progressDuration, setProgressDuration] = useState(8); // ثواني

  // 5. الإطار والألوان
  const [hasBorder, setHasBorder] = useState(false); // افتراضياً بدون إطار لإعلان صافي
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState('#FFC500');
  const [borderRadius, setBorderRadius] = useState(12);
  const [hasGlow, setHasGlow] = useState(false);
  const [bgColor, setBgColor] = useState('#0B0F17');
  const [bgStyle, setBgStyle] = useState<'gradient' | 'solid' | 'transparent'>('solid');

  const [activeTab, setActiveTab] = useState<'media' | 'elements' | 'timer' | 'colors' | 'border'>('media');
  const [publishedAlert, setPublishedAlert] = useState(false);

  // رفع ملف من الهاتف
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

  // حفظ ونشر الإعلان برمجياً وبشكل دائم
  const handleSaveAndPublish = () => {
    const newAd: PublishedAd = {
      id: `AD-${Date.now()}`,
      placementId: selectedPlacement.id,
      placementName: selectedPlacement.name,
      adType,
      mediaUrl: mediaFileUrl,
      mediaType,
      showBadge,
      badgeText,
      badgeBgColor,
      badgeTextColor,
      showHeadline,
      headline,
      headlineColor,
      showDescription,
      description,
      descColor,
      showButton,
      ctaText,
      btnBgColor,
      btnTextColor,
      targetUrl,
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

    // حفظ في التخزين الدائم
    const existing = JSON.parse(localStorage.getItem('yr_published_ads') || '[]');
    localStorage.setItem('yr_published_ads', JSON.stringify([newAd, ...existing]));

    adminAuditService.logAction('نشر إعلان جديد وحفظه في المعرض المرئي', 'ad_campaign', newAd.id, { headline, placement: selectedPlacement.name });

    setPublishedAlert(true);
    setTimeout(() => setPublishedAlert(false), 4000);
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif] pb-16">
      
      {/* 1. المعاينة المباشرة المثبتة في الأعلى (Sticky Live Preview on Mobile) */}
      <div className="sticky top-16 z-30 bg-[#070A10]/95 backdrop-blur-md p-4 rounded-2xl border border-[#1F2937] shadow-2xl">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
            <span className="text-xs font-black text-white">المعاينة الحية الفورية (Live Ad Preview)</span>
          </div>

          <div className="flex items-center gap-1 bg-[#161D2B] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'mobile' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}
            >
              <Smartphone size={14} />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'tablet' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'desktop' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}
            >
              <Monitor size={14} />
            </button>
          </div>
        </div>

        {/* الإعلان الحي */}
        <div className="w-full flex justify-center overflow-x-auto py-1">
          <div 
            className={`w-full transition-all duration-300 ${
              viewMode === 'mobile' ? 'max-w-[390px]' : viewMode === 'tablet' ? 'max-w-[560px]' : 'max-w-[850px]'
            }`}
          >
            <div
              style={{
                borderRadius: `${borderRadius}px`,
                border: hasBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
                backgroundColor: bgStyle === 'transparent' ? 'transparent' : bgColor,
                backgroundImage: bgStyle === 'gradient' ? `linear-gradient(135deg, ${bgColor} 0%, #161D2B 100%)` : 'none',
                boxShadow: hasGlow && hasBorder ? `0 0 25px ${borderColor}40` : 'none',
              }}
              className="relative overflow-hidden w-full min-h-[140px] flex flex-col justify-between"
            >
              {/* شريط تمرير الإعلان من البداية للنهاية (Animated Progress Bar) */}
              {hasProgressBar && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
                  <div 
                    style={{ 
                      backgroundColor: progressBarColor,
                      animation: `yrAdProgress ${progressDuration}s linear infinite`
                    }}
                    className="h-full w-full origin-left"
                  />
                </div>
              )}

              {/* الوسائط (صورة ناصعة أو فيديو حقيقي) */}
              {mediaFileUrl && (
                <div className="absolute inset-0 z-0">
                  {mediaType === 'video' ? (
                    <video src={mediaFileUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img 
                      src={mediaFileUrl} 
                      alt="Ad media" 
                      style={{ 
                        filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                        imageRendering: 'crisp-edges'
                      }}
                      className="w-full h-full object-cover" 
                    />
                  )}
                  {imgOverlay > 0 && (
                    <div className="absolute inset-0 bg-black" style={{ opacity: imgOverlay / 100 }} />
                  )}
                </div>
              )}

              {/* المحتوى الاختياري - يظهر فقط إذا تم تفعيله */}
              {(showBadge || showHeadline || showDescription) && (
                <div className="relative z-10 p-4 space-y-2">
                  {showBadge && (
                    <span
                      style={{ backgroundColor: badgeBgColor, color: badgeTextColor, borderColor: badgeTextColor }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-block backdrop-blur-sm"
                    >
                      {badgeText}
                    </span>
                  )}
                  {showHeadline && (
                    <h3 style={{ color: headlineColor }} className="text-base font-black drop-shadow-md leading-tight">
                      {headline}
                    </h3>
                  )}
                  {showDescription && (
                    <p style={{ color: descColor }} className="text-xs drop-shadow line-clamp-2 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* زر الإجراء الاختياري */}
              {showButton && (
                <div className="relative z-10 p-4 pt-0 flex justify-between items-center">
                  <button
                    style={{ backgroundColor: btnBgColor, color: btnTextColor }}
                    className="px-4 py-2 rounded-xl font-black text-xs shadow-xl hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </button>
                  <span className="text-[9px] text-white/80 font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                    {selectedPlacement.name.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* تنبيه تأكيد الحفظ والنشر */}
      {publishedAlert && (
        <div className="p-4 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#16A34A]" />
            <span>تم حفظ ونشر الإعلان بنجاح! يمكنك الآن مشاهدته في قائمة الإعلانات المنشورة.</span>
          </div>
          <a href="/admin/ads" className="px-3 py-1.5 rounded-lg bg-[#FFC500] text-black font-black text-xs">
            مشاهدة المعرض المرئي
          </a>
        </div>
      )}

      {/* 2. شريط تمرير المواضع الـ 10 */}
      <div className="bg-[#0B0F17] p-3 rounded-2xl border border-[#1F2937] space-y-2">
        <label className="text-xs font-bold text-[#FFC500]">موضع الإعلان في يمن ريتنغ (10 مواضع):</label>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {YR_AD_PLACEMENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlacement(p)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPlacement.id === p.id 
                  ? 'bg-[#FFC500] text-black border-[#FFC500] shadow-md' 
                  : 'bg-[#161D2B] text-[#9CA3AF] border-[#1F2937]'
              }`}
            >
              #{p.id} {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. أدوات التحكم والاستوديو الكامل */}
      <div className="bg-[#0B0F17] p-5 rounded-2xl border border-[#1F2937] space-y-5">
        
        {/* تبويبات التحكم الخمسة */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#161D2B] rounded-xl border border-[#1F2937] text-xs font-black">
          <button
            onClick={() => setActiveTab('media')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'media' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
          >
            الوسائط
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'elements' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
          >
            العناصر/صافي
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'timer' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
          >
            شريط التمرير
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'colors' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
          >
            الألوان
          </button>
          <button
            onClick={() => setActiveTab('border')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'border' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
          >
            الحواف
          </button>
        </div>

        {/* تبويب 1: رفع الوسائط وتصفية الصورة/الفيديو */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white block mb-2">تحميل صورة أو فيديو من جهازك:</label>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#161D2B] border-2 border-dashed border-[#FFC500] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={16} className="text-[#FFC500]" />
                  <span>اضغط لاختيار صورة/فيديو من الهاتف</span>
                </button>
                {mediaFileUrl && (
                  <button
                    onClick={() => setMediaFileUrl('')}
                    className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

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
                <label className="text-[11px] text-[#9CA3AF] block mb-1">تعتيم الخلفية (Overlay): {imgOverlay}%</label>
                <input type="range" min="0" max="90" value={imgOverlay} onChange={(e) => setImgOverlay(Number(e.target.value))} className="w-full accent-[#FFC500]" />
              </div>
            </div>
          </div>
        )}

        {/* تبويب 2: تفعيل/تعطيل العناصر (حرية نشر إعلان صافي بدون نصوص) */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#161D2B] border border-[#1F2937] text-xs text-[#D1D5DB]">
              💡 <b>ميزة الإعلان الصافي:</b> يمكنك إغلاق جميع المفاتيح بالأسفل لنشر إعلان ناصع بالصورة أو الفيديو فقط بدون أي نصوص أو أزرار إجبارية.
            </div>

            {/* مفتاح الشارة */}
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">شارة الإعلان (Badge)</span>
                <span className="text-[10px] text-[#9CA3AF]">نص صغير أعلى الإعلان</span>
              </div>
              <button
                onClick={() => setShowBadge(!showBadge)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${showBadge ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {showBadge ? 'ظاهر' : 'مخفي'}
              </button>
            </div>
            {showBadge && (
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="نص الشارة..."
                className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
              />
            )}

            {/* مفتاح العنوان الرئيسي */}
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">العنوان الرئيسي</span>
                <span className="text-[10px] text-[#9CA3AF]">العنوان البارز في الإعلان</span>
              </div>
              <button
                onClick={() => setShowHeadline(!showHeadline)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${showHeadline ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {showHeadline ? 'ظاهر' : 'مخفي (صافي)'}
              </button>
            </div>
            {showHeadline && (
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="اكتب العنوان..."
                className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
              />
            )}

            {/* مفتاح الوصف */}
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">نص الوصف والسطور الترويجية</span>
                <span className="text-[10px] text-[#9CA3AF]">نص تفصيلي إضافي</span>
              </div>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${showDescription ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {showDescription ? 'ظاهر' : 'مخفي (صافي)'}
              </button>
            </div>
            {showDescription && (
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب الوصف..."
                className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
              />
            )}

            {/* مفتاح زر الإجراء CTA */}
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">زر الإجراء (CTA Button)</span>
                <span className="text-[10px] text-[#9CA3AF]">زر التحويل والرابط</span>
              </div>
              <button
                onClick={() => setShowButton(!showButton)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${showButton ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {showButton ? 'ظاهر' : 'مخفي (صافي)'}
              </button>
            </div>
            {showButton && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="نص الزر..."
                  className="bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="الرابط المستهدف..."
                  className="bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* تبويب 3: شريط تمرير الإعلان الزمني (Progress Bar) */}
        {activeTab === 'timer' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">شريط التمرير والتقدم الزمني</span>
                <span className="text-[10px] text-[#9CA3AF]">شريط يتحرك من أول الظهور لآخره</span>
              </div>
              <button
                onClick={() => setHasProgressBar(!hasProgressBar)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${hasProgressBar ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {hasProgressBar ? 'مفعل' : 'معطل'}
              </button>
            </div>

            {hasProgressBar && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <div>
                  <label className="text-[11px] text-[#9CA3AF] block mb-1">مدة الإعلان وسرعة الشريط: {progressDuration} ثوانٍ</label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={progressDuration}
                    onChange={(e) => setProgressDuration(Number(e.target.value))}
                    className="w-full accent-[#FFC500]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#9CA3AF] block mb-1">لون شريط التمرير</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={progressBarColor}
                      onChange={(e) => setProgressBarColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-white">{progressBarColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* تبويب 4: تخصيص الألوان بالكامل */}
        {activeTab === 'colors' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">خلفية الزر</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                  <span className="text-[10px] font-mono text-white">{btnBgColor}</span>
                </div>
              </div>
              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">نص الزر</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={btnTextColor} onChange={(e) => setBtnTextColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                  <span className="text-[10px] font-mono text-white">{btnTextColor}</span>
                </div>
              </div>
              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">لون العنوان</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={headlineColor} onChange={(e) => setHeadlineColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                  <span className="text-[10px] font-mono text-white">{headlineColor}</span>
                </div>
              </div>
              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">لون خلفية الإعلان</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                  <span className="text-[10px] font-mono text-white">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تبويب 5: تخصيص أو إلغاء الحواف (Border Controls) */}
        {activeTab === 'border' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">تفعيل الإطار والحواف</span>
                <span className="text-[10px] text-[#9CA3AF]">يمكنك إلغاؤه لجعل الإعلان صافياً ومفتوحاً</span>
              </div>
              <button
                onClick={() => setHasBorder(!hasBorder)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${hasBorder ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {hasBorder ? 'مفعل' : 'ملغي (بدون حواف)'}
              </button>
            </div>

            {hasBorder && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">سماكة الحافة: {borderWidth}px</label>
                  <input type="range" min="1" max="8" value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">انحناء الزوايا: {borderRadius}px</label>
                  <input type="range" min="0" max="32" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full accent-[#FFC500]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">لون الإطار</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                    <span className="text-xs font-mono text-white">{borderColor}</span>
                  </div>
                </div>
              </div>
            )}
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
