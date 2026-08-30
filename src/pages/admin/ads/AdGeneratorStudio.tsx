import React, { useState, useRef } from 'react';
import { 
  Sparkles, Smartphone, Tablet, Monitor, Image as ImageIcon, 
  Palette, Crop, Video, Upload, Layers, Eye, CheckCircle2, 
  ExternalLink, ArrowRight, Sliders, Play, X, Trash2, Maximize2
} from 'lucide-react';
import { YR_AD_PLACEMENTS } from '../../../utils/adGeneratorEngine';
import { adminAuditService } from '../../../services/adminService';

const PRESET_PALETTES = [
  { name: 'ذهب يمن ريتنغ', bg: '#0B0F17', accent: '#FFC500', btnBg: '#FFC500', btnText: '#000000', text: '#FFFFFF' },
  { name: 'أزرق توثيق ملكي', bg: '#070F26', accent: '#2EA5FF', btnBg: '#2EA5FF', btnText: '#FFFFFF', text: '#FFFFFF' },
  { name: 'أخضر نجاح زمردي', bg: '#061A11', accent: '#16A34A', btnBg: '#16A34A', btnText: '#FFFFFF', text: '#FFFFFF' },
  { name: 'أحمر عروض عاجلة', bg: '#1A0606', accent: '#DC2626', btnBg: '#DC2626', btnText: '#FFFFFF', text: '#FFFFFF' },
  { name: 'بنفسجي VIP نخبوي', bg: '#130A24', accent: '#A855F7', btnBg: '#A855F7', btnText: '#FFFFFF', text: '#FFFFFF' },
  { name: 'فضي بلاتيني فخم', bg: '#111827', accent: '#E5E7EB', btnBg: '#FFFFFF', btnText: '#000000', text: '#F3F4F6' },
  { name: 'عنبري دافئ', bg: '#1A0F00', accent: '#F59E0B', btnBg: '#F59E0B', btnText: '#000000', text: '#FFFFFF' },
  { name: 'أسود داكن مطفي', bg: '#000000', accent: '#FFC500', btnBg: '#1F2937', btnText: '#FFC500', text: '#FFFFFF' }
];

export const AdGeneratorStudio: React.FC = () => {
  // 1. نوع الإعلان وموضعه
  const [adType, setAdType] = useState<'image' | 'video' | 'animated' | 'ticker'>('image');
  const [selectedPlacement, setSelectedPlacement] = useState(YR_AD_PLACEMENTS[0]);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // 2. الوسائط (رفع حقيقي من الهاتف)
  const [mediaFileUrl, setMediaFileUrl] = useState<string>('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=85');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [aspectRatio, setAspectRatio] = useState<'auto' | '16:9' | '1:1' | '4:1'>('auto');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [imgOverlay, setImgOverlay] = useState(40);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 3. النصوص
  const [badgeText, setBadgeText] = useState('إعلان ممول — Yemen Rating');
  const [headline, setHeadline] = useState('أكبر تخفيضات الموسم في صنعاء وعدن');
  const [description, setDescription] = useState('تغطية شاملة لأفضل الشركات الموثقة وخدمات رجال الأعمال مع خصومات حصرية للمشتركين.');
  const [ctaText, setCtaText] = useState('اكتشف العرض الآن');
  const [targetUrl, setTargetUrl] = useState('https://yemen-rating.com');

  // 4. تخصيص الألوان بالكامل
  const [bgColor, setBgColor] = useState('#0B0F17');
  const [bgStyle, setBgStyle] = useState<'gradient' | 'solid' | 'transparent'>('gradient');
  const [headlineColor, setHeadlineColor] = useState('#FFFFFF');
  const [descColor, setDescColor] = useState('#D1D5DB');
  const [badgeBgColor, setBadgeBgColor] = useState('rgba(255, 197, 0, 0.15)');
  const [badgeTextColor, setBadgeTextColor] = useState('#FFC500');
  const [btnBgColor, setBtnBgColor] = useState('#FFC500');
  const [btnTextColor, setBtnTextColor] = useState('#000000');
  
  // 5. الحواف والإطارات
  const [hasBorder, setHasBorder] = useState(true);
  const [borderWidth, setBorderWidth] = useState(2);
  const [borderColor, setBorderColor] = useState('#FFC500');
  const [borderRadius, setBorderRadius] = useState(16);
  const [hasGlow, setHasGlow] = useState(true);

  // 6. حالات الحفظ والمعاينة في الموقع
  const [publishedModal, setPublishedModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'type' | 'media' | 'content' | 'colors' | 'border'>('type');

  // معالجة رفع الملفات من الهاتف (صور أو فيديو)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const fileUrl = URL.createObjectURL(file);
      setMediaFileUrl(fileUrl);
      setMediaType(isVideo ? 'video' : 'image');
      if (isVideo) setAdType('video');
    }
  };

  // تطبيق لوحة ألوان جاهزة
  const applyPalette = (pal: typeof PRESET_PALETTES[0]) => {
    setBgColor(pal.bg);
    setHeadlineColor(pal.text);
    setBtnBgColor(pal.btnBg);
    setBtnTextColor(pal.btnText);
    setBorderColor(pal.accent);
    setBadgeTextColor(pal.accent);
    setBadgeBgColor(`${pal.accent}25`);
  };

  // نشر الإعلان وحفظه
  const handlePublish = async () => {
    await adminAuditService.logAction('نشر إعلان استوديو كامل المواصفات', 'ad_campaign', `AD-${Date.now()}`, {
      headline,
      placement: selectedPlacement.name,
      adType,
      targetUrl
    });
    setPublishedModal(true);
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif] pb-12">
      
      {/* 1. منطقة المعاينة العلوية المثبتة للموبايل (Sticky Live Mobile Preview) */}
      <div className="sticky top-16 z-30 bg-[#070A10]/95 backdrop-blur-md p-4 rounded-2xl border border-[#1F2937] shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-[#1F2937] pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
            <span className="text-xs font-black text-white">المعاينة الحية الفورية (Live Studio Render)</span>
          </div>

          {/* محدد حجم الجهاز */}
          <div className="flex items-center gap-1 bg-[#161D2B] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === 'mobile' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}
              title="هاتف"
            >
              <Smartphone size={15} />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === 'tablet' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}
              title="تابلت"
            >
              <Tablet size={15} />
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === 'desktop' ? 'bg-[#FFC500] text-black font-bold' : 'text-[#9CA3AF]'}`}
              title="كمبيوتر"
            >
              <Monitor size={15} />
            </button>
          </div>
        </div>

        {/* كونسول الإعلان الحقيقي */}
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
                boxShadow: hasGlow && hasBorder ? `0 0 25px ${borderColor}33` : 'none',
              }}
              className="relative overflow-hidden w-full p-4 sm:p-5 flex flex-col justify-between transition-all"
            >
              {/* وسائط الخلفية (صورة ناصعة أو فيديو حقيقي) */}
              {mediaFileUrl && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {mediaType === 'video' ? (
                    <video 
                      src={mediaFileUrl} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover" 
                    />
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
                  {/* طبقة التعتيم للقراءة */}
                  <div 
                    className="absolute inset-0 bg-black transition-opacity" 
                    style={{ opacity: imgOverlay / 100 }} 
                  />
                </div>
              )}

              {/* المحتوى النصي */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    style={{ 
                      backgroundColor: badgeBgColor, 
                      color: badgeTextColor,
                      borderColor: badgeTextColor
                    }}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black border tracking-wide inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: badgeTextColor }} />
                    {badgeText}
                  </span>
                  <span className="text-[10px] text-white/80 font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                    {selectedPlacement.name.split(' ')[0]}
                  </span>
                </div>

                <div>
                  <h3 
                    style={{ color: headlineColor }} 
                    className="text-sm sm:text-base font-black leading-tight drop-shadow-md"
                  >
                    {headline}
                  </h3>
                  <p 
                    style={{ color: descColor }} 
                    className="text-xs mt-1 leading-relaxed line-clamp-2 drop-shadow"
                  >
                    {description}
                  </p>
                </div>
              </div>

              {/* زر الإجراء السفلي */}
              <div className="relative z-10 pt-3 mt-2 flex items-center justify-between border-t border-white/10">
                <button
                  style={{ 
                    backgroundColor: btnBgColor, 
                    color: btnTextColor 
                  }}
                  className="px-4 py-2 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                >
                  <span>{ctaText}</span>
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </button>

                <span className="text-[10px] text-white/70 font-mono">YR Verified Ad</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. شريط التمرير الأفقي للمواضع الـ 10 (Horizontal Placements Scroll) */}
      <div className="bg-[#0B0F17] p-3 rounded-2xl border border-[#1F2937] space-y-2">
        <label className="text-xs font-black text-[#FFC500] flex items-center gap-1.5">
          <Layers size={14} /> اختر موضع العرض في المنصة (10 مواضع معتمدة):
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {YR_AD_PLACEMENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlacement(p)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPlacement.id === p.id 
                  ? 'bg-[#FFC500] text-black border-[#FFC500] shadow-md shadow-[#FFC500]/20' 
                  : 'bg-[#161D2B] text-[#9CA3AF] border-[#1F2937] hover:text-white'
              }`}
            >
              #{p.id} {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. شريط أدوات التعديل المتكامل (Editing Tool Tabs) */}
      <div className="bg-[#0B0F17] p-5 rounded-2xl border border-[#1F2937] space-y-5">
        
        {/* أزرار التبويبات مع ألوان واضحة */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#161D2B] rounded-xl border border-[#1F2937] text-xs font-black">
          <button
            onClick={() => setActiveTab('type')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'type' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
          >
            نوع الإعلان
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'media' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
          >
            الصور/الفيديو
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2 rounded-lg transition-all ${activeTab === 'content' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
          >
            النصوص
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
            الإطار
          </button>
        </div>

        {/* تبويب 1: نوع الإعلان */}
        {activeTab === 'type' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#D1D5DB] block">اختر نوع وهيئة الإعلان:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'image', title: 'صورة ثابتة (Banner)', icon: ImageIcon },
                { id: 'video', title: 'إعلان فيديو تفاعلي', icon: Video },
                { id: 'animated', title: 'إعلان متوهج ومتحرك', icon: Sparkles },
                { id: 'ticker', title: 'شريط ترويجي عاجل', icon: Maximize2 },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setAdType(t.id as any);
                      if (t.id === 'animated') setHasGlow(true);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                      adType === t.id 
                        ? 'border-[#FFC500] bg-[#FFC500]/15 text-[#FFC500]' 
                        : 'border-[#1F2937] bg-[#161D2B] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-bold">{t.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* تبويب 2: رفع ومعالجة الوسائط من الهاتف */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#D1D5DB] block mb-2">
                تحميل صورة أو فيديو من هاتفك مباشرة:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#161D2B] border-2 border-dashed border-[#FFC500]/50 hover:border-[#FFC500] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Upload size={16} className="text-[#FFC500]" />
                  <span>اضغط لاختيار صورة/فيديو من الألبوم</span>
                </button>
                {mediaFileUrl && (
                  <button
                    onClick={() => setMediaFileUrl('')}
                    className="p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 hover:bg-[#DC2626]/20"
                    title="حذف الوسائط"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* معالجة نقاء ووضوح الصورة */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <div>
                <label className="text-[11px] text-[#9CA3AF] block mb-1">السطوع والنقاء: {brightness}%</label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#FFC500]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#9CA3AF] block mb-1">التباين وإبراز الألوان: {contrast}%</label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-[#FFC500]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#9CA3AF] block mb-1">عتمة الخلفية للقراءة: {imgOverlay}%</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={imgOverlay}
                  onChange={(e) => setImgOverlay(Number(e.target.value))}
                  className="w-full accent-[#FFC500]"
                />
              </div>
            </div>
          </div>
        )}

        {/* تبويب 3: النصوص والروابط */}
        {activeTab === 'content' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#9CA3AF] block mb-1">شارة الإعلان العلوية</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#9CA3AF] block mb-1">العنوان الرئيسي للإعلان</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#9CA3AF] block mb-1">الوصف التسويقي</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[#9CA3AF] block mb-1">نص الزر (CTA)</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#9CA3AF] block mb-1">الرابط الموجه</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* تبويب 4: لوحة الألوان المفتوحة وتخصيص كل عنصر */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            {/* قوالب جاهزة سريعة */}
            <div>
              <label className="text-xs font-bold text-[#FFC500] block mb-2">قوالب ألوان فخمة وسريعة:</label>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {PRESET_PALETTES.map((pal, i) => (
                  <button
                    key={i}
                    onClick={() => applyPalette(pal)}
                    className="shrink-0 p-2 rounded-xl bg-[#161D2B] border border-[#1F2937] flex items-center gap-2 hover:border-[#FFC500]"
                  >
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: pal.accent }} />
                    <span className="text-[11px] font-bold text-white">{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* تخصيص ألوان الأزرار والنصوص بدقة */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">خلفية زر الإجراء</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={btnBgColor}
                    onChange={(e) => setBtnBgColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-white">{btnBgColor}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">نص زر الإجراء</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={btnTextColor}
                    onChange={(e) => setBtnTextColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-white">{btnTextColor}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">لون العنوان الرئيسي</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={headlineColor}
                    onChange={(e) => setHeadlineColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-white">{headlineColor}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">لون نص الوصف</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={descColor}
                    onChange={(e) => setDescColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-white">{descColor}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <label className="text-[10px] text-[#9CA3AF] block mb-1 font-bold">لون خلفية الإعلان</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-white">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تبويب 5: تخصيص الحواف والإطار (Border Freedom) */}
        {activeTab === 'border' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
              <div>
                <div className="text-xs font-bold text-white">تفعيل الإطار والحواف</div>
                <div className="text-[10px] text-[#9CA3AF]">يمكنك إلغاء الإطار تماماً وجعل الإعلان بدون حواف</div>
              </div>
              <button
                type="button"
                onClick={() => setHasBorder(!hasBorder)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  hasBorder ? 'bg-[#16A34A] text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {hasBorder ? 'مفعل (يوجد إطار)' : 'ملغي (بدون إطار)'}
              </button>
            </div>

            {hasBorder && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">سماكة الإطار: {borderWidth}px</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(Number(e.target.value))}
                    className="w-full accent-[#FFC500]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">انحناء الزوايا: {borderRadius}px</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full accent-[#FFC500]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#9CA3AF] block mb-1">لون الإطار</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-white">{borderColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* زر النشر النهائي وتوليد المعاينة الحية */}
        <button
          onClick={handlePublish}
          className="w-full py-4 rounded-xl bg-[#FFC500] text-black font-black text-sm hover:bg-[#FFC500]/90 transition-all shadow-xl shadow-[#FFC500]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Sparkles size={18} />
          <span>حفظ ونشر الإعلان فوراً وعرضه في الموقع</span>
        </button>
      </div>

      {/* نافذة معاينة الإعلان المنشور داخل الموقع (Live Placement Modal) */}
      {publishedModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F2937] rounded-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#16A34A]" />
                <h3 className="text-sm font-bold text-white">تم نشر الإعلان بنجاح — محاكاة الظهور في صفحات يمن ريتنغ</h3>
              </div>
              <button onClick={() => setPublishedModal(false)} className="text-[#9CA3AF] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-[#161D2B] rounded-xl text-xs text-[#D1D5DB]">
              يظهر الإعلان حالياً في: <b className="text-[#FFC500]">{selectedPlacement.name}</b>
            </div>

            {/* شكل الإعلان الحي */}
            <div className="p-4 bg-[#070A10] rounded-xl border border-dashed border-[#1F2937] flex justify-center">
              <div 
                style={{
                  borderRadius: `${borderRadius}px`,
                  border: hasBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
                  backgroundColor: bgColor,
                  backgroundImage: bgStyle === 'gradient' ? `linear-gradient(135deg, ${bgColor} 0%, #161D2B 100%)` : 'none',
                }}
                className="relative overflow-hidden w-full max-w-lg p-5 shadow-2xl space-y-3"
              >
                {mediaFileUrl && (
                  <div className="absolute inset-0 z-0">
                    <img src={mediaFileUrl} alt="Ad media" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black" style={{ opacity: imgOverlay / 100 }} />
                  </div>
                )}

                <div className="relative z-10 space-y-2">
                  <span style={{ backgroundColor: badgeBgColor, color: badgeTextColor }} className="px-2.5 py-0.5 rounded-full text-[10px] font-black border">
                    {badgeText}
                  </span>
                  <h4 style={{ color: headlineColor }} className="text-base font-black">{headline}</h4>
                  <p style={{ color: descColor }} className="text-xs line-clamp-2">{description}</p>
                  
                  <button style={{ backgroundColor: btnBgColor, color: btnTextColor }} className="px-4 py-2 rounded-lg font-black text-xs">
                    {ctaText}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
              <button
                onClick={() => setPublishedModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90"
              >
                تم والعودة للاستوديو
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
