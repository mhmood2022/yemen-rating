import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Power,
  Calendar,
  Globe,
  Tag,
  Building,
  RefreshCw,
  Eye,
  ShieldCheck,
  Save,
  ImagePlus,
  Trash2,
  X
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

  // حقول الراعي الرسمي
  const [advertiserName, setAdvertiserName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [contractExpiry, setContractExpiry] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [sponsorRecordId, setSponsorRecordId] = useState<string | null>(null);

  // إحصائيات
  const [viewsCount, setViewsCount] = useState(0);
  const [clicksCount, setClicksCount] = useState(0);

  const logoInputRef = useRef<HTMLInputElement | null>(null);

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

        const adData = data.data || {};
        setAdvertiserName(adData.advertiserName || data.advertiser_name || '');
        setSlogan(adData.title || data.title || '');
        setTargetUrl(adData.targetUrl || data.target_url || '');
        setLogoUrl(adData.logoUrl || data.logo_url || '');
        setContractExpiry(adData.contractExpiry || data.contract_expiry || '');
      } else {
        setIsActive(false);
        setSponsorRecordId(null);
      }
    } catch (err) {
      showToast('error', 'تعذر تحميل بيانات الراعي الرسمي من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsorData();
  }, []);

  // رفع الشعار من الهاتف
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('warning', 'حجم الصورة كبير، يرجى اختيار شعار أقل من 3 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
          showToast('success', 'تم تحميل الشعار من هاتفك بنجاح');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // حفظ وتحديث بيانات الراعي الرسمي
  const handleSaveSponsor = async (desiredStatus?: boolean) => {
    const statusToSave = desiredStatus !== undefined ? desiredStatus : isActive;

    if (statusToSave && !advertiserName.trim()) {
      showToast('warning', 'يرجى كتابة اسم الجهة الراعية أولاً');
      return;
    }

    // التحقق من أن الرابط يبدأ بـ http:// أو https://
    const trimmedUrl = targetUrl.trim();
    if (trimmedUrl && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      showToast('warning', 'يجب أن يبدأ رابط الراعي بـ http:// أو https://');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        placement_id: 'home_sponsor',
        status: statusToSave ? 'active' : 'paused',
        data: {
          advertiserName: advertiserName.trim(),
          title: slogan.trim(),
          targetUrl: trimmedUrl,
          logoUrl: logoUrl.trim(),
          contractExpiry: contractExpiry.trim()
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
        if (newRec) setSponsorRecordId(newRec.id);
      }

      if (opError) throw opError;

      setIsActive(statusToSave);
      if (statusToSave) {
        showToast('success', 'تم حفظ وتفعيل الراعي الرسمي بنجاح ويظهر الآن في الرئيسية');
      } else {
        showToast('success', 'تم إيقاف الرعاية بنجاح واختفى شريط الراعي من الرئيسية');
      }
    } catch (err: any) {
      showToast('error', 'حدث خطأ أثناء الحفظ في قاعدة البيانات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 font-['Cairo',sans-serif] text-white p-4 max-w-6xl mx-auto">
      {/* التنبيهات بالهوية الفخمة */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
          <div className={`px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-[#0D1527]/95 border-emerald-500/60 text-emerald-400'
              : toast.type === 'warning'
              ? 'bg-[#0D1527]/95 border-[#F5C400]/60 text-[#F5C400]'
              : 'bg-[#0D1527]/95 border-red-500/60 text-red-400'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span className="text-xs font-bold leading-relaxed">{toast.text}</span>
            <button onClick={() => setToast(null)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white mr-1">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* الرأس */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="text-[#F5C400]" />
            <span>إدارة الراعي الرسمي للصفحة الرئيسية</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            التحكم الحصري بالجهة الراعية في أعلى شريط البحث بالصفحة الرئيسية.
          </p>
        </div>

        <button
          onClick={loadSponsorData}
          disabled={loading}
          className="px-3.5 py-2 bg-[#0D1527] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
          <span>تحديث</span>
        </button>
      </div>

      {/* لوحة التحكم */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* عمود البيانات */}
        <div className="lg:col-span-2 space-y-4 bg-[#0D1527] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-[#F5C400]" size={17} />
              <span>بيانات الراعي</span>
            </h2>
            <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {isActive ? 'الرعاية نشطة' : 'الرعاية معطلة'}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* اسم الجهة الراعية */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Building size={14} className="text-[#F5C400]" />
                <span>اسم الجهة الراعية *</span>
              </label>
              <input
                type="text"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="اسم الجهة الراعية"
                className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            {/* الشعار الترويجي */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Tag size={14} className="text-[#F5C400]" />
                <span>الشعار أو الجملة الترويجية</span>
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="الشعار الترويجي"
                className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            {/* رفع الشعار من الهاتف */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <ImagePlus size={14} className="text-[#F5C400]" />
                <span>شعار الراعي الرسمي</span>
              </label>

              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2.5 bg-[#060A13] border border-slate-800 hover:border-[#F5C400] text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ImagePlus size={16} className="text-[#F5C400]" />
                  <span>{logoUrl ? 'تغيير الشعار من الهاتف' : 'رفع الشعار من الهاتف'}</span>
                </button>

                {logoUrl && (
                  <div className="flex items-center gap-2 bg-[#060A13] border border-slate-800 rounded-xl p-1.5 pr-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 p-0.5 border border-slate-700 shrink-0">
                      <img src={logoUrl} alt="logo-preview" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] text-emerald-400 font-bold">تم التحميل</span>
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors mr-1"
                      title="حذف الشعار"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* رابط الزيارة (إلزامي يبدأ بـ http://) وتاريخ الانتهاء */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Globe size={14} className="text-[#F5C400]" />
                  <span>رابط الموقع (يبدأ بـ http://)</span>
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="http://example.com"
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs text-left font-mono focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#F5C400]" />
                  <span>تاريخ انتهاء الرعاية</span>
                </label>
                <input
                  type="date"
                  value={contractExpiry}
                  onChange={(e) => setContractExpiry(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveSponsor(!isActive)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <Power size={14} />
              <span>{isActive ? 'إيقاف وتعطيل الرعاية' : 'تنشيط وتفعيل الرعاية الآن'}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveSponsor(isActive)}
              className="px-6 py-2.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={15} />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </div>

        {/* المعاينة الحية */}
        <div className="space-y-4">
          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5C400]">
              <Eye size={15} />
              <span>المعاينة في شريط البحث:</span>
            </div>

            <div className="bg-[#060A13] border border-slate-800 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-[#F5C400]/15 text-[#F5C400] text-[10px] font-black border border-[#F5C400]/30 flex items-center gap-1 shrink-0">
                  <Sparkles size={11} />
                  <span>الراعي الرسمي</span>
                </span>
                {logoUrl && (
                  <div className="w-5 h-5 rounded overflow-hidden bg-white/10 p-0.5 border border-slate-700 shrink-0">
                    <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
                  </div>
                )}
                <span className="text-white text-xs font-bold truncate">
                  {advertiserName || 'اسم الجهة'}
                </span>
              </div>

              {slogan && (
                <span className="text-[10px] text-[#F5C400] font-bold shrink-0 truncate max-w-[140px]">
                  {slogan}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed bg-[#060A13] p-2.5 rounded-xl border border-slate-800">
              {isActive
                ? 'الرعاية مفعلة؛ تظهر في الصفحة الرئيسية مع الشعار والرابط.'
                : 'الرعاية معطلة؛ شريط البحث يظهر بدون أي راعٍ.'}
            </p>
          </div>

          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300 shadow-xl">
            <h3 className="font-bold text-white border-b border-slate-800 pb-2">بيانات الرعاية</h3>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">حالة الرابط:</span>
              <span className="text-emerald-400 font-bold">Supabase</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">عدد المشاهدات:</span>
              <span className="font-mono text-white font-bold">{viewsCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">تاريخ الانتهاء:</span>
              <span className="font-mono text-[#F5C400] font-bold">{contractExpiry || 'مستمر'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
