import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { sendSubscriptionNotification } from '../../../../utils/notifySubscription';
import { VerifiedBadge } from '../../../../components/common/VerifiedBadge';

interface PendingRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  plan_name: string;
  plan_badge: string;
  plan_price: number;
  plan_currency: string;
  plan_duration: number;
  proof_url: string | null;
  created_at: string;
  scope: 'account' | 'business';
  business_id?: string | null;
  business_name?: string | null;
}

export const PendingRequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!subs || subs.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(subs.map(s => s.user_id))];
      const planIds = [...new Set(subs.map(s => s.plan_id))];
      const subIds = subs.map(s => s.id);

      const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds);
      const { data: plans } = await supabase.from('subscription_plans').select('id, name, badge_type, price, currency, duration_days').in('id', planIds);
      const { data: proofs } = await supabase.from('payment_proofs').select('subscription_id, proof_url').in('subscription_id', subIds);
      const bizIds = [...new Set(subs.map((s: any) => { const m = String(s.notes || '').match(/\[BIZ_VERIFY:([^|\]]+)/); return m ? m[1] : null; }).filter(Boolean))];
      const { data: bizRows } = bizIds.length > 0 ? await supabase.from('businesses').select('id, name, logo_url').in('id', bizIds) : { data: [] };
      const bizMap = new Map((bizRows || []).map((b: any) => [b.id, b]));

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const planMap = new Map((plans || []).map(p => [p.id, p]));
      const proofMap = new Map((proofs || []).map(p => [p.subscription_id, p.proof_url]));

      const formatted = subs.map((s: any) => {
        const prof = profileMap.get(s.user_id);
        const plan = planMap.get(s.plan_id);
        const m = String(s.notes || '').match(/\[BIZ_VERIFY:([^|\]]+)(?:\|([^\]]+))?\]/);
        const bizId = m ? m[1] : null;
        const bizObj = bizId ? bizMap.get(bizId) : null;
        const bizName = bizObj?.name || (m && m[2]) || null;
        return {
          id: s.id,
          user_id: s.user_id,
          scope: bizId ? 'business' : 'account',
          business_id: bizId,
          business_name: bizName,
          user_name: bizId ? (bizName || 'منشأة') : (prof?.full_name || 'مستخدم'),
          user_avatar: bizId ? (bizObj?.logo_url || null) : (prof?.avatar_url || null),
          plan_name: plan?.name || 'باقة',
          plan_badge: plan?.badge_type || 'none',
          plan_price: plan?.price || 0,
          plan_currency: plan?.currency || 'YER',
          plan_duration: plan?.duration_days || 30,
          proof_url: proofMap.get(s.id) || null,
          created_at: s.created_at,
        } as PendingRequest;
      });

      setRequests(formatted);
    } catch (err: any) {
      console.error(err);
      showToast('خطأ في جلب البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleApprove = async (req: PendingRequest) => {
    if (!confirm(`قبول طلب ${req.user_name}؟`)) return;

    try {
      if (req.scope === 'business' && req.business_id) {
        const now = new Date();
        const end = new Date(now.getTime() + (req.plan_duration || 30) * 86400000);
        const { error: subUpErr } = await supabase.from('subscriptions').update({ status: 'ACTIVE', start_date: now.toISOString(), end_date: end.toISOString() }).eq('id', req.id);
        if (subUpErr) throw new Error('فشل تحديث الاشتراك: ' + subUpErr.message);
        await supabase.from('payment_proofs').update({ status: 'APPROVED', reviewed_at: now.toISOString() }).eq('subscription_id', req.id);
        const { error: bizErr } = await supabase.from('businesses').update({ is_verified: true, badge_type: req.plan_badge && req.plan_badge !== 'none' ? req.plan_badge : 'gold' }).eq('id', req.business_id);
        if (bizErr) throw new Error('فشل توثيق المنشأة: ' + bizErr.message);
      } else {
        const { error } = await supabase.rpc('approve_subscription', { sub_id: req.id });
        if (error) throw new Error('فشل القبول: ' + error.message);
      }

      await sendSubscriptionNotification({ userId: req.user_id, scope: req.scope, entityName: req.business_name, serviceName: req.plan_name, status: 'approved' });
      showToast('تم القبول وتفعيل الشارة', 'success');
      fetchRequests();
    } catch (err: any) {
      console.error('❌ Approval Error:', err);
      showToast(err.message, 'error');
    }
  };

  const handleReject = async (req: PendingRequest) => {
    const id = req.id;
    if (!confirm('رفض الطلب؟')) return;
    try {
      await supabase.from('subscriptions').update({ status: 'REJECTED' }).eq('id', id);
      await sendSubscriptionNotification({ userId: req.user_id, scope: req.scope, entityName: req.business_name, serviceName: req.plan_name, status: 'rejected' });
      showToast('تم الرفض', 'success');
      fetchRequests();
    } catch { showToast('خطأ', 'error'); }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-3 rounded-xl text-center text-sm font-bold ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">طلبات الاشتراك المعلقة</h2>
        <span className="text-xs bg-[#FFC500]/20 text-[#FFC500] px-2 py-1 rounded-full font-bold">{requests.length} طلب</span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">لا توجد طلبات جديدة</div>
      ) : (
        requests.map(req => (
          <div key={req.id} className="p-4 rounded-xl border border-[#2A2B30] bg-black">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFC500]/20 flex items-center justify-center font-bold text-[#FFC500] overflow-hidden">
                  {req.user_avatar ? <img src={req.user_avatar} alt="" className="w-full h-full object-cover" /> : req.user_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{req.user_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.scope === 'business' ? 'bg-[#FFC500]/15 text-[#FFC500]' : 'bg-sky-500/15 text-sky-400'}`}>{req.scope === 'business' ? 'صفحة منشأة' : 'حساب شخصي'}</span>
                    <VerifiedBadge type={req.plan_badge as any} size={16} />
                  </div>
                  <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(req.created_at).toLocaleDateString('ar-YE')}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-[#2A2B30] pt-3">
              <div>
                <p className="text-sm text-white">الباقة: <span className="font-bold text-[#FFC500]">{req.plan_name}</span></p>
                <p className="text-xs text-zinc-400">السعر: {req.plan_price} {req.plan_currency} لمدة {req.plan_duration} يوم</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {req.proof_url && (
                  <a href={req.proof_url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-bold flex items-center gap-1 flex-1 md:flex-none"><Eye className="w-4 h-4" /> الإثبات</a>
                )}
                <button onClick={() => handleApprove(req)} className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-bold flex items-center gap-1 flex-1 md:flex-none"><CheckCircle2 className="w-4 h-4" /> قبول</button>
                <button onClick={() => handleReject(req)} className="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-bold flex items-center gap-1 flex-1 md:flex-none"><XCircle className="w-4 h-4" /> رفض</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
