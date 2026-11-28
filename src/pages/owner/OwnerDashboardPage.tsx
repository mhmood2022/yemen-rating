import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RatingStars } from '../../components/common/RatingStars';
import { SupportModal } from '../../components/support/SupportModal';
import { ReportPage } from '../../components/community/ReportPage';
import { AdSubscriptionWizardModal } from '../../components/ads/AdSubscriptionWizardModal';
import {
  adSubscriptionsService,
  AdProductType,
  AdSubscriptionOrder,
} from '../../services/adSubscriptionsService';
import {
  ArrowRight,
  Bell,
  Building2,
  Smartphone,
  Image as ImageIcon,
  Sparkles,
  Clock,
  CreditCard,
  Crown,
  Edit3,
  ExternalLink,
  Eye,
  Flag,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Star,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [businessData, setBusinessData] = useState<any>({
    id: null,
    name: '',
    logo_url: '',
    cover_url: '',
    slug: '',
    views_count: 0,
    call_clicks: 0,
    whatsapp_clicks: 0,
    rating: 0,
    review_count: 0,
    is_verified: false,
    badge_type: 'blue',
  });
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  // الدعم والبلاغات
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ name: string; context: string } | null>(null);

  // نافذة الاشتراك الإعلاني الموحدة وطلبات المعلن
  const [isAdWizardOpen, setIsAdWizardOpen] = useState(false);
  const [adWizardType, setAdWizardType] = useState<AdProductType | null>(null);
  const [myAdOrders, setMyAdOrders] = useState<AdSubscriptionOrder[]>([]);
  const [extraCounts, setExtraCounts] = useState({ support: 0, reports: 0, badgeVerified: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email ||
              'مالك منشأة',
          });
        }

        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id');
        const tabParam = urlParams.get('tab');
        if (tabParam && ['overview', 'stats', 'reviews', 'ads'].includes(tabParam)) {
          setActiveTab(tabParam);
        }

        if (!session?.user && !targetId) return;

        let query = supabase.from('businesses').select('*');
        if (targetId) query = query.eq('id', targetId);
        else if (session?.user) query = query.eq('owner_id', session.user.id);

        const { data: biz } = await query.maybeSingle();

        if (biz) {
          setBusinessData(biz);
          const { data: revs } = await supabase
            .from('reviews')
            .select('*')
            .eq('entity_id', biz.id)
            .order('created_at', { ascending: false });
          setReviewsList(revs || []);
          if (session?.user?.id) {
            adSubscriptionsService.getMyOrders(session.user.id).then((orders) => setMyAdOrders((orders || []).filter((o) => o.business_id === biz.id))).catch(() => {});
            (async () => {
              try {
                const { data: msgs } = await supabase.from('user_support_messages').select('id, message').eq('user_id', session.user.id);
                const rows = (msgs || []).filter((m: any) => m?.metadata?.business_id === biz.id || String(m?.message || '').includes(`(${biz.id})`));
                const repCnt = rows.filter((m: any) => m?.metadata?.kind === 'report' || String(m.message || '').includes('[بلاغ')).length;
                setExtraCounts({ support: Math.max(0, rows.length - repCnt), reports: repCnt, badgeVerified: biz?.is_verified ? 1 : 0 });
              } catch {}
            })();
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      const { error } = await supabase
        .from('reviews')
        .update({
          owner_reply: text,
          owner_reply_at: new Date().toISOString(),
        })
        .eq('id', reviewId);
      if (!error) {
        setReviewsList((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, owner_reply: text, owner_reply_at: new Date().toISOString() }
              : r
          )
        );
        setReplyInput((prev) => ({ ...prev, [reviewId]: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(null);
    }
  };

  const handleSubmitReport = async (reason: string) => {
    try {
      const msg = `[بلاغ من لوحة المالك]\nالمنشأة: ${businessData.name} (${businessData.id})\nالمُبلّغ عنه: ${reportTarget?.context || ''}\nالسبب: ${reason}`;
      await supabase.from('user_support_messages').insert({
        user_id: currentUser?.id || null,
        user_name: currentUser?.name || businessData.name || 'مالك منشأة',
        message: msg,
        status: 'PENDING',
        metadata: { scope: 'business', kind: 'report', business_id: businessData.id, business_name: businessData.name },
      });
      setExtraCounts((p) => ({ ...p, reports: p.reports + 1 }));
    } catch (err) {
      console.error(err);
    }
  };

  const publicBusinessPath = `/business-page/${businessData.id || businessData.slug || ''}`;
  const editBusinessPath = `/business-page/${businessData.id || businessData.slug || ''}?edit=1`;

  const unansweredCount = reviewsList.filter((r) => !r.owner_reply).length;
  const answeredCount = reviewsList.filter((r) => Boolean(r.owner_reply)).length;
  const filteredReviews = reviewsList.filter((r) => {
    if (reviewFilter === 'unanswered') return !r.owner_reply;
    if (reviewFilter === 'answered') return Boolean(r.owner_reply);
    return true;
  });

  const LineChart = ({ data }: { data: { date: string; count: number }[] }) => {
    if (!data || data.length === 0) {
      return <div className="text-center text-[#71767B] py-10 text-xs">لا توجد بيانات زيارات لهذه الفترة</div>;
    }

    const max = Math.max(...data.map((d) => d.count), 1);
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
            <stop offset="0%" stopColor="#FFC500" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFC500" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGrad)" />
        <path d={pathD} fill="none" stroke="#FFC500" strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#FFC500" />
            <title>
              {p.date}: {p.count}
            </title>
          </g>
        ))}
      </svg>
    );
  };

  const DonutChart = ({
    distribution,
    total,
  }: {
    distribution: Record<string, number>;
    total: number;
  }) => {
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
                cx="50"
                cy="50"
                r={radius}
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
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[idx] }} />
              <span className="text-zinc-400">{star} نجوم</span>
              <span className="text-white font-bold">{distribution?.[String(star)] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-sm font-bold">
        جاري تحميل لوحة المالك...
      </div>
    );
  }

  if (!businessData.id) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-4" dir="rtl">
        <Building2 size={36} className="text-[#FFC500]" />
        <p className="text-base font-black">لم يتم العثور على المنشأة المطلوبة</p>
        <p className="text-xs text-[#71767B]">تأكد من تسجيل الدخول بحساب المالك أو صحة رابط المنشأة</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-full bg-[#FFC500] text-black text-xs font-black"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const tabsNav = [
    { id: 'overview', label: 'الملخص' },
    { id: 'stats', label: 'الإحصائيات' },
    { id: 'reviews', label: `التقييمات (${reviewsList.length})` },
    { id: 'ads', label: 'الإعلانات' },
  ];

  const renderReviewsList = (items: Review[]) => (
    <div className="divide-y divide-[#2F3336] border border-[#2F3336] rounded-2xl bg-black overflow-hidden">
      {items.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#71767B]">لا توجد تقييمات في هذا التصنيف حالياً</div>
      ) : (
        items.map((rev) => (
          <div key={rev.id} className="p-4 hover:bg-[#080808] transition">
            <div className="flex items-start gap-3">
              {rev.user_avatar ? (
                <img src={rev.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#2F3336]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#16181C] border border-[#2F3336] flex items-center justify-center font-bold text-sm text-[#FFC500] shrink-0">
                  {(rev.user_name || 'م').charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="font-bold text-sm text-white">{rev.user_name || 'مستخدم'}</span>
                    <span className="text-xs text-[#71767B]" dir="ltr">
                      @{((rev.user_name || 'user').replace(/\s+/g, '')).toLowerCase()}
                    </span>
                    <span className="text-xs text-[#71767B]">
                      · {new Date(rev.created_at).toLocaleDateString('ar-YE')}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setReportTarget({
                        name: rev.user_name || 'مستخدم',
                        context: `تقييم (${rev.id}): ${rev.comment || ''}`,
                      })
                    }
                    className="text-[#71767B] hover:text-rose-400 p-1 rounded-full transition shrink-0"
                    title="إبلاغ عن التقييم"
                  >
                    <Flag size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                  <RatingStars rating={Number(rev.stars) || 0} size={12} emptyColorClass="text-zinc-700" />
                  <span className="text-xs text-[#71767B]">{Number(rev.stars || 0).toFixed(1)}</span>
                </div>

                <p className="text-sm text-zinc-200 mt-2 leading-relaxed">{rev.comment || 'بدون تعليق'}</p>

                {rev.owner_reply ? (
                  <div className="mt-3 pr-3 border-r-2 border-[#FFC500]">
                    <div className="flex items-center gap-1.5 text-xs text-[#FFC500] font-bold">
                      <Building2 size={11} />
                      <span>رد المنشأة</span>
                      <span className="text-[#71767B] font-normal">
                        · {rev.owner_reply_at ? new Date(rev.owner_reply_at).toLocaleDateString('ar-YE') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{rev.owner_reply}</p>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex gap-2">
                      <textarea
                        value={replyInput[rev.id] || ''}
                        onChange={(e) => setReplyInput((p) => ({ ...p, [rev.id]: e.target.value }))}
                        placeholder="اكتب رد المنشأة هنا..."
                        rows={1}
                        className="flex-1 bg-[#16181C] border border-[#2F3336] rounded-full px-4 py-2 text-xs text-white placeholder-[#71767B] focus:outline-none focus:border-[#FFC500] resize-none"
                      />
                      <button
                        onClick={() => handleOwnerReply(rev.id)}
                        disabled={!replyInput[rev.id]?.trim() || submittingReply !== null}
                        className="px-4 py-2 rounded-full bg-[#FFC500] text-black font-black text-xs disabled:opacity-40 transition"
                      >
                        {submittingReply === rev.id ? '...' : 'رد'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-1.5">
                      <Clock size={11} />
                      <span>بانتظار الرد</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const bannerAdsCount = myAdOrders.filter((o) => o.ad_type === 'banner').length;
  const sponsorAdsCount = myAdOrders.filter((o) => o.ad_type === 'sponsor').length;
  const featuredAdsCount = myAdOrders.filter((o) => o.ad_type === 'phone_feed' || (o.ad_type as any) === 'featured' || (o.ad_type as any) === 'promoted').length;
  const activeSubsCount = myAdOrders.filter((o) => o.status === 'active').length || myAdOrders.length;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20" dir="rtl">
      <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-[#2F3336]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button onClick={() => navigate(publicBusinessPath)} className="w-9 h-9 rounded-full hover:bg-[#16181C] border border-[#2F3336] flex items-center justify-center shrink-0 transition cursor-pointer" title="العودة لصفحة المنشأة"><ArrowRight size={17} /></button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black truncate">{businessData.name || 'لوحة المالك'}</h1>
              <p className="text-[11px] text-[#71767B] truncate">إدارة المنشأة والإحصائيات</p>
            </div>
          </div>
          <button onClick={() => navigate(publicBusinessPath)} className="px-3.5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black flex items-center gap-1.5 shrink-0 transition cursor-pointer">
            <ExternalLink size={13} /><span>صفحة المنشأة</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 space-y-5">
        {activeTab !== 'overview' && (
          <div className="flex items-center justify-between border-b border-[#2F3336] pb-2.5">
            <button type="button" onClick={() => setActiveTab('overview')} className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#FFC500] transition cursor-pointer"><ArrowRight size={15} /><span>العودة إلى الرئيسية</span></button>
            <span className="text-xs font-black text-[#71767B]">{activeTab === 'ads' ? 'إدارة الإعلانات' : activeTab === 'reviews' ? 'إدارة التقييمات' : 'الإحصائيات'}</span>
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            <div className="rounded-2xl border border-[#2F3336] bg-[#080808] p-4 space-y-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {businessData.logo_url ? (
                  <img src={businessData.logo_url} alt={businessData.name} className="w-14 h-14 rounded-full object-cover border border-[#2F3336] shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#16181C] border border-[#2F3336] flex items-center justify-center text-white font-black text-lg shrink-0">{(businessData.name || 'م').charAt(0)}</div>
                )}
                <div className="min-w-0 space-y-1">
                  <h2 className="text-base font-black text-white truncate">{businessData.name}</h2>
                  {businessData.slug && <p className="text-xs text-[#71767B] truncate" dir="ltr" style={{ textAlign: 'right' }}>@{businessData.slug}</p>}
                  <div className="flex items-center gap-1.5 text-xs flex-wrap pt-0.5">
                    <span className="text-zinc-300 font-bold">التقييمات</span>
                    <RatingStars rating={Number(statsData?.avg_rating ?? businessData.rating ?? 0)} size={12} />
                    <span className="font-bold text-white tabular-nums">{Number(statsData?.avg_rating ?? businessData.rating ?? 0).toFixed(1)}</span>
                    <span className="text-[#71767B]">({statsData?.total_reviews ?? reviewsList.length} تقييم)</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => navigate(editBusinessPath)} className="py-2.5 px-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"><Edit3 size={13} /><span>تعديل صفحة المنشأة</span></button>
                <button onClick={() => navigate(publicBusinessPath)} className="py-2.5 px-3 rounded-full bg-black border border-[#2F3336] hover:bg-[#16181C] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"><Eye size={13} /><span>عرض كزائر</span></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => navigate('/notifications')} className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-[#2F3336] bg-[#080808] hover:bg-[#111] text-right transition cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#16181C] border border-[#2F3336] flex items-center justify-center text-[#FFC500] shrink-0"><Bell size={16} /></div>
                <div className="min-w-0"><p className="text-xs font-black text-white">الإشعارات</p><p className="text-[10px] text-[#71767B] truncate">التنبيهات والتفاعلات</p></div>
              </button>
              <button onClick={() => navigate(`/premium?scope=business&businessId=${businessData.id}&businessName=${encodeURIComponent(businessData.name || '')}`)} className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-[#2F3336] bg-[#080808] hover:bg-[#111] text-right transition cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#16181C] border border-[#2F3336] flex items-center justify-center text-[#FFC500] shrink-0"><Crown size={16} /></div>
                <div className="min-w-0"><p className="text-xs font-black text-white">توثيق الشارة</p><p className="text-[10px] text-[#71767B] truncate">باقات التوثيق</p></div>
              </button>
              <button onClick={() => setActiveTab('ads')} className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-[#2F3336] bg-[#080808] hover:bg-[#111] text-right transition cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#16181C] border border-[#2F3336] flex items-center justify-center text-[#FFC500] shrink-0"><Megaphone size={16} /></div>
                <div className="min-w-0"><p className="text-xs font-black text-white">الإعلانات</p><p className="text-[10px] text-[#71767B] truncate">ترويج وظهور مميز</p></div>
              </button>
              <button onClick={() => navigate(`/my-payments?scope=business&businessId=${businessData.id}&businessName=${encodeURIComponent(businessData.name || '')}`)} className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-[#2F3336] bg-[#080808] hover:bg-[#111] text-right transition cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#16181C] border border-[#2F3336] flex items-center justify-center text-[#FFC500] shrink-0"><CreditCard size={16} /></div>
                <div className="min-w-0"><p className="text-xs font-black text-white">المدفوعات</p><p className="text-[10px] text-[#71767B] truncate">الفواتير والعمليات</p></div>
              </button>
              <button onClick={() => setIsSupportOpen(true)} className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-[#2F3336] bg-[#080808] hover:bg-[#111] text-right transition cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#16181C] border border-[#2F3336] flex items-center justify-center text-[#FFC500] shrink-0"><MessageCircle size={16} /></div>
                <div className="min-w-0"><p className="text-xs font-black text-white">الدعم الفني</p><p className="text-[10px] text-[#71767B] truncate">تواصل مع الإدارة</p></div>
              </button>
              <button onClick={() => setReportTarget({ name: businessData.name, context: 'بلاغ عام من لوحة المنشأة' })} className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-[#2F3336] bg-[#080808] hover:bg-[#111] text-right transition cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#16181C] border border-[#2F3336] flex items-center justify-center text-rose-400 shrink-0"><Flag size={16} /></div>
                <div className="min-w-0"><p className="text-xs font-black text-white">البلاغات</p><p className="text-[10px] text-[#71767B] truncate">إبلاغ عن مشكلة</p></div>
              </button>
            </div>
          </>
        )}

        {(activeTab === 'overview' || activeTab === 'stats') && (
          <div className="space-y-4">
            <h2 className="text-base font-black flex items-center gap-2"><TrendingUp size={18} className="text-[#FFC500]" /><span>الإحصائيات والتحليلات</span></h2>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[{ label: 'اليوم', days: 1 }, { label: '7 أيام', days: 7 }, { label: '30 يوم', days: 30 }, { label: '3 أشهر', days: 90 }, { label: '12 شهر', days: 365 }].map((p) => (
                <button key={p.days} onClick={() => setStatsPeriod(p.days)} className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${statsPeriod === p.days ? 'bg-white text-black font-black' : 'bg-[#111111] border border-[#2F3336] text-zinc-400 hover:text-white'}`}>{p.label}</button>
              ))}
            </div>
            {loadingStats ? (
              <div className="text-center text-[#71767B] py-10 text-xs">جاري تحميل الإحصائيات...</div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="المشاهدات" value={statsData?.views ?? businessData.views_count ?? 0} color="text-white" />
                  <StatCard label="توثيق الشارة" value={extraCounts.badgeVerified} color="text-white" />
                  <StatCard label="الاشتراكات" value={activeSubsCount} color="text-white" />
                  <StatCard label="إعلان بانر" value={bannerAdsCount} color="text-emerald-400" />
                  <StatCard label="إعلان راعي" value={sponsorAdsCount} color="text-emerald-400" />
                  <StatCard label="إعلان مميز / ممول" value={featuredAdsCount} color="text-emerald-400" />
                  <StatCard label="نقر الواتساب" value={statsData?.whatsapp_clicks ?? businessData.whatsapp_clicks ?? 0} color="text-[#FFC500]" />
                  <StatCard label="نقر اتصال" value={statsData?.phone_clicks ?? businessData.call_clicks ?? 0} color="text-sky-400" />
                  <StatCard label="زيارات الموقع" value={statsData?.website_clicks ?? businessData.website_clicks ?? 0} color="text-sky-400" />
                  <StatCard label="إجمالي التقييمات" value={statsData?.total_reviews ?? reviewsList.length} color="text-[#FFC500]" />
                  <StatCard label="الدعم" value={extraCounts.support} color="text-[#FFC500]" />
                  <StatCard label="البلاغات" value={extraCounts.reports} color="text-[#FFC500]" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <MiniStat label="زوار مميزون" value={statsData?.unique_views ?? 0} color="text-white" />
                  <MiniStat label="تقييمات جديدة" value={statsData?.new_reviews ?? 0} color="text-[#FFC500]" />
                  <MiniStat label="بدون رد" value={statsData?.unanswered_reviews ?? unansweredCount} color="text-amber-400" />
                  <MiniStat label="تم الرد" value={statsData?.answered_reviews ?? answeredCount} color="text-emerald-400" />
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black flex items-center gap-2"><MessageSquare size={17} className="text-[#FFC500]" /><span>أحدث تقييمات العملاء ({reviewsList.length})</span></h3>
                    {activeTab === 'overview' && reviewsList.length > 3 && <button onClick={() => setActiveTab('reviews')} className="text-xs font-bold text-white hover:underline cursor-pointer">عرض الكل</button>}
                  </div>
                  {renderReviewsList(activeTab === 'overview' ? reviewsList.slice(0, 5) : reviewsList)}
                </div>
                {statsData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-[#080808] rounded-2xl border border-[#2F3336] p-4"><h3 className="text-sm font-bold mb-3">توزيع التقييمات</h3><DonutChart distribution={statsData.rating_distribution || {}} total={statsData.total_reviews || reviewsList.length} /></div>
                    <div className="bg-[#080808] rounded-2xl border border-[#2F3336] p-4"><h3 className="text-sm font-bold mb-3">تطور الزيارات</h3><LineChart data={statsData.views_trend || []} /></div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      {/* تبويب التقييمات والردود */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-black">إدارة التقييمات والردود</h2>
                <div className="flex gap-1.5">
                  {[
                    { id: 'all', label: `الكل (${reviewsList.length})` },
                    { id: 'unanswered', label: `بانتظار الرد (${unansweredCount})` },
                    { id: 'answered', label: `تم الرد (${answeredCount})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setReviewFilter(f.id as any)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                        reviewFilter === f.id
                          ? 'bg-[#FFC500] text-black font-black'
                          : 'bg-[#16181C] border border-[#2F3336] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {renderReviewsList(filteredReviews)}
            </div>
          )}

          {/* تبويب الاشتراك بالإعلانات الموحد (منفصل تماماً عن اشتراكات الشارات) */}
          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#2F3336] bg-[#080808] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Megaphone size={18} className="text-[#FFC500]" />
                    <h2 className="text-base font-black">مركز الاشتراكات الإعلانية</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdWizardType(null);
                      setIsAdWizardOpen(true);
                    }}
                    className="px-4 py-2 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-xs font-black transition"
                  >
                    + اشتراك إعلاني جديد
                  </button>
                </div>
                <p className="text-xs text-[#71767B] leading-relaxed">
                  اختر نوع الإعلان المناسب لنشاطك: تغريدات سوق الهاتف المميزة، رعاية قسم كامل (Sponsor)، أو حجز بانر مصور.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdWizardType('phone_feed');
                      setIsAdWizardOpen(true);
                    }}
                    className="p-4 rounded-2xl border border-[#2F3336] bg-black hover:border-[#FFC500] text-right space-y-1.5 transition"
                  >
                    <Smartphone size={18} className="text-[#FFC500]" />
                    <p className="text-xs font-black text-white">إعلانات سوق الهاتف</p>
                    <p className="text-[11px] text-[#71767B]">منشورات وتغريدات مميزة برصيد باقة</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdWizardType('sponsor');
                      setIsAdWizardOpen(true);
                    }}
                    className="p-4 rounded-2xl border border-[#2F3336] bg-black hover:border-[#FFC500] text-right space-y-1.5 transition"
                  >
                    <Sparkles size={18} className="text-[#FFC500]" />
                    <p className="text-xs font-black text-white">إعلان الراعي (Sponsor)</p>
                    <p className="text-[11px] text-[#71767B]">رعاية قسم كامل بشعارك واسمك</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdWizardType('banner');
                      setIsAdWizardOpen(true);
                    }}
                    className="p-4 rounded-2xl border border-[#2F3336] bg-black hover:border-[#FFC500] text-right space-y-1.5 transition"
                  >
                    <ImageIcon size={18} className="text-[#FFC500]" />
                    <p className="text-xs font-black text-white">إعلانات البانر (Banner)</p>
                    <p className="text-[11px] text-[#71767B]">مساحة مصورة في الوحدة الأولى أو الثانية</p>
                  </button>
                </div>
              </div>

              {/* طلبات واشتراكات الإعلانات الحالية للمعلن */}
              <div className="rounded-2xl border border-[#2F3336] bg-[#080808] p-4 space-y-3">
                <h3 className="text-sm font-black text-white">
                  اشتراكاتك وطلباتك الإعلانية ({myAdOrders.length})
                </h3>
                {myAdOrders.length === 0 ? (
                  <p className="text-xs text-[#71767B] py-4 text-center">
                    لا توجد اشتراكات إعلانية بعد. اختر أحد الأنواع أعلاه للبدء.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myAdOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl border border-[#2F3336] bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white">{ord.package_name_snapshot}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#16181C] text-[#FFC500] text-[10px] font-bold">
                              {ord.ad_type === 'phone_feed'
                                ? 'سوق الهاتف'
                                : ord.ad_type === 'sponsor'
                                  ? 'راعي قسم'
                                  : 'بانر'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 text-[10px]">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#71767B]">
                            القسم: {ord.section_id} · السعر:{' '}
                            {ord.is_free_order ? 'مجاني' : `${ord.final_price.toLocaleString()} ${ord.currency}`}
                            {ord.ad_type === 'phone_feed' && ord.status === 'active'
                              ? ` · الرصيد المتبقي: ${ord.remaining_posts}/${ord.post_quota}`
                              : ''}
                          </p>
                        </div>
                        {ord.ends_at && (
                          <span className="text-[11px] text-zinc-400">
                            ينتهي: {new Date(ord.ends_at).toLocaleDateString('ar-YE')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

      <AdSubscriptionWizardModal
        isOpen={isAdWizardOpen}
        onClose={() => setIsAdWizardOpen(false)}
        initialAdType={adWizardType}
        businessId={businessData.id}
        onOrderSubmitted={(newOrder) => {
          setMyAdOrders((prev) => [newOrder, ...prev]);
        }}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        currentUser={currentUser}
        businessContext={businessData?.id ? { id: businessData.id, name: businessData.name } : null}
      />

      {reportTarget && (
        <ReportPage
          onClose={() => setReportTarget(null)}
          onSubmit={handleSubmitReport}
          authorName={reportTarget.name}
          type="account"
        />
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-[#080808] rounded-2xl border border-[#2F3336] p-3 flex flex-col justify-between min-h-[68px]">
    <p className="text-[10.5px] sm:text-[11px] text-[#71767B] leading-tight truncate">{label}</p>
    <p className={`text-lg sm:text-xl font-black mt-1 tabular-nums ${color}`}>{Number(value || 0).toLocaleString('en-US')}</p>
  </div>
);

const MiniStat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-black rounded-xl border border-[#2F3336]/80 px-2.5 py-2 text-center">
    <p className="text-[10px] text-[#71767B] truncate">{label}</p>
    <p className={`text-sm font-black mt-0.5 tabular-nums ${color}`}>{Number(value || 0).toLocaleString('en-US')}</p>
  </div>
);
