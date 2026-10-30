import React, { useEffect, useState } from 'react';
import { Receipt, Eye, CheckCircle2, XCircle, X, Check, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PaymentProof {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  proof_url: string | null;
  reference_number: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  subscription_id: string | null;
  plan_name?: string;
}

export const PaymentProofsTab: React.FC = () => {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [viewProof, setViewProof] = useState<PaymentProof | null>(null);
  const [rejectModal, setRejectModal] = useState<PaymentProof | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select('*, subscription:subscriptions(plan:subscription_plans(name)), user:profiles(full_name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formatted = (data || []).map((p: any) => ({
        ...p,
        user_name: p.user?.full_name || 'مستخدم',
        plan_name: p.subscription?.plan?.name || 'اشتراك',
      }));
      setProofs(formatted);
    } catch (err: any) {
      showToast('تعذر جلب السندات: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProofs(); }, []);

  const handleApprove = async (proof: PaymentProof) => {
    if (!confirm('قبول هذا السند؟ سيتم تفعيل الخدمة.')) return;
    try {
      if (proof.subscription_id) {
        const { error } = await supabase.rpc('approve_subscription', { sub_id: proof.subscription_id });
        if (error) throw error;
      }
      // تحديث حالة السند
      await supabase.from('payment_proofs').update({ status: 'APPROVED', reviewed_at: new Date().toISOString() }).eq('id', proof.id);
      showToast('تم قبول السند وتفعيل الخدمة', 'success');
      fetchProofs();
    } catch (err: any) {
      showToast('تعذر القبول: ' + err.message, 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await supabase.from('payment_proofs').update({
        status: 'REJECTED',
        admin_notes: rejectReason,
        reviewed_at: new Date().toISOString(),
      }).eq('id', rejectModal.id);
      
      showToast('تم رفض السند', 'success');
      setRejectModal(null);
      setRejectReason('');
      fetchProofs();
    } catch (err: any) {
      showToast('تعذر الرفض: ' + err.message, 'error');
    }
  };

  const filteredProofs = proofs.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter.toUpperCase();
  });

  const counts = {
    pending: proofs.filter(p => p.status === 'PENDING').length,
    approved: proofs.filter(p => p.status === 'APPROVED').length,
    rejected: proofs.filter(p => p.status === 'REJECTED').length,
    all: proofs.length,
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-xl border ${toast.type === 'success' ? 'bg-[#0a1f0a] border-green-500/40 text-green-400' : 'bg-[#1f0a0a] border-red-500/40 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#FFC500]" /> مراجعة السندات
        </h2>
      </div>

      <div className="flex bg-[#111] rounded-lg p-1 mb-4">
        {[
          { id: 'pending', label: 'قيد المراجعة', count: counts.pending },
          { id: 'approved', label: 'مقبول', count: counts.approved },
          { id: 'rejected', label: 'مرفوض', count: counts.rejected },
          { id: 'all', label: 'الكل', count: counts.all },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition ${filter === tab.id ? 'bg-[#FFC500] text-black' : 'text-zinc-400 hover:text-white'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>
      ) : filteredProofs.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">لا توجد سندات في هذه الحالة.</div>
      ) : (
        <div className="space-y-2">
          {filteredProofs.map(proof => (
            <div key={proof.id} className="p-4 rounded-xl bg-black border border-[#2A2B30]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-white">{proof.user_name}</p>
                  <p className="text-xs text-zinc-500">{new Date(proof.created_at).toLocaleDateString('ar-YE')}</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-[#FFC500]">{proof.amount} {proof.currency}</p>
                  <p className="text-xs text-zinc-500">{proof.plan_name}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-[#2A2B30]">
                {proof.proof_url && (
                  <button onClick={() => setViewProof(proof)} className="flex-1 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" /> عرض السند
                  </button>
                )}
                {proof.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(proof)} className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> قبول
                    </button>
                    <button onClick={() => setRejectModal(proof)} className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4" /> رفض
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* عرض السند */}
      {viewProof && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90" onClick={() => setViewProof(null)}>
          <div className="relative max-w-2xl w-full bg-black border border-[#2A2B30] rounded-2xl p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-2">
              <h3 className="font-bold text-white">سند: {viewProof.user_name}</h3>
              <button onClick={() => setViewProof(null)} className="text-white"><X className="w-5 h-5" /></button>
            </div>
            {viewProof.proof_url?.endsWith('.pdf') ? (
              <a href={viewProof.proof_url} target="_blank" rel="noreferrer" className="block w-full py-8 text-center text-[#FFC500] underline">فتح ملف PDF</a>
            ) : (
              <img src={viewProof.proof_url!} alt="سند" className="w-full max-h-[70vh] object-contain rounded-xl" />
            )}
            <p className="text-xs text-zinc-500 mt-2">رقم العملية: {viewProof.reference_number || 'غير محدد'}</p>
          </div>
        </div>
      )}

      {/* رفض */}
      {rejectModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90">
          <div className="relative max-w-md w-full bg-black border border-[#2A2B30] rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3">سبب الرفض</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض (سيظهر للمستخدم)..."
              rows={3}
              className="w-full bg-[#111] border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2 bg-zinc-800 text-white rounded-lg text-xs font-bold">إلغاء</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">تأكيد الرفض</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
