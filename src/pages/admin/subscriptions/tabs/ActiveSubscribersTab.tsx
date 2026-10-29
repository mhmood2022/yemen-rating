import React, { useEffect, useState } from 'react';
import { Users, Calendar } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { VerifiedBadge } from '../../../../components/common/VerifiedBadge';

interface Subscriber {
  id: string;
  user_name: string;
  username: string;
  avatar_url: string | null;
  plan_name: string;
  plan_badge: string;
  start_date: string;
  end_date: string;
}

export const ActiveSubscribersTab: React.FC = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      console.log('🚀 Starting to fetch active subscribers...');

      try {
        // 1. جلب الاشتراكات النشطة
        const { data: activeSubs, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('status', 'ACTIVE');

        if (error) {
          console.error('❌ Error fetching subscriptions:', error);
          throw error;
        }

        console.log('✅ Active subscriptions from DB:', activeSubs);

        if (!activeSubs || activeSubs.length === 0) {
          console.log('⚠️ No active subscriptions found.');
          setSubs([]);
          setLoading(false);
          return;
        }

        // 2. جلب البروفايلات والباقات يدوياً (بدون Join)
        const userIds = [...new Set(activeSubs.map(s => s.user_id))];
        const planIds = [...new Set(activeSubs.map(s => s.plan_id))];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', userIds);
        
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('id, name, badge_type')
          .in('id', planIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        const planMap = new Map((plans || []).map(p => [p.id, p]));

        // 3. دمج البيانات
        const formatted = activeSubs.map(s => {
          const prof = profileMap.get(s.user_id);
          const plan = planMap.get(s.plan_id);
          return {
            id: s.id,
            user_name: prof?.full_name || 'مستخدم',
            username: prof?.username || 'user',
            avatar_url: prof?.avatar_url || null,
            plan_name: plan?.name || 'باقة',
            plan_badge: plan?.badge_type || 'none',
            start_date: s.start_date,
            end_date: s.end_date,
          };
        });

        console.log('🎉 Final formatted subscribers:', formatted);
        setSubs(formatted);

      } catch (err) {
        console.error('❌ Error in fetchSubs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, []);

  if (loading) return <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#FFC500]" /> المشتركون الحاليون ({subs.length})
      </h2>

      {subs.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 bg-black border border-[#2A2B30] rounded-xl">
          لا يوجد مشتركون نشطون حالياً
        </div>
      ) : (
        <div className="space-y-2">
          {subs.map(sub => (
            <div key={sub.id} className="p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black border border-[#2A2B30]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFC500]/20 flex items-center justify-center font-bold text-[#FFC500] overflow-hidden">
                  {sub.avatar_url ? (
                    <img src={sub.avatar_url} alt={sub.user_name} className="w-full h-full object-cover" />
                  ) : (
                    sub.user_name[0]
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{sub.user_name}</span>
                    <VerifiedBadge type={sub.plan_badge as any} size={16} />
                  </div>
                  <span className="text-xs text-zinc-500">@{sub.username}</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs">
                <div>
                  <span className="text-zinc-500">الباقة: </span>
                  <span className="text-[#FFC500] font-bold">{sub.plan_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-400">
                    ينتهي: {sub.end_date ? new Date(sub.end_date).toLocaleDateString('ar-YE') : 'غير محدد'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
