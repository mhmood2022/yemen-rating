import React, { useEffect, useState } from 'react';
import { Receipt, Eye, CheckCircle2, XCircle, X, Clock, CreditCard, Wallet } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { VerifiedBadge } from '../../../components/common/VerifiedBadge';

interface PaymentProof {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  amount: number;
  currency: string;
  payment_method_name: string;
  proof_url: string | null;
  reference_number: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  subscription_id: string | null;
  plan_name?: string;
  plan_badge?: string;
}

export const PaymentProofsTab: React.FC = () => {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [viewProof, setViewProof] = useState<PaymentProof | null>(null);
  const [signedProofUrl, setSignedProofUrl] = useState<string | null>(null);
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
      const { data: proofsData, error: proofsError } = await supabase
        .from('payment_proofs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (proofsError) throw proofsError;
      if (!proofsData || proofsData.length === 0) {
        setProofs([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(proofsData.map(p => p.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const subIds = proofsData.filter(p => p.subscription_id).map(p => p.subscription_id);
      let planMap = new Map();
      if (subIds.length > 0) {
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('id, plan:subscription_plans(name, badge_type)')
          .in('id', subIds);
        (subs || []).forEach((s: any) => {
          planMap.set(s.id, { name: s.plan?.name || 'اشتراك', badge: s.plan?.badge_type });
        });
      }

      const methodTypes = [...new Set(proofsData.map(p => p.payment_method))];
      let methodNameMap = new Map();
      if (methodTypes.length > 0) {
        const { data: methods } = await supabase
          .from('payment_methods')
          .select('type, name')
          .in('type', methodTypes);
        (methods || []).forEach((m: any) => {
          methodNameMap.set(m.type, m.name);
        });
      }

      const formatted: PaymentProof[] = proofsData.map((p: any) => {
        const prof = profileMap.get(p.user_id);
        const planInfo = p.subscription_id ? planMap.get(p.subscription_id) : null;
        return {
          ...p,
          user_name: prof?.full_name || 'مستخدم',
          user_avatar: prof?.avatar_url || null,
          payment_method_name: methodNameMap.get(p.payment_method) || p.payment_method,
          plan_name: planInfo?.name || (p.subscription_id ? 'اشتراك' : 'خدمة أخرى'),
          plan_badge: planInfo?.badge || 'none',
        };
      });

      setProofs(formatted);
    } catch (err: any) {
      showToast('تعذر جلب السندات: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProofs(); }, []);

  // دالة إنشاء رابط مؤقت للسند (Bucket خاص)
  const openProof = async (proof: PaymentProof) => {
    setViewProof(proof);
    setSignedProofUrl(null);
    
    if (!proof.proof_url) return;
    
    let filePath = proof.proof_url;
    // إذا كان الرابط قديماً (public)، نستخرج المسار منه
    if (proof.proof_url.includes('/payment-proofs/')) {
      const parts = proof.proof_url.split('/payment-proofs/');
      if (parts.length >= 2) {
        filePath = decodeURIComponent(parts[1].split('?')[0]);
      }
    }
    
    try {
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .createSignedUrl(filePath, 3600);
      
      if (error) {
        console.error('Signed URL error:', error);
        // نعرض المسار كما هو كخطة بديلة
        setSignedProofUrl(proof.proof_url);
      } else {
        setSignedProofUrl(data.signedUrl);
      }
    } catch (e) {
      console.error('Signed URL exception:', e);
      setSignedProofUrl(proof.proof_url);
    }
  };

  const handleApprove = async (proof: PaymentProof) => {
    if (!confirm('قبول هذا السند؟ سيتم تفعيل الخدمة.')) return;
    try {
      if (proof.subscription_id) {
        const { error } = await supabase.rpc('approve_subscription', { sub_id: proof.subscription_id });
        if (error) throw error;
      }
      await supabase.from('payment_proofs').update({ 
        status: 'APPROVED', 
        reviewed_at: new Date().toISOString() 
      }).eq('id', proof.id);
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
        <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-xl border shadow-lg ${toast.type === 'success' ? 'bg-[#0a1f0a] border-green-500/40 text-green-400' : 'bg-[#1f0a0a] border-red-500/40 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#FFC500]" /> مراجعة السندات
        </h2>
      </div>

      <div className="flex bg-[#111] rounded-lg p-1 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'pending', label: 'قيد المراجعة', count: counts.pending },
          { id: 'approved', label: 'مقبول', count: counts.approved },
          { id: 'rejected', label: 'مرفوض', count: counts.rejected },
          { id: 'all', label: 'الكل', count: counts.all },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 min-w-[90px] px-3 py-2 text-xs font-bold rounded-md transition whitespace-nowrap ${filter === tab.id ? 'bg-[#FFC500] text-black' : 'text-zinc-400 hover:text-white'}`}
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
        <div className="space-y-3">
          {filteredProofs.map(proof => (
            <div key={proof.id} className="p-4 rounded-xl bg-black border border-[#2A2B30]">
              
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FFC500]/20 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0" style={{ color: '#FFC500' }}>
                    {proof.user_avatar ? (
                      <img src={proof.user_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      proof.user_name[0]
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{proof.user_name}</p>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(proof.created_at).toLocaleDateString('ar-YE')}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  proof.status === 'PENDING' ? 'bg-[#FFC500]/20 text-[#FFC500]' :
                  proof.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {proof.status === 'PENDING' ? 'قيد المراجعة' : proof.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg mb-2.5" style={{ background: '#0A0A0B', border: '1px solid #2A2B30' }}>
                <div>
                  <p className="text-[10px] text-zinc-500 mb-0.5">المبلغ</p>
                  <p className="text-lg font-black text-[#FFC500]">{proof.amount} <span className="text-xs">{proof.currency}</span></p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-zinc-500 mb-0.5">الخدمة</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">{proof.plan_name}</span>
                    {proof.plan_badge && proof.plan_badge !== 'none' && <VerifiedBadge type={proof.plan_badge as any} size={14} />}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-400 mb-3 px-1">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> {proof.payment_method_name}
                </span>
                {proof.reference_number && (
                  <span className="flex items-center gap-1" dir="ltr">
                    <CreditCard className="w-3 h-3" /> {proof.reference_number}
                  </span>
                )}
              </div>

              {proof.status === 'REJECTED' && proof.admin_notes && (
                <div className="mb-3 p-2 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400">
                  <strong>سبب الرفض:</strong> {proof.admin_notes}
                </div>
              )}

              {/* تنبيهات التحقق التلقائي */}
              {proof.verification_status && proof.verification_status !== 'clean' && (
                <div className={`mb-3 p-3 rounded-lg border ${
                  proof.verification_status === 'suspicious' 
                    ? 'bg-red-500/10 border-red-500/40' 
                    : 'bg-yellow-500/10 border-yellow-500/40'
                }`}>
                  <p className={`text-xs font-bold mb-1 ${
                    proof.verification_status === 'suspicious' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {proof.verification_status === 'suspicious' ? '⚠️ سند مريب!' : '🔍 يحتاج مراجعة'}
                  </p>
                  {proof.verification_notes?.warnings?.length > 0 && (
                    <ul className="space-y-0.5">
                      {proof.verification_notes.warnings.map((w: any, i: number) => (
                        <li key={i} className="text-[11px] text-zinc-300">• {w.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {proof.status === 'PENDING' ? (
                <div className="flex gap-2 pt-2 border-t border-[#2A2B30]">
                  {proof.proof_url && (
                    <button onClick={() => openProof(proof)} className="flex-1 h-9 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1 active:opacity-70">
                      <Eye className="w-3.5 h-3.5" /> السند
                    </button>
                  )}
                  <button onClick={() => handleApprove(proof)} className="flex-1 h-9 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold flex items-center justify-center gap-1 active:opacity-70">
                    <CheckCircle2 className="w-3.5 h-3.5" /> قبول
                  </button>
                  <button onClick={() => setRejectModal(proof)} className="flex-1 h-9 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1 active:opacity-70">
                    <XCircle className="w-3.5 h-3.5" /> رفض
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#2A2B30]">
                  {proof.proof_url && (
                    <button onClick={() => openProof(proof)} className="w-full h-9 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> عرض السند
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox عرض السند (صورة فقط) */}
      {viewProof && (
        <div 
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          onClick={() => { setViewProof(null); setSignedProofUrl(null); }}
        >
          {/* زر إغلاق صغير في الأعلى */}
          <button 
            onClick={() => { setViewProof(null); setSignedProofUrl(null); }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white"
            style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* الصورة فقط - بدون إطار */}
          <div 
            className="w-full h-full flex items-center justify-center p-0"
            onClick={e => e.stopPropagation()}
          >
            {!signedProofUrl && viewProof.proof_url && (
              <div className="text-center text-zinc-500">
                <div className="animate-pulse">جاري تحميل الصورة...</div>
              </div>
            )}
            
            {signedProofUrl && (
              signedProofUrl.toLowerCase().endsWith('.pdf') ? (
                <a 
                  href={signedProofUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#FFC500] underline font-bold"
                  onClick={e => e.stopPropagation()}
                >
                  فتح ملف PDF
                </a>
              ) : (
                <img 
                  src={signedProofUrl} 
                  alt="سند" 
                  className="max-w-full max-h-full object-contain"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    maxHeight: '100vh',
                    maxWidth: '100vw'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const msg = document.createElement('p');
                      msg.className = 'text-center text-red-400 py-8';
                      msg.textContent = 'تعذر تحميل الصورة';
                      parent.appendChild(msg);
                    }
                  }}
                />
              )
            )}
            
            {!viewProof.proof_url && (
              <p className="text-center text-zinc-500">لا توجد صورة للسند.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal الرفض */}
      {rejectModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90">
          <div className="relative max-w-md w-full bg-black border border-[#2A2B30] rounded-2xl p-5">
            <h3 className="font-bold text-white mb-3 text-sm">سبب الرفض</h3>
            <p className="text-xs text-zinc-500 mb-2">سيظهر هذا السبب للمستخدم في صفحة مدفوعاته.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="مثال: المبلغ غير مطابق، السند غير واضح، رقم العملية غير صحيح..."
              rows={3}
              className="w-full bg-[#111] border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 bg-zinc-900 text-white rounded-lg text-xs font-bold border border-[#71767B]">إلغاء</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">تأكيد الرفض</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
