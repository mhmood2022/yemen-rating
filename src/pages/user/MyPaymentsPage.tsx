import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CreditCard, Clock, CheckCircle2, XCircle, Megaphone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adSubscriptionsService, AdSubscriptionOrder } from '../../services/adSubscriptionsService';

export const MyPaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const isBiz = sp.get('scope') === 'business';
  const bizId = sp.get('businessId') || '';
  const bizName = sp.get('businessName') || '';
  const [payments, setPayments] = useState<any[]>([]);
  const [adOrders, setAdOrders] = useState<AdSubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const [{ data: proofsData }, ordersData] = await Promise.all([
        supabase.from('payment_proofs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        adSubscriptionsService.getMyOrders(user.id).catch(() => [] as AdSubscriptionOrder[]),
      ]);
      let map: Record<string, { scope?: string; businessId?: string | null }> = {};
      try { map = JSON.parse(localStorage.getItem('yr_scoped_payments_v1') || '{}'); } catch {}
      setPayments((proofsData || []).filter((p: any) => {
        const noteBiz = String(p.admin_notes || '').includes('[BIZ_VERIFY:');
        const isProofBiz = map[p.id]?.scope === 'business' || noteBiz;
        if (isBiz) return isProofBiz && (!bizId || map[p.id]?.businessId === bizId || String(p.admin_notes || '').includes(bizId));
        return !isProofBiz;
      }));
      setAdOrders((ordersData || []).filter((o) => isBiz ? (bizId ? o.business_id === bizId : Boolean(o.business_id)) : !o.business_id));
      setLoading(false);
    })();
  }, [navigate, isBiz, bizId]);

  const statusInfo = (s: string) => {
    const up = String(s || '').toUpperCase();
    if (up === 'APPROVED' || up === 'ACTIVE') return { label: 'مقبول', color: '#22C55E', icon: CheckCircle2 };
    if (up === 'REJECTED' || up === 'CANCELLED') return { label: 'مرفوض', color: '#EF4444', icon: XCircle };
    return { label: 'قيد المراجعة', color: '#FFC500', icon: Clock };
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20" dir="rtl">
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-[#2F3336] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#181818] rounded-full transition cursor-pointer"><ArrowRight className="w-5 h-5" /></button>
        <h1 className="font-bold text-base truncate">{isBiz ? `مدفوعات المنشأة${bizName ? `: ${bizName}` : ''}` : 'مدفوعات الحساب الشخصي'}</h1>
      </div>
      <div className="p-4 max-w-lg mx-auto space-y-3">
        {loading ? <div className="text-center py-10 text-zinc-500">جاري التحميل...</div> : payments.length === 0 && adOrders.length === 0 ? (
          <div className="text-center py-12 text-zinc-500"><CreditCard className="w-12 h-12 mx-auto mb-3 text-zinc-700" /><p className="text-sm">{isBiz ? 'لا توجد مدفوعات لهذه المنشأة.' : 'لا توجد مدفوعات للحساب الشخصي.'}</p></div>
        ) : (
          <>
            {payments.map((p) => { const st = statusInfo(p.status); const Icon = st.icon; return (
              <div key={p.id} className="p-4 rounded-xl bg-[#111] border border-[#2A2B30]">
                <div className="flex items-center justify-between mb-2"><span className="text-lg font-black text-[#FFC500]">{p.amount} {p.currency}</span><span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${st.color}20`, color: st.color }}><Icon className="w-3.5 h-3.5" />{st.label}</span></div>
                <div className="text-xs text-zinc-400 space-y-1"><p>طريقة الدفع: {p.payment_method === 'wallet' ? 'محفظة إلكترونية' : p.payment_method === 'bank' ? 'حساب بنكي' : 'أخرى'}</p>{p.reference_number && <p dir="ltr" style={{ textAlign: 'right' }}>رقم العملية: {p.reference_number}</p>}<p>التاريخ: {new Date(p.created_at).toLocaleDateString('ar-YE')}</p></div>
              </div>
            ); })}
            {adOrders.map((o) => { const st = statusInfo(o.status); const Icon = st.icon; return (
              <div key={o.id} className="p-4 rounded-xl bg-[#111] border border-[#2A2B30]">
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-black text-white inline-flex items-center gap-1.5"><Megaphone size={14} className="text-[#FFC500]" />{o.package_name_snapshot}</span><span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${st.color}20`, color: st.color }}><Icon className="w-3.5 h-3.5" />{st.label}</span></div>
                <div className="text-xs text-zinc-400 space-y-1"><p>المبلغ: {o.is_free_order ? 'مجاني' : `${o.final_price} ${o.currency}`}</p><p>القسم: {o.section_id}</p></div>
              </div>
            ); })}
          </>
        )}
      </div>
    </div>
  );
};
