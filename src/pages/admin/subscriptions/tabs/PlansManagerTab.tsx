import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { VerifiedBadge } from '../../../../components/common/VerifiedBadge';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  badge_type: string;
  is_active: boolean;
}

export const PlansManagerTab: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
    if (data) {
      setPlans(data.map(p => ({
        ...p,
        features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || [])
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('subscription_plans').update({ is_active: !current }).eq('id', id);
    fetchPlans();
  };

  if (loading) return <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-[#FFC500]" /> إدارة الباقات
      </h2>

      {plans.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">لا توجد باقات مضافة</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="p-4 rounded-xl border border-[#2A2B30] bg-black">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  <VerifiedBadge type={plan.badge_type as any} size={16} />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${plan.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {plan.is_active ? 'نشطة' : 'موقوفة'}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-3">{plan.description}</p>
              <div className="flex justify-between items-center border-t border-[#2A2B30] pt-3">
                <span className="font-black text-[#FFC500]">{plan.price} {plan.currency}</span>
                <button onClick={() => toggleActive(plan.id, plan.is_active)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${plan.is_active ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                  {plan.is_active ? 'إيقاف' : 'تفعيل'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
