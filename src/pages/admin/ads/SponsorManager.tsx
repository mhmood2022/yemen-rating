import React, { useState, useEffect } from 'react';
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
  Save
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const SponsorManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // الخيارات والحقول الكاملة للراعي الرسمي
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

  // جلب بيانات الراعي الحالية من Supabase
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
      console.error('Error loading sponsor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsorData();
  }, []);

  // حفظ وتحديث بيانات الراعي الرسمي
  const handleSaveSponsor = async (desiredStatus?: boolean) => {
    const statusToSave = desiredStatus !== undefined ? desiredStatus : isActive;

    if (statusToSave && !advertiserName.trim()) {
      setToastMessage('يرجى إدخال اسم الكيان / الجهة الراعية أولاً');
      setTimeout(() => setToastMessage(null), 3500);
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
          targetUrl: targetUrl.trim(),
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
      setToastMessage(
        statusToSave
          ? 'تم تفعيل ونشر الراعي الرسمي بنجاح ويظهر الآن في الصفحة الرئيسية'
          : 'تم إيقاف وتعطيل الراعي واختفى من شريط البحث في الصفحة الرئيسية'
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(err.message || 'حدث خطأ أثناء حفظ الراعي في Supabase');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 font-['Cairo',sans-serif] text-white p-4 max-w-6xl mx-auto">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-5 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={17} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* شريط العنوان */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="text-[#F5C400]" />
            <span>إدارة الراعي الرسمي للصفحة الرئيسية</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            التحكم الحصري بالجهة الراعية وشعار الرعاية الذي يظهر في أعلى شريط البحث لجميع زوار المنصة.
          </p>
        </div>

        <button
          onClick={loadSponsorData}
          disabled={loading}
          className="px-3.5 py-2 bg-[#0D1527] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#F5C400]' : ''} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* لوحة التحكم الشاملة بكل الخيارات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* عمود الخيارات والإدخال (الجهتين) */}
        <div className="lg:col-span-2 space-y-4 bg-[#0D1527] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-[#F5C400]" size={17} />
              <span>إعدادات عقد الرعاية وبيانات الراعي</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isActive ? 'الرعاية نشطة في الرئيسية' : 'الرعاية معطلة (مخفية)'}
              </span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* 1. اسم الجهة الراعية */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Building size={14} className="text-[#F5C400]" />
                <span>اسم الكيان / الجهة الراعية الرسمية *</span>
              </label>
              <input
                type="text"
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="مثال: بنك الكريمي للتمويل الأصغر الإسلامي، شركة يمن موبايل، مجموعة هائل سعيد..."
                className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            {/* 2. الجملة الإعلانية أو الشعار */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Tag size={14} className="text-[#F5C400]" />
                <span>شعار الرعاية أو الجملة الترويجية</span>
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="مثال: شريك التمكين المالي والتنمية الوطنية، الشبكة الأوسع والأقرب إليك..."
                className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            {/* 3. رابط الزيارة */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                <Globe size={14} className="text-[#F5C400]" />
                <span>رابط الزيارة أو صفحة المنشأة</span>
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://... أو /banks/kuraimi-bank"
                className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs text-left focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            {/* 4. خيارات متقدمة: تاريخ انتهاء العقد ورابط الشعار */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#F5C400]" />
                  <span>تاريخ انتهاء عقد الرعاية</span>
                </label>
                <input
                  type="date"
                  value={contractExpiry}
                  onChange={(e) => setContractExpiry(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <ExternalLink size={14} className="text-[#F5C400]" />
                  <span>رابط شعار الراعي (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-3 text-white text-xs text-left focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSponsor(!isActive)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                    : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Power size={14} />
                <span>{isActive ? 'إيقاف وتعطيل الرعاية (إخفاء)' : 'تنشيط وتفعيل الرعاية الآن'}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveSponsor(isActive)}
              className="px-6 py-2.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Save size={15} />
              <span>{saving ? 'جاري الحفظ في Supabase...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </div>

        {/* عمود المعاينة الحية والإحصائيات */}
        <div className="space-y-4">
          {/* المعاينة الحية المباشرة */}
          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5C400]">
              <Eye size={15} />
              <span>معاينة شريط الراعي في الصفحة الرئيسية:</span>
            </div>

            {/* تمثيل دقيق لشريط الراعي المدمج */}
            <div className="bg-[#060A13] border border-slate-800 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-[#F5C400]/15 text-[#F5C400] text-[10px] font-black border border-[#F5C400]/30 flex items-center gap-1 shrink-0">
                  <Sparkles size={11} />
                  <span>الراعي الرسمي</span>
                </span>
                <span className="text-white text-xs font-bold truncate">
                  {advertiserName || '(اكتب اسم الراعي للمعاينة)'}
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
                ? '✅ الرعاية مفعلة حالياً؛ ستظهر في رأس شريط البحث في الصفحة الرئيسية لجميع الزوار.'
                : '⏸️ الرعاية معطلة حالياً؛ شريط البحث يظهر بدون أي راعٍ وبشكل نظيف تماماً.'}
            </p>
          </div>

          {/* معلومات العقد والمشاهدات */}
          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300 shadow-xl">
            <h3 className="font-bold text-white border-b border-slate-800 pb-2">سجل العقد والمشاهدات</h3>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">حالة الربط:</span>
              <span className="text-emerald-400 font-bold">Supabase (published_ads)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">عدد المشاهدات:</span>
              <span className="font-mono text-white font-bold">{viewsCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">تاريخ انتهاء العقد:</span>
              <span className="font-mono text-[#F5C400] font-bold">{contractExpiry || 'مستمر / غير محدد'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
