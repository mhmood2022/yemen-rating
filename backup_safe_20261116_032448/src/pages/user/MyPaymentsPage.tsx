import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  proof_url: string | null;
  reference_number: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export const MyPaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setPayments(data || []);
      setLoading(false);
    };
    fetchPayments();
  }, [navigate]);

  const statusInfo = (status: string) => {
    switch (status) {
      case 'APPROVED': return { label: 'مقبول', color: '#22C55E', icon: CheckCircle2 };
      case 'REJECTED': return { label: 'مرفوض', color: '#EF4444', icon: XCircle };
      default: return { label: 'قيد المراجعة', color: '#FFC500', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20" dir="rtl">
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-[#2F3336] px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#181818] rounded-full transition">
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">سجل مدفوعاتي</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-3">
        {loading ? (
          <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>لا توجد مدفوعات سابقة.</p>
          </div>
        ) : (
          payments.map(payment => {
            const status = statusInfo(payment.status);
            const Icon = status.icon;
            return (
              <div key={payment.id} className="p-4 rounded-xl bg-[#111] border border-[#2A2B30]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-[#FFC500]">{payment.amount} {payment.currency}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${status.color}20`, color: status.color }}>
                    <Icon className="w-3.5 h-3.5" />
                    {status.label}
                  </div>
                </div>
                
                <div className="text-xs text-zinc-400 space-y-1">
                  <p>طريقة الدفع: {payment.payment_method === 'wallet' ? 'محفظة إلكترونية' : payment.payment_method === 'bank' ? 'حساب بنكي' : 'باي بال'}</p>
                  {payment.reference_number && <p dir="ltr">رقم العملية: {payment.reference_number}</p>}
                  <p>تاريخ: {new Date(payment.created_at).toLocaleDateString('ar-YE')}</p>
                </div>

                {payment.status === 'REJECTED' && payment.admin_notes && (
                  <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    <strong>سبب الرفض:</strong> {payment.admin_notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
