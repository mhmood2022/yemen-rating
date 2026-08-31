import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Image as ImageIcon,
  Crop,
  Video,
  Upload,
  Layers,
  Eye,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Maximize2,
  Move,
  ZoomIn,
  Calendar,
  Clock,
  Palette,
  Square
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
  // خيارات اقتصاص وتموضع الصورة
  imageFit: 'contain' | 'cover';
  imgPosX: number; // 0 to 100%
  imgPosY: number; // 0 to 100%
  imgScale: number; // 50 to 300%
  // عناصر اختيارية
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
  // تاريخ البدء والإيقاف
  startDate?: string;
  endDate?: string;
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

  // الوسائط وخيارات الاقتصاص والتموضع
  const [mediaFileUrl, setMediaFileUrl] = useState<string>('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=85');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageFit, setImageFit] = useState<'contain' | 'cover'>('cover');
  const [imgPosX, setImgPosX] = useState(50);
  const [imgPosY, setImgPosY] = useState(50);
  const [imgScale, setImgScale] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [imgOverlay, setImgOverlay] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // العناصر الاختيارية
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

  // تاريخ البدء وتاريخ الإيقاف
  const [startDate, setStartDate] = useState('2026-08-31');
  const [endDate, setEndDate] = useState('2026-09-30');

  // شريط التمرير
  const [hasProgressBar, setHasProgressBar] = useState(true);
  const [progressBarColor, setProgressBarColor] = useState('#FFC500');
  const [progressDuration, setProgressDuration] = useState(8);

  // الحواف والمظهر
  const [hasBorder, setHasBorder] = useState(false);
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState('#FFC500');
  const [borderRadius, setBorderRadius] = useState(16);
  const [hasGlow, setHasGlow] = useState(false);
  const [bgColor, setBgColor] = useState('#0B0F17');
  const [bgStyle, setBgStyle] = useState<'gradient' | 'solid' | 'transparent'>('solid');

  const [activeTab, setActiveTab] = useState<'crop' | 'elements' | 'dates' | 'colors' | 'border'>('crop');
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

  const handleSaveAndPublish = () => {
    const newAd: PublishedAd = {
      id: `AD-${Date.now()}`,
      placementId: selectedPlacement.id,
      placementName: selectedPlacement.name,
      adType,
      mediaUrl: mediaFileUrl,
      mediaType,
      imageFit,
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
      showDescription,
      description,
      descColor,
      showButton,
      ctaText,
      btnBgColor,
      btnTextColor,
      targetUrl,
      startDate,
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
    adminAuditService.logAction('نشر إعلان باقتصاص وتموضع مخصص', 'ad_campaign', newAd.id, { headline, imageFit, startDate, endDate });

    setPublishedAlert(true);
    setTimeout(() => setPublishedAlert(false), 5000);
  };

  return (
    <div dir="rtl" className="space-y-6 font-['Cairo',sans-serif] pb-16">
      {/* 1. رأس الصفحة مع زر الرجوع الذهبي البارز */}
      <div className="flex items-center justify-between gap-4 bg-[#0B0F17] p-4 sm:p-5 rounded-2xl border border-[#1F2937] shadow-lg">
        <div className="flex items-center gap-3">
          <NavLink
            to="/admin/ads"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#161D2B] text-yellow-400 hover:text-yellow-300 hover:bg-[#1F2937] border border-[#1F2937] transition font-bold text-xs shrink-0 shadow-sm"
            title="رجوع لمعرض الإعلانات"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            <span>رجوع لمعرض الإعلانات</span>
          </NavLink>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="text-yellow-400 w-5 h-5" />
              استوديو تصميم ومولد الإعلانات YR Studio
            </h1>
            <p className="text-zinc-400 text-xs mt-0.5">
              تخصيص أبعاد التموضع، النصوص، وتحديد فترة ظهور الإعلان
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAndPublish}
          className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl text-xs transition shadow-lg shadow-yellow-500/20 shrink-0"
        >
          نشر وحفظ الإعلان
        </button>
      </div>

      {/* 2. شاشة المعاينة الحية المثبتة في الأعلى أثناء التمرير (Sticky Preview) */}
      <div className="sticky top-20 z-30 bg-[#070A10] p-4 rounded-2xl border border-[#1F2937] shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-white">المعاينة الحية الفورية (Live Studio Preview)</span>
          </div>

          <div className="flex items-center gap-1 bg-[#161D2B] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'mobile' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400'}`}
              title="عرض الهاتف"
            >
              <Smartphone size={14} />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'tablet' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400'}`}
              title="عرض التابلت"
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-lg text-xs transition ${viewMode === 'desktop' ? 'bg-yellow-500 text-black font-bold' : 'text-zinc-400'}`}
              title="عرض الشاشة"
            >
              <Monitor size={14} />
            </button>
          </div>
        </div>

        {/* كونسول الإعلان الحي */}
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
              className="relative overflow-hidden w-full min-h-[140px] flex flex-col justify-between"
            >
              {/* شريط التمرير الزمني */}
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

              {/* الوسائط */}
              {mediaFileUrl && (
                <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
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
                      className="w-full h-full transition-all duration-150"
                    />
                  )}
                  {imgOverlay > 0 && (
                    <div className="absolute inset-0 bg-black" style={{ opacity: imgOverlay / 100 }} />
                  )}
                </div>
              )}

              {/* محتوى الإعلان */}
              <div className="relative z-10 p-4 flex flex-col justify-between h-full min-h-[140px]">
                {(showBadge || showHeadline || showDescription) && (
                  <div className="space-y-1.5 max-w-xl">
                    {showBadge && (
                      <span
                        style={{ backgroundColor: badgeBgColor, color: badgeTextColor, borderColor: badgeTextColor }}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-block backdrop-blur-sm"
                      >
                        {badgeText}
                      </span>
                    )}

                    {showHeadline && (
                      <h3 style={{ color: headlineColor }} className="text-sm sm:text-base font-black leading-snug drop-shadow-md">
                        {headline}
                      </h3>
                    )}

                    {showDescription && (
                      <p style={{ color: descColor }} className="text-xs text-gray-200 line-clamp-2 drop-shadow leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                )}

                {showButton && (
                  <div className="pt-2 flex items-center justify-end mt-2">
                    <button
                      type="button"
                      style={{ backgroundColor: btnBgColor, color: btnTextColor }}
                      className="px-4 py-1.5 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5"
                    >
                      <span>{ctaText}</span>
                      <ArrowRight size={13} className="rtl:rotate-180" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تنبيه النجاح بعد الحفظ مع زر رجوع مباشر */}
      {publishedAlert && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-white text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>تم حفظ ونشر الإعلان وتحديد فترته بنجاح!</span>
          </div>
          <NavLink to="/admin/ads" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500 text-black font-black text-xs">
            <ArrowRight className="w-3.5 h-3.5" /> رجوع لمعرض الإعلانات
          </NavLink>
        </div>
      )}

      {/* 3. شريط المواضع الـ 10 */}
      <div className="bg-[#0B0F17] p-3.5 rounded-2xl border border-[#1F2937] space-y-2">
        <label className="text-xs font-bold text-yellow-400 block">موضع الإعلان المختار في المنصة (10 مواضع):</label>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {YR_AD_PLACEMENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlacement(p)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPlacement.id === p.id
                  ? 'bg-yellow-500 text-black border-yellow-500 shadow-md font-black'
                  : 'bg-[#161D2B] text-zinc-400 border-[#1F2937] hover:text-white'
              }`}
            >
              #{p.id} {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. أدوات ولوحة تحكم الاستوديو والتبويبات */}
      <div className="bg-[#0B0F17] p-5 rounded-2xl border border-[#1F2937] space-y-5 shadow-xl">
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#161D2B] rounded-xl border border-[#1F2937] text-xs font-black">
          <button
            onClick={() => setActiveTab('crop')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'crop' ? 'bg-yellow-500 text-black' : 'text-zinc-400'}`}
          >
            قص وتموضع
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'elements' ? 'bg-yellow-500 text-black' : 'text-zinc-400'}`}
          >
            النصوص والأزرار
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'dates' ? 'bg-yellow-500 text-black' : 'text-zinc-400'}`}
          >
            فترة الإعلان
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'colors' ? 'bg-yellow-500 text-black' : 'text-zinc-400'}`}
          >
            الألوان
          </button>
          <button
            onClick={() => setActiveTab('border')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'border' ? 'bg-yellow-500 text-black' : 'text-zinc-400'}`}
          >
            الحواف
          </button>
        </div>

        {/* تبويب 1: القص والتموضع */}
        {activeTab === 'crop' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-yellow-400 block mb-2">تحميل وسائط الإعلان (صورة أو فيديو):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mediaFileUrl}
                  onChange={(e) => setMediaFileUrl(e.target.value)}
                  placeholder="أدخل رابط الصورة أو الفيديو المباشر..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-zinc-700"
                >
                  <Upload size={14} /> ملف محلي
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <div>
                <label className="text-[11px] text-yellow-400 font-bold block mb-1">التقريب (Zoom): {imgScale}%</label>
                <input type="range" min="100" max="250" value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))} className="w-full accent-yellow-500" />
              </div>
              <div>
                <label className="text-[11px] text-yellow-400 font-bold block mb-1">إزاحة أفقية (X): {imgPosX}%</label>
                <input type="range" min="0" max="100" value={imgPosX} onChange={(e) => setImgPosX(Number(e.target.value))} className="w-full accent-yellow-500" />
              </div>
              <div>
                <label className="text-[11px] text-yellow-400 font-bold block mb-1">إزاحة رأسية (Y): {imgPosY}%</label>
                <input type="range" min="0" max="100" value={imgPosY} onChange={(e) => setImgPosY(Number(e.target.value))} className="w-full accent-yellow-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <div>
                <label className="text-[11px] text-yellow-400 font-bold block mb-1">السطوع: {brightness}%</label>
                <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full accent-yellow-500" />
              </div>
              <div>
                <label className="text-[11px] text-yellow-400 font-bold block mb-1">التباين: {contrast}%</label>
                <input type="range" min="50" max="150" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full accent-yellow-500" />
              </div>
              <div>
                <label className="text-[11px] text-yellow-400 font-bold block mb-1">تعتيم الخلفية: {imgOverlay}%</label>
                <input type="range" min="0" max="90" value={imgOverlay} onChange={(e) => setImgOverlay(Number(e.target.value))} className="w-full accent-yellow-500" />
              </div>
            </div>
          </div>
        )}

        {/* تبويب 2: العناصر والنصوص */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-yellow-400 block mb-1">عنوان الإعلان الرئيسي:</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-yellow-400 block mb-1">نص زر التحويل (CTA):</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-yellow-400 block mb-1">رابط التوجيه عند النقر (Target URL):</label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 font-mono"
              />
            </div>
          </div>
        )}

        {/* تبويب 3: فترة ظهور الإعلان (تاريخ البدء وتاريخ الإيقاف) */}
        {activeTab === 'dates' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-yellow-400 block mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} /> تاريخ بدء ظهور الإعلان:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-yellow-400 block mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} /> تاريخ إيقاف / انتهاء الإعلان:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-400">شريط التمرير الزمني المتحرك:</span>
              <button
                type="button"
                onClick={() => setHasProgressBar(!hasProgressBar)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  hasProgressBar ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {hasProgressBar ? 'مفعل' : 'معطل'}
              </button>
            </div>
          </div>
        )}

        {/* تبويب 4: الألوان */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-yellow-400 block mb-1">لون زر التحويل (Button):</label>
              <input
                type="color"
                value={btnBgColor}
                onChange={(e) => setBtnBgColor(e.target.value)}
                className="w-full h-10 bg-zinc-900 rounded-xl cursor-pointer border border-zinc-700"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-yellow-400 block mb-1">لون خلفية الإعلان:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 bg-zinc-900 rounded-xl cursor-pointer border border-zinc-700"
              />
            </div>
          </div>
        )}

        {/* تبويب 5: الحواف */}
        {activeTab === 'border' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-yellow-400 block mb-1">انحناء الزوايا: {borderRadius}px</label>
              <input
                type="range"
                min="0"
                max="30"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between gap-3">
          <NavLink
            to="/admin/ads"
            className="flex items-center gap-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 font-bold rounded-xl text-xs transition"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" /> رجوع لمعرض الإعلانات
          </NavLink>
          <button
            onClick={handleSaveAndPublish}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black rounded-xl text-xs transition shadow-lg shadow-yellow-500/20"
          >
            حفظ ونشر الإعلان الآن
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdGeneratorStudio;
