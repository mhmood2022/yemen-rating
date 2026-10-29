import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, CheckCircle2, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  badge_type: string;
}

export const PremiumCheckout: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'wallet' | 'gateway'>('bank');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      const { data } = await supabase.from('subscription_plans').select('*').eq('id', planId).single();
      if (data) {
        let parsedFeatures = [];
        try {
          parsedFeatures = Array.isArray(data.features) ? data.features : JSON.parse(data.features || '[]');
        } catch (e) {}
        setPlan({ ...data, features: parsedFeatures });
      }
      setLoading(false);
    };
    fetchPlan();
  }, [planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // 1. إنشاء طلب اشتراك
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'PENDING',
        })
        .select()
        .single();

      if (subError) throw subError;

      // 2. إضافة إثبات الدفع
      await supabase.from('payment_proofs').insert({
        subscription_id: subData.id,
        user_id: user.id,
        amount: plan.price,
        currency: plan.currency,
        payment_method: paymentMethod,
        status: 'PENDING',
      });

      setSuccess(true);
    } catch (err: any) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">جاري التحميل...</div>;
  if (!plan) return <div className="min-h-screen bg-black text-white flex items-center justify-center">الباقة غير موجودة</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">تم استلام طلبك بنجاح!</h1>
        <p className="text-zinc-400 mb-6">سيتم مراجعة إثبات الدفع من قبل الإدارة وتفعيل الاشتراك قريباً.</p>
        <button onClick={() => navigate('/account')} className="px-6 py-2.5 bg-[#FFC500] text-black font-bold rounded-xl">العودة للحساب</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20" dir="rtl">
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-[#2F3336] px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#181818] rounded-full transition">
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">إتمام الاشتراك</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* ملخص الباقة */}
        <div className="rounded-2xl p-5" style={{ background: '#000', border: '1px solid #2A2B30' }}>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold">{plan.name}</h2>
            {plan.badge_type && <VerifiedBadge type={plan.badge_type as any} size={18} />}
          </div>
          <p className="text-sm text-zinc-400 mb-4">{plan.description}</p>
          <div className="flex justify-between items-center border-t border-[#2A2B30] pt-4">
            <span className="text-zinc-400">الإجمالي:</span>
            <span className="text-2xl font-black text-[#FFC500]">{plan.price} {plan.currency}</span>
          </div>
        </div>

        {/* نموذج الدفع */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FFC500]" /> طريقة الدفع
          </h3>
          
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer" style={{ borderColor: paymentMethod === 'bank' ? '#FFC500' : '#2A2B30', background: paymentMethod === 'bank' ? '#FFC50010' : '#000' }}>
              <input type="radio" name="payment" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="accent-[#FFC500]" />
              <span className="text-sm font-bold">تحويل بنكي</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer" style={{ borderColor: paymentMethod === 'wallet' ? '#FFC500' : '#2A2B30', background: paymentMethod === 'wallet' ? '#FFC50010' : '#000' }}>
              <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="accent-[#FFC500]" />
              <span className="text-sm font-bold">محفظة إلكترونية</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer" style={{ borderColor: paymentMethod === 'gateway' ? '#FFC500' : '#2A2B30', background: paymentMethod === 'gateway' ? '#FFC50010' : '#000' }}>
              <input type="radio" name="payment" checked={paymentMethod === 'gateway'} onChange={() => setPaymentMethod('gateway')} className="accent-[#FFC500]" />
              <span className="text-sm font-bold">بوابة إلكترونية (قريباً)</span>
            </label>
          </div>

          {/* رفع إثبات الدفع */}
          <div className="pt-2">
            <label className="block text-sm text-zinc-400 mb-2">إرفاق إثبات الدفع (صورة أو PDF)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-white/5" style={{ borderColor: '#2A2B30' }}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-500">{proofFile ? proofFile.name : 'اضغط لاختيار ملف'}</p>
                </div>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full h-12 rounded-xl font-bold text-black flex items-center justify-center gap-2 mt-4" style={{ background: '#FFC500' }}>
            {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
};
