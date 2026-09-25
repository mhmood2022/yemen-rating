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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Dynamic Owner State from Supabase Auth Session
  const [ownerUser, setOwnerUser] = useState<any>(null);
  const [businessData, setBusinessData] = useState<{ id: string | null; name: string; city: string }>({
    id: null,
    name: 'منشأتي المعتمدة',
    city: 'الجمهورية اليمنية'
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
            .select('id, name, city')
            .eq('owner_id', u.id)
            .limit(1)
            .maybeSingle();

          if (biz) {
            setBusinessData({
              id: biz.id,
              name: biz.name,
              city: biz.city || 'اليمن'
            });
          }
        }
      } catch (err) {
        console.error('Session load error:', err);
      }
    };

    fetchCurrentSession();
  }, []);

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
    <div className="min-h-screen bg-[#070b13] text-slate-200 flex flex-col font-sans pb-16" dir="rtl">
      
      {/* 1. OWNER PROFILE SUB-HEADER BAR */}
      <div className="bg-[#0e1320] border-b border-[#1c2438] px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="relative cursor-pointer"
              title="تعديل حساب المالك"
            >
              {ownerData.avatar ? (
                <img 
                  src={ownerData.avatar} 
                  alt={ownerData.name} 
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-500 shadow"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#161c2e] border-2 border-amber-500 flex items-center justify-center text-amber-400 font-bold shadow">
                  <User className="w-5 h-5" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0e1320]"></span>
            </div>
            
            <div>
              <h1 className="text-sm md:text-base font-black text-white">{ownerData.name}</h1>
              <p className="text-[11px] text-slate-400">{businessData.name} • {businessData.city}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsNotificationOpen(true)}
              className="relative w-9 h-9 rounded-xl bg-[#161c2e] hover:bg-[#202942] border border-[#232d46] text-slate-300 hover:text-white flex items-center justify-center transition"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                1
              </span>
            </button>

            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-[#161c2e] hover:bg-[#202942] border border-[#232d46] text-amber-400 flex items-center justify-center transition"
              title="تعديل حساب المالك"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button 
              onClick={handleSignOut}
              className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. HORIZONTAL NAVIGATION TABS */}
      <div className="max-w-6xl mx-auto w-full px-4 mt-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'editor' 
                ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-amber-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'editor' ? 'text-black' : 'text-amber-400'}`} />
            <span>تعديل بيانات المنشأة</span>
          </button>

          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'stats' 
                ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-amber-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === 'stats' ? 'text-black' : 'text-emerald-400'}`} />
            <span>الإحصائيات والنقرات</span>
          </button>

          <button 
            onClick={() => setActiveTab('ads')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'ads' 
                ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-amber-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
          >
            <Crown className={`w-4 h-4 ${activeTab === 'ads' ? 'text-black' : 'text-amber-400'}`} />
            <span>الإعلانات والترقية</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'chat' 
                ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-amber-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === 'chat' ? 'text-black' : 'text-sky-400'}`} />
            <span>دردشة الإدارة العامة</span>
          </button>

          <button 
            onClick={() => setActiveTab('reviews')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'reviews' 
                ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-amber-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
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
              className="w-full bg-[#0e1320] rounded-3xl border border-[#222b42] p-4 sm:p-7 shadow-2xl"
            >
              <UnifiedFacilityEditor businessId={businessData.id} />
            </div>
          </div>
        )}

        {/* TAB 2: REAL-TIME STATISTICS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0e1320] p-5 rounded-2xl border border-[#222b42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold">مشاهدات الصفحة</span>
                <Eye className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">0</div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">إجمالي الزيارات</span>
            </div>

            <div className="bg-[#0e1320] p-5 rounded-2xl border border-[#222b42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold">نقرات الاتصال</span>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">0</div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">حجوزات واستفسارات</span>
            </div>

            <div className="bg-[#0e1320] p-5 rounded-2xl border border-[#222b42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold">محادثات الواتساب</span>
                <MessageCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">0</div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">تواصل مباشر</span>
            </div>

            <div className="bg-[#0e1320] p-5 rounded-2xl border border-[#222b42]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-bold">متوسط التقييم</span>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-amber-400">0.0 <span className="text-xs text-slate-400">/ 5</span></div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">من أصل 0 تقييم</span>
            </div>
          </div>
        )}

        {/* TAB 3: PROMOTION & PACKAGES */}
        {activeTab === 'ads' && (
          <div className="bg-[#0e1320] rounded-3xl border border-[#222b42] p-6 md:p-8">
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
          <div className="bg-[#0e1320] rounded-3xl border border-[#222b42] overflow-hidden flex flex-col h-[520px] shadow-2xl">
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

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#070b13]/50">
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
                  className="flex-1 bg-[#0e1320] border border-[#222b42] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
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
            <div className="bg-[#0e1320] p-8 rounded-2xl border border-[#222b42] text-center text-slate-400 text-xs">
              لا توجد تقييمات جديدة حالياً لهذه المنشأة.
            </div>
          </div>
        )}

      </main>

      {/* 4. NOTIFICATION MODAL */}
      {isNotificationOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1320] border border-[#222b42] rounded-3xl w-full max-w-sm p-5 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222b42] mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">مركز الإشعارات</h3>
              </div>
              <button 
                onClick={() => setIsNotificationOpen(false)}
                className="w-7 h-7 rounded-full bg-[#161c2e] text-slate-400 hover:text-white flex items-center justify-center"
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
              className="mt-5 w-full py-2.5 rounded-xl bg-[#161c2e] hover:bg-[#202942] text-xs font-bold text-slate-300 transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* 5. EDIT OWNER PERSONAL PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1320] border border-[#222b42] rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
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

    </div>
  );
};

export default OwnerDashboardPage;
