import React, { useEffect, useMemo, useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  RotateCcw,
  Gift,
  Power,
  History,
  Layers,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  Percent,
} from 'lucide-react';
import {
  adSubscriptionsService,
  AdPackageRecord,
  AdPricingAuditLog,
  AdProductType,
  AdSectionPricingRecord,
} from '../../../../services/adSubscriptionsService';
import {
  AD_SLOT_OPTIONS,
  getDynamicMarketSections,
  getDynamicSectionLabel,
} from '../../../../utils/adGeneratorEngine';
import {
  fetchCommunitySections,
  getCachedCommunitySections,
  type CommunitySection,
} from '../../../../services/sectionsService';

const TYPE_TABS: { id: AdProductType | 'audit'; label: string }[] = [
  { id: 'phone_feed', label: 'أسعار سوق الهاتف' },
  { id: 'sponsor', label: 'أسعار إعلان الراعي' },
  { id: 'banner', label: 'أسعار إعلانات البانر' },
  { id: 'audit', label: 'سجل تغييرات الأسعار' },
];

export const AdPricingManagerTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AdProductType | 'audit'>('phone_feed');
  const [packages, setPackages] = useState<AdPackageRecord[]>([]);
  const [sectionPricing, setSectionPricing] = useState<AdSectionPricingRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdPricingAuditLog[]>([]);
  const [sections, setSections] = useState<CommunitySection[]>(() => getCachedCommunitySections());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // مودال تعديل/إضافة باقة
  const [editingPkg, setEditingPkg] = useState<Partial<AdPackageRecord> | null>(null);
  const [newFeature, setNewFeature] = useState('');

  // مودال الأسعار المخصصة للأقسام والمساحات
  const [sectionModalPkg, setSectionModalPkg] = useState<AdPackageRecord | null>(null);
  const [spSection, setSpSection] = useState('phones');
  const [spSlot, setSpSlot] = useState('all');
  const [spPriceYer, setSpPriceYer] = useState<number>(0);
  const [spPriceUsd, setSpPriceUsd] = useState<number>(0);
  const [spIsFree, setSpIsFree] = useState(false);
  const [spDiscountPct, setSpDiscountPct] = useState<number>(0);
  const [spPromoEnd, setSpPromoEnd] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const marketSections = useMemo(() => getDynamicMarketSections(sections), [sections]);

  const loadAll = async () => {
    setLoading(true);
    try {
      fetchCommunitySections().then(setSections).catch(() => {});
      const [pkgs, sps, logs] = await Promise.all([
        adSubscriptionsService.adminGetAllPackages(),
        adSubscriptionsService.getSectionPricing(),
        adSubscriptionsService.adminGetPricingAuditLogs(80),
      ]);
      setPackages(pkgs);
      setSectionPricing(sps);
      setAuditLogs(logs);
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحميل بيانات الأسعار (تأكد من تطبيق الـ Migration)', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const visiblePackages = useMemo(() => {
    if (activeSubTab === 'audit') return [];
    return packages.filter((p) => p.ad_type === activeSubTab);
  }, [packages, activeSubTab]);

  const handleQuickAdjust = async (pkg: AdPackageRecord, pct: number) => {
    const nextYer = Math.max(0, Math.round(pkg.default_price_yer * (1 + pct / 100)));
    const nextUsd = Math.max(0, Number((pkg.default_price_usd * (1 + pct / 100)).toFixed(2)));
    try {
      await adSubscriptionsService.adminUpsertPackage({
        ...pkg,
        default_price_yer: nextYer,
        default_price_usd: nextUsd,
        is_free: nextYer === 0,
      });
      showToast(`تم تعديل السعر (${pct > 0 ? '+' : ''}${pct}%)`);
      loadAll();
    } catch (err: any) {
      showToast(err?.message || 'فشل تعديل السعر', 'error');
    }
  };

  const handleToggleFree = async (pkg: AdPackageRecord) => {
    try {
      await adSubscriptionsService.adminTogglePackageFree(pkg.id, !pkg.is_free);
      showToast(!pkg.is_free ? 'تم تحويل الباقة إلى مجانية (0)' : 'تم إلغاء المجانية واستعادة السعر');
      loadAll();
    } catch (err: any) {
      showToast(err?.message || 'فشل التحديث', 'error');
    }
  };

  const handleRestorePrevious = async (pkg: AdPackageRecord) => {
    try {
      await adSubscriptionsService.adminRestorePreviousPrice(pkg.id);
      showToast('تمت استعادة السعر السابق بنجاح');
      loadAll();
    } catch (err: any) {
      showToast(err?.message || 'لا يوجد سعر سابق محفوظ', 'error');
    }
  };

  const handleToggleActive = async (pkg: AdPackageRecord) => {
    try {
      await adSubscriptionsService.adminUpsertPackage({
        ...pkg,
        is_active: !pkg.is_active,
      });
      showToast(pkg.is_active ? 'تم إيقاف الباقة' : 'تم تفعيل الباقة');
      loadAll();
    } catch (err: any) {
      showToast(err?.message || 'فشل التحديث', 'error');
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg || !editingPkg.name?.trim()) {
      showToast('اسم الباقة مطلوب', 'error');
      return;
    }
    setSaving(true);
    try {
      await adSubscriptionsService.adminUpsertPackage({
        ...editingPkg,
        name: editingPkg.name.trim(),
        ad_type: (editingPkg.ad_type || (activeSubTab === 'audit' ? 'phone_feed' : activeSubTab)) as AdProductType,
        promo_starts_at: editingPkg.promo_starts_at || null,
        promo_ends_at: editingPkg.promo_ends_at || null,
      });
      showToast('تم حفظ الباقة والسعر وتسجيل التغيير في سجل التدقيق');
      setEditingPkg(null);
      loadAll();
    } catch (err: any) {
      showToast(err?.message || 'فشل الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openSectionModal = (pkg: AdPackageRecord) => {
    setSectionModalPkg(pkg);
    const defaultSec = pkg.ad_type === 'phone_feed' ? 'phones' : 'community';
    setSpSection(defaultSec);
    setSpSlot(pkg.ad_type === 'sponsor' ? 'header_sponsor' : pkg.ad_type === 'banner' ? 'slot_1' : 'all');
    setSpPriceYer(pkg.default_price_yer);
    setSpPriceUsd(pkg.default_price_usd);
    setSpIsFree(pkg.is_free);
    setSpDiscountPct(0);
    setSpPromoEnd('');
  };

  const handleSaveSectionPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionModalPkg) return;
    setSaving(true);
    try {
      await adSubscriptionsService.adminUpsertSectionPricing({
        packageId: sectionModalPkg.id,
        sectionId: spSection,
        slotKey: spSlot,
        priceYer: spPriceYer,
        priceUsd: spPriceUsd,
        isFree: spIsFree,
        discountPercent: spDiscountPct,
        promoEndsAt: spPromoEnd ? new Date(spPromoEnd).toISOString() : null,
      });
      showToast('تم حفظ السعر المخصص للقسم/المساحة');
      loadAll();
    } catch (err: any) {
      showToast(err?.message || 'فشل حفظ السعر المخصص', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSectionPricing = async (id: string) => {
    try {
      await adSubscriptionsService.adminDeleteSectionPricing(id);
      showToast('تم حذف التخصيص والرجوع للسعر الافتراضي');
      loadAll();
    } catch (err: any) {
      showToast(err?.message || 'فشل الحذف', 'error');
    }
  };

  const toLocalDateInput = (iso?: string | null) => {
    if (!iso) return '';
    try {
      return new Date(iso).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[250] p-3.5 rounded-xl text-xs font-bold shadow-2xl border ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/95 border-rose-500/40 text-rose-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#FFC500]" />
            <span>إدارة أسعار وباقات الإعلانات</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            تحكم مركزي في باقات سوق الهاتف والراعي والبانرات، الأسعار المخصصة للأقسام، المجانية، والخصومات.
          </p>
        </div>

        {activeSubTab !== 'audit' && (
          <button
            onClick={() =>
              setEditingPkg({
                ad_type: activeSubTab,
                name: '',
                description: '',
                tier_key: 'custom',
                duration_days: 30,
                post_quota: activeSubTab === 'phone_feed' ? 10 : 0,
                highlight_quota: activeSubTab === 'phone_feed' ? 2 : 0,
                default_price_yer: 10000,
                default_price_usd: 15,
                is_free: false,
                discount_percent: 0,
                discount_amount_yer: 0,
                features: [],
                visual_tier: activeSubTab === 'phone_feed' ? 'basic' : activeSubTab === 'sponsor' ? 'monthly' : 'standard',
                is_exclusive: false,
                allow_rotation: true,
                requires_approval: true,
                is_active: true,
                sort_order: visiblePackages.length + 1,
              })
            }
            className="px-4 py-2 rounded-xl bg-[#FFC500] hover:bg-[#e6b100] text-black text-xs font-black flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة باقة جديدة</span>
          </button>
        )}
      </div>

      {/* تبويبات الأنواع الثلاثة + سجل التدقيق */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPE_TABS.map((t) => {
          const active = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                active
                  ? 'bg-[#FFC500] text-black font-black'
                  : 'bg-[#0A0A0C] text-zinc-400 border border-[#2A2B30] hover:text-white'
              }`}
            >
              {t.id === 'audit' && <History className="w-3.5 h-3.5" />}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-500 text-xs">جاري تحميل الباقات والأسعار...</div>
      ) : activeSubTab === 'audit' ? (
        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <div className="py-10 text-center text-zinc-500 text-xs border border-[#2A2B30] rounded-xl">
              لا توجد تغييرات أسعار مسجلة بعد.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[#0A0A0C] border border-[#2A2B30] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-[#FFC500]">
                    {log.admin_name || 'مسؤول'} · {log.action} ({log.target_table})
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(log.created_at).toLocaleString('ar-YE')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400">
                  {log.old_values && (
                    <div className="p-2 rounded-lg bg-black border border-[#222]">
                      <span className="text-rose-400 font-bold">القديم: </span>
                      <span>
                        {log.old_values.default_price_yer ?? log.old_values.price_yer ?? 0} ر.ي /{' '}
                        {log.old_values.default_price_usd ?? log.old_values.price_usd ?? 0}${' '}
                        {log.old_values.is_free ? '(مجانية)' : ''}
                      </span>
                    </div>
                  )}
                  {log.new_values && (
                    <div className="p-2 rounded-lg bg-black border border-[#222]">
                      <span className="text-emerald-400 font-bold">الجديد: </span>
                      <span>
                        {log.new_values.default_price_yer ?? log.new_values.price_yer ?? 0} ر.ي /{' '}
                        {log.new_values.default_price_usd ?? log.new_values.price_usd ?? 0}${' '}
                        {log.new_values.is_free ? '(مجانية)' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {visiblePackages.map((pkg) => {
            const overrides = sectionPricing.filter((sp) => sp.package_id === pkg.id);
            return (
              <div
                key={pkg.id}
                className={`p-4 rounded-2xl border bg-[#0A0A0C] space-y-3 ${
                  pkg.is_active ? 'border-[#2A2B30]' : 'border-rose-500/30 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-white">{pkg.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-[#2A2B30] text-[10px] text-zinc-300">
                        {pkg.visual_tier}
                      </span>
                      {pkg.is_free && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                          مجانية
                        </span>
                      )}
                      {!pkg.is_active && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black">
                          موقفة
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{pkg.description}</p>
                  </div>

                  <div className="text-left shrink-0" dir="ltr">
                    <p className="text-lg font-black text-[#FFC500]">
                      {pkg.is_free ? '0 YER' : `${pkg.default_price_yer.toLocaleString()} YER`}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      ${pkg.is_free ? '0' : pkg.default_price_usd}
                    </p>
                    {pkg.previous_price_yer != null && (
                      <p className="text-[10px] text-zinc-500 line-through">
                        سابق: {pkg.previous_price_yer.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-300">
                  <span className="px-2.5 py-1 rounded-lg bg-black border border-[#222]">
                    المدة: {pkg.duration_days} يوم
                  </span>
                  {pkg.ad_type === 'phone_feed' && (
                    <>
                      <span className="px-2.5 py-1 rounded-lg bg-black border border-[#222]">
                        المنشورات: {pkg.post_quota}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black border border-[#222]">
                        الإبراز: {pkg.highlight_quota}
                      </span>
                    </>
                  )}
                  {(pkg.discount_percent > 0 || pkg.discount_amount_yer > 0) && (
                    <span className="px-2.5 py-1 rounded-lg bg-[#FFC500]/15 text-[#FFC500] font-bold flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      خصم {pkg.discount_percent > 0 ? `${pkg.discount_percent}%` : `${pkg.discount_amount_yer} ر.ي`}
                    </span>
                  )}
                  {pkg.is_exclusive && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 font-bold">
                      حصري
                    </span>
                  )}
                </div>

                {overrides.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-black border border-[#222] space-y-1">
                    <p className="text-[10px] font-bold text-[#FFC500]">
                      أسعار مخصصة للأقسام ({overrides.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {overrides.map((ov) => (
                        <span
                          key={ov.id}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-[#2A2B30] text-zinc-300"
                        >
                          {getDynamicSectionLabel(ov.section_id, sections)} ({ov.slot_key}):{' '}
                          {ov.is_free ? 'مجاني' : `${ov.price_yer.toLocaleString()} ر.ي`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* أزرار التحكم السريع */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-[#222]">
                  <button
                    onClick={() => setEditingPkg({ ...pkg })}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#FFC500]" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => openSectionModal(pkg)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-sky-300 flex items-center justify-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>أسعار الأقسام</span>
                  </button>
                  <button
                    onClick={() => handleToggleFree(pkg)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                      pkg.is_free
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-emerald-400'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{pkg.is_free ? 'إلغاء المجانية' : 'جعلها مجانية'}</span>
                  </button>
                  <button
                    onClick={() => handleQuickAdjust(pkg, 10)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>رفع +10%</span>
                  </button>
                  <button
                    onClick={() => handleQuickAdjust(pkg, -10)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-cyan-300 flex items-center justify-center gap-1"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>خفض -10%</span>
                  </button>
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-300 flex items-center justify-center gap-1"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{pkg.is_active ? 'إيقاف' : 'تفعيل'}</span>
                  </button>
                  {pkg.previous_price_yer != null && (
                    <button
                      onClick={() => handleRestorePrevious(pkg)}
                      className="col-span-2 sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-[11px] font-bold text-purple-300 flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استعادة السعر السابق ({pkg.previous_price_yer.toLocaleString()} ر.ي)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* مودال تعديل / إنشاء باقة */}
      {editingPkg && (
        <div
          className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={() => setEditingPkg(null)}
        >
          <form
            onSubmit={handleSavePackage}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#09090B] border border-[#2A2B30] rounded-2xl p-5 space-y-3.5 text-xs"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="text-sm font-black text-white">
                {editingPkg.id ? `تعديل: ${editingPkg.name}` : 'إضافة باقة إعلانية جديدة'}
              </h3>
              <button type="button" onClick={() => setEditingPkg(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">اسم الباقة *</label>
                <input
                  type="text"
                  required
                  value={editingPkg.name || ''}
                  onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">المستوى البصري</label>
                <input
                  type="text"
                  value={editingPkg.visual_tier || ''}
                  onChange={(e) => setEditingPkg({ ...editingPkg, visual_tier: e.target.value })}
                  placeholder="basic / pro / vip / exclusive"
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">الوصف</label>
              <input
                type="text"
                value={editingPkg.description || ''}
                onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
                className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">السعر (ر.ي)</label>
                <input
                  type="number"
                  min={0}
                  value={editingPkg.default_price_yer ?? 0}
                  onChange={(e) => setEditingPkg({ ...editingPkg, default_price_yer: Number(e.target.value) })}
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">السعر ($)</label>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={editingPkg.default_price_usd ?? 0}
                  onChange={(e) => setEditingPkg({ ...editingPkg, default_price_usd: Number(e.target.value) })}
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">المدة (أيام)</label>
                <input
                  type="number"
                  min={1}
                  value={editingPkg.duration_days ?? 30}
                  onChange={(e) => setEditingPkg({ ...editingPkg, duration_days: Number(e.target.value) })}
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {editingPkg.ad_type === 'phone_feed' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">عدد المنشورات المسموحة</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPkg.post_quota ?? 0}
                    onChange={(e) => setEditingPkg({ ...editingPkg, post_quota: Number(e.target.value) })}
                    className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">عدد مرات الإبراز</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPkg.highlight_quota ?? 0}
                    onChange={(e) => setEditingPkg({ ...editingPkg, highlight_quota: Number(e.target.value) })}
                    className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">نسبة الخصم (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editingPkg.discount_percent ?? 0}
                  onChange={(e) => setEditingPkg({ ...editingPkg, discount_percent: Number(e.target.value) })}
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">خصم ثابت (ر.ي)</label>
                <input
                  type="number"
                  min={0}
                  value={editingPkg.discount_amount_yer ?? 0}
                  onChange={(e) => setEditingPkg({ ...editingPkg, discount_amount_yer: Number(e.target.value) })}
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">بداية العرض الترويجي</label>
                <input
                  type="datetime-local"
                  value={toLocalDateInput(editingPkg.promo_starts_at)}
                  onChange={(e) =>
                    setEditingPkg({
                      ...editingPkg,
                      promo_starts_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2 text-white"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">نهاية العرض الترويجي</label>
                <input
                  type="datetime-local"
                  value={toLocalDateInput(editingPkg.promo_ends_at)}
                  onChange={(e) =>
                    setEditingPkg({
                      ...editingPkg,
                      promo_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2 text-white"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingPkg.is_free)}
                  onChange={(e) => setEditingPkg({ ...editingPkg, is_free: e.target.checked })}
                />
                <span>باقة مجانية (0)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingPkg.is_exclusive)}
                  onChange={(e) => setEditingPkg({ ...editingPkg, is_exclusive: e.target.checked })}
                />
                <span>حصرية (تمنع التعارض)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPkg.allow_rotation !== false}
                  onChange={(e) => setEditingPkg({ ...editingPkg, allow_rotation: e.target.checked })}
                />
                <span>السماح بالتدوير</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPkg.is_active !== false}
                  onChange={(e) => setEditingPkg({ ...editingPkg, is_active: e.target.checked })}
                />
                <span>مفعلة</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-zinc-400 block">المزايا</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="أضف ميزة..."
                  className="flex-1 bg-black border border-[#2A2B30] rounded-xl p-2 text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newFeature.trim()) return;
                    setEditingPkg({
                      ...editingPkg,
                      features: [...(editingPkg.features || []), newFeature.trim()],
                    });
                    setNewFeature('');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-800 text-white font-bold"
                >
                  إضافة
                </button>
              </div>
              <div className="space-y-1">
                {(editingPkg.features || []).map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black border border-[#222] rounded-lg px-2.5 py-1.5">
                    <span>{f}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPkg({
                          ...editingPkg,
                          features: (editingPkg.features || []).filter((_, i) => i !== idx),
                        })
                      }
                      className="text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#FFC500] text-black font-black text-sm disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات وتسجيلها'}
            </button>
          </form>
        </div>
      )}

      {/* مودال الأسعار المخصصة للأقسام والمساحات */}
      {sectionModalPkg && (
        <div
          className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={() => setSectionModalPkg(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#09090B] border border-[#2A2B30] rounded-2xl p-5 space-y-4 text-xs"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="text-sm font-black text-white">
                أسعار الأقسام والمساحات — {sectionModalPkg.name}
              </h3>
              <button onClick={() => setSectionModalPkg(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSectionPricing} className="space-y-3 p-3.5 rounded-xl bg-black border border-[#222]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">القسم</label>
                  <select
                    value={spSection}
                    onChange={(e) => setSpSection(e.target.value)}
                    className="w-full bg-[#0A0A0C] border border-[#2A2B30] rounded-xl p-2.5 text-white"
                  >
                    {marketSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">المساحة الإعلانية</label>
                  <select
                    value={spSlot}
                    onChange={(e) => setSpSlot(e.target.value)}
                    className="w-full bg-[#0A0A0C] border border-[#2A2B30] rounded-xl p-2.5 text-white"
                  >
                    <option value="all">الكل / افتراضي القسم</option>
                    {sectionModalPkg.ad_type === 'sponsor' && (
                      <option value="header_sponsor">رأس القسم (إعلان الراعي)</option>
                    )}
                    {sectionModalPkg.ad_type === 'banner' &&
                      AD_SLOT_OPTIONS.filter((o) => o.id !== 'all').map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">السعر (ر.ي)</label>
                  <input
                    type="number"
                    min={0}
                    value={spPriceYer}
                    onChange={(e) => setSpPriceYer(Number(e.target.value))}
                    className="w-full bg-[#0A0A0C] border border-[#2A2B30] rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">السعر ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={spPriceUsd}
                    onChange={(e) => setSpPriceUsd(Number(e.target.value))}
                    className="w-full bg-[#0A0A0C] border border-[#2A2B30] rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">خصم (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={spDiscountPct}
                    onChange={(e) => setSpDiscountPct(Number(e.target.value))}
                    className="w-full bg-[#0A0A0C] border border-[#2A2B30] rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                <div>
                  <label className="text-zinc-400 block mb-1">نهاية العرض (اختياري)</label>
                  <input
                    type="datetime-local"
                    value={spPromoEnd}
                    onChange={(e) => setSpPromoEnd(e.target.value)}
                    className="w-full bg-[#0A0A0C] border border-[#2A2B30] rounded-xl p-2 text-white"
                    dir="ltr"
                  />
                </div>
                <label className="flex items-center gap-2 pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={spIsFree}
                    onChange={(e) => setSpIsFree(e.target.checked)}
                  />
                  <span>مجاني لهذا القسم والمساحة</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-[#FFC500] text-black font-black"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ السعر المخصص'}
              </button>
            </form>

            <div className="space-y-2">
              <p className="font-bold text-zinc-300">الأسعار المخصصة الحالية لهذه الباقة:</p>
              {sectionPricing.filter((sp) => sp.package_id === sectionModalPkg.id).length === 0 ? (
                <p className="text-zinc-500">لا توجد أسعار مخصصة؛ يُستخدم السعر الافتراضي للباقة حالياً.</p>
              ) : (
                sectionPricing
                  .filter((sp) => sp.package_id === sectionModalPkg.id)
                  .map((sp) => (
                    <div
                      key={sp.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-[#222]"
                    >
                      <div>
                        <p className="font-bold text-white">
                          {getDynamicSectionLabel(sp.section_id, sections)} · {sp.slot_key}
                        </p>
                        <p className="text-[11px] text-[#FFC500]">
                          {sp.is_free ? 'مجاني (0)' : `${sp.price_yer.toLocaleString()} ر.ي / $${sp.price_usd}`}
                          {sp.discount_percent > 0 ? ` · خصم ${sp.discount_percent}%` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSectionPricing(sp.id)}
                        className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                        title="حذف التخصيص"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
