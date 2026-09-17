import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Power,
  RefreshCw,
  Save,
  ImagePlus,
  Video,
  Trash2,
  X,
  ArrowRight,
  Upload,
  Palette,
  Sliders,
  Check,
  Globe,
  Tag,
  Phone,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ToastState {
  type: 'success' | 'error' | 'warning';
  text: string;
}

export const SponsorManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // معرّف السجل الحالي في قاعدة البيانات
  const [sponsorRecordId, setSponsorRecordId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);
  const [clicksCount, setClicksCount] = useState(0);

  // 1. بيانات الراعي الأساسية
  const [advertiserName, setAdvertiserName] = useState('');
  const [sponsorTag, setSponsorTag] = useState('الراعي الرسمي');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [ctaText, setCtaText] = useState('زيارة الراعي');
  const [contractExpiry, setContractExpiry] = useState('');

  // 2. الوسائط (رفع من استوديو الهاتف)
  const [logoUrl, setLogoUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  // 3. التخصيص البصري والأبعاد والحركة
  const [bgColor, setBgColor] = useState('#090E1A');
  const [accentColor, setAccentColor] = useState('#F5C400');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [btnBgColor, setBtnBgColor] = useState('#F5C400');
  const [btnTextColor, setBtnTextColor] = useState('#000000');
  const [animationEffect, setAnimationEffect] = useState<'none' | 'shimmer' | 'pulse' | 'glow'>('shimmer');
  const [customHeight, setCustomHeight] = useState(160);

  const showToast = (type: 'success' | 'error' | 'warning', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // جلب بيانات الراعي من Supabase
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
        setTargetUrl(d.targetUrl || data.target_url || '');
        setCtaText(d.ctaText || 'زيارة الراعي');
        setContractExpiry(d.contractExpiry || data.contract_expiry || '');

        setLogoUrl(d.logoUrl || data.logo_url || '');
        setMediaUrl(d.mediaUrl || data.media_url || data.image_url || '');
        setMediaType(d.mediaType || (data.media_url?.endsWith('.mp4') ? 'video' : 'image'));

        if (d.styles) {
          if (d.styles.bgColor) setBgColor(d.styles.bgColor);
          if (d.styles.accentColor) setAccentColor(d.styles.accentColor);
          if (d.styles.textColor) setTextColor(d.styles.textColor);
          if (d.styles.btnBgColor) setBtnBgColor(d.styles.btnBgColor);
          if (d.styles.btnTextColor) setBtnTextColor(d.styles.btnTextColor);
          if (d.styles.animationEffect) setAnimationEffect(d.styles.animationEffect);
          if (d.styles.customHeight) setCustomHeight(d.styles.customHeight);
        }
      } else {
        setIsActive(false);
        setSponsorRecordId(null);
      }
    } catch {
      showToast('error', 'تعذر تحميل بيانات الراعي الرسمي من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsorData();
  }, []);

  // معالجة رفع الملفات من استوديو الهاتف
  const handlePhoneFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "logo" | "media"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    showToast("warning", `جارِ رفع ${isVideo ? "فيديو" : "شعار"} الراعي إلى السيرفر...`);

    try {
      const fileExt = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
      const fileName = `sponsors/${target}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("public")
        .getPublicUrl(fileName);

      if (target === "logo") {
        setLogoUrl(publicUrl);
        showToast("success", "تم رفع شعار الراعي بنجاح ✅");
      } else {
        setMediaUrl(publicUrl);
        setMediaType(isVideo ? "video" : "image");
        showToast("success", `تم رفع ${isVideo ? "فيديو" : "صورة"} الإعلان بنجاح ✅`);
      }
    } catch (err) {
      console.error("Storage upload fallback to reader:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          if (target === "logo") setLogoUrl(reader.result);
          else {
            setMediaUrl(reader.result);
            setMediaType(isVideo ? "video" : "image");
          }
          showToast("success", "تم حفظ الملف بنجاح ✅");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // حفظ وتفعيل إعلان الراعي
  const handleSaveSponsor = async (desiredStatus?: boolean) => {
    const statusToSave = desiredStatus !== undefined ? desiredStatus : isActive;

    if (statusToSave && !advertiserName.trim()) {
      showToast('warning', 'يرجى كتابة اسم الجهة الراعية أولاً');
      return;
    }

    const trimmedUrl = targetUrl.trim();
    if (trimmedUrl && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('tel:') && !trimmedUrl.startsWith('https://wa.me')) {
      showToast('warning', 'يرجى إدخال رابط يبدأ بـ https:// أو رقم هاتف صحيح');
      return;
    }

    try {
      setSaving(true);
      const generatedId = sponsorRecordId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "sponsor_" + Date.now());
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
          targetUrl: trimmedUrl,
          ctaText: ctaText.trim() || 'زيارة الراعي',
          contractExpiry: contractExpiry.trim(),
          logoUrl: logoUrl,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
          styles: {
            bgColor,
            accentColor,
            textColor,
            btnBgColor,
            btnTextColor,
            animationEffect,
            customHeight
          }
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
        const { data: newRec, error } = await supabase
          .from('published_ads')
          .insert([payload])
          .select()
          .single();
        opError = error;
        setSponsorRecordId(generatedId);
      }

      if (opError) throw opError;

      // مزامنة التخزين المحلي فوراً
      try {
        const saved = localStorage.getItem('yr_published_ads');
        const list = saved ? JSON.parse(saved) : [];
        const filtered = list.filter((a: any) => String(a.placementId) !== 'home_sponsor');
        if (statusToSave) {
          filtered.unshift({
            id: sponsorRecordId || 'home_sponsor_live',
            placementId: 'home_sponsor',
            placementName: 'الراعي الرسمي للصفحة الرئيسية',
            status: 'active',
            title: title || advertiserName,
            advertiserName: advertiserName,
            targetUrl: trimmedUrl,
            mediaUrl: mediaUrl,
            logoUrl: logoUrl,
            ctaText: ctaText,
            createdAt: new Date().toLocaleDateString('ar-YE'),
          views: 0,
          clicks: 0
          });
        }
        localStorage.setItem('yr_published_ads', JSON.stringify(filtered));
      } catch (_) {}

      setIsActive(statusToSave);
      showToast('success', statusToSave ? '🎉 تم حفظ وتفعيل إعلان الراعي بنجاح في المنصة!' : 'تم حفظ الإعلان وإيقاف ظهوره مؤقتاً.');
    } catch {
      const msg = opError?.message || opError?.details || err?.message || "خطأ غير محدد"; console.error("Supabase Error:", opError || err); showToast("error", `فشل الحفظ: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // حذف إعلان الراعي
  const handleDeleteSponsor = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف بيانات إعلان الراعي نهائياً؟')) return;
    try {
      setSaving(true);
      if (sponsorRecordId) {
        await supabase.from('published_ads').delete().eq('id', sponsorRecordId);
      }
      try {
        const saved = localStorage.getItem('yr_published_ads');
        if (saved) {
          const list = JSON.parse(saved).filter((a: any) => String(a.placementId) !== 'home_sponsor');
          localStorage.setItem('yr_published_ads', JSON.stringify(list));
        }
      } catch (_) {}

      setSponsorRecordId(null);
      setIsActive(false);
      setAdvertiserName('');
      setTitle('');
      setDescription('');
      setTargetUrl('');
      setLogoUrl('');
      setMediaUrl('');
      showToast('success', '✅ تم حذف سجل إعلان الراعي بنجاح.');
    } catch {
      showToast('error', 'تعذر حذف الإعلان من قاعدة البيانات.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 font-['Cairo',sans-serif] text-white p-3 sm:p-6 max-w-6xl mx-auto pb-20">
      
      {/* 🔔 التنبيهات المنبثقة الفخمة */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 w-[90%] max-w-md">
          <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-[#0D1527]/95 border-emerald-500/60 text-emerald-400'
              : toast.type === 'warning'
              ? 'bg-[#0D1527]/95 border-[#F5C400]/60 text-[#F5C400]'
              : 'bg-[#0D1527]/95 border-red-500/60 text-red-400'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={20} className="shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold leading-relaxed flex-1">{toast.text}</span>
            <button onClick={() => setToast(null)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 🔙 شريط الرأس مع زر الخروج والتراجع الآمن */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0B101D] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <NavLink
            to="/admin/ads"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#161D2B] text-yellow-400 hover:text-yellow-300 hover:bg-[#1F2937] border border-[#1F2937] transition-all font-black text-xs active:scale-95 shrink-0"
            title="إلغاء وخروج إلى إدارة الإعلانات"
          >
            <ArrowRight size={16} className="stroke-[2.5]" />
            <span>إلغاء وخروج</span>
          </NavLink>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="text-[#F5C400] shrink-0" size={20} />
              <span>استوديو إعلان الراعي الرسمي (Sponsor Studio)</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              تحكم متكامل في إعلان وهوية الراعي مع استعراض حي وفوري.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadSponsorData}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] bg-[#161D2B] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
            <span>تحديث</span>
          </button>
          <button
            onClick={() => handleSaveSponsor(true)}
            disabled={saving}
            className="flex-1 sm:flex-none px-6 py-2.5 min-h-[44px] bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Save size={15} />
            <span>{saving ? 'جارِ الحفظ...' : 'حفظ وتفعيل'}</span>
          </button>
        </div>
      </div>

      {/* 📱 شاشة المشاهدة الحية التفاعلية المباشرة لإعلان الراعي (Live Preview) */}
      <div className="bg-[#0B101D] border-2 border-[#F5C400]/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#F5C400]/20 rounded-lg text-[#F5C400]">
              <Sparkles size={16} className="animate-spin" />
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              المعاينة الحية الفورية لإعلان الراعي (Live Sponsor Preview)
            </span>
          </div>
          <span className="text-[10px] sm:text-xs bg-[#161D2B] border border-slate-700 text-[#F5C400] font-mono px-2.5 py-1 rounded-lg">
            الارتفاع: {customHeight}px • الحالة: {isActive ? '🟢 نشط' : '⚪ متوقف'}
          </span>
        </div>

        {/* بطاقة الإعلان الحقيقية كما تظهر للمستخدم */}
        <div
          className={`relative w-full rounded-2xl overflow-hidden border transition-all duration-300 shadow-2xl ${
            animationEffect === 'pulse' ? 'animate-pulse' :
            animationEffect === 'glow' ? 'shadow-[0_0_35px_rgba(245,196,0,0.35)]' : ''
          }`}
          style={{
            backgroundColor: bgColor,
            borderColor: accentColor,
            minHeight: `${customHeight}px`
          }}
        >
          {/* تأثير لمعان Shimmer */}
          {animationEffect === 'shimmer' && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />
          )}

          {/* شريط رأس الراعي */}
          <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-black border flex items-center gap-1 shrink-0"
                style={{
                  backgroundColor: `${accentColor}25`,
                  color: accentColor,
                  borderColor: accentColor
                }}
              >
                <Sparkles size={11} />
                <span>{sponsorTag || 'الراعي الرسمي'}</span>
              </span>

              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="sponsor-logo"
                  className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0 bg-black/40"
                />
              )}

              <span className="text-xs sm:text-sm font-black truncate" style={{ color: textColor }}>
                {advertiserName || 'اسم الجهة الراعية يظهر هنا'}
              </span>
            </div>

            <span className="text-[10px] text-zinc-400 font-bold shrink-0">إعلان معتمد</span>
          </div>

          {/* محتوى الإعلان ووسائطه وزر الإجراء */}
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-right space-y-1.5 min-w-0 w-full">
              <h3 className="text-sm sm:text-base font-black truncate" style={{ color: textColor }}>
                {title || 'عنوان إعلان الراعي الرئيسي'}
              </h3>
              <p className="text-xs opacity-80 line-clamp-2" style={{ color: textColor }}>
                {description || 'الوصف التسويقي المميز لخدمات وعروض الراعي الرسمي يظهر هنا بشكل أنيق ومتناسق...'}
              </p>
            </div>

            {mediaUrl && (
              <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={mediaUrl} alt="media" className="w-full h-full object-cover" />
                )}
              </div>
            )}

            <div
              className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-transform"
              style={{
                backgroundColor: btnBgColor,
                color: btnTextColor
              }}
            >
              <span>{ctaText || 'زيارة الراعي'}</span>
              <ExternalLink size={13} />
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ لوحة إدخال البيانات والوسائط (Touch-Optimized) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* القسم الأيمن: بيانات ونصوص الراعي */}
        <div className="bg-[#0B101D] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <h2 className="text-xs sm:text-sm font-black text-[#F5C400] flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
            <Tag size={16} />
            <span>بيانات ونصوص إعلان الراعي</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الراعي / الشركة المعلنة *</label>
            <input
              type="text"
              value={advertiserName}
              onChange={(e) => setAdvertiserName(e.target.value)}
              placeholder="مثال: بنك الكريمي للتمويل الأصغر الإسلامي"
              className="w-full min-h-[46px] bg-[#050811] border border-slate-700 focus:border-[#F5C400] rounded-xl px-3.5 text-xs sm:text-sm text-white outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">عبارة الرعاية (الشارة)</label>
              <input
                type="text"
                value={sponsorTag}
                onChange={(e) => setSponsorTag(e.target.value)}
                placeholder="مثال: الراعي الرسمي، شريك بلاتيني"
                className="w-full min-h-[46px] bg-[#050811] border border-slate-700 focus:border-[#F5C400] rounded-xl px-3 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نص زر الإجراء</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="مثال: اطلب الآن، زيارة، تواصل"
                className="w-full min-h-[46px] bg-[#050811] border border-slate-700 focus:border-[#F5C400] rounded-xl px-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان الإعلان الرئيسي</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: شريك الريادة والتميز المصرفي في اليمن"
              className="w-full min-h-[46px] bg-[#050811] border border-slate-700 focus:border-[#F5C400] rounded-xl px-3.5 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف التسويقي للإعلان</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً موجزاً وجذاباً للخدمات أو العروض المقدمة من الراعي..."
              className="w-full bg-[#050811] border border-slate-700 focus:border-[#F5C400] rounded-xl p-3 text-xs sm:text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط الزر (أو واتساب / هاتف)</label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com أو https://wa.me/..."
                className="w-full min-h-[46px] bg-[#050811] border border-slate-700 focus:border-[#F5C400] rounded-xl px-3 text-xs text-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">تاريخ انتهاء العقد</label>
              <input
                type="date"
                value={contractExpiry}
                onChange={(e) => setContractExpiry(e.target.value)}
                className="w-full min-h-[46px] bg-[#050811] border border-slate-700 focus:border-[#F5C400] rounded-xl px-3 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* القسم الأيسر: رفع الوسائط من الهاتف والتحكم بالمظهر والمقاس */}
        <div className="space-y-5">
          
          {/* رفع الوسائط من استوديو الهاتف مع استعراض بصري */}
          <div className="bg-[#0B101D] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <h2 className="text-xs sm:text-sm font-black text-[#F5C400] flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Upload size={16} />
              <span>الرفع المباشر من الهاتف (الاستوديو والملفات)</span>
            </h2>

            {/* 1. رفع شعار الراعي */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">شعار الراعي (Logo)</label>
              {logoUrl ? (
                <div className="flex items-center gap-3 p-2.5 bg-[#050811] border border-emerald-500/40 rounded-xl min-h-[50px]">
                  <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-black/60 border border-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-emerald-400 block truncate">تم تحميل الشعار بنجاح ✅</span>
                    <span className="text-[10px] text-slate-400">معروض في شريط الراعي</span>
                  </div>
                  <label className="px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center shrink-0">
                    <span>تغيير</span>
                    <input type="file" accept="image/*" onChange={(e) => handlePhoneFileUpload(e, 'logo')} className="hidden" />
                  </label>
                  <button type="button" onClick={() => setLogoUrl('')} className="p-2 text-slate-400 hover:text-red-400 shrink-0" title="حذف">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3.5 min-h-[48px] bg-[#050811] border border-dashed border-slate-700 hover:border-[#F5C400] rounded-xl cursor-pointer transition-colors group">
                  <ImagePlus size={18} className="text-[#F5C400] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-bold text-slate-300 group-hover:text-[#F5C400]">
                    اضغط لاختيار شعار الراعي من استوديو هاتفك
                  </span>
                  <input type="file" accept="image/*" onChange={(e) => handlePhoneFileUpload(e, 'logo')} className="hidden" />
                </label>
              )}
            </div>

            {/* 2. رفع صورة أو فيديو الإعلان */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">صورة أو فيديو الإعلان الرئيسي من الهاتف</label>
              {mediaUrl ? (
                <div className="flex items-center gap-3 p-2.5 bg-[#050811] border border-emerald-500/40 rounded-xl min-h-[50px]">
                  {mediaType === 'video' ? (
                    <video src={mediaUrl} className="w-12 h-10 rounded-lg object-cover bg-black shrink-0" />
                  ) : (
                    <img src={mediaUrl} alt="Media" className="w-12 h-10 rounded-lg object-cover bg-black shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-emerald-400 block truncate">تم تحميل الوسائط بنجاح ✅</span>
                    <span className="text-[10px] text-slate-400">{mediaType === 'video' ? 'فيديو إعلاني من هاتفك' : 'صورة إعلانية من هاتفك'}</span>
                  </div>
                  <label className="px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center shrink-0">
                    <span>تغيير</span>
                    <input type="file" accept="image/*,video/*" onChange={(e) => handlePhoneFileUpload(e, 'media')} className="hidden" />
                  </label>
                  <button type="button" onClick={() => setMediaUrl('')} className="p-2 text-slate-400 hover:text-red-400 shrink-0" title="حذف">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3.5 min-h-[48px] bg-[#050811] border border-dashed border-slate-700 hover:border-[#F5C400] rounded-xl cursor-pointer transition-colors group">
                  <Video size={18} className="text-[#F5C400] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-bold text-slate-300 group-hover:text-[#F5C400]">
                    اضغط لرفع صورة أو فيديو الإعلان من هاتفك
                  </span>
                  <input type="file" accept="image/*,video/*" onChange={(e) => handlePhoneFileUpload(e, 'media')} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* 🎨 تخصيص الألوان والمقاس والتأثير الحركي */}
          <div className="bg-[#0B101D] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <h2 className="text-xs sm:text-sm font-black text-[#F5C400] flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
              <Palette size={16} />
              <span>التحكم الذاتي بالألوان والأبعاد والحركة</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الخلفية</label>
                <div className="flex items-center gap-2 bg-[#050811] p-2 rounded-xl border border-slate-800 min-h-[44px]">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" />
                  <span className="text-[10px] text-white font-mono truncate">{bgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الإبراز / الشارة</label>
                <div className="flex items-center gap-2 bg-[#050811] p-2 rounded-xl border border-slate-800 min-h-[44px]">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" />
                  <span className="text-[10px] text-white font-mono truncate">{accentColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">زر الإجراء</label>
                <div className="flex items-center gap-2 bg-[#050811] p-2 rounded-xl border border-slate-800 min-h-[44px]">
                  <input type="color" value={btnBgColor} onChange={(e) => setBtnBgColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" />
                  <span className="text-[10px] text-white font-mono truncate">{btnBgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">نص الزر</label>
                <div className="flex items-center gap-2 bg-[#050811] p-2 rounded-xl border border-slate-800 min-h-[44px]">
                  <input type="color" value={btnTextColor} onChange={(e) => setBtnTextColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" />
                  <span className="text-[10px] text-white font-mono truncate">{btnTextColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تأثير الحركة البصري</label>
                <select
                  value={animationEffect}
                  onChange={(e: any) => setAnimationEffect(e.target.value)}
                  className="w-full min-h-[46px] bg-[#050811] border border-slate-700 rounded-xl px-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="none">ثابت بدون حركة</option>
                  <option value="shimmer">لمعان ذهبي دوري (Shimmer)</option>
                  <option value="pulse">نبض هادئ (Pulse)</option>
                  <option value="glow">توهج ملكي مستمر (Glow)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>ارتفاع الإعلان المخصص</span>
                  <span className="text-[#F5C400] font-mono">{customHeight}px</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="320"
                  step="10"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-full accent-[#F5C400] cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔘 شريط أزرار التحكم النهائي باللمس (حفظ، تفعيل/إيقاف، حذف) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0B101D] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* زر التفعيل / الإيقاف المؤقت */}
          <button
            type="button"
            onClick={() => handleSaveSponsor(!isActive)}
            disabled={saving}
            className={`flex-1 sm:flex-none px-4 py-3 min-h-[48px] rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            <Power size={16} />
            <span>{isActive ? 'إيقاف الرعاية مؤقتاً' : 'تفعيل ونشر الرعاية'}</span>
          </button>

          {/* زر الحذف */}
          {sponsorRecordId && (
            <button
              type="button"
              onClick={handleDeleteSponsor}
              disabled={saving}
              className="px-4 py-3 min-h-[48px] rounded-xl text-xs font-black bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">حذف</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <NavLink
            to="/admin/ads"
            className="flex-1 sm:flex-none px-5 py-3 min-h-[48px] rounded-xl text-xs font-bold text-slate-300 bg-[#161D2B] border border-slate-700 hover:bg-[#1F2937] flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>إلغاء وخروج</span>
          </NavLink>

          <button
            type="button"
            onClick={() => handleSaveSponsor(true)}
            disabled={saving}
            className="flex-1 sm:flex-none px-7 py-3 min-h-[48px] rounded-xl text-xs font-black text-black bg-[#F5C400] hover:bg-[#DDAF00] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? 'جارِ الحفظ...' : 'حفظ ونشر الإعلان فوراً'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
