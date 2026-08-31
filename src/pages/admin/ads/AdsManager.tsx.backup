import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Megaphone, Sparkles, Play, Pause, Trash2, LayoutGrid, Table, ArrowRight } from 'lucide-react';
import { PublishedAd } from './AdGeneratorStudio';

export const AdsManager: React.FC = () => {
  const [ads, setAds] = useState<PublishedAd[]>([]);
  const [viewFormat, setViewFormat] = useState<'grid' | 'table'>('grid');

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

  const toggleAdStatus = (id: string) => {
    const updated = ads.map(a => a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } as PublishedAd : a);
    setAds(updated);
    localStorage.setItem('yr_published_ads', JSON.stringify(updated));
  };

  const deleteAd = (id: string) => {
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);
    localStorage.setItem('yr_published_ads', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif] pb-16">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0F17] p-5 rounded-2xl border border-[#1F2937]">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Megaphone className="text-[#FFC500]" />
            معرض الإعلانات المنشورة الحقيقية (Live Ads Showcase)
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            مشاهدة الإعلانات المنشورة بكامل الصورة أو بالاقتصاص المخصص بالفيديو والصور الحية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#161D2B] p-1 rounded-xl border border-[#1F2937]">
            <button onClick={() => setViewFormat('grid')} className={`p-2 rounded-lg text-xs font-bold ${viewFormat === 'grid' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewFormat('table')} className={`p-2 rounded-lg text-xs font-bold ${viewFormat === 'table' ? 'bg-[#FFC500] text-black' : 'text-[#9CA3AF]'}`}>
              <Table size={15} />
            </button>
          </div>

          <NavLink
            to="/admin/ads/generator"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/20"
          >
            <Sparkles size={16} />
            <span>إنشاء إعلان جديد (YR Studio)</span>
          </NavLink>
        </div>
      </div>

      {/* المعرض المرئي */}
      {viewFormat === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-[#9CA3AF] bg-[#0B0F17] rounded-2xl border border-[#1F2937]">
              لا توجد إعلانات منشورة حالياً. اضغط على "إنشاء إعلان جديد" لتصميم ونشر أول إعلان.
            </div>
          ) : (
            ads.map((ad) => (
              <div key={ad.id} className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-5 space-y-4 shadow-xl">
                
                <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
                  <div>
                    <span className="text-xs font-bold text-white">{ad.placementName}</span>
                    <div className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">{ad.id} • {ad.createdAt}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ad.status === 'active' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {ad.status === 'active' ? 'معروض نشط' : 'متوقف مؤقتاً'}
                    </span>
                    <button onClick={() => toggleAdStatus(ad.id)} className="p-1.5 rounded-lg bg-[#161D2B] text-white hover:text-[#FFC500]">
                      {ad.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button onClick={() => deleteAd(ad.id)} className="p-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* مجسم الإعلان الحقيقي بالاقتصاص والتموضع الدقيق */}
                <div
                  style={{
                    borderRadius: `${ad.borderRadius}px`,
                    border: ad.hasBorder ? `${ad.borderWidth}px solid ${ad.borderColor}` : 'none',
                    backgroundColor: ad.bgColor,
                    backgroundImage: ad.bgStyle === 'gradient' ? `linear-gradient(135deg, ${ad.bgColor} 0%, #161D2B 100%)` : 'none',
                    boxShadow: ad.hasGlow && ad.hasBorder ? `0 0 20px ${ad.borderColor}40` : 'none',
                  }}
                  className="relative overflow-hidden w-full min-h-[160px] flex flex-col justify-between p-4"
                >
                  {ad.hasProgressBar && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
                      <div 
                        style={{ 
                          backgroundColor: ad.progressBarColor,
                          animation: `yrAdProgress ${ad.progressDuration}s linear infinite`
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
                            filter: `brightness(${ad.brightness}%) contrast(${ad.contrast}%)`,
                            imageRendering: 'crisp-edges'
                          }}
                          className="w-full h-full" 
                        />
                      )}
                      {ad.imgOverlay > 0 && (
                        <div className="absolute inset-0 bg-black" style={{ opacity: ad.imgOverlay / 100 }} />
                      )}
                    </div>
                  )}

                  <div className="relative z-10 space-y-2">
                    {ad.showBadge && (
                      <span style={{ backgroundColor: ad.badgeBgColor, color: ad.badgeTextColor, borderColor: ad.badgeTextColor }} className="px-2 py-0.5 rounded-full text-[10px] font-black border inline-block">
                        {ad.badgeText}
                      </span>
                    )}
                    {ad.showHeadline && (
                      <h4 style={{ color: ad.headlineColor }} className="text-sm font-black drop-shadow-md">
                        {ad.headline}
                      </h4>
                    )}
                    {ad.showDescription && (
                      <p style={{ color: ad.descColor }} className="text-xs drop-shadow line-clamp-2">
                        {ad.description}
                      </p>
                    )}
                  </div>

                  {ad.showButton && (
                    <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/10">
                      <button style={{ backgroundColor: ad.btnBgColor, color: ad.btnTextColor }} className="px-3 py-1.5 rounded-lg font-black text-xs shadow-lg">
                        {ad.ctaText}
                      </button>
                      <span className="text-[9px] text-white/80 font-mono">YR Verified</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-[#161D2B] border border-[#1F2937]">
                    <span className="text-[10px] text-[#9CA3AF] block">المشاهدات</span>
                    <b className="text-sm font-mono text-white">{ad.views.toLocaleString()}</b>
                  </div>
                  <div className="p-2 rounded-xl bg-[#161D2B] border border-[#1F2937]">
                    <span className="text-[10px] text-[#9CA3AF] block">النقرات</span>
                    <b className="text-sm font-mono text-[#FFC500]">{ad.clicks.toLocaleString()}</b>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* عرض الجدول */}
      {viewFormat === 'table' && (
        <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="py-3.5 px-4">الإعلان والموضع</th>
                <th className="py-3.5 px-4">نمط العرض</th>
                <th className="py-3.5 px-4 text-center">شريط التمرير</th>
                <th className="py-3.5 px-4 text-center">المشاهدات / النقرات</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white">
              {ads.map(ad => (
                <tr key={ad.id} className="hover:bg-[#161D2B]/50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold">{ad.headline || 'إعلان صافي'}</div>
                    <div className="text-[10px] text-[#FFC500]">{ad.placementName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#D1D5DB]">
                    {ad.imageFit === 'contain' ? 'كامل الصورة 100%' : 'اقتصاص وتموضع مخصص'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[11px]">
                    {ad.hasProgressBar ? `${ad.progressDuration} ثوانٍ` : 'معطل'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="text-white">{ad.views}</span> / <span className="text-[#FFC500]">{ad.clicks}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ad.status === 'active' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {ad.status === 'active' ? 'نشط' : 'متوقف'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => toggleAdStatus(ad.id)} className="p-1 rounded bg-[#161D2B] hover:text-[#FFC500]">
                        {ad.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                      <button onClick={() => deleteAd(ad.id)} className="p-1 rounded bg-[#DC2626]/10 text-[#DC2626]">
                        <Trash2 size={13} />
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
