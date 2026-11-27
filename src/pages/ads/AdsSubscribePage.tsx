import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Smartphone,
  Sparkles,
  Image as ImageIcon,
  Megaphone,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Gift,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  adSubscriptionsService,
  AdOrderStatus,
  AdProductType,
  AdSubscriptionOrder,
} from '../../services/adSubscriptionsService';
import { AdSubscriptionWizardModal } from '../../components/ads/AdSubscriptionWizardModal';

const STATUS_MAP: Record<AdOrderStatus, { label: string; cls: string }> = {
  draft: { label: 'مسودة', cls: 'bg-zinc-800 text-zinc-300' },
  pending_payment: { label: 'بانتظار الدفع', cls: 'bg-amber-500/20 text-amber-300' },
  pending_review: { label: 'بانتظار مراجعة الإدارة', cls: 'bg-sky-500/20 text-sky-300' },
  approved: { label: 'مقبول / موقوف', cls: 'bg-indigo-500/20 text-indigo-300' },
  active: { label: 'نشط الآن', cls: 'bg-emerald-500/20 text-emerald-300' },
  rejected: { label: 'مرفوض', cls: 'bg-rose-500/20 text-rose-300' },
  expired: { label: 'منتهي', cls: 'bg-zinc-800 text-zinc-500' },
  cancelled: { label: 'ملغي', cls: 'bg-zinc-900 text-zinc-500' },
};

export const AdsSubscribePage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdSubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<AdProductType | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        const list = await adSubscriptionsService.getMyOrders(data.user.id);
        setOrders(list);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openWizard = (type: AdProductType | null) => {
    setWizardType(type);
    setIsWizardOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20" dir="rtl">
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-[#2F3336] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black text-white">مركز الاشتراكات الإعلانية</h1>
              <p className="text-[11px] text-[#71767B]">اختر نوع الإعلان المناسب وتابع اشتراكاتك</p>
            </div>
          </div>

          <button
            onClick={() => openWizard(null)}
            className="px-4 py-2 rounded-full bg-[#FFC500] text-black text-xs font-black"
          >
            + إعلان جديد
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#FFC500]" />
            <span>أنواع الإعلانات المتاحة في يمن ريتنج</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => openWizard('phone_feed')}
              className="p-4 rounded-2xl border border-[#2F3336] bg-[#080808] hover:border-[#FFC500] text-right space-y-2 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFC500]/15 text-[#FFC500] flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">إعلانات سوق الهاتف</h3>
              <p className="text-xs text-[#71767B] leading-relaxed">
                باقات منشورات وتغريدات مميزة داخل سوق الهاتف والمجتمع.
              </p>
              <span className="inline-block text-[11px] font-black text-[#FFC500]">
                اختر الباقة ←
              </span>
            </button>

            <button
              onClick={() => openWizard('sponsor')}
              className="p-4 rounded-2xl border border-[#2F3336] bg-[#080808] hover:border-[#FFC500] text-right space-y-2 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFC500]/15 text-[#FFC500] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">إعلانات الراعي (Sponsor)</h3>
              <p className="text-xs text-[#71767B] leading-relaxed">
                رعاية قسم معين بشعارك واسم منشأتك وعبارة «هذا القسم برعاية».
              </p>
              <span className="inline-block text-[11px] font-black text-[#FFC500]">
                احجز رعاية ←
              </span>
            </button>

            <button
              onClick={() => openWizard('banner')}
              className="p-4 rounded-2xl border border-[#2F3336] bg-[#080808] hover:border-[#FFC500] text-right space-y-2 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFC500]/15 text-[#FFC500] flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">إعلانات البانر (Banner)</h3>
              <p className="text-xs text-[#71767B] leading-relaxed">
                حجز مساحة بانر مصورة في الوحدة الأولى أو الثانية داخل الأقسام.
              </p>
              <span className="inline-block text-[11px] font-black text-[#FFC500]">
                احجز مساحة ←
              </span>
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-black text-white">اشتراكاتي وطلباتي الإعلانية ({orders.length})</h2>
          {loading ? (
            <div className="py-10 text-center text-xs text-[#71767B]">جاري التحميل...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#2F3336] bg-[#080808] text-center text-xs text-[#71767B]">
              لا توجد لديك طلبات إعلانية بعد. اختر أحد الأنواع أعلاه للبدء.
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.map((ord) => {
                const st = STATUS_MAP[ord.status] || STATUS_MAP.pending_review;
                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-[#2F3336] bg-[#080808] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{ord.package_name_snapshot}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#71767B]">
                        {new Date(ord.created_at).toLocaleDateString('ar-YE')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-zinc-400">
                      <span>القسم: {ord.section_id}</span>
                      <span>المساحة: {ord.slot_key}</span>
                      <span className="text-[#FFC500] font-bold inline-flex items-center gap-1">
                        {ord.is_free_order ? (
                          <>
                            <Gift className="w-3.5 h-3.5" /> مجاني (0)
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5" /> {ord.final_price.toLocaleString()} {ord.currency}
                          </>
                        )}
                      </span>
                    </div>

                    {ord.ad_type === 'phone_feed' && ord.status === 'active' && (
                      <div className="p-2.5 rounded-xl bg-black border border-[#2F3336] flex items-center justify-between">
                        <span>
                          الرصيد المتبقي: <strong className="text-[#FFC500]">{ord.remaining_posts}</strong> / {ord.post_quota} منشور · إبراز:{' '}
                          <strong className="text-white">{ord.remaining_highlights}</strong>
                        </span>
                        <button
                          onClick={() => navigate('/phones')}
                          className="px-3 py-1 rounded-full bg-[#FFC500] text-black font-black text-[11px]"
                        >
                          انشر الآن
                        </button>
                      </div>
                    )}

                    {ord.ends_at && (
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                        {ord.status === 'active' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span>ينتهي في: {new Date(ord.ends_at).toLocaleDateString('ar-YE')}</span>
                      </p>
                    )}

                    {ord.status === 'rejected' && ord.admin_notes && (
                      <p className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>سبب الرفض: {ord.admin_notes}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <AdSubscriptionWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialAdType={wizardType}
        onOrderSubmitted={() => loadOrders()}
      />
    </div>
  );
};
