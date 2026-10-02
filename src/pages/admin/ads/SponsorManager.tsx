import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  ExternalLink,
  Power,
  Save,
  Trash2,
  X,
  ArrowRight,
  Eye,
  ChevronDown,
  Image as ImageIcon,
  Film,
  Check,
  MessageCircle,
  Globe
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ToastState {
  type: 'success' | 'error' | 'warning';
  text: string;
}

const SPONSOR_TAG_OPTIONS = [
  'الراعي الرسمي',
  'الراعي الذهبي',
  'الراعي الماسي',
  'الراعي الفضي',
  'شريك استراتيجي',
  'عرض حصري',
  'راعي الفعالية',
  'إعلان مميز'
];

const ANIMATION_OPTIONS = [
  { id: 'none', label: 'بدون حركة' },
  { id: 'shimmer', label: 'لمعان دوري (Shimmer)' },
  { id: 'pulse', label: 'نبض هادئ (Pulse)' },
  { id: 'glow', label: 'توهج ناصع (Glow)' }
];

export const SponsorManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [sponsorRecordId, setSponsorRecordId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);
  const [clicksCount, setClicksCount] = useState(0);

  // 1. بيانات الراعي الأساسية
  const [advertiserName, setAdvertiserName] = useState('');
  const [sponsorTag, setSponsorTag] = useState('الراعي الرسمي');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contractExpiry, setContractExpiry] = useState('');

  // 2. تحكم الرابط الذكي (واتساب أو موقع)
  const [linkType, setLinkType] = useState<'whatsapp' | 'website'>('whatsapp');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ctaText, setCtaText] = useState('تواصل واتساب');

  // 3. الوسائط
  const [logoUrl, setLogoUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  // 4. التخصيص البصري
  const [bgColor, setBgColor] = useState('#090E1A');
  const [accentColor, setAccentColor] = useState('#F5C400');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [btnBgColor, setBtnBgColor] = useState('#16A34A');
  const [btnTextColor, setBtnTextColor] = useState('#FFFFFF');
  const [animationEffect, setAnimationEffect] = useState<'none' | 'shimmer' | 'pulse' | 'glow'>('shimmer');
  const [customHeight, setCustomHeight] = useState(130);

  // مراجع عناصر الإدخال
  const logoGalleryRef = useRef<HTMLInputElement>(null);
  const mediaGalleryRef = useRef<HTMLInputElement>(null);
  const mediaVideoRef = useRef<HTMLInputElement>(null);

  // حالات القوائم المنسدلة
  const [openTagDropdown, setOpenTagDropdown] = useState(false);
  const [openAnimDropdown, setOpenAnimDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const animDropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (type: 'success' | 'error' | 'warning', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // توليد الرابط المعتمد النهائي تلقائياً
  const getFinalTargetUrl = () => {
    if (linkType === 'whatsapp') {
      const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
      if (!cleanDigits) return '';
      if (cleanDigits.startsWith('967')) return `https://wa.me/${cleanDigits}`;
      if (cleanDigits.length === 9) return `https://wa.me/967${cleanDigits}`;
      if (cleanDigits.length === 10 && cleanDigits.startsWith('0')) return `https://wa.me/967${cleanDigits.slice(1)}`;
      return `https://wa.me/${cleanDigits}`;
    } else {
      let raw = websiteUrl.trim();
      if (!raw) return '';
      if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
      return `https://${raw}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setOpenTagDropdown(false);
      }
      if (animDropdownRef.current && !animDropdownRef.current.contains(e.target as Node)) {
        setOpenAnimDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSponsorData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('published_ads')
        .select('*')
        .eq('placement_id', 'home_sponsor')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setSponsorRecordId(data.id);
        setIsActive(data.status === 'active');
        setViewsCount(data.views || 0);
        setClicksCount(data.clicks || 0);

        const d = data.data || {};
        setAdvertiserName(d.advertiserName || data.advertiser_name || '');
        setSponsorTag(d.sponsorTag || 'الراعي الرسمي');
        setTitle(d.title || data.title || '');
        setDescription(d.description || data.description || '');
        setContractExpiry(d.contractExpiry || data.contract_expiry || '');

        const savedUrl = d.targetUrl || data.target_url || '';
        if (savedUrl.includes('wa.me/')) {
          setLinkType('whatsapp');
          const num = savedUrl.split('wa.me/')[1]?.replace('967', '') || '';
          setWhatsappNumber(num);
        } else if (savedUrl) {
          setLinkType('website');
          setWebsiteUrl(savedUrl.replace(/^https?:\/\//, ''));
        }

        setCtaText(d.ctaText || 'تواصل واتساب');
        setLogoUrl(d.logoUrl || data.logo_url || '');
        setMediaUrl(d.mediaUrl || data.media_url || data.image_url || '');
        setMediaType(d.mediaType || (data.media_url?.endsWith('.mp4') ? 'video' : 'image'));

        const styles = d.styles || {};
        if (styles.bgColor) setBgColor(styles.bgColor);
        if (styles.accentColor) setAccentColor(styles.accentColor);
        if (styles.textColor) setTextColor(styles.textColor);
        if (styles.btnBgColor) setBtnBgColor(styles.btnBgColor);
        if (styles.btnTextColor) setBtnTextColor(styles.btnTextColor);
        if (styles.animationEffect) setAnimationEffect(styles.animationEffect);
        if (styles.customHeight) setCustomHeight(styles.customHeight);
      }
    } catch {
      showToast('error', 'تعذر تحميل بيانات الراعي من السيرفر');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsorData();
  }, []);

  const compressImage = (file: File, maxW = 900, quality = 0.75): Promise<{ blob: Blob; base64: string }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        URL.revokeObjectURL(url);
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/webp", quality);
        canvas.toBlob((b) => {
          if (b) resolve({ blob: b, base64 });
          else reject(new Error("toBlob failed"));
        }, "image/webp", quality);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("img load error"));
      };
      img.src = url;
    });

  const handlePhoneFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "logo" | "media",
    forcedType?: 'image' | 'video'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = forcedType === 'video' || file.type.startsWith("video/");
    const MAX_VIDEO_MB = 10;
    if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      showToast("error", `حجم الفيديو أكبر من ${MAX_VIDEO_MB} ميجابايت.`);
      e.target.value = "";
      return;
    }

    showToast("warning", `جارِ معالجة ورفع ${isVideo ? "فيديو" : "صورة"} الراعي...`);

    try {
      let body: Blob | File = file;
      let fallbackBase64 = "";

      if (!isVideo) {
        const compressed = await compressImage(file, target === 'logo' ? 400 : 900);
        body = compressed.blob;
        fallbackBase64 = compressed.base64;
      }

      const fileExt = isVideo ? (file.name.split(".").pop() || "mp4") : "webp";
      const fileName = `ads/sponsors_${target}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("businesses")
        .upload(fileName, body, { upsert: true, contentType: isVideo ? file.type : "image/webp" });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("businesses")
          .getPublicUrl(fileName);

        if (target === "logo") {
          setLogoUrl(publicUrl);
        } else {
          setMediaUrl(publicUrl);
          setMediaType(isVideo ? "video" : "image");
        }
        showToast("success", `تم رفع ${isVideo ? "الفيديو" : "الشعار"} بنجاح للسحابة ✅`);
      } else {
        if (!isVideo && fallbackBase64) {
          if (target === "logo") setLogoUrl(fallbackBase64);
          else {
            setMediaUrl(fallbackBase64);
            setMediaType("image");
          }
          showToast("success", "تم حفظ الصورة بنجاح ✅");
        } else {
          throw uploadError;
        }
      }
    } catch (err: any) {
      console.error("Storage upload:", err);
      showToast("error", `فشل الرفع: ${err?.message || "خطأ غير متوقع"}`);
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveSponsor = async (desiredStatus?: boolean) => {
    const statusToSave = desiredStatus !== undefined ? desiredStatus : isActive;

    if (statusToSave && !advertiserName.trim()) {
      showToast('warning', 'يرجى كتابة اسم الجهة الراعية أولاً');
      return;
    }

    const targetUrl = getFinalTargetUrl();

    try {
      setSaving(true);
      const generatedId = sponsorRecordId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "sponsor_" + Date.now());

      const stylesData = {
        bgColor,
        accentColor,
        textColor,
        btnBgColor,
        btnTextColor,
        animationEffect,
        customHeight
      };

      const payload: any = {
        id: generatedId,
        is_sponsor: true,
        sponsor_name: advertiserName.trim(),
        sponsor_logo: logoUrl || "",
        sponsor_tag: sponsorTag.trim() || "الراعي الرسمي",
        placement_id: 'home_sponsor',
        status: statusToSave ? 'active' : 'paused',
        data: {
          advertiserName: advertiserName.trim(),
          sponsorTag: sponsorTag.trim(),
          title: title.trim(),
          description: description.trim(),
          targetUrl: targetUrl,
          ctaText: ctaText.trim() || (linkType === 'whatsapp' ? 'تواصل واتساب' : 'زيارة الموقع'),
          contractExpiry: contractExpiry.trim(),
          logoUrl: logoUrl,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
          styles: stylesData
        },
        views: viewsCount,
        clicks: clicksCount,
        updated_at: new Date().toISOString()
      };

      let opError = null;
      if (sponsorRecordId) {
        const { error } = await supabase
          .from('published_ads')
          .update(payload)
          .eq('id', sponsorRecordId);
        opError = error;
      } else {
        const { error } = await supabase
          .from('published_ads')
          .insert([payload])
          .select()
          .single();
        opError = error;
        setSponsorRecordId(generatedId);
      }

      if (opError) throw opError;

      // مزامنة التخزين المحلي الفوري
      try {
        const saved = localStorage.getItem('yr_published_ads');
        const list = saved ? JSON.parse(saved) : [];
        const filtered = list.filter((a: any) => String(a.placementId) !== 'home_sponsor');
        if (statusToSave) {
          filtered.unshift({
            id: sponsorRecordId || generatedId,
            placementId: 'home_sponsor',
            placementName: 'الراعي الرسمي',
            status: 'active',
            title: title || advertiserName,
            advertiserName: advertiserName,
            targetUrl: targetUrl,
            mediaUrl: mediaUrl,
            logoUrl: logoUrl,
            ctaText: ctaText.trim() || (linkType === 'whatsapp' ? 'تواصل واتساب' : 'زيارة الموقع'),
            createdAt: new Date().toLocaleDateString('ar-YE'),
            views: viewsCount,
            clicks: clicksCount,
            styles: stylesData
          });
        }
        localStorage.setItem('yr_published_ads', JSON.stringify(filtered));
      } catch (_) {}

      setIsActive(statusToSave);
      showToast('success', statusToSave ? '🎉 تم حفظ وتفعيل إعلان الراعي بالمنصة!' : 'تم حفظ الإعلان وإيقافه مؤقتاً.');
    } catch (err: any) {
      showToast('error', `فشل الحفظ: ${err?.message || "خطأ غير معروف"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-3 font-['Cairo',sans-serif] text-white p-2 sm:p-4 max-w-4xl mx-auto pb-16">
      
      {/* 🔮 أنماط حركات المعاينة الحية المباشرة */}
      <style>{`
        @keyframes yrPulseAnim {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes yrGlowAnim {
          0%, 100% { filter: brightness(1) contrast(1); }
          50% { filter: brightness(1.25) contrast(1.1); }
        }
        @keyframes yrShimmerAnim {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes yrBtnPulseAnim {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 196, 0, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 10px 2px rgba(245, 196, 0, 0.6); }
        }
        .sp-anim-pulse { animation: yrPulseAnim 3.5s ease-in-out infinite !important; }
        .sp-anim-glow { animation: yrGlowAnim 2.8s ease-in-out infinite alternate !important; }
        .sp-shimmer-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
          animation: yrShimmerAnim 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          pointer-events: none;
          z-index: 15;
        }
        .sp-btn-animated { animation: yrBtnPulseAnim 2.2s ease-in-out infinite !important; }
      `}</style>

      {/* التنبيهات */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm">
          <div className={`p-2.5 rounded-xl shadow-lg flex items-center justify-between border backdrop-blur-md text-xs font-bold ${
            toast.type === 'success'
              ? 'bg-[#0D1527]/95 border-emerald-500/50 text-emerald-400'
              : toast.type === 'warning'
              ? 'bg-[#0D1527]/95 border-amber-500/50 text-amber-300'
              : 'bg-[#0D1527]/95 border-rose-500/50 text-rose-400'
          }`}>
            <span>{toast.text}</span>
            <button onClick={() => setToast(null)} className="p-0.5 text-gray-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 🔙 شريط الرأس الرشيق */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-[#0B0F17] border border-[#1F2937] p-2.5 sm:p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <NavLink
            to="/admin/ads"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161D2B] text-yellow-400 hover:bg-[#1F2937] border border-[#1F2937] transition font-bold text-xs shrink-0"
            title="رجوع لمعرض الإعلانات"
          >
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>رجوع</span>
          </NavLink>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="text-[#FFC500]" size={15} />
              <span>إعلان الراعي الرسمي</span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => handleSaveSponsor(!isActive)}
          disabled={saving}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
            isActive 
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25' 
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
          }`}
        >
          <Power size={13} />
          <span>{isActive ? 'إيقاف الراعي' : 'تفعيل الراعي'}</span>
        </button>
      </div>

      {/* 📱 المعاينة الحية المباشرة (مطابقة للموقع العام بالملي) */}
      <div className="bg-[#0B0F17] border border-[#1F2937] rounded-xl p-2.5 sm:p-3 space-y-2">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#1F2937]">
          <div className="flex items-center gap-1.5 text-gray-300 font-semibold text-[11px]">
            <Eye size={13} className="text-[#FFC500]" />
            <span>معاينة حية فورية (كما يظهر في الموقع تماماً):</span>
          </div>
          <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isActive ? '● نشط' : '○ متوقف'}
          </span>
        </div>

        {/* مجسم الإعلان الحقيقي */}
        <div
          className="relative w-full rounded-none overflow-hidden transition-all duration-300 border-b-2"
          style={{
            backgroundColor: bgColor,
            borderColor: accentColor,
            minHeight: `${customHeight}px`
          }}
        >
          {mediaUrl ? (
            <div className="relative w-full h-24 sm:h-28 bg-[#0B101D] overflow-hidden group">
              {/* وسائط الإعلان مع الحركة الحية */}
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    animationEffect === 'pulse' ? 'sp-anim-pulse' :
                    animationEffect === 'glow' ? 'sp-anim-glow' : ''
                  }`}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="preview"
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    animationEffect === 'pulse' ? 'sp-anim-pulse' :
                    animationEffect === 'glow' ? 'sp-anim-glow' : ''
                  }`}
                />
              )}

              {/* لمعان Shimmer الحي */}
              {animationEffect === 'shimmer' && <div className="sp-shimmer-sweep" />}

              {/* طبقة التظليل والعناصر */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/50 flex flex-col justify-between p-2 z-10">
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      backgroundColor: `${accentColor}25`,
                      color: accentColor,
                      borderColor: `${accentColor}50`
                    }}
                    className="px-1.5 py-0.5 border text-[9px] font-black rounded-none flex items-center gap-1 backdrop-blur-sm"
                  >
                    <Sparkles size={10} />
                    <span>{sponsorTag}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <span
                      style={{
                        backgroundColor: btnBgColor,
                        color: btnTextColor
                      }}
                      className={`text-[9px] font-black px-2.5 py-0.5 rounded-none flex items-center gap-1 shadow-md transition-all ${
                        animationEffect !== 'none' ? 'sp-btn-animated' : ''
                      }`}
                    >
                      <span>{ctaText || (linkType === 'whatsapp' ? 'تواصل واتساب' : 'زيارة الموقع')}</span>
                      <ExternalLink size={9} />
                    </span>
                    <span className="text-[8px] text-zinc-300 bg-black/70 border border-white/15 px-1.5 py-0.5 rounded-none">
                      إعلان راعٍ ⓘ
                    </span>
                    <span className="text-[8px] font-black text-zinc-100 bg-white/15 border border-white/25 px-1 py-0.5 rounded-none font-sans">
                      AD
                    </span>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="logo"
                        style={{ borderColor: accentColor }}
                        className="w-5 h-5 rounded-full object-cover border bg-black/60 shrink-0"
                      />
                    )}
                    <h4 className="text-white text-[11px] sm:text-xs font-bold truncate drop-shadow-md">
                      {advertiserName || 'اسم الجهة الراعية'}
                    </h4>
                  </div>

                  {title && (
                    <p
                      style={{ color: textColor }}
                      className="text-[10px] font-bold drop-shadow-md shrink-0 text-left"
                    >
                      {title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* في حال عدم رفع وسائط (المعاينة النصية) */
            <div className="p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  style={{ color: accentColor, borderColor: accentColor }}
                  className="px-1.5 py-0.5 text-[9px] font-bold border rounded-none flex items-center gap-1"
                >
                  <Sparkles size={9} />
                  <span>{sponsorTag}</span>
                </span>
                {logoUrl && (
                  <img src={logoUrl} alt="logo" className="w-5 h-5 rounded-full object-cover border" style={{ borderColor: accentColor }} />
                )}
                <span className="text-white text-xs font-bold truncate">
                  {advertiserName || 'اسم الجهة الراعية'}
                </span>
              </div>
              <span
                style={{ backgroundColor: btnBgColor, color: btnTextColor }}
                className="text-[9px] font-black px-2 py-0.5 rounded-none flex items-center gap-0.5 shadow-md"
              >
                <span>{ctaText || 'زيارة'}</span>
                <ExternalLink size={9} />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 📝 نموذج التعديل المتكامل والذكي */}
      <div className="bg-[#0B0F17] border border-[#1F2937] rounded-xl p-3 sm:p-4 space-y-3">
        
        {/* بيانات الإعلان الأساسية */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-300 pb-1 border-b border-[#1F2937]">بيانات ونصوص الراعي:</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">اسم الراعي / الشركة *</label>
              <input
                type="text"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="مثال: فندق بلقيس مأرب"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#1F2937] text-white focus:outline-none focus:border-[#FFC500] text-xs"
              />
            </div>

            {/* عبارة الشارة */}
            <div className="relative" ref={tagDropdownRef}>
              <label className="block text-[11px] text-gray-400 mb-1">عبارة الشارة</label>
              <button
                type="button"
                onClick={() => setOpenTagDropdown(!openTagDropdown)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#1F2937] text-white text-xs flex items-center justify-between"
              >
                <span>{sponsorTag}</span>
                <ChevronDown size={14} className="text-[#FFC500]" />
              </button>

              {openTagDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#121824] border border-[#2D3748] rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-48 overflow-y-auto">
                  {SPONSOR_TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSponsorTag(tag);
                        setOpenTagDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-right text-xs flex items-center justify-between ${
                        sponsorTag === tag ? 'bg-[#FFC500]/15 text-[#FFC500] font-bold' : 'text-gray-200 hover:bg-[#1A2234]'
                      }`}
                    >
                      <span>{tag}</span>
                      {sponsorTag === tag && <Check size={13} className="text-[#FFC500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">عنوان الإعلان الرئيسي</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: انضم الآن"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#1F2937] text-white focus:outline-none focus:border-[#FFC500] text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">نص زر الإجراء</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="مثال: تواصل واتساب أو زيارة الرابط"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#1F2937] text-white focus:outline-none focus:border-[#FFC500] text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-gray-400 mb-1">الوصف التسويقي</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصفاً موجزاً للخدمات أو العرض..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#1F2937] text-white focus:outline-none focus:border-[#FFC500] text-xs resize-none"
              />
            </div>
          </div>
        </div>

        {/* 🟢 قسم الرابط المباشر للواتساب أو الموقع بدون أي لصق يدوي */}
        <div className="space-y-2 pt-2 border-t border-[#1F2937]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">توجيه الزر:</span>
            <div className="flex items-center gap-1 bg-[#161D2B] p-0.5 rounded-lg border border-[#1F2937]">
              <button
                type="button"
                onClick={() => {
                  setLinkType('whatsapp');
                  setCtaText('تواصل واتساب');
                  setBtnBgColor('#16A34A');
                  setBtnTextColor('#FFFFFF');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                  linkType === 'whatsapp' ? 'bg-[#16A34A] text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageCircle size={12} />
                <span>واتساب مباشر</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkType('website');
                  setCtaText('زيارة الموقع');
                  setBtnBgColor('#F5C400');
                  setBtnTextColor('#000000');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                  linkType === 'website' ? 'bg-[#F5C400] text-black shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Globe size={12} />
                <span>موقع إلكتروني</span>
              </button>
            </div>
          </div>

          {linkType === 'whatsapp' ? (
            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <label className="block text-[11px] font-bold text-emerald-400">رقم هاتف الواتساب (9 أرقام فقط):</label>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1.5 bg-[#161D2B] border border-[#1F2937] rounded-lg text-xs font-mono text-gray-300 dir-ltr">
                  +967
                </span>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="مثال: 772457898"
                  maxLength={9}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#161D2B] border border-emerald-500/40 text-white font-mono text-sm focus:outline-none focus:border-emerald-400 text-left dir-ltr"
                />
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
              <label className="block text-[11px] font-bold text-amber-400">رابط الموقع الإلكتروني:</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="google.com أو رابط الموقع"
                className="w-full px-3 py-1.5 rounded-lg bg-[#161D2B] border border-amber-500/40 text-white text-xs focus:outline-none focus:border-amber-400 text-left dir-ltr"
              />
            </div>
          )}
        </div>

        {/* 🎨 وسائط الإعلان (المعرض والاستوديو) */}
        <div className="pt-2 border-t border-[#1F2937] space-y-2">
          <label className="block text-[11px] text-gray-300 font-bold">وسائط الإعلان (المعرض والاستوديو):</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            
            {/* رفع الشعار */}
            <div className="relative">
              <input
                ref={logoGalleryRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhoneFileUpload(e, 'logo', 'image')}
                className="hidden"
              />
              <div
                onClick={() => logoGalleryRef.current?.click()}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl bg-[#161D2B]/80 border-2 border-dashed border-[#FFC500] hover:bg-[#FFC500]/5 transition-all cursor-pointer text-center active:scale-98"
              >
                <ImageIcon size={16} className="text-[#FFC500]" />
                <span className="text-[10px] font-bold text-white">
                  {logoUrl ? 'تغيير شعار الراعي' : 'اختيار شعار الراعي'}
                </span>
                <span className="text-[8.5px] text-[#FFC500]">استوديو ومعرض الصور</span>
              </div>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="absolute top-1.5 left-1.5 p-1 rounded-md bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                  title="حذف الشعار"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>

            {/* رفع وسائط الإعلان */}
            <div className="relative flex flex-col gap-1">
              <input
                ref={mediaGalleryRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhoneFileUpload(e, 'media', 'image')}
                className="hidden"
              />
              <input
                ref={mediaVideoRef}
                type="file"
                accept="video/*"
                onChange={(e) => handlePhoneFileUpload(e, 'media', 'video')}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-1.5">
                <div
                  onClick={() => mediaGalleryRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-[#161D2B]/80 border-2 border-dashed border-[#FFC500] hover:bg-[#FFC500]/5 transition-all cursor-pointer text-center active:scale-98"
                >
                  <ImageIcon size={15} className="text-[#FFC500]" />
                  <span className="text-[9.5px] font-bold text-white">صورة من المعرض</span>
                </div>

                <div
                  onClick={() => mediaVideoRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-[#161D2B]/80 border-2 border-dashed border-[#FFC500] hover:bg-[#FFC500]/5 transition-all cursor-pointer text-center active:scale-98"
                >
                  <Film size={15} className="text-[#FFC500]" />
                  <span className="text-[9.5px] font-bold text-white">فيديو من المعرض</span>
                </div>
              </div>

              {mediaUrl && (
                <div className="flex items-center justify-between p-1 rounded-lg bg-[#161D2B] border border-[#1F2937] text-[10px]">
                  <span className="text-emerald-400 font-bold truncate max-w-[190px]">✓ تم اختيار {mediaType === 'video' ? 'الفيديو' : 'الصورة'}</span>
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="p-1 rounded text-rose-400 hover:text-white"
                    title="حذف الوسائط"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 🎨 تخصيص ألوان الزر والنصوص والبطاقة */}
        <div className="pt-2 border-t border-[#1F2937] space-y-2">
          <label className="block text-[11px] text-gray-300 font-bold">ألوان الزر والنصوص والحركة:</label>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
            <div className="p-1.5 bg-[#161D2B] rounded-lg border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">لون خلفية الزر</span>
                <span className="text-[8.5px] text-gray-400 font-mono">{btnBgColor}</span>
              </div>
              <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
            </div>

            <div className="p-1.5 bg-[#161D2B] rounded-lg border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">لون نص الزر</span>
                <span className="text-[8.5px] text-gray-400 font-mono">{btnTextColor}</span>
              </div>
              <input type="color" value={btnTextColor} onChange={(e) => setBtnTextColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
            </div>

            <div className="p-1.5 bg-[#161D2B] rounded-lg border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">لون العنوان</span>
                <span className="text-[8.5px] text-gray-400 font-mono">{textColor}</span>
              </div>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
            </div>

            <div className="p-1.5 bg-[#161D2B] rounded-lg border border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">لون الإطار</span>
                <span className="text-[8.5px] text-gray-400 font-mono">{accentColor}</span>
              </div>
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            {/* حركة الزر والوسائط */}
            <div className="relative" ref={animDropdownRef}>
              <label className="block text-[10px] text-gray-400 mb-1">تأثير الحركة البصرية</label>
              <button
                type="button"
                onClick={() => setOpenAnimDropdown(!openAnimDropdown)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#161D2B] border border-[#1F2937] text-white text-xs flex items-center justify-between"
              >
                <span>{ANIMATION_OPTIONS.find(o => o.id === animationEffect)?.label || 'بدون حركة'}</span>
                <ChevronDown size={13} className="text-[#FFC500]" />
              </button>

              {openAnimDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#121824] border border-[#2D3748] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  {ANIMATION_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAnimationEffect(item.id as any);
                        setOpenAnimDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-right text-xs flex items-center justify-between ${
                        animationEffect === item.id ? 'bg-[#FFC500]/15 text-[#FFC500] font-bold' : 'text-gray-200 hover:bg-[#1A2234]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {animationEffect === item.id && <Check size={13} className="text-[#FFC500]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>ارتفاع الإعلان</span>
                <span className="font-mono text-[#FFC500]">{customHeight}px</span>
              </div>
              <input
                type="range"
                min={110}
                max={200}
                step={5}
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                className="w-full accent-[#FFC500] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* زر الحفظ النهائي الرشيق */}
        <div className="pt-1">
          <button
            onClick={() => handleSaveSponsor(true)}
            disabled={saving}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? 'جارِ الحفظ...' : 'حفظ وتفعيل إعلان الراعي فوراً'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
