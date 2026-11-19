import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Eye,
  MousePointer,
  Calendar,
} from 'lucide-react';
import {
  adsDatabaseService,
  ExtendedAdRecord,
  isAdCurrentlyValid,
} from '../../../services/adsDatabaseService';
import {
  MARKET_SECTIONS,
  SECTION_LABEL_MAP,
} from '../../../utils/adGeneratorEngine';

const SLOT_LABEL: Record<string, string> = {
  all: 'تدوير تلقائي',
  slot_1: 'الوحدة 1 (أعلى)',
  slot_2: 'الوحدة 2 (وسط/أسفل)',
};

export const AdsManager: React.FC = () => {
  const navigate = useNavigate();
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [ads, setAds] = useState<ExtendedAdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFormat, setViewFormat] = useState<'grid' | 'table'>('grid');
  const [sectionFilter, setSectionFilter] = useState<string>('all_filter');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  const loadAllAds = async () => {
    try {
      setLoading(true);
      const cloudAds = await adsDatabaseService.getAllAds('banner');
      if (cloudAds && cloudAds.length > 0) {
        setAds(cloudAds);
        try {
          localStorage.setItem('yr_published_ads', JSON.stringify(cloudAds));
        } catch (_) {}
      } else {
        const saved = localStorage.getItem('yr_published_ads');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAds(parsed.filter((a: any) => a?.adKind !== 'sponsor' && a?.placementId !== 'home_sponsor'));
          }
        }
      }
    } catch (err) {
      console.error('Error loading ads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAds();
  }, []);

  const toggleAdStatus = async (id: string) => {
    const currentAd = ads.find((a) => a.id === id);
    if (!currentAd) return;
    const newStatus = currentAd.status === 'active' ? 'paused' : 'active';

    const updated = ads.map((a) =>
      a.id === id ? ({ ...a, status: newStatus } as ExtendedAdRecord) : a
    );
    setAds(updated);
    try {
      localStorage.setItem('yr_published_ads', JSON.stringify(updated));
    } catch (_) {}

    await adsDatabaseService.updateAdStatus(id, newStatus);
  };

  const deleteAd = async (id: string) => {
    const updated = ads.filter((a) => a.id !== id);
    setAds(updated);
    try {
      localStorage.setItem('yr_published_ads', JSON.stringify(updated));
    } catch (_) {}
    await adsDatabaseService.deleteAd(id);
    setDeleteSuccess('تم حذف الإعلان بنجاح من قاعدة البيانات والمنصة.');
    setTimeout(() => setDeleteSuccess(null), 3500);
  };

  const filteredAds = ads.filter((ad) => {
    if (statusFilter !== 'all' && ad.status !== statusFilter) return false;
    if (sectionFilter === 'all_filter') return true;
    const secs = ad.targetSections || ['all'];
    return secs.includes(sectionFilter) || secs.includes('all');
  });

  return (
    <div dir="rtl" className="space-y-4 font-['Cairo',sans-serif] pb-16">
      {deleteSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <span>{deleteSuccess}</span>
          <button
            onClick={() => setDeleteSuccess(null)}
            className="text-emerald-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* الهيدر */}
      <div className="bg-[#0B0F17] p-3.5 sm:p-4 rounded-xl border border-[#2F3336] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            <NavLink
              to="/admin"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161D2B] text-yellow-400 hover:bg-[#2F3336] border border-[#2F3336] transition font-bold text-xs shrink-0"
            >
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>رجوع</span>
            </NavLink>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-[#FFC500]" />
              <span>إدارة حملات البانر ({filteredAds.length})</span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-0.5 bg-[#161D2B] p-0.5 rounded-lg border border-[#2F3336]">
              <button
                onClick={() => setViewFormat('grid')}
                className={`p-1.5 rounded-md text-xs transition-all ${
                  viewFormat === 'grid' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="عرض شبكي"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewFormat('table')}
                className={`p-1.5 rounded-md text-xs transition-all ${
                  viewFormat === 'table' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="عرض جدول"
              >
                <Table size={14} />
              </button>
            </div>

            <NavLink
              to="/admin/sponsor"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161D2B] hover:bg-[#2F3336] text-amber-400 border border-[#2F3336] font-bold text-[11px] transition-all"
            >
              <Sparkles size={13} />
              <span>رعاة الأقسام</span>
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

        {/* فلاتر القسم والحالة */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#2F3336]">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSectionFilter('all_filter')}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border ${
                sectionFilter === 'all_filter'
                  ? 'bg-[#FFC500] text-black border-[#FFC500]'
                  : 'bg-[#161D2B] text-gray-300 border-[#2F3336]'
              }`}
            >
              كل الأقسام
            </button>
            {MARKET_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSectionFilter(sec.id)}
                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold border ${
                  sectionFilter === sec.id
                    ? 'bg-[#FFC500] text-black border-[#FFC500]'
                    : 'bg-[#161D2B] text-gray-300 border-[#2F3336]'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#161D2B] p-0.5 rounded-lg border border-[#2F3336] text-[10.5px] font-bold">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'active', label: 'نشط' },
              { id: 'paused', label: 'متوقف' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-md ${
                  statusFilter === st.id ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* المعرض الشبكي */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 bg-[#0B0F17] rounded-xl border border-[#2F3336] text-xs">
          جارِ تحميل الحملات...
        </div>
      ) : viewFormat === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAds.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400 bg-[#0B0F17] rounded-xl border border-[#2F3336] text-xs">
              لا توجد حملات مطابقة. اضغط على "إنشاء إعلان" لتصميم أول إعلان.
            </div>
          ) : (
            filteredAds.map((ad) => {
              const sectionsLabel = (ad.targetSections || ['all'])
                .map((s) => SECTION_LABEL_MAP[s] || s)
                .join('، ');
              const slotLabel = SLOT_LABEL[ad.slotKey || 'all'] || 'تدوير تلقائي';
              const dateValid = isAdCurrentlyValid(ad);

              return (
                <div
                  key={ad.id}
                  className="bg-[#0B0F17] rounded-xl border border-[#2F3336] p-3 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-[#2F3336] pb-2 gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {sectionsLabel}
                      </div>
                      <div className="text-[10px] text-[#FFC500] font-bold">
                        {slotLabel} • أولوية {ad.priority || 1}x
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ad.status === 'active' && dateValid
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : ad.status === 'active' && !dateValid
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {ad.status === 'active'
                          ? dateValid
                            ? 'نشط'
                            : 'منتهي/مجدول'
                          : 'متوقف'}
                      </span>

                      <button
                        onClick={() => toggleAdStatus(ad.id)}
                        className="p-1.5 rounded-md bg-[#161D2B] text-gray-300 hover:text-[#FFC500] border border-[#2F3336]"
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

                  {/* معاينة الإعلان */}
                  <div
                    style={{
                      borderRadius: '0px',
                      border: ad.hasBorder
                        ? `${ad.borderWidth || 1}px solid ${ad.borderColor || '#333'}`
                        : '1px solid #2F3336',
                      backgroundColor: ad.bgColor || '#111',
                    }}
                    className="relative overflow-hidden w-full min-h-[115px] flex flex-col justify-between p-3"
                  >
                    {ad.mediaUrl && (
                      <div className="absolute inset-0 z-0 overflow-hidden">
                        {ad.mediaType === 'video' ? (
                          <video
                            src={ad.mediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={ad.mediaUrl}
                            alt="Ad"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {(ad.showHeadline || ad.showDescription) && Number(ad.imgOverlay || 0) > 0 && (
                          <div
                            className="absolute inset-0 bg-black"
                            style={{ opacity: Number(ad.imgOverlay) / 100 }}
                          />
                        )}
                      </div>
                    )}

                    <div className="relative z-10 space-y-1">
                      {ad.showHeadline && ad.headline && (
                        <h4
                          style={{ color: ad.headlineColor }}
                          className="text-xs sm:text-sm font-bold drop-shadow-md line-clamp-1"
                        >
                          {ad.headline}
                        </h4>
                      )}
                      {ad.showDescription && ad.description && (
                        <p
                          style={{ color: ad.descColor }}
                          className="text-[11px] drop-shadow line-clamp-2"
                        >
                          {ad.description}
                        </p>
                      )}
                    </div>

                    {ad.showButton && (
                      <div className="relative z-10 pt-2 flex items-center justify-between border-t border-white/10 mt-2">
                        <span
                          style={{ backgroundColor: ad.btnBgColor, color: ad.btnTextColor }}
                          className="px-2.5 py-1 rounded font-bold text-[10px] shadow"
                        >
                          {ad.ctaText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* التواريخ والإحصائيات */}
                  <div className="flex items-center justify-between flex-wrap gap-2 px-2.5 py-1.5 rounded-lg bg-[#161D2B]/80 border border-[#2F3336] text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-gray-300">
                        <Eye size={12} className="text-gray-400" />
                        <span className="font-mono font-bold text-white">
                          {(ad.views || 0).toLocaleString()}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-300">
                        <MousePointer size={12} className="text-[#FFC500]" />
                        <span className="font-mono font-bold text-[#FFC500]">
                          {(ad.clicks || 0).toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                      <Calendar size={11} />
                      <span>
                        {ad.startDate || 'فوري'} → {ad.endDate || 'مفتوح'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-[#0B0F17] rounded-xl border border-[#2F3336] overflow-x-auto custom-scrollbar">
          <table className="w-full text-right text-xs min-w-[650px]">
            <thead className="bg-[#111111] text-gray-400 border-b border-[#2F3336]">
              <tr>
                <th className="py-2.5 px-3">الإعلان والأقسام</th>
                <th className="py-2.5 px-3">الموضع / الأولوية</th>
                <th className="py-2.5 px-3">الصلاحية</th>
                <th className="py-2.5 px-3 text-center">المشاهدات / النقرات</th>
                <th className="py-2.5 px-3 text-center">الحالة</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F3336] text-white text-[11px]">
              {filteredAds.map((ad) => {
                const sectionsLabel = (ad.targetSections || ['all'])
                  .map((s) => SECTION_LABEL_MAP[s] || s)
                  .join('، ');
                return (
                  <tr key={ad.id} className="hover:bg-[#161D2B]/50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold truncate max-w-[160px]">
                        {ad.headline || 'بانر مصور'}
                      </div>
                      <div className="text-[10px] text-[#FFC500] truncate max-w-[180px]">
                        {sectionsLabel}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">
                      <div>{SLOT_LABEL[ad.slotKey || 'all'] || 'تدوير تلقائي'}</div>
                      <div className="text-[10px] text-gray-400">أولوية {ad.priority || 1}x</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-gray-300">
                      {ad.startDate || 'فوري'} → {ad.endDate || 'مفتوح'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="text-white">{ad.views || 0}</span> /{' '}
                      <span className="text-[#FFC500]">{ad.clicks || 0}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ad.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {ad.status === 'active' ? 'نشط' : 'متوقف'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toggleAdStatus(ad.id)}
                          className="p-1 rounded bg-[#161D2B] hover:text-[#FFC500]"
                        >
                          {ad.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/ads/generator?editId=${ad.id}`)}
                          className="p-1 rounded bg-[#FFC500]/15 text-[#FFC500]"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteAd(ad.id)}
                          className="p-1 rounded bg-rose-500/10 text-rose-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdsManager;
