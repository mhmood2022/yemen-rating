import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, CheckCircle2, CreditCard, Copy, Check, X, ChevronDown } from 'lucide-react';
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

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_url: string | null;
  qr_code_url: string | null;
  phone_number: string | null;
  wallet_number: string | null;
  point_number: string | null;
  account_number: string | null;
  iban: string | null;
  account_name: string | null;
  bank_name: string | null;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
}

export const PremiumCheckout: React.FC = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!planId) return;
      // جلب الباقة
      const { data: planData } = await supabase.from('subscription_plans').select('*').eq('id', planId).single();
      if (planData) {
        let parsedFeatures = [];
        try { parsedFeatures = Array.isArray(planData.features) ? planData.features : JSON.parse(planData.features || '[]'); } catch (e) {}
        setPlan({ ...planData, features: parsedFeatures });
      }
      // جلب طرق الدفع النشطة
      const { data: methodsData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (methodsData) {
        setMethods(methodsData);
        if (methodsData.length > 0) setSelectedMethod(methodsData[0]);
      }
      setLoading(false);
    };
    fetchData();
  }, [planId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !selectedMethod) return;
    if (!referenceNumber.trim()) {
      alert('يرجى إدخال رقم عملية التحويل');
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      // 1. إنشاء طلب اشتراك
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .insert({ user_id: user.id, plan_id: plan.id, status: 'PENDING' })
        .select()
        .single();
      if (subError) throw subError;

      // 2. رفع إثبات الدفع (إن وجد)
      let proofUrl = null;
      if (proofFile) {
        const ext = proofFile.name.split('.').pop();
        const fileName = `${user.id}/${subData.id}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, proofFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
          proofUrl = urlData.publicUrl;
        }
      }

      // 3. إضافة سجل الدفع
      await supabase.from('payment_proofs').insert({
        subscription_id: subData.id,
        user_id: user.id,
        amount: plan.price,
        currency: plan.currency,
        payment_method: selectedMethod.type,
        proof_url: proofUrl,
        reference_number: referenceNumber,
        status: 'PENDING',
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
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
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#181818] rounded-full transition"><ArrowRight className="w-5 h-5" /></button>
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
            <CreditCard className="w-5 h-5 text-[#FFC500]" /> اختر طريقة الدفع
          </h3>

          {/* قائمة طرق الدفع */}
          {methods.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#111] border border-[#2A2B30] text-center text-zinc-400 text-sm">
              لا توجد طرق دفع متاحة حالياً.
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setPaymentMethodOpen(!paymentMethodOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#111] border border-[#2A2B30] text-sm hover:border-[#FFC500] transition"
              >
                <div className="flex items-center gap-3">
                  {selectedMethod ? (
                    <>
                      {selectedMethod.icon_url ? (
                        <img src={selectedMethod.icon_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
                      ) : (
                        <CreditCard className="w-6 h-6 text-[#FFC500]" />
                      )}
                      <span className="font-bold text-white">{selectedMethod.name}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-zinc-500" />
                      </div>
                      <span className="text-zinc-400">اختر طريقة الدفع</span>
                    </>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${paymentMethodOpen ? 'rotate-180' : ''}`} />
              </button>
              {paymentMethodOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPaymentMethodOpen(false)} />
                  <div className="absolute top-full mt-2 inset-x-0 z-50 bg-[#111] border border-[#2A2B30] rounded-xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto">
                    {methods.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setSelectedMethod(m); setPaymentMethodOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-sm border-b border-[#2A2B30] last:border-0"
                      >
                        {m.icon_url ? (
                          <img src={m.icon_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-zinc-400" />
                          </div>
                        )}
                        <span className="flex-1 text-right font-bold text-white">{m.name}</span>
                        {selectedMethod?.id === m.id && (
                          <div className="w-5 h-5 rounded-full bg-[#FFC500] flex items-center justify-center">
                            <Check className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* تفاصيل طريقة الدفع المختارة */}
          {selectedMethod && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: '#0A0A0B', border: '1px solid #2A2B30' }}>
              
              {/* تنبيه المبلغ المطلوب */}
              <div className="p-3 rounded-lg bg-[#FFC500]/10 border border-[#FFC500]/30 text-center">
                <p className="text-xs text-[#FFC500] mb-1">المبلغ المطلوب تحويله بالضبط:</p>
                <p className="text-xl font-black text-white">{plan.price} {plan.currency}</p>
              </div>

              <p className="text-xs text-zinc-500 mb-2 text-center">حوّل المبلغ إلى الحساب التالي:</p>

              {selectedMethod.phone_number && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#111]">
                  <div><span className="text-xs text-zinc-500 block">رقم الهاتف</span><span className="text-sm font-bold font-mono" dir="ltr">{selectedMethod.phone_number}</span></div>
                  <button type="button" onClick={() => copyToClipboard(selectedMethod.phone_number!, 'phone')} className="p-1.5 text-zinc-400 hover:text-[#FFC500]">
                    {copiedField === 'phone' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {selectedMethod.point_number && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#111]">
                  <div><span className="text-xs text-zinc-500 block">رقم النقطة</span><span className="text-sm font-bold font-mono" dir="ltr">{selectedMethod.point_number}</span></div>
                  <button type="button" onClick={() => copyToClipboard(selectedMethod.point_number!, 'point')} className="p-1.5 text-zinc-400 hover:text-[#FFC500]">
                    {copiedField === 'point' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {selectedMethod.account_number && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#111]">
                  <div><span className="text-xs text-zinc-500 block">{selectedMethod.bank_name ? `رقم الحساب - ${selectedMethod.bank_name}` : 'رقم الحساب'}</span><span className="text-sm font-bold font-mono" dir="ltr">{selectedMethod.account_number}</span></div>
                  <button type="button" onClick={() => copyToClipboard(selectedMethod.account_number!, 'account')} className="p-1.5 text-zinc-400 hover:text-[#FFC500]">
                    {copiedField === 'account' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {selectedMethod.account_name && (
                <div className="p-2 rounded-lg bg-[#111]">
                  <span className="text-xs text-zinc-500 block">اسم المستفيد</span>
                  <span className="text-sm font-bold">{selectedMethod.account_name}</span>
                </div>
              )}

              {selectedMethod.qr_code_url && (
                <div>
                  <button type="button" onClick={() => setShowQR(selectedMethod.qr_code_url)} className="w-full p-2 rounded-lg bg-[#111] text-xs font-bold text-[#FFC500] hover:bg-white/5">
                    عرض الباركود (QR)
                  </button>
                </div>
              )}

              {selectedMethod.instructions && (
                <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-xs text-blue-400">{selectedMethod.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* رفع السند */}
          <div className="pt-2">
            <label className="block text-sm text-zinc-400 mb-2">إرفاق صورة السند (إثبات التحويل) *</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-white/5" style={{ borderColor: '#2A2B30' }}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                <p className="text-sm text-zinc-500">{proofFile ? proofFile.name : 'اضغط لاختيار صورة'}</p>
              </div>
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">رقم عملية التحويل *</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="مثال: TXN123456"
              className="w-full bg-black border border-[#2A2B30] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFC500]"
              dir="ltr"
              required
            />
            <p className="text-[10px] text-zinc-500 mt-1">رقم العملية يساعد الإدارة على التحقق من التحويل بسرعة.</p>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedMethod || !proofFile}
            className="w-full h-12 rounded-xl font-bold text-black flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            style={{ background: '#FFC500' }}
          >
            {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
          </button>
          {!proofFile && <p className="text-xs text-center text-red-400 mt-2">يجب إرفاق صورة السند لتأكيد الطلب</p>}
        </form>
      </div>

      {/* Modal الباركود */}
      {showQR && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90" onClick={() => setShowQR(null)}>
          <div className="relative bg-white p-4 rounded-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQR(null)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
            <img src={showQR} alt="QR" className="w-64 h-64 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
