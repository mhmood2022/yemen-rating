import { adsDatabaseService } from '../../../services/adsDatabaseService';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Megaphone, Sparkles, Play, Pause, Trash2, Pencil, LayoutGrid, Table, ArrowRight, Eye, MousePointer } from 'lucide-react';
import { PublishedAd } from './AdGeneratorStudio';

export const AdsManager: React.FC = () => {
  const navigate = useNavigate();
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [ads, setAds] = useState<PublishedAd[]>([]);
  const [viewFormat, setViewFormat] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    const loadAllAdsFromCloud = async () => {
      try {
        const cloudAds = await adsDatabaseService.getActiveAds();
        if (cloudAds && cloudAds.length > 0) {
          setAds(cloudAds);
          try {
            localStorage.setItem('yr_published_ads', JSON.stringify(cloudAds));
          } catch (_) {}
        }
      } catch (err) {
        console.error("Error loading ads from cloud:", err);
      }
    };
    loadAllAdsFromCloud();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('yr_published_ads');
    if (saved) {
      try {
        setAds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleAdStatus = async (id: string) => {
    const currentAd = ads.find(a => a.id === id);
    if (!currentAd) return;
    const newStatus = currentAd.status === "active" ? "paused" : "active";

    // 1. تحديث الواجهة فوراً
    const updated = ads.map(a => a.id === id ? { ...a, status: newStatus } as PublishedAd : a);
    setAds(updated);
    try {
      localStorage.setItem("yr_published_ads", JSON.stringify(updated));
    } catch (_) {}

    // 2. إرسال التحديث الحقيقي لقاعدة بيانات Supabase ليتوقف الإعلان فوراً في الموقع العام
    try {
      await adsDatabaseService.updateAdStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to sync ad status with cloud:", err);
    }
  };

  const deleteAd = async (id: string) => {
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);
    try {
      localStorage.setItem('yr_published_ads', JSON.stringify(updated));
    } catch (_) {}
    try {
      await adsDatabaseService.deleteAd(id);
    } catch (e) {
      console.error(e);
    }
    setDeleteSuccess('✅ تم حذف الإعلان بنجاح من قاعدة البيانات والمنصة!');
    setTimeout(() => setDeleteSuccess(null), 3500);
  };

  return (
    <div className="space-y-4 font-['Cairo',sans-serif] pb-16">
      {deleteSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <span>{deleteSuccess}</span>
          <button onClick={() => setDeleteSuccess(null)} className="text-emerald-400 hover:text-white px-2 py-0.5">✕</button>
        </div>
      )}

      {/* الهيدر المنسق الرشيق */}
      <div className="bg-[#0B0F17] p-3.5 sm:p-4 rounded-xl border border-[#1F2937] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            <NavLink
              to="/admin"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161D2B] text-yellow-400 hover:bg-[#1F2937] border border-[#1F2937] transition font-bold text-xs shrink-0"
              title="رجوع للوحة التحكم"
            >
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>رجوع</span>
            </NavLink>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-[#FFC500]" />
              <span>معرض الإعلانات المنشورة</span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* أزرار التبديل شبكة / جدول */}
            <div className="flex items-center gap-0.5 bg-[#161D2B] p-0.5 rounded-lg border border-[#1F2937]">
              <button 
                onClick={() => setViewFormat('grid')} 
                className={`p-1.5 rounded-md text-xs transition-all ${viewFormat === 'grid' ? 'bg-[#FFC500] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                title="عرض شبكي"
              >
                <LayoutGrid size={14} />
              </button>
              <button 
                onClick={() => setViewFormat('table')} 
                className={`p-1.5 rounded-md text-xs transition-all ${viewFormat === 'table' ? 'bg-[#FFC500] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                title="عرض جدول"
              >
                <Table size={14} />
              </button>
            </div>

            {/* أزرار الإجراءات */}
            <NavLink
              to="/admin/sponsor"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161D2B] hover:bg-[#1F2937] text-amber-400 border border-[#1F2937] font-bold text-[11px] transition-all"
            >
              <Sparkles size={13} />
              <span>إعلان راعٍ</span>
            </NavLink>
            <NavLink
              to="/admin/ads/generator"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFC500] hover:bg-[#FFC500]/90 text-black font-bold text-[11px] transition-all shadow-sm"
            >
              <Sparkles size={13} />
              <span>إنشاء إعلان</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* المعرض المرئي (شبكة) */}
      {viewFormat === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ads.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400 bg-[#0B0F17] rounded-xl border border-[#1F2937] text-xs">
              لا توجد إعلانات منشورة حالياً. اضغط على "إنشاء إعلان" لتصميم أول إعلان.
            </div>
          ) : (
            ads.map((ad) => {
              // تنظيف المسمى من الأقواس والنصوص الإنجليزية الطويلة
              const cleanPlacement = (ad.placementName || '')
                .replace(/\(.*?\)/g, '')
                .replace(/^[^\s]+—\s*/, '')
                .trim() || ad.placementName || 'موضع غير محدد';

              return (
                <div key={ad.id} className="bg-[#0B0F17] rounded-xl border border-[#1F2937] p-3 space-y-2.5 shadow-sm">
                  {/* شريط رأس البطاقة */}
                  <div className="flex items-center justify-between border-b border-[#1F2937] pb-2">
                    <div className="min-w-0 pr-1">
                      <div className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-xs">{cleanPlacement}</div>
                      <div className="text-[9.5px] text-gray-400 font-mono">{ad.id.slice(0, 10)} • {ad.createdAt?.split('T')[0] || ad.createdAt}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ad.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ad.status === 'active' ? 'نشط' : 'متوقف'}
                      </span>

                      <button 
                        onClick={() => toggleAdStatus(ad.id)} 
                        className="p-1.5 rounded-md bg-[#161D2B] text-gray-300 hover:text-[#FFC500] border border-[#1F2937]"
                        title={ad.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل'}
                      >
                        {ad.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                      </button>

                      <button
                        onClick={() => navigate(`/admin/ads/generator?editId=${ad.id}`)}
                        className="p-1.5 rounded-md bg-[#FFC500]/10 text-[#FFC500] hover:bg-[#FFC500] hover:text-black border border-[#FFC500]/20 transition-all"
                        title="تعديل الإعلان"
                      >
                        <Pencil size={12} />
                      </button>

                      <button 
                        onClick={() => deleteAd(ad.id)} 
                        className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all"
                        title="حذف الإعلان"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* مجسم الإعلان الحقيقي */}
                  <div
                    style={{
                      borderRadius: `${ad.borderRadius || 8}px`,
                      border: ad.hasBorder ? `${ad.borderWidth || 1}px solid ${ad.borderColor || '#333'}` : 'none',
                      backgroundColor: ad.bgColor || '#111',
                      backgroundImage: ad.bgStyle === 'gradient' ? `linear-gradient(135deg, ${ad.bgColor} 0%, #161D2B 100%)` : 'none',
                      boxShadow: ad.hasGlow && ad.hasBorder ? `0 0 15px ${ad.borderColor}40` : 'none',
                    }}
                    className="relative overflow-hidden w-full min-h-[140px] flex flex-col justify-between p-3"
                  >
                    {ad.hasProgressBar && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-20 overflow-hidden">
                        <div
                          style={{
                            backgroundColor: ad.progressBarColor || '#FFC500',
                            animation: `yrAdProgress ${ad.progressDuration || 5}s linear infinite`
                          }}
                          className="h-full w-full origin-left"
                        />
                      </div>
                    )}

                    {ad.mediaUrl && (
                      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
                        {ad.mediaType === 'video' ? (
                          <video src={ad.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={ad.mediaUrl}
                            alt="Ad"
                            style={{
                              objectFit: ad.imageFit || 'cover',
                              objectPosition: `${ad.imgPosX ?? 50}% ${ad.imgPosY ?? 50}%`,
                              transform: `scale(${(ad.imgScale ?? 100) / 100})`,
                              filter: `brightness(${ad.brightness ?? 100}%) contrast(${ad.contrast ?? 100}%)`,
                              imageRendering: 'crisp-edges'
                            }}
                            className="w-full h-full"
                          />
                        )}
                        {Number(ad.imgOverlay || 0) > 0 && (
                          <div className="absolute inset-0 bg-black" style={{ opacity: Number(ad.imgOverlay) / 100 }} />
                        )}
                      </div>
                    )}

                    <div className="relative z-10 space-y-1">
                      {ad.showBadge && (
                        <span style={{ backgroundColor: ad.badgeBgColor, color: ad.badgeTextColor, borderColor: ad.badgeTextColor }} className="px-1.5 py-0.5 rounded text-[9px] font-bold border inline-block">
                          {ad.badgeText}
                        </span>
                      )}
                      {ad.showHeadline && (
                        <h4 style={{ color: ad.headlineColor }} className="text-xs sm:text-sm font-bold drop-shadow-md line-clamp-1">
                          {ad.headline}
                        </h4>
                      )}
                      {ad.showDescription && (
                        <p style={{ color: ad.descColor }} className="text-[11px] drop-shadow line-clamp-2">
                          {ad.description}
                        </p>
                      )}
                    </div>

                    {ad.showButton && (
                      <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/10 mt-2">
                        <button style={{ backgroundColor: ad.btnBgColor, color: ad.btnTextColor }} className="px-2.5 py-1 rounded font-bold text-[10px] shadow">
                          {ad.ctaText}
                        </button>
                        <span className="text-[8.5px] text-white/70 font-mono">YR Verified</span>
                      </div>
                    )}
                  </div>

                  {/* شريط الإحصائيات الرشيق */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#161D2B]/80 border border-[#1F2937] text-[11px]">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Eye size={12} className="text-gray-400" />
                      <span>المشاهدات:</span>
                      <span className="font-mono font-bold text-white">{(ad.views || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-[1px] h-3 bg-[#1F2937]" />
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <MousePointer size={12} className="text-[#FFC500]" />
                      <span>النقرات:</span>
                      <span className="font-mono font-bold text-[#FFC500]">{(ad.clicks || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* عرض الجدول */}
      {viewFormat === 'table' && (
        <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs min-w-[550px]">
            <thead className="bg-[#111827] text-gray-400 border-b border-[#1F2937]">
              <tr>
                <th className="py-2.5 px-3">الإعلان والموضع</th>
                <th className="py-2.5 px-3">نمط العرض</th>
                <th className="py-2.5 px-3 text-center">شريط التمرير</th>
                <th className="py-2.5 px-3 text-center">المشاهدات / النقرات</th>
                <th className="py-2.5 px-3 text-center">الحالة</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white text-[11px]">
              {ads.map(ad => (
                <tr key={ad.id} className="hover:bg-[#161D2B]/50">
                  <td className="py-2.5 px-3">
                    <div className="font-bold truncate max-w-[150px]">{ad.headline || 'إعلان بدون عنوان'}</div>
                    <div className="text-[10px] text-[#FFC500] truncate max-w-[150px]">{ad.placementName}</div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-300">
                    {ad.imageFit === 'contain' ? 'كامل الصورة' : 'اقتصاص مخصص'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-[10px]">
                    {ad.hasProgressBar ? `${ad.progressDuration} ثوانٍ` : 'معطل'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className="text-white">{ad.views || 0}</span> / <span className="text-[#FFC500]">{ad.clicks || 0}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ad.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {ad.status === 'active' ? 'نشط' : 'متوقف'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => toggleAdStatus(ad.id)} className="p-1 rounded bg-[#161D2B] hover:text-[#FFC500]" title="تبديل الحالة">
                        {ad.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                      <button
                        onClick={() => navigate(`/admin/ads/generator?editId=${ad.id}`)}
                        className="p-1 rounded bg-[#FFC500]/15 text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all"
                        title="تعديل الإعلان"
                      >
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => deleteAd(ad.id)} className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white" title="حذف">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
