import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Megaphone,
  Sparkles,
  Play,
  Pause,
  Trash2,
  Pencil,
  LayoutGrid,
  Table,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Power
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { adsDatabaseService } from '../../../services/adsDatabaseService';
import { PublishedAd } from './AdGeneratorStudio';

export const AdsManager: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<PublishedAd[]>([]);
  const [viewFormat, setViewFormat] = useState<'grid' | 'table'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // إدارة الراعي الرسمي للصفحة الرئيسية
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorSlogan, setSponsorSlogan] = useState('');
  const [sponsorUrl, setSponsorUrl] = useState('');
  const [isSponsorActive, setIsSponsorActive] = useState(false);
  const [savingSponsor, setSavingSponsor] = useState(false);

  // 1. جلب الإعلانات العادية
  useEffect(() => {
    const loadAllAds = async () => {
      try {
        const cloudAds = await adsDatabaseService.getActiveAds();
        if (cloudAds && cloudAds.length > 0) {
          setAds(cloudAds);
        }
      } catch (err) {
        console.error('Error loading ads:', err);
      }
    };
    loadAllAds();
  }, []);

  // 2. جلب الراعي الرسمي الحالي من Supabase
  const fetchCurrentSponsor = async () => {
    try {
      const { data } = await supabase
        .from('published_ads')
        .select('*')
        .eq('placement_id', 'home_sponsor')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const adData = data.data || {};
        setSponsorName(adData.advertiserName || data.advertiser_name || '');
        setSponsorSlogan(adData.title || data.title || '');
        setSponsorUrl(adData.targetUrl || data.target_url || '');
        setIsSponsorActive(data.status === 'active');
      } else {
        setIsSponsorActive(false);
      }
    } catch (err) {
      console.error('Error fetching sponsor:', err);
    }
  };

  useEffect(() => {
    fetchCurrentSponsor();
  }, []);

  // حفظ أو تحديث الراعي الرسمي في Supabase
  const handleSaveSponsor = async (active: boolean) => {
    if (active && !sponsorName.trim()) {
      setToastMessage('يرجى كتابة اسم الجهة الراعية أولاً');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      setSavingSponsor(true);
      const sponsorPayload = {
        placement_id: 'home_sponsor',
        status: active ? 'active' : 'paused',
        data: {
          advertiserName: sponsorName.trim(),
          title: sponsorSlogan.trim(),
          targetUrl: sponsorUrl.trim()
        },
        views: 0,
        clicks: 0,
        updated_at: new Date().toISOString()
      };

      // فحص هل يوجد سجل مسبق لتحديثه أو إدخال جديد
      const { data: existing } = await supabase
        .from('published_ads')
        .select('id')
        .eq('placement_id', 'home_sponsor')
        .limit(1)
        .maybeSingle();

      let opError = null;
      if (existing?.id) {
        const { error } = await supabase
          .from('published_ads')
          .update(sponsorPayload)
          .eq('id', existing.id);
        opError = error;
      } else {
        const { error } = await supabase
          .from('published_ads')
          .insert([sponsorPayload]);
        opError = error;
      }

      if (opError) throw opError;

      setIsSponsorActive(active);
      setToastMessage(active ? 'تم تفعيل ونشر الراعي الرسمي بنجاح' : 'تم تعطيل وإخفاء الراعي الرسمي من الصفحة الرئيسية');
      setTimeout(() => setToastMessage(null), 3500);
      fetchCurrentSponsor();
    } catch (err: any) {
      setToastMessage(err.message || 'حدث خطأ في حفظ الراعي');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setSavingSponsor(false);
    }
  };

  const toggleAdStatus = (id: string) => {
    const updated = ads.map((a) =>
      a.id === id ? ({ ...a, status: a.status === 'active' ? 'paused' : 'active' } as PublishedAd) : a
    );
    setAds(updated);
  };

  return (
    <div dir="rtl" className="space-y-6 font-['Cairo',sans-serif] text-white p-4 max-w-6xl mx-auto">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-5 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الرأس */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Megaphone className="text-[#F5C400]" />
            <span>مركز إدارة الإعلانات والرعاة</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            التحكم بإعلانات المنصة والرعاة الرسميين في الصفحة الرئيسية وشاشات البحث.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/ads/generator')}
          className="px-4 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
        >
          <Sparkles size={15} />
          <span>استوديو توليد الإعلانات الذكي</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 🌟 بطاقة التحكم بالراعي الرسمي للصفحة الرئيسية (Official Sponsor) */}
      {/* ============================================================ */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F5C400]/15 text-[#F5C400] border border-[#F5C400]/30">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">الراعي الرسمي للصفحة الرئيسية (شريط البحث)</h2>
              <p className="text-[11px] text-slate-400">
                يظهر أعلى شريط البحث في الصفحة الرئيسية لـ 100% من الزوار.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
              isSponsorActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {isSponsorActive ? 'الراعي مفعّل وحي الآن' : 'الراعي معطّل (مخفي)'}
            </span>
          </div>
        </div>

        {/* مدخلات الراعي */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">اسم الجهة الراعية *</label>
            <input
              type="text"
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              placeholder="مثال: بنك الكريمي للتمويل الأصغر"
              className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">الجملة الدعائية / الشعار</label>
            <input
              type="text"
              value={sponsorSlogan}
              onChange={(e) => setSponsorSlogan(e.target.value)}
              placeholder="مثال: شريك التمكين المالي والتنمية"
              className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">رابط الزيارة (اختياري)</label>
            <input
              type="text"
              value={sponsorUrl}
              onChange={(e) => setSponsorUrl(e.target.value)}
              placeholder="https://... أو /banks/kuraimi-bank"
              className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white text-left focus:outline-none focus:border-[#F5C400]"
            />
          </div>
        </div>

        {/* المعاينة الحية كما ستظهر في الصفحة الرئيسية */}
        <div className="p-3 bg-[#060A13] rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 font-bold block">معاينة شريط الراعي المدمج في شريط البحث:</span>
          <div className="bg-[#060A13] border border-slate-800 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#F5C400]/15 text-[#F5C400] text-[10px] font-black border border-[#F5C400]/30 flex items-center gap-1">
                <Sparkles size={11} />
                <span>الراعي الرسمي</span>
              </span>
              <span className="text-white text-xs font-bold">
                {sponsorName || '(اكتب اسم الجهة الراعية أعلاه للظهور)'}
              </span>
            </div>
            {sponsorSlogan && (
              <span className="text-[10px] text-[#F5C400] font-bold">
                {sponsorSlogan}
              </span>
            )}
          </div>
        </div>

        {/* أزرار التحكم بالراعي */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
          {isSponsorActive && (
            <button
              type="button"
              disabled={savingSponsor}
              onClick={() => handleSaveSponsor(false)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-xl transition-all"
            >
              إيقاف وتعطيل الراعي (إخفاء)
            </button>
          )}

          <button
            type="button"
            disabled={savingSponsor}
            onClick={() => handleSaveSponsor(true)}
            className="px-5 py-2 bg-[#F5C400] hover:bg-[#DDAF00] text-black text-xs font-black rounded-xl transition-all shadow-md"
          >
            {savingSponsor ? 'جاري الحفظ...' : 'حفظ وتفعيل الراعي الرسمي الآن'}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* قائمة باقي الإعلانات والبانرات */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">كافة الحملات والبانرات النشطة</h2>
          <span className="text-xs text-[#F5C400] font-bold">الإعلانات: {ads.length}</span>
        </div>

        {ads.length === 0 ? (
          <div className="py-12 text-center bg-[#0D1527] rounded-2xl border border-slate-800 text-slate-400 text-xs">
            لا توجد إعلانات بنرات عادية مضافة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-[#0D1527] border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white truncate">{ad.title}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${ad.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {ad.status === 'active' ? 'نشط' : 'متوقف'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{ad.advertiserName}</p>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => toggleAdStatus(ad.id)}
                    className="p-1.5 rounded-lg bg-[#060A13] text-slate-300 hover:text-white"
                  >
                    {ad.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
