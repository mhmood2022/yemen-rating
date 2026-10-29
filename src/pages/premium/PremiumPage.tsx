import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Crown, Zap, Star } from 'lucide-react';
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

export const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      if (!error && data) {
        // تحويل المزايا من JSONB إلى مصفوفة
        const formattedPlans = data.map(p => {
          let parsedFeatures = [];
          try {
            if (Array.isArray(p.features)) {
              parsedFeatures = p.features;
            } else if (typeof p.features === 'string') {
              parsedFeatures = JSON.parse(p.features);
            }
          } catch (e) {
            console.error('Error parsing features:', e);
            parsedFeatures = [];
          }
          return { ...p, features: parsedFeatures };
        });
        console.log('🎫 Plans loaded:', formattedPlans);
        setPlans(formattedPlans);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#FFC500] text-lg font-bold">جاري تحميل الباقات...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-[#2F3336] px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#181818] rounded-full transition">
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg">توثيق الحساب</h1>
      </div>

      {/* Hero Section */}
      <div className="text-center py-10 px-4">
        <div className="w-16 h-16 rounded-full bg-[#FFC500]/10 border border-[#FFC500]/30 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-[#FFC500]" />
        </div>
        <h1 className="text-3xl font-black mb-2">ارتقِ بحسابك</h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          احصل على شارة التوثيق، وزد مصداقية حسابك على منصة يمن ريتنج.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="px-4 pb-20 space-y-4 max-w-lg mx-auto">
        {plans.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            لا توجد باقات متاحة حالياً.
          </div>
        ) : (
          plans.map(plan => (
            <div 
              key={plan.id} 
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: '#000000', border: '1px solid #2A2B30' }}
            >
              {/* شارة الباقة */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                  {plan.badge_type && <VerifiedBadge type={plan.badge_type as any} size={18} />}
                </div>
                <div className="text-left" dir="ltr">
                  <span className="text-2xl font-black text-[#FFC500]">{plan.price}</span>
                  <span className="text-xs text-zinc-400 ml-1">{plan.currency}</span>
                </div>
              </div>

              <p className="text-sm text-zinc-400 mb-4">{plan.description}</p>

              {/* المزايا */}
              {plan.features.length > 0 && (
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* المدة */}
              <div className="flex items-center gap-1 text-xs text-zinc-500 mb-4">
                <Zap className="w-3.5 h-3.5" />
                <span>صالح لمدة {plan.duration_days} يوم</span>
              </div>

              {/* زر الاشتراك */}
              <button 
                onClick={() => navigate(`/premium/checkout/${plan.id}`)}
                className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:opacity-80"
                style={{ background: '#FFC500', color: '#000' }}
              >
                <Star className="w-4 h-4" />
                اشترك الآن
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
