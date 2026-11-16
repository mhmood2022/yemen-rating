import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell, LogOut, Settings, TrendingUp, Eye, PhoneCall,
  MessageSquare, Crown, Star, X, MessageCircle, User,
  Building2, Clock, CheckCircle2, Check, CreditCard,
  BarChart3, Briefcase, Megaphone, ShieldCheck, Menu,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UnifiedFacilityEditor } from '../../components/business/UnifiedFacilityEditor';
import { OwnerSidebar } from './OwnerSidebar';

interface Review {
  id: string;
  user_name?: string;
  user_avatar?: string;
  stars: number;
  comment?: string;
  created_at: string;
  owner_reply?: string;
  owner_reply_at?: string;
}

interface StatsData {
  views: number;
  unique_views: number;
  phone_clicks: number;
  whatsapp_clicks: number;
  website_clicks: number;
  total_reviews: number;
  new_reviews: number;
  unanswered_reviews: number;
  answered_reviews: number;
  avg_rating: number;
  rating_distribution: Record<string, number>;
  views_trend: { date: string; count: number }[];
}

export const OwnerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [businessData, setBusinessData] = useState<any>({
    id: null, name: '', logo_url: '', cover_url: '', slug: '',
    views_count: 0, call_clicks: 0, whatsapp_clicks: 0,
    rating: 0, review_count: 0, is_verified: false, badge_type: 'blue',
  });
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  // جلب بيانات المنشأة
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');
        
        let query = supabase.from('businesses').select('*');
        if (targetId) query = query.eq('id', targetId);
        else query = query.eq('owner_id', session.user.id);
        
        const { data: biz } = await query.maybeSingle();
        
        if (biz) {
          setBusinessData(biz);
          const { data: revs } = await supabase
            .from('reviews')
            .select('*')
            .eq('entity_id', biz.id)
            .order('created_at', { ascending: false });
          setReviewsList(revs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // جلب الإحصائيات
  const fetchStats = async (period: number) => {
    if (!businessData.id) return;
    setLoadingStats(true);
    try {
      const { data, error } = await supabase.rpc('get_owner_stats', {
        p_business_id: businessData.id,
        p_days: period,
      });
      if (!error && data) setStatsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (businessData.id) fetchStats(statsPeriod);
  }, [businessData.id, statsPeriod]);

  const handleOwnerReply = async (reviewId: string) => {
    const text = replyInput[reviewId]?.trim();
    if (!text) return;
    setSubmittingReply(reviewId);
    try {
      const { error } = await supabase.from('reviews').update({
        owner_reply: text,
        owner_reply_at: new Date().toISOString(),
      }).eq('id', reviewId);
      if (!error) {
        setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, owner_reply: text, owner_reply_at: new Date().toISOString() } : r));
        setReplyInput(prev => ({ ...prev, [reviewId]: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(null);
    }
  };

  // رسم بياني احترافي (Line Chart)
  const LineChart = ({ data }: { data: { date: string; count: number }[] }) => {
    if (!data || data.length === 0) return <div className="text-center text-zinc-600 py-10 text-xs">لا توجد بيانات</div>;
    
    const max = Math.max(...data.map(d => d.count), 1);
    const width = 300;
    const height = 100;
    const step = width / Math.max(data.length - 1, 1);
    
    const points = data.map((d, i) => ({
      x: i * step,
      y: height - (d.count / max) * 80 - 10,
      ...d,
    }));
    
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFC500" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFC500" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGrad)" />
        <path d={pathD} fill="none" stroke="#FFC500" strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#FFC500" />
            <title>{p.date}: {p.count}</title>
          </g>
        ))}
      </svg>
    );
  };

  // رسم دائري احترافي (Donut Chart)
  const DonutChart = ({ distribution, total }: { distribution: Record<string, number>; total: number }) => {
    const colors = ['#FFC500', '#F59E0B', '#8B5CF6', '#3B82F6', '#EF4444'];
    let cumulative = 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    
    return (
      <div className="flex items-center justify-center gap-6">
        <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
          {[5, 4, 3, 2, 1].map((star, idx) => {
            const count = distribution?.[String(star)] || 0;
            const pct = total > 0 ? count / total : 0;
            const dash = pct * circumference;
            const offset = -cumulative * circumference;
            cumulative += pct;
            return (
              <circle
                key={star}
                cx="50" cy="50" r={radius}
                fill="none"
                stroke={colors[idx]}
                strokeWidth="10"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={offset}
              />
            );
          })}
          <circle cx="50" cy="50" r="30" fill="#000" />
        </svg>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ background: colors[idx] }} />
              <span className="text-zinc-400">{star} نجوم</span>
              <span className="text-white font-bold">{distribution?.[String(star)] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex" dir="rtl">
      <OwnerSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        businessName={businessData.name}
        businessLogo={businessData.logo_url}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-24">
        {/* الهيدر العلوي للجوال */}
        <div className="md:hidden sticky top-0 z-30 bg-black/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-bold truncate">{businessData.name || 'لوحة المالك'}</h1>
          <div className="w-9" />
        </div>

        <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-4">
          {/* تبويب الصفحة العامة (home) */}
          {activeTab === 'home' && (
            <div className="w-full h-[calc(100vh-130px)] bg-black rounded-xl overflow-hidden border border-zinc-800">
              <iframe
                src={`/bank.html?slug=${encodeURIComponent(businessData.slug || '')}`}
                className="w-full h-full border-0"
                title="الصفحة العامة"
              />
            </div>
          )}

          {/* تبويب التعديل (editor) */}
          {activeTab === 'editor' && (
            <div className="bg-[#0e1320] rounded-2xl border border-zinc-800 p-4">
              <UnifiedFacilityEditor businessId={businessData.id} hideAdminOnlyFields={true} />
            </div>
          )}

          {/* تبويب الإحصائيات (stats) */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black">الإحصائيات والتحليلات</h2>
              
              {/* محدد الفترة */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { label: 'اليوم', days: 1 },
                  { label: '7 أيام', days: 7 },
                  { label: '30 يوم', days: 30 },
                  { label: '3 أشهر', days: 90 },
                  { label: '12 شهر', days: 365 },
                ].map(p => (
                  <button
                    key={p.days}
                    onClick={() => setStatsPeriod(p.days)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${statsPeriod === p.days ? 'bg-[#FFC500] text-black' : 'bg-zinc-900 text-zinc-400'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {loadingStats ? (
                <div className="text-center text-zinc-500 py-8">جاري التحميل...</div>
              ) : statsData && (
                <>
                  {/* بطاقات العدادات */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <StatCard label="الزيارات" value={statsData.views} color="text-white" />
                    <StatCard label="زوار مميزون" value={statsData.unique_views} color="text-white" />
                    <StatCard label="نقرات الهاتف" value={statsData.phone_clicks} color="text-emerald-400" />
                    <StatCard label="نقرات الواتساب" value={statsData.whatsapp_clicks} color="text-emerald-400" />
                    <StatCard label="فتح الموقع" value={statsData.website_clicks} color="text-sky-400" />
                    <StatCard label="إجمالي التقييمات" value={statsData.total_reviews} color="text-[#FFC500]" />
                    <StatCard label="تقييمات جديدة" value={statsData.new_reviews} color="text-[#FFC500]" />
                    <StatCard label="بدون رد" value={statsData.unanswered_reviews} color="text-orange-400" />
                    <StatCard label="تم الرد" value={statsData.answered_reviews} color="text-emerald-400" />
                  </div>

                  {/* الرسوم البيانية */}
                  <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4">
                    <h3 className="text-sm font-bold mb-3">تطور الزيارات</h3>
                    <LineChart data={statsData.views_trend || []} />
                  </div>

                  <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4">
                    <h3 className="text-sm font-bold mb-3">توزيع التقييمات</h3>
                    <DonutChart distribution={statsData.rating_distribution || {}} total={statsData.total_reviews} />
                  </div>

                  {/* قسم التقييمات */}
                  <div className="space-y-3">
                    <h3 className="text-base font-black">تقييمات العملاء ({reviewsList.length})</h3>
                    {reviewsList.map(rev => (
                      <div key={rev.id} className="p-4 border-b border-zinc-800">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          {rev.user_avatar ? (
                            <img src={rev.user_avatar} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm">
                              {(rev.user_name || 'م').charAt(0)}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm">{rev.user_name || 'مستخدم'}</span>
                              <span className="text-xs text-zinc-500">@{((rev.user_name || 'user').replace(/\s+/g, '')).toLowerCase()}</span>
                              <span className="text-xs text-zinc-500">· {new Date(rev.created_at).toLocaleDateString('ar-YE')}</span>
                            </div>
                            
                            {/* Stars */}
                            <div className="flex items-center gap-0.5 mt-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={12} className={s <= rev.stars ? 'fill-[#FFC500] text-[#FFC500]' : 'text-zinc-700'} />
                              ))}
                              <span className="text-xs text-zinc-500 mr-1">{rev.stars}.0</span>
                            </div>
                            
                            {/* Comment */}
                            <p className="text-sm text-zinc-200 mt-2 leading-relaxed">{rev.comment || 'بدون تعليق'}</p>
                            
                            {/* Owner Reply */}
                            {rev.owner_reply && (
                              <div className="mt-2 pr-3 border-r-2 border-[#FFC500]/50">
                                <div className="flex items-center gap-1 text-xs text-[#FFC500] font-bold">
                                  <Building2 size={10} />
                                  رد المنشأة
                                  <span className="text-zinc-500 font-normal">· {rev.owner_reply_at ? new Date(rev.owner_reply_at).toLocaleDateString('ar-YE') : ''}</span>
                                </div>
                                <p className="text-sm text-zinc-300 mt-1">{rev.owner_reply}</p>
                              </div>
                            )}
                            
                            {/* Reply Input */}
                            {!rev.owner_reply && (
                              <div className="mt-2 flex gap-2">
                                <textarea
                                  value={replyInput[rev.id] || ''}
                                  onChange={e => setReplyInput(p => ({ ...p, [rev.id]: e.target.value }))}
                                  placeholder="اكتب ردك..."
                                  rows={1}
                                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FFC500] resize-none"
                                />
                                <button
                                  onClick={() => handleOwnerReply(rev.id)}
                                  disabled={!replyInput[rev.id]?.trim() || submittingReply !== null}
                                  className="px-4 py-2 rounded-xl bg-[#FFC500] text-black font-bold text-xs disabled:opacity-40"
                                >
                                  {submittingReply === rev.id ? '...' : 'رد'}
                                </button>
                              </div>
                            )}
                            
                            {!rev.owner_reply && (
                              <div className="flex items-center gap-1 text-[10px] text-orange-400 mt-1">
                                <Clock size={10} /> بانتظار الرد
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// بطاقة إحصائية
const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3">
    <p className="text-[10px] text-zinc-500">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value || 0}</p>
  </div>
);
