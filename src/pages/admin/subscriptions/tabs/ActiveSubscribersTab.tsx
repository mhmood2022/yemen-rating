import React, { useEffect, useState } from 'react';
import { Users, Calendar, Gift, CreditCard, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
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
  source: string;
  amount_paid: number;
  notes: string | null;
  status: string;
}

export const ActiveSubscribersTab: React.FC = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'expired'>('active');

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      try {
        const { data: activeSubs, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!activeSubs || activeSubs.length === 0) {
          setSubs([]);
          setLoading(false);
          return;
        }

        const userIds = [...new Set(activeSubs.map(s => s.user_id))];
        const planIds = [...new Set(activeSubs.map(s => s.plan_id))];

        const { data: profiles } = await supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', userIds);
        const { data: plans } = await supabase.from('subscription_plans').select('id, name, badge_type').in('id', planIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        const planMap = new Map((plans || []).map(p => [p.id, p]));

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
            source: s.source || 'payment',
            amount_paid: s.amount_paid || 0,
            notes: s.notes || null,
            status: s.status,
          };
        });

        setSubs(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, []);

  // فلترة حسب الحالة
  const filteredSubs = subs.filter(s => {
    if (filter === 'active') return s.status === 'ACTIVE';
    if (filter === 'expired') return s.status === 'EXPIRED';
    return true;
  });

  // حساب الوقت المتبقي
  const getRemainingTime = (endDate: string) => {
    if (!endDate) return 'غير محدد';
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'منتهي';
    if (diffDays === 0) return 'ينتهي اليوم';
    if (diffDays < 30) return `متبقي ${diffDays} يوم`;
    if (diffDays < 365) return `متبقي ${Math.floor(diffDays / 30)} شهر`;
    return `متبقي ${Math.floor(diffDays / 365)} سنة`;
  };

  return (
    <div className="space-y-4">
      {/* الترويسة والفلاتر */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-[#FFC500]" /> إدارة المشتركين ({filteredSubs.length})
        </h2>
        
        <div className="flex bg-[#111] rounded-lg p-1">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${filter === 'active' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'}`}
          >
            نشط
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${filter === 'expired' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'}`}
          >
            منتهي
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>
      ) : filteredSubs.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 bg-black border border-[#2A2B30] rounded-xl">
          لا يوجد مشتركون {filter === 'active' ? 'نشطون' : 'منتهون'} حالياً
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSubs.map(sub => {
            const isActive = sub.status === 'ACTIVE';
            return (
              <div key={sub.id} className="p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black border border-[#2A2B30]">
                {/* معلومات المستخدم */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFC500]/20 flex items-center justify-center font-bold text-[#FFC500] overflow-hidden">
                    {sub.avatar_url ? <img src={sub.avatar_url} alt="" className="w-full h-full object-cover" /> : sub.user_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{sub.user_name}</span>
                      <VerifiedBadge type={sub.plan_badge as any} size={16} />
                    </div>
                    <span className="text-xs text-zinc-500">@{sub.username}</span>
                  </div>
                </div>
                
                {/* تفاصيل الاشتراك */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {/* المصدر */}
                  <div className="flex items-center gap-1">
                    {sub.source === 'admin_grant' ? (
                      <><Gift className="w-3.5 h-3.5 text-[#FFC500]" /> <span className="text-[#FFC500]">منحة إدارية</span></>
                    ) : (
                      <><CreditCard className="w-3.5 h-3.5 text-green-400" /> <span className="text-green-400">مدفوع ({sub.amount_paid} YER)</span></>
                    )}
                  </div>

                  {/* الباقة */}
                  <div>
                    <span className="text-zinc-500">الباقة: </span>
                    <span className="text-[#FFC500] font-bold">{sub.plan_name}</span>
                  </div>

                  {/* الوقت المتبقي */}
                  <div className="flex items-center gap-1">
                    <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-[#22C55E]' : 'text-red-400'}`} />
                    <span className={isActive ? 'text-[#22C55E]' : 'text-red-400'}>
                      {getRemainingTime(sub.end_date)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
