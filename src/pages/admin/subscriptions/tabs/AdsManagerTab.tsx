import React, { useEffect, useMemo, useState } from 'react';
import {
  Megaphone,
  CheckCircle2,
  XCircle,
  PauseCircle,
  CalendarClock,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search,
  DollarSign,
  Gift,
  Sparkles,
  X,
} from 'lucide-react';
import {
  adSubscriptionsService,
  AdOrderStatus,
  AdProductType,
  AdSubscriptionOrder,
} from '../../../../services/adSubscriptionsService';
import {
  getDynamicMarketSections,
  getDynamicSectionLabel,
} from '../../../../utils/adGeneratorEngine';
import {
  fetchCommunitySections,
  getCachedCommunitySections,
  type CommunitySection,
} from '../../../../services/sectionsService';

const TYPE_LABELS: Record<AdProductType, string> = {
  phone_feed: 'سوق الهاتف',
  sponsor: 'إعلان راعي',
  banner: 'إعلان بانر',
};

const STATUS_BADGE: Record<AdOrderStatus, { label: string; cls: string }> = {
  draft: { label: 'مسودة', cls: 'bg-zinc-800 text-zinc-300' },
  pending_payment: { label: 'بانتظار الدفع', cls: 'bg-amber-500/20 text-amber-300' },
  pending_review: { label: 'بانتظار المراجعة', cls: 'bg-sky-500/20 text-sky-300' },
  approved: { label: 'مقبول / موقوف', cls: 'bg-indigo-500/20 text-indigo-300' },
  active: { label: 'نشط الآن', cls: 'bg-emerald-500/20 text-emerald-300' },
  rejected: { label: 'مرفوض', cls: 'bg-rose-500/20 text-rose-300' },
  expired: { label: 'منتهي', cls: 'bg-zinc-800 text-zinc-500' },
  cancelled: { label: 'ملغي', cls: 'bg-zinc-900 text-zinc-500' },
};

export const AdsManagerTab: React.FC = () => {
  const [orders, setOrders] = useState<AdSubscriptionOrder[]>([]);
  const [sections, setSections] = useState<CommunitySection[]>(() => getCachedCommunitySections());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | AdProductType>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AdOrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdSubscriptionOrder | null>(null);
  const [resolvedProofUrl, setResolvedProofUrl] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const marketSections = useMemo(() => getDynamicMarketSections(sections), [sections]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      fetchCommunitySections().then(setSections).catch(() => {});
      const list = await adSubscriptionsService.adminGetAllOrders();
      setOrders(list);
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحميل الاشتراكات الإعلانية', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder?.payment_proof_url) {
      setResolvedProofUrl(null);
      return;
    }
    adSubscriptionsService
      .resolveProofUrl(selectedOrder.payment_proof_url)
      .then(setResolvedProofUrl)
      .catch(() => setResolvedProofUrl(null));
  }, [selectedOrder?.id, selectedOrder?.payment_proof_url]);

  // تقارير وإحصائيات شاملة
  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => !o.is_free_order && o.final_price > 0).length;
    const free = orders.filter((o) => o.is_free_order || o.final_price === 0).length;
    const active = orders.filter((o) => o.status === 'active').length;
    const pendingReview = orders.filter((o) => o.status === 'pending_review').length;
    const revenueYer = orders
      .filter((o) => o.currency === 'YER' && ['active', 'approved', 'expired'].includes(o.status))
      .reduce((acc, o) => acc + Number(o.final_price || 0), 0);
    const revenueUsd = orders
      .filter((o) => o.currency === 'USD' && ['active', 'approved', 'expired'].includes(o.status))
      .reduce((acc, o) => acc + Number(o.final_price || 0), 0);

    const pkgCounts = new Map<string, number>();
    for (const o of orders) {
      pkgCounts.set(o.package_name_snapshot, (pkgCounts.get(o.package_name_snapshot) || 0) + 1);
    }
    let topPackage = '—';
    let topCount = 0;
    pkgCounts.forEach((cnt, name) => {
      if (cnt > topCount) {
        topCount = cnt;
        topPackage = name;
      }
    });

    const reservedSlots = orders.filter(
      (o) => o.ad_type !== 'phone_feed' && o.status === 'active'
    ).length;

    return { total, paid, free, active, pendingReview, revenueYer, revenueUsd, topPackage, reservedSlots };
  }, [orders]);

  // اكتشاف الحجوزات المتعارضة في نفس القسم والمساحة
  const conflictOrderIds = useMemo(() => {
    const ids = new Set<string>();
    const activeSlots = orders.filter(
      (o) =>
        o.ad_type !== 'phone_feed' &&
        ['active', 'approved', 'pending_review'].includes(o.status)
    );
    for (let i = 0; i < activeSlots.length; i++) {
      for (let j = i + 1; j < activeSlots.length; j++) {
        const a = activeSlots[i];
        const b = activeSlots[j];
        if (a.ad_type !== b.ad_type) continue;
        const sameSec = a.section_id === b.section_id || a.section_id === 'all' || b.section_id === 'all';
        const sameSlot =
          a.ad_type === 'sponsor' || a.slot_key === b.slot_key || a.slot_key === 'all' || b.slot_key === 'all';
        if (sameSec && sameSlot) {
          ids.add(a.id);
          ids.add(b.id);
        }
      }
    }
    return ids;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (typeFilter !== 'all' && o.ad_type !== typeFilter) return false;
      if (sectionFilter !== 'all' && o.section_id !== sectionFilter) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (q) {
        const hay = `${o.user_name || ''} ${o.business_name || ''} ${o.package_name_snapshot} ${o.payment_reference || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, typeFilter, sectionFilter, statusFilter, searchQuery]);

  const runAction = async (
    order: AdSubscriptionOrder,
    action: 'approve_activate' | 'approve_only' | 'reject' | 'pause' | 'cancel' | 'extend'
  ) => {
    if (action === 'extend' && !customEndDate) {
      showToast('اختر تاريخ الانتهاء الجديد أولاً', 'error');
      return;
    }
    setBusyId(order.id);
    try {
      await adSubscriptionsService.adminReviewOrder(
        order.id,
        action,
        adminNotes || undefined,
        action === 'extend' ? new Date(customEndDate).toISOString() : undefined
      );
      showToast('تم تنفيذ الإجراء وتحديث الحالة بنجاح');
      setSelectedOrder(null);
      setAdminNotes('');
      setCustomEndDate('');
      loadOrders();
    } catch (err: any) {
      showToast(err?.message || 'فشل تنفيذ الإجراء', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleExpireElapsed = async () => {
    try {
      const cnt = await adSubscriptionsService.adminExpireElapsed();
      showToast(`تم فحص الاشتراكات وإغلاق ${cnt} اشتراكاً منتهياً`);
      loadOrders();
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحديث المنتهية', 'error');
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
            <Megaphone className="w-5 h-5 text-[#FFC500]" />
            <span>إدارة الاشتراكات الإعلانية والحجوزات</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            مراجعة الطلبات وإيصالات الدفع، تفعيل إعلانات الراعي والبانر وسوق الهاتف، ومتابعة الإيرادات.
          </p>
        </div>

        <button
          onClick={handleExpireElapsed}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-[#2A2B30] hover:border-[#FFC500]/50 text-xs font-bold text-zinc-200 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FFC500]" />
          <span>تحديث الاشتراكات المنتهية</span>
        </button>
      </div>

      {/* لوحة التقارير والإيرادات */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 rounded-xl bg-[#0A0A0C] border border-[#2A2B30]">
          <p className="text-[10px] text-zinc-400">إجمالي الطلبات</p>
          <p className="text-xl font-black text-white mt-0.5">{stats.total}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#0A0A0C] border border-[#2A2B30]">
          <p className="text-[10px] text-zinc-400">بانتظار المراجعة</p>
          <p className="text-xl font-black text-sky-400 mt-0.5">{stats.pendingReview}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#0A0A0C] border border-[#2A2B30]">
          <p className="text-[10px] text-zinc-400">إعلانات نشطة</p>
          <p className="text-xl font-black text-emerald-400 mt-0.5">{stats.active}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#0A0A0C] border border-[#2A2B30]">
          <p className="text-[10px] text-zinc-400 flex items-center gap-1">
            <Gift className="w-3 h-3 text-emerald-400" /> مدفوعة / مجانية
          </p>
          <p className="text-base font-black text-white mt-0.5">
            {stats.paid} <span className="text-zinc-500 text-xs">/</span>{' '}
            <span className="text-emerald-400">{stats.free}</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[#0A0A0C] border border-[#2A2B30]">
          <p className="text-[10px] text-zinc-400 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[#FFC500]" /> الإيرادات
          </p>
          <p className="text-sm font-black text-[#FFC500] mt-0.5" dir="ltr">
            {stats.revenueYer.toLocaleString()} YER
          </p>
          {stats.revenueUsd > 0 && (
            <p className="text-[10px] text-zinc-400" dir="ltr">${stats.revenueUsd}</p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-[#0A0A0C] border border-[#2A2B30]">
          <p className="text-[10px] text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFC500]" /> الأكثر طلباً
          </p>
          <p className="text-xs font-black text-white mt-1 truncate">{stats.topPackage}</p>
          <p className="text-[10px] text-zinc-500">مساحات محجوزة: {stats.reservedSlots}</p>
        </div>
      </div>

      {/* الفلاتر */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالمعلن أو المرجع أو الباقة..."
            className="w-full bg-[#0A0A0C] border border-[#2A2B30] rounded-xl pr-9 pl-3 py-2 text-xs text-white"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="bg-[#0A0A0C] border border-[#2A2B30] rounded-xl px-3 py-2 text-xs text-white"
        >
          <option value="all">كل الأنواع</option>
          <option value="phone_feed">إعلانات سوق الهاتف</option>
          <option value="sponsor">إعلانات الراعي</option>
          <option value="banner">إعلانات البانر</option>
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="bg-[#0A0A0C] border border-[#2A2B30] rounded-xl px-3 py-2 text-xs text-white"
        >
          <option value="all">كل الأقسام</option>
          {marketSections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-[#0A0A0C] border border-[#2A2B30] rounded-xl px-3 py-2 text-xs text-white"
        >
          <option value="all">كل الحالات</option>
          {Object.entries(STATUS_BADGE).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* قائمة الطلبات */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500 text-xs">جاري تحميل الطلبات...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs border border-[#2A2B30] rounded-2xl">
          لا توجد اشتراكات إعلانية مطابقة للتصفية الحالية.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const st = STATUS_BADGE[order.status] || STATUS_BADGE.pending_review;
            const hasConflict = conflictOrderIds.has(order.id);
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-[#2A2B30] bg-[#0A0A0C] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFC500]/15 text-[#FFC500] text-[11px] font-black">
                      {TYPE_LABELS[order.ad_type]}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${st.cls}`}>
                      {st.label}
                    </span>
                    {order.is_free_order && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                        مجاني
                      </span>
                    )}
                    {hasConflict && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> تداخل مساحة/فترة
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-zinc-500">
                    {new Date(order.created_at).toLocaleString('ar-YE')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-zinc-400">المعلن</p>
                    <p className="font-bold text-white mt-0.5">
                      {order.user_name}
                      {order.business_name ? ` · (${order.business_name})` : ''}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      القسم: {getDynamicSectionLabel(order.section_id, sections)} · المساحة: {order.slot_key}
                    </p>
                  </div>

                  <div>
                    <p className="text-zinc-400">الباقة والتسعير</p>
                    <p className="font-bold text-white mt-0.5">
                      {order.package_name_snapshot} ({order.duration_days} يوم)
                    </p>
                    <p className="text-[11px] text-[#FFC500] font-bold">
                      {order.is_free_order
                        ? 'مجاني (0)'
                        : `${order.final_price.toLocaleString()} ${order.currency}`}
                      {order.discount_amount > 0 ? ` (خصم ${order.discount_amount})` : ''}
                    </p>
                    {order.ad_type === 'phone_feed' && (
                      <p className="text-[11px] text-zinc-400">
                        الرصيد المتبقي: {order.remaining_posts}/{order.post_quota} منشور · إبراز:{' '}
                        {order.remaining_highlights}/{order.highlight_quota}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-zinc-400">الدفع والصلاحية</p>
                    <p className="text-white mt-0.5">
                      {order.is_free_order
                        ? 'لا يتطلب إيصال تحويل'
                        : `${order.payment_method_name || 'دفع يدوي'} · مرجع: ${order.payment_reference || '—'}`}
                    </p>
                    {order.ends_at && (
                      <p className="text-[11px] text-zinc-400">
                        ينتهي: {new Date(order.ends_at).toLocaleDateString('ar-YE')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#222]">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setAdminNotes(order.admin_notes || '');
                      setCustomEndDate(order.ends_at ? order.ends_at.slice(0, 10) : '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#FFC500]" />
                    <span>معاينة الإعلان والإيصال والإجراءات</span>
                  </button>

                  {order.status !== 'active' && order.status !== 'rejected' && (
                    <button
                      disabled={busyId === order.id}
                      onClick={() => runAction(order, 'approve_activate')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>اعتماد وتفعيل</span>
                    </button>
                  )}

                  {order.status === 'active' && (
                    <button
                      disabled={busyId === order.id}
                      onClick={() => runAction(order, 'pause')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>إيقاف مؤقت</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* مودال معاينة الإعلان والإيصال وإجراءات الإدارة */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[220] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#09090B] border border-[#2A2B30] rounded-2xl p-5 space-y-4 text-xs"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="text-sm font-black text-white">
                تفاصيل الطلب: {selectedOrder.package_name_snapshot}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* معاينة محتوى الإعلان */}
            <div className="p-3.5 rounded-xl bg-black border border-[#222] space-y-2">
              <p className="font-bold text-[#FFC500]">معاينة محتوى الإعلان</p>
              {selectedOrder.ad_payload?.mediaUrl && (
                <img
                  src={selectedOrder.ad_payload.mediaUrl}
                  alt="معاينة الإعلان"
                  className="w-full max-h-48 object-contain rounded-xl border border-[#222] bg-zinc-950"
                />
              )}
              <div className="space-y-1 text-zinc-300">
                {selectedOrder.ad_payload?.advertiserName && (
                  <p>المعلن / الراعي: <strong>{selectedOrder.ad_payload.advertiserName}</strong></p>
                )}
                {selectedOrder.ad_payload?.title && (
                  <p>العنوان: <strong>{selectedOrder.ad_payload.title}</strong></p>
                )}
                {selectedOrder.ad_payload?.sponsorTag && (
                  <p>وسم الرعاية: <strong>{selectedOrder.ad_payload.sponsorTag}</strong></p>
                )}
                {selectedOrder.ad_payload?.description && (
                  <p>الوصف: {selectedOrder.ad_payload.description}</p>
                )}
                {selectedOrder.ad_payload?.linkUrl && (
                  <p dir="ltr" className="text-sky-400 truncate">
                    {selectedOrder.ad_payload.linkUrl}
                  </p>
                )}
              </div>
            </div>

            {/* معاينة إيصال الدفع */}
            {!selectedOrder.is_free_order && (
              <div className="p-3.5 rounded-xl bg-black border border-[#222] space-y-2">
                <p className="font-bold text-[#FFC500]">بيانات الدفع والإيصال</p>
                <p>الطريقة: {selectedOrder.payment_method_name || '—'}</p>
                <p dir="ltr">المرجع: {selectedOrder.payment_reference || 'لم يُدخل بعد'}</p>
                {resolvedProofUrl ? (
                  <a href={resolvedProofUrl} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={resolvedProofUrl}
                      alt="إيصال التحويل"
                      className="w-full max-h-56 object-contain rounded-xl border border-[#222]"
                    />
                  </a>
                ) : (
                  <p className="text-zinc-500">لم يتم رفع صورة سند تحويل.</p>
                )}
              </div>
            )}

            {/* تمديد تاريخ الانتهاء وملاحظات الإدارة */}
            <div className="space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">ملاحظات الإدارة (تظهر للمعلن عند الرفض)</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-black border border-[#2A2B30] rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-zinc-400 block mb-1">تعديل/تمديد تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-black border border-[#2A2B30] rounded-xl p-2 text-white"
                    dir="ltr"
                  />
                </div>
                <button
                  disabled={busyId === selectedOrder.id}
                  onClick={() => runAction(selectedOrder, 'extend')}
                  className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>تمديد</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#222]">
              <button
                disabled={busyId === selectedOrder.id}
                onClick={() => runAction(selectedOrder, 'approve_activate')}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد وتفعيل</span>
              </button>
              <button
                disabled={busyId === selectedOrder.id}
                onClick={() => runAction(selectedOrder, 'pause')}
                className="py-2.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold"
              >
                إيقاف مؤقت
              </button>
              <button
                disabled={busyId === selectedOrder.id}
                onClick={() => runAction(selectedOrder, 'reject')}
                className="py-2.5 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 font-bold flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                <span>رفض</span>
              </button>
              <button
                disabled={busyId === selectedOrder.id}
                onClick={() => runAction(selectedOrder, 'cancel')}
                className="py-2.5 rounded-xl bg-zinc-900 text-zinc-400 font-bold"
              >
                إلغاء الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
