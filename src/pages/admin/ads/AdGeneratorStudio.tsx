import React, { useState } from 'react';
import { 
  Sparkles, Smartphone, Tablet, Monitor, Image as ImageIcon, 
  Palette, Move, Crop, Sliders, Layers, Eye, Download, 
  CheckCircle2, ArrowRight, ExternalLink, RefreshCw, Upload
} from 'lucide-react';
import { YR_AD_PLACEMENTS } from '../../../utils/adGeneratorEngine';
import { adminAuditService } from '../../../services/adminService';

export const AdGeneratorStudio: React.FC = () => {
  // 1. أبعاد ومواضع الإعلان
  const [selectedPlacement, setSelectedPlacement] = useState(YR_AD_PLACEMENTS[0]);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // 2. المحتوى والنصوص
  const [badgeText, setBadgeText] = useState('إعلان ممول — YR Ads');
  const [headline, setHeadline] = useState('عرض خاص وحصري عبر منصة يمن ريتنغ');
  const [description, setDescription] = useState('احصل على خصم 25% على كافة الخدمات المعتمدة لفترة محدودة');
  const [ctaText, setCtaText] = useState('استكشف العرض الآن');
  const [targetUrl, setTargetUrl] = useState('https://yemen-rating.com');

  // 3. التصميم والألوان
  const [bgColor, setBgColor] = useState('#0B0F17');
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'image'>('gradient');
  const [accentColor, setAccentColor] = useState('#FFC500');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [borderRadius, setBorderRadius] = useState(16);
  const [isAnimated, setIsAnimated] = useState(true);

  // 4. أداة تحريك واقتصاص العناصر (Positioning & Transform)
  const [imgUrl, setImgUrl] = useState('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80');
  const [imgScale, setImgScale] = useState(100);
  const [imgOverlay, setImgOverlay] = useState(60); // تعتيم الخلفية
  const [activeTool, setActiveTool] = useState<'content' | 'style' | 'media' | 'position'>('content');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // حفظ الإعلان في النظام
  const handleSaveAd = async () => {
    setSaveSuccess(true);
    await adminAuditService.logAction('تصميم ونشر إعلان من YR Ads Studio', 'ad_campaign', `AD-${Date.now()}`, {
      placement: selectedPlacement.name,
      headline,
      accentColor
    });
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      {/* رأس الاستوديو ومحدد الأجهزة */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B0F17] p-5 rounded-2xl border border-[#1F2937]">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="text-[#FFC500]" />
            YR Ads Studio — مولد ومصمم الإعلانات الاحترافي
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            أدوات تصميم متكاملة مع إمكانية المعاينة الحية على الهواتف والأجهزة المكتبية للمواضع الـ 10
          </p>
        </div>

        {/* أزرار المعاينة على الأجهزة */}
        <div className="flex items-center gap-2 bg-[#161D2B] p-1.5 rounded-xl border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] px-2 font-bold hidden sm:inline">المعاينة على:</span>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'mobile' ? 'bg-[#FFC500] text-black shadow-md' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Smartphone size={14} /> هاتف
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'tablet' ? 'bg-[#FFC500] text-black shadow-md' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Tablet size={14} /> تابلت
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'desktop' ? 'bg-[#FFC500] text-black shadow-md' : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Monitor size={14} /> كمبيوتر
          </button>
        </div>
      </div>

      {/* منطقة العمل الرئيسية: أدوات التحكم + شاشة المعاينة الحية */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* شريط الأدوات والتحكم (5 أعمدة) */}
        <div className="lg:col-span-5 bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-5 space-y-5">
          {/* تبويبات أدوات الاستوديو */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#161D2B] rounded-xl border border-[#1F2937] text-xs font-bold">
            <button
              onClick={() => setActiveTool('content')}
              className={`py-2 rounded-lg transition-all ${activeTool === 'content' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
            >
              النصوص
            </button>
            <button
              onClick={() => setActiveTool('style')}
              className={`py-2 rounded-lg transition-all ${activeTool === 'style' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
            >
              الألوان
            </button>
            <button
              onClick={() => setActiveTool('media')}
              className={`py-2 rounded-lg transition-all ${activeTool === 'media' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
            >
              الوسائط
            </button>
            <button
              onClick={() => setActiveTool('position')}
              className={`py-2 rounded-lg transition-all ${activeTool === 'position' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}
            >
              الموضع
            </button>
          </div>

          {/* 1. تبويب الموضع والمقاس */}
          {activeTool === 'position' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1.5">موضع العرض المستهدف في الموقع (10 مواضع)</label>
                <select
                  value={selectedPlacement.id}
                  onChange={(e) => {
                    const found = YR_AD_PLACEMENTS.find(p => p.id === e.target.value);
                    if (found) setSelectedPlacement(found);
                  }}
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-3 text-xs text-white focus:border-[#FFC500] outline-none"
                >
                  {YR_AD_PLACEMENTS.map(p => (
                    <option key={p.id} value={p.id}>
                      موضع #{p.id}: {p.name} ({p.width}x{p.height}px)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1">انحناء الحواف (Border Radius)</label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-[#FFC500]"
                />
                <span className="text-[10px] text-[#9CA3AF]">{borderRadius}px</span>
              </div>

              <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937] flex items-center justify-between">
                <span className="text-xs font-bold text-white">تأثير التوهج المتحرك (Animated Glow)</span>
                <input
                  type="checkbox"
                  checked={isAnimated}
                  onChange={(e) => setIsAnimated(e.target.checked)}
                  className="w-4 h-4 accent-[#FFC500] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 2. تبويب النصوص والمحتوى */}
          {activeTool === 'content' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1">شارة الإعلان العلوية (Badge)</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1">النص الترويجي والوصف</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#D1D5DB] block mb-1">نص زر الإجراء (CTA)</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#D1D5DB] block mb-1">الرابط المستهدف</label>
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

          {/* 3. تبويب الألوان والتدرجات */}
          {activeTool === 'style' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1.5">نوع الخلفية</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['gradient', 'solid', 'image'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setBgType(type)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        bgType === type ? 'border-[#FFC500] bg-[#FFC500]/15 text-[#FFC500]' : 'border-[#1F2937] bg-[#161D2B] text-[#9CA3AF]'
                      }`}
                    >
                      {type === 'gradient' ? 'تدرج لوني' : type === 'solid' ? 'لون موحد' : 'صورة خلفية'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                  <label className="text-[11px] font-bold text-[#9CA3AF] block mb-1">لون التمييز (Accent)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-white">{accentColor}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#161D2B] rounded-xl border border-[#1F2937]">
                  <label className="text-[11px] font-bold text-[#9CA3AF] block mb-1">لون الخلفية الأساسي</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-white">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. تبويب الوسائط والصور */}
          {activeTool === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1">رابط صورة الإعلان</label>
                <input
                  type="text"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1">حجم وتقريب الصورة (Zoom/Crop): {imgScale}%</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={imgScale}
                  onChange={(e) => setImgScale(Number(e.target.value))}
                  className="w-full accent-[#FFC500]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#D1D5DB] block mb-1">درجة تعتيم الخلفية للقراءة (Overlay): {imgOverlay}%</label>
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
          )}

          {/* زر الحفظ والنشر */}
          <button
            onClick={handleSaveAd}
            className="w-full py-3.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 size={16} className="text-black" />
                <span>تم حفظ وتوثيق الإعلان بنجاح!</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>حفظ وتثبيت الإعلان للحملة</span>
              </>
            )}
          </button>
        </div>

        {/* شاشة المعاينة التفاعلية الحية (7 أعمدة) */}
        <div className="lg:col-span-7 bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-5 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between border-b border-[#1F2937] pb-3 mb-6">
            <span className="text-xs font-bold text-[#9CA3AF]">
              معاينة حية: <b className="text-white">{selectedPlacement.name}</b> ({selectedPlacement.width}x{selectedPlacement.height}px)
            </span>
            <span className="px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] text-[10px] font-bold">
              مظهر حقيقي Live Render
            </span>
          </div>

          {/* إطار محاكي الأجهزة */}
          <div 
            className={`transition-all duration-300 w-full flex items-center justify-center p-4 bg-[#070A10] rounded-xl border border-dashed border-[#1F2937] overflow-hidden ${
              viewMode === 'mobile' ? 'max-w-[380px]' : viewMode === 'tablet' ? 'max-w-[580px]' : 'max-w-full'
            }`}
          >
            {/* الإعلان المصمم */}
            <div
              style={{
                borderRadius: `${borderRadius}px`,
                borderColor: accentColor,
                backgroundColor: bgColor,
                backgroundImage: bgType === 'gradient' 
                  ? `linear-gradient(135deg, ${bgColor} 0%, #161D2B 100%)` 
                  : bgType === 'image' ? `url(${imgUrl})` : 'none',
                backgroundSize: `${imgScale}%`,
                backgroundPosition: 'center',
              }}
              className={`relative overflow-hidden w-full border-2 p-6 transition-all duration-200 shadow-2xl flex flex-col justify-between ${
                isAnimated ? 'shadow-[#FFC500]/10 hover:shadow-[#FFC500]/20' : ''
              }`}
            >
              {/* طبقة التعتيم للقراءة فوق الصورة */}
              {bgType === 'image' && (
                <div 
                  className="absolute inset-0 bg-black" 
                  style={{ opacity: imgOverlay / 100 }} 
                />
              )}

              {/* المحتوى الداخلي للإعلان */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    style={{ backgroundColor: `${accentColor}25`, color: accentColor, borderColor: `${accentColor}40` }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wide inline-flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                    {badgeText}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-mono">YR Verified</span>
                </div>

                <div>
                  <h3 style={{ color: textColor }} className="text-base sm:text-lg font-black leading-snug">
                    {headline}
                  </h3>
                  <p className="text-xs text-[#D1D5DB] mt-1.5 leading-relaxed line-clamp-2">
                    {description}
                  </p>
                </div>
              </div>

              {/* زر الإجراء السفلي */}
              <div className="relative z-10 pt-5 mt-2 flex items-center justify-between border-t border-white/10">
                <button
                  style={{ backgroundColor: accentColor }}
                  className="px-4 py-2 rounded-xl text-black font-black text-xs shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{ctaText}</span>
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </button>

                <div className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                  <ExternalLink size={11} />
                  <span>yemen-rating.com</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#6B7280] mt-4 text-center">
            * يتم تكييف أبعاد الإعلان تلقائياً عند النشر ليناسب حاويات الموضع الـ 10 المختارة.
          </p>
        </div>
      </div>
    </div>
  );
};
