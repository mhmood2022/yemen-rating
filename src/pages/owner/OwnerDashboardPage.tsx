import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  LogOut, 
  Settings, 
  TrendingUp, 
  Eye, 
  PhoneCall, 
  MessageSquare, 
  Crown, 
  Send, 
  Star, 
  Check, 
  X, 
  MessageCircle,
  User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UnifiedFacilityEditor } from '../../components/business/UnifiedFacilityEditor';

export const OwnerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'stats' | 'ads' | 'chat' | 'reviews'>('editor');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Dynamic Owner State from Supabase Auth Session
  const [ownerUser, setOwnerUser] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  const [businessData, setBusinessData] = useState<any>({
    id: null,
    name: 'منشأتي المعتمدة',
    city: 'الجمهورية اليمنية',
    slug: '',
    logo_url: '',
    cover_url: '',
    category: '',
    description: '',
    phone: '',
    whatsapp: '',
    address: '',
    website_url: '',
    views_count: 0,
    call_clicks: 0,
    whatsapp_clicks: 0,
    rating: 0,
    review_count: 0
  });

  const [ownerData, setOwnerData] = useState({
    name: 'مالك المنشأة',
    phone: '',
    email: '',
    avatar: '',
  });

  // Chat State (Clean)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'owner' | 'admin'; text: string; time: string }>>([
    {
      sender: 'admin',
      text: 'مرحباً بك في لوحة تحكم المنشأة 🌹 يسعدنا تواجدك معنا. يمكنك التواصل معنا هنا في أي وقت بخصوص منشأتك أو طلب ترقية إعلاناتك.',
      time: 'الآن'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Fetch Current Logged-in Owner & Claimed Business
  useEffect(() => {
    // إذا كان هناك ?id= في الرابط، اجلب المنشأة مباشرة
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('id');
    if (targetId) {
      fetchBusinessDirectly(targetId);
    }

    const fetchCurrentSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const u = session.user;
          setOwnerUser(u);
          const fullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'مالك المنشأة';
          setOwnerData({
            name: fullName,
            phone: u.user_metadata?.phone || u.phone || '',
            email: u.email || '',
            avatar: u.user_metadata?.avatar_url || '',
          });

          // Fetch business claimed/owned by this user ID
          const { data: biz } = await supabase
            .from('businesses')
            .select('id, name, city, slug, views_count, call_clicks, whatsapp_clicks, rating, review_count, logo_url, category, description, phone, address, website_url').eq('owner_id', u.id)
            .limit(1)
            .maybeSingle();

          if (biz) {
            setBusinessData({
              id: biz.id,
              name: biz.name,
              city: biz.city || 'اليمن',
              slug: biz.slug || '',
              logo_url: biz.logo_url || '',
              cover_url: biz.cover_url || '',
              category: biz.category || '',
              description: biz.description || '',
              phone: biz.phone || '',
              whatsapp: biz.whatsapp || '',
              address: biz.address || '',
              website_url: biz.website_url || '',
              views_count: biz.views_count || 0,
              call_clicks: biz.call_clicks || 0,
              whatsapp_clicks: biz.whatsapp_clicks || 0,
              rating: biz.rating || 5.0,
              review_count: biz.review_count || 0
            });
            loadReviewsForBusiness(biz.id);
          }
        }
      } catch (err) {
        console.error('Session load error:', err);
      }
    };

    fetchCurrentSession();
  }, []);

    const handleOwnerReply = async (reviewId: string) => {
    const text = replyInput[reviewId]?.trim();
    if (!text) return;
    try {
      setSubmittingReply(reviewId);
      const { error } = await supabase.from('reviews').update({
        owner_reply: text,
        owner_reply_at: new Date().toISOString()
      }).eq('id', reviewId);

      if (!error) {
        setReviewsList(prev => prev.map(r => r.id === reviewId ? { ...r, owner_reply: text, owner_reply_at: new Date().toISOString() } : r));
        alert('تم إرسال رد المالك بنجاح!');
      } else {
        alert('تعذر إرسال الرد');
      }
    } catch (_) {
      alert('خطأ في الاتصال');
    } finally {
      setSubmittingReply(null);
    }
  };

  
  
    const fetchBusinessDirectly = async (targetId: string) => {
      try {
        const { data: bData, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', targetId)
          .single();

        if (bData && !error) {
          // جلب التقييمات التابعة للمنشأة
          const { data: rData } = await supabase
            .from('reviews')
            .select('*')
            .eq('entity_id', targetId)
            .order('created_at', { ascending: false });

          const reviews = rData || [];
          setReviewsList(reviews);

          const rCount = reviews.length > 0 ? reviews.length : (bData.review_count || 0);
          const rAvg = reviews.length > 0
            ? (reviews.reduce((s: number, r: any) => s + (Number(r.stars) || 5), 0) / reviews.length).toFixed(1)
            : (bData.rating || 5.0).toString();

          setBusinessData({
            ...bData,
            views_count: bData.views_count ?? 142,
            whatsapp_clicks: bData.whatsapp_clicks ?? 38,
            call_clicks: bData.call_clicks ?? 19,
            rating: parseFloat(rAvg),
            review_count: rCount,
            reviews_count: rCount
          });
        }
      } catch (e) {
        console.error('Error fetching target business:', e);
      }
    };

  const loadReviewsForBusiness = async (bId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('entity_id', bId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReviewsList(data);
        const count = data.length;
        const avg = count > 0 
          ? (data.reduce((sum: number, r: any) => sum + (Number(r.stars) || 5), 0) / count).toFixed(1)
          : '5.0';
        setBusinessData((prev: any) => ({
          ...prev,
          rating: parseFloat(avg),
          review_count: count,
          reviews_count: count
        }));
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: 'owner' as const,
      text: chatInput.trim(),
      time: 'الآن'
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'admin' as const,
          text: 'تم استلام استفسارك، سيقوم فريق الإدارة العامة بالرد عليك والمتابعة في أقرب وقت.',
          time: 'الآن'
        }
      ]);
    }, 1200);
  };

  const handleSignOut = async () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await supabase.auth.signOut();
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col font-sans pb-16" dir="rtl">
      
      {/* 1. COVER + BUSINESS IDENTITY (Reflection of Public Page) */}
      <div className="relative bg-black">
        {/* Cover Image */}
        <div className="relative h-[160px] sm:h-[220px] w-full overflow-hidden bg-black">
          <img 
            src={businessData.cover_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80'} 
            alt={businessData.name} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          
          {/* Top Buttons (Back & Account) */}
          <div className="absolute top-3 left-0 right-0 px-4 flex items-center justify-between z-10">
            <button
              onClick={() => businessData.slug ? window.location.href = `/bank.html?slug=${encodeURIComponent(businessData.slug)}` : window.history.back()}
              className="w-9 h-9 rounded-full bg-black/65 backdrop-blur text-white flex items-center justify-center hover:bg-black transition"
              title="رجوع إلى صفحة المنشأة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-9 h-9 rounded-full bg-black/65 backdrop-blur text-white flex items-center justify-center hover:bg-black transition"
              title="حسابي"
            >
              <User size={18} />
            </button>
          </div>
        </div>

        {/* Logo + Business Info (Centered like public page) */}
        <div className="relative px-4 pb-4 -mt-12 sm:-mt-14 max-w-6xl mx-auto flex flex-col items-center justify-center text-center gap-3">
          
          {/* Logo Frame */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[18px] bg-white shadow-2xl overflow-hidden shrink-0 z-10 border-0 flex items-center justify-center">
            {businessData.logo_url ? (
              <img src={businessData.logo_url} alt={businessData.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-[#FFC500]">{(businessData.name || 'م').charAt(0)}</span>
            )}
          </div>

          {/* Name, Category, Ratings */}
          <div className="space-y-1.5 flex flex-col items-center">
            <h1 className="text-lg sm:text-2xl font-black text-white leading-tight flex items-center justify-center gap-1.5 flex-wrap">
              <span>{businessData.name || 'إدارة المنشأة'}</span>
              {businessData.is_verified && (
                <svg className="w-5 h-5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"/>
                </svg>
              )}
            </h1>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-[6px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                {businessData.category || 'غير مصنف'}
              </span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {businessData.city || 'اليمن'}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 pt-0.5">
              <div className="flex items-center gap-1 font-black text-white bg-zinc-900 px-2 py-1 rounded-[6px] border border-zinc-800">
                <Star size={12} className="text-[#FFC500] fill-[#FFC500]" />
                <span className="text-sm">{businessData.rating || '5.0'}</span>
              </div>
              <span className="text-[11px] text-zinc-500">({businessData.review_count || 0} تقييم)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-2"></div>
{/* 2. HORIZONTAL NAVIGATION TABS */}
      <div className="max-w-6xl mx-auto w-full px-4 mt-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          
          <button
            onClick={() => {
              if (businessData.slug) {
                setIsPreviewOpen(true);
              } else {
                alert('لا يمكن عرض الصفحة لعدم وجود رابط (Slug) للمنشأة.');
              }
            }}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-black text-white border-2 border-[#2F3336] hover:bg-zinc-900 text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-95"
            title="عرض الصفحة كما يراها الزائر"
          >
            <Eye className="w-4 h-4" />
            <span>كيف يرى الآخرون صفحتك</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-95 ${activeTab === 'editor' ? 'bg-[#FFC500] text-black border-2 border-[#FFC500]' : 'bg-black text-white border-2 border-[#2F3336] hover:bg-zinc-900'}`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'editor' ? 'text-black' : 'text-amber-400'}`} />
            <span>تعديل بيانات المنشأة</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-95 ${activeTab === 'stats' ? 'bg-[#FFC500] text-black border-2 border-[#FFC500]' : 'bg-black text-white border-2 border-[#2F3336] hover:bg-zinc-900'}`}
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === 'stats' ? 'text-black' : 'text-emerald-400'}`} />
            <span>الإحصائيات والنقرات</span>
          </button>

          <button 
            onClick={() => setActiveTab('ads')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-95 ${activeTab === 'ads' ? 'bg-[#FFC500] text-black border-2 border-[#FFC500]' : 'bg-black text-white border-2 border-[#2F3336] hover:bg-zinc-900'}`}
          >
            <Crown className={`w-4 h-4 ${activeTab === 'ads' ? 'text-black' : 'text-amber-400'}`} />
            <span>الإعلانات والترقية</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-95 ${activeTab === 'chat' ? 'bg-[#FFC500] text-black border-2 border-[#FFC500]' : 'bg-black text-white border-2 border-[#2F3336] hover:bg-zinc-900'}`}
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === 'chat' ? 'text-black' : 'text-sky-400'}`} />
            <span>دردشة الإدارة العامة</span>
          </button>

          <button 
            onClick={() => setActiveTab('reviews')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-95 ${activeTab === 'reviews' ? 'bg-[#FFC500] text-black border-2 border-[#FFC500]' : 'bg-black text-white border-2 border-[#2F3336] hover:bg-zinc-900'}`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-black' : 'text-amber-400'}`} />
            <span>التقييمات والردود</span>
          </button>

        </div>
      </div>

      {/* 3. MAIN TABS CONTENT */}
      <main className="max-w-6xl mx-auto w-full px-4 mt-5 flex-1">

        {/* TAB 1: FACILITY EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-4">
            <div 
              id="facility-editor-container" 
              className="w-full bg-black rounded-3xl border border-[#222b42] p-4 sm:p-7 shadow-2xl"
            >
              <UnifiedFacilityEditor businessId={businessData.id} />
            </div>
          </div>
        )}

        {/* TAB 2: REAL-TIME STATISTICS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black p-5 rounded-2xl border border-[#222b42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold">مشاهدات الصفحة</span>
                <Eye className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">{businessData.views_count}</div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">إجمالي الزيارات</span>
            </div>

            <div className="bg-black p-5 rounded-2xl border border-[#222b42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold">نقرات الاتصال</span>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">{businessData.call_clicks}</div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">حجوزات واستفسارات</span>
            </div>

            <div className="bg-black p-5 rounded-2xl border border-[#222b42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold">محادثات الواتساب</span>
                <MessageCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">{businessData.whatsapp_clicks}</div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">تواصل مباشر</span>
            </div>

            <div className="bg-black p-5 rounded-2xl border border-[#222b42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold">متوسط التقييم</span>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-amber-400">{businessData.rating} <span className="text-xs text-slate-400">/ 5</span></div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">من أصل {businessData.review_count} تقييم</span>
            </div>
          </div>
        )}

        {/* TAB 3: PROMOTION & PACKAGES */}
        {activeTab === 'ads' && (
          <div className="bg-black rounded-3xl border border-[#222b42] p-6 md:p-8">
            <div className="max-w-2xl mb-6">
              <h2 className="text-lg md:text-xl font-black text-white">ترقية ظهور المنشأة في صدارة محركات البحث</h2>
              <p className="text-xs text-slate-400 mt-1">
                تثبيت المنشأة في المركز الأول أو تفعيل الإعلانات المضمنة يضاعف وصول العملاء الحقيقيين.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#141a2c] p-5 rounded-2xl border border-[#222b42] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">إعلان أسبوعي عادي</h3>
                  <div className="my-3 text-2xl font-black text-white">30$<span className="text-xs text-slate-400"> / أسبوع</span></div>
                  <ul className="text-xs text-slate-300 space-y-2 border-t border-[#222b42] pt-3">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> ظهور في قسم عروض المحافظة</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> زر اتصال وواتساب سريع</li>
                  </ul>
                </div>
                <button onClick={() => alert('تم رفع طلب الترقية')} className="mt-5 w-full py-2.5 rounded-xl border border-[#222b42] hover:border-amber-400 text-slate-200 text-xs font-bold transition">
                  طلب الباقة
                </button>
              </div>

              <div className="bg-[#141a2c] p-5 rounded-2xl border-2 border-amber-500 relative flex flex-col justify-between shadow-xl">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-3 py-0.5 rounded-full uppercase">
                  الأكثر فاعلية (VIP)
                </span>
                <div>
                  <h3 className="font-black text-amber-400 text-base">الباقة الذهبية (VIP)</h3>
                  <div className="my-3 text-2xl font-black text-white">120$<span className="text-xs text-slate-400"> / شهرياً</span></div>
                  <ul className="text-xs text-slate-200 space-y-2 border-t border-[#222b42] pt-3">
                    <li className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400" /> تثبيت في المركز #1 في محافظتك</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> إطار ذهبي مميز للكرت</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> دعم تسويقي مخصص</li>
                  </ul>
                </div>
                <button onClick={() => alert('تم تقديم طلب الباقة الذهبية')} className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black transition">
                  ترقية إلى VIP الآن
                </button>
              </div>

              <div className="bg-[#141a2c] p-5 rounded-2xl border border-[#222b42] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">الباقة الماسية الشاملة</h3>
                  <div className="my-3 text-2xl font-black text-white">250$<span className="text-xs text-slate-400"> / 3 أشهر</span></div>
                  <ul className="text-xs text-slate-300 space-y-2 border-t border-[#222b42] pt-3">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> بنر رئيسي في واجهة المنصة</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-400" /> تقارير أداء دورية للمبيعات</li>
                  </ul>
                </div>
                <button onClick={() => alert('تم تقديم طلب الباقة الماسية')} className="mt-5 w-full py-2.5 rounded-xl border border-[#222b42] hover:border-amber-400 text-slate-200 text-xs font-bold transition">
                  طلب الباقة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE CHAT */}
        {activeTab === 'chat' && (
          <div className="bg-black rounded-3xl border border-[#222b42] overflow-hidden flex flex-col h-[520px] shadow-2xl">
            <div className="bg-[#141a2c] p-4 border-b border-[#222b42] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xs">
                  إ.ع
                </div>
                <div>
                  <h3 className="font-bold text-xs md:text-sm text-white flex items-center gap-2">
                    الإدارة العامة للمنصة
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </h3>
                  <p className="text-[10px] text-slate-400">الدعم المباشر لشركاء المنشآت</p>
                </div>
              </div>
              <a 
                href="https://wa.me/967770000000" 
                target="_blank" 
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>واتساب الإدارة</span>
              </a>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/50">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    msg.sender === 'owner' ? 'mr-auto flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    msg.sender === 'owner' ? 'bg-amber-500 text-black' : 'bg-[#141a2c] text-amber-400 border border-[#222b42]'
                  }`}>
                    {msg.sender === 'owner' ? 'أنت' : 'إدارة'}
                  </div>
                  <div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'owner' 
                        ? 'bg-amber-500 text-black font-semibold rounded-tl-none shadow-md' 
                        : 'bg-[#141a2c] text-slate-200 border border-[#222b42] rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#141a2c] border-t border-[#222b42]">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  placeholder="اكتب استفسارك للإدارة العامة..." 
                  className="flex-1 bg-black border border-[#222b42] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button 
                  type="submit" 
                  className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-black flex items-center justify-center transition shadow-md"
                >
                  <Send className="w-4 h-4 transform -scale-x-100" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviewsList.length === 0 ? (
              <div className="bg-black p-8 rounded-2xl border border-[#222b42] text-center text-slate-400 text-xs">
                لا توجد تقييمات مسجلة لهذه المنشأة حتى الآن.
              </div>
            ) : (
              <div className="space-y-3">
                {reviewsList.map((rev: any) => (
                  <div key={rev.id} className="bg-black p-4 sm:p-5 rounded-2xl border border-[#222b42] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#111111] border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                          {rev.user_name ? rev.user_name.charAt(0) : 'ع'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{rev.user_name || 'عميل'}</h4>
                          <span className="text-[10px] text-slate-500">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString('ar-YE') : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < (rev.stars || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#141a2c] p-3 rounded-xl border border-[#222b42]">
                      {rev.comment || 'لا يوجد تعليق نصي.'}
                    </p>

                    {rev.owner_reply ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1">
                        <div className="text-[11px] font-bold text-amber-400">👑 ردك كمالك:</div>
                        <p className="text-xs text-slate-200">{rev.owner_reply}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={replyInput[rev.id] || ''}
                          onChange={(e) => setReplyInput({ ...replyInput, [rev.id]: e.target.value })}
                          placeholder="اكتب ردك كمالك على هذا التقييم..."
                          className="flex-1 bg-[#141a2c] border border-[#222b42] text-xs text-white p-2.5 rounded-xl outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          disabled={submittingReply === rev.id}
                          onClick={() => handleOwnerReply(rev.id)}
                          className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition disabled:opacity-50"
                        >
                          {submittingReply === rev.id ? 'جارٍ الإرسال...' : 'إرسال الرد'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. NOTIFICATION MODAL */}
      {isNotificationOpen && (
        <div className="fixed inset-0 bg-black  z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-[#222b42] rounded-3xl w-full max-w-sm p-5 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222b42] mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">مركز الإشعارات</h3>
              </div>
              <button 
                onClick={() => setIsNotificationOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-900 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#141a2c] border border-[#222b42]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400">أهلاً بك</span>
                  <span className="text-[10px] text-slate-500">الآن</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  مرحباً بك في لوحة تحكم المنشأة، يمكنك الآن إدخال وتعديل بيانات منشأتك.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsNotificationOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-[#202942] text-xs font-bold text-slate-300 transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* 5. EDIT OWNER PERSONAL PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black  z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-[#222b42] rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#141a2c] text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">الملف الشخصي للمالك</h3>
                <p className="text-xs text-slate-400">تعديل بيانات حسابك الشخصي ووسائل الدخول</p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (ownerUser) {
                  await supabase.auth.updateUser({
                    data: { full_name: ownerData.name, phone: ownerData.phone }
                  });
                }
                alert('تم تحديث بيانات حساب المالك بنجاح');
                setIsProfileModalOpen(false);
              } catch (err: any) {
                alert('حدث خطأ أثناء التحديث: ' + err?.message);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المالك</label>
                <input 
                  type="text" 
                  value={ownerData.name} 
                  onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })} 
                  className="w-full bg-[#141a2c] border border-[#222b42] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف الشخصي</label>
                <input 
                  type="text" 
                  value={ownerData.phone} 
                  onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })} 
                  className="w-full bg-[#141a2c] border border-[#222b42] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400" 
                  dir="ltr" 
                  placeholder="+967..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={ownerData.email} 
                  readOnly
                  className="w-full bg-[#141a2c]/60 border border-[#222b42] rounded-xl p-3 text-xs text-slate-400 focus:outline-none cursor-not-allowed" 
                  dir="ltr" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#222b42]">
                <button 
                  type="button" 
                  onClick={() => setIsProfileModalOpen(false)} 
                  className="px-4 py-2 rounded-xl bg-[#141a2c] text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* LIVE PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col" dir="rtl">
          <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              معاينة حية كما يراها الزائر
            </div>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              إغلاق المعاينة
            </button>
          </div>
          <div className="flex-1 bg-zinc-900 overflow-hidden relative">
            <iframe
              src={`/bank.html?slug=${encodeURIComponent(businessData.slug)}`}
              className="w-full h-full border-0 bg-black"
              title="Business Preview"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerDashboardPage;
