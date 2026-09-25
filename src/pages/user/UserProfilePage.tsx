import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Building2, 
  Star, 
  Bookmark, 
  MessageSquare, 
  Send, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  X,
  Plus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'claims' | 'favorites' | 'reviews' | 'support'>('claims');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // User State
  const [userData, setUserData] = useState({
    name: 'زائر المنصة',
    phone: '',
    email: '',
    avatar: '',
  });

  // Claims State
  const [claims, setClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);

  // Chat State with Support
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'admin'; text: string; time: string }>>([
    {
      sender: 'admin',
      text: 'أهلاً بك في منصة يمن ريتنغ 🌹 يسعدنا خدمتك، إذا كان لديك أي استفسار أو ترغب بالمطالبة بملكية منشأتك فنحن هنا لمساعدتك.',
      time: 'الآن'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Fetch Current Session & User's Claims
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const u = session.user;
          const fullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'عضو معتمد';
          setUserData({
            name: fullName,
            phone: u.user_metadata?.phone || u.phone || '',
            email: u.email || '',
            avatar: u.user_metadata?.avatar_url || '',
          });

          // Fetch business claims submitted by this user
          const { data: claimsData } = await supabase
            .from('business_claims')
            .select('*')
            .eq('user_id', u.id)
            .order('created_at', { ascending: false });

          if (claimsData) {
            setClaims(claimsData);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoadingClaims(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: 'user' as const,
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
          text: 'تم استلام رسالتك، سيقوم ممثل خدمة العملاء بالرد عليك فوراً.',
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
    <div className="min-h-screen bg-[#070b13] text-slate-200 flex flex-col font-['Cairo',sans-serif] pb-16" dir="rtl">
      
      {/* 1. USER HEADER BAR */}
      <div className="bg-[#0e1320] border-b border-[#1c2438] px-4 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className="relative cursor-pointer"
              title="تعديل الحساب"
            >
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.name} 
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#FFC500] shadow"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#161c2e] border-2 border-[#FFC500] flex items-center justify-center text-[#FFC500] font-bold shadow">
                  <User className="w-5 h-5" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0e1320]"></span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-black text-white">{userData.name}</h1>
                <span className="bg-[#FFC500]/15 text-[#FFC500] border border-[#FFC500]/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  عضو مسجل
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{userData.email || userData.phone || 'حساب مفعل'}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsNotificationOpen(true)}
              className="relative w-9 h-9 rounded-xl bg-[#161c2e] hover:bg-[#202942] border border-[#232d46] text-slate-300 hover:text-white flex items-center justify-center transition"
              title="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                1
              </span>
            </button>

            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-9 h-9 rounded-xl bg-[#161c2e] hover:bg-[#202942] border border-[#232d46] text-[#FFC500] flex items-center justify-center transition"
              title="تعديل بيانات الحساب"
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

      {/* 2. RECTANGULAR NAVIGATION TABS */}
      <div className="max-w-6xl mx-auto w-full px-4 mt-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          
          <button 
            onClick={() => setActiveTab('claims')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'claims' 
                ? 'bg-[#FFC500] text-black border-[#FFC500] font-extrabold shadow-yellow-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'claims' ? 'text-black' : 'text-[#FFC500]'}`} />
            <span>مطالبات المنشآت</span>
          </button>

          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'favorites' 
                ? 'bg-[#FFC500] text-black border-[#FFC500] font-extrabold shadow-yellow-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'favorites' ? 'text-black' : 'text-emerald-400'}`} />
            <span>المحفوظات والمفضلة</span>
          </button>

          <button 
            onClick={() => setActiveTab('reviews')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'reviews' 
                ? 'bg-[#FFC500] text-black border-[#FFC500] font-extrabold shadow-yellow-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-black' : 'text-amber-400'}`} />
            <span>تقييماتي السابقة</span>
          </button>

          <button 
            onClick={() => setActiveTab('support')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-sm ${
              activeTab === 'support' 
                ? 'bg-[#FFC500] text-black border-[#FFC500] font-extrabold shadow-yellow-500/10' 
                : 'bg-[#0e1320] text-slate-300 border-[#222b42] hover:bg-[#161c2e] hover:border-slate-600'
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === 'support' ? 'text-black' : 'text-sky-400'}`} />
            <span>الدعم الفني المباشر</span>
          </button>

        </div>
      </div>

      {/* 3. MAIN TABS CONTENT */}
      <main className="max-w-6xl mx-auto w-full px-4 mt-5 flex-1">

        {/* TAB 1: CLAIMS & UPGRADE TO OWNER */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            
            {/* Banner: Become an Owner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-[#0e1320] to-[#0e1320] border-2 border-[#FFC500]/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-[#FFC500] text-black font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  هل أنت صاحب منشأة أو نشاط تجاري؟
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">طالب بملكية منشأتك الآن وتحكّم بصفحتها كاملة</h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  عند قبول طلبك من الإدارة العامة، ستتحول لوحتك تلقائياً إلى لوحة تحكم المالك لتعديل الصور، الأسعار، العروض، وتلقي الحجوزات.
                </p>
              </div>
              <button 
                onClick={() => navigate('/businesses')}
                className="px-5 py-2.5 bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0"
              >
                <Plus size={15} />
                <span>تصفح المنشآت للمطالبة</span>
              </button>
            </div>

            {/* User Claims List */}
            <div className="bg-[#0e1320] border border-[#222b42] rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-[#1F2937]">
                <Clock className="w-4 h-4 text-[#FFC500]" />
                <span>سجل طلبات التوثيق والمطالبة بالملكية</span>
              </h3>

              {loadingClaims ? (
                <div className="text-center py-8 text-xs text-slate-500">جاري تحميل طلباتك...</div>
              ) : claims.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#161c2e] text-slate-500 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold">لم تقم بتقديم أي طلب مطالبة بملكية منشأة حتى الآن.</p>
                  <p className="text-[11px] text-slate-500">ابحث عن منشأتك في دليل الموقع واضغط على "المطالبة بملكية هذه المنشأة".</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((claim) => (
                    <div key={claim.id} className="p-4 rounded-2xl bg-[#141a2c] border border-[#1F2937] flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{claim.business_name || 'منشأة تجارية'}</h4>
                        <span className="text-[11px] text-slate-400">تاريخ الطلب: {new Date(claim.created_at).toLocaleDateString('ar-YE')}</span>
                      </div>
                      <div>
                        {claim.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                            <CheckCircle2 size={13} /> تم الاعتماد (أنت المالك)
                          </span>
                        ) : claim.status === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                            <XCircle size={13} /> تم الرفض
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                            <Clock size={13} /> قيد مراجعة الإدارة
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: FAVORITES */}
        {activeTab === 'favorites' && (
          <div className="bg-[#0e1320] border border-[#222b42] rounded-3xl p-8 text-center space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#161c2e] text-[#FFC500] flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">قائمة المنشآت المفضلة لديك</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              يمكنك حفظ الفنادق، المستشفيات، أو المطاعم المفضلة بالضغط على رمز الإشارة المرجعية أثناء تصفحك للرجوع إليها بسرعة.
            </p>
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-[#0e1320] border border-[#222b42] rounded-3xl p-8 text-center space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#161c2e] text-amber-400 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">التقييمات والمراجعات التي كتبتها</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ستظهر هنا جميع آرائك وتقييماتك بالنجوم التي أضفتها للخدمات والمنشآت داخل المنصة.
            </p>
          </div>
        )}

        {/* TAB 4: LIVE CHAT SUPPORT */}
        {activeTab === 'support' && (
          <div className="bg-[#0e1320] rounded-3xl border border-[#222b42] overflow-hidden flex flex-col h-[520px] shadow-2xl">
            <div className="bg-[#141a2c] p-4 border-b border-[#222b42] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FFC500]/20 text-[#FFC500] border border-[#FFC500]/40 flex items-center justify-center font-black text-xs">
                  دعم
                </div>
                <div>
                  <h3 className="font-bold text-xs md:text-sm text-white flex items-center gap-2">
                    خدمة العملاء والدعم العام
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </h3>
                  <p className="text-[10px] text-slate-400">مساعدة ومتابعة توثيق الحسابات والأنشطة</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#070b13]/50">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'mr-auto flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    msg.sender === 'user' ? 'bg-[#FFC500] text-black' : 'bg-[#141a2c] text-[#FFC500] border border-[#222b42]'
                  }`}>
                    {msg.sender === 'user' ? 'أنت' : 'إدارة'}
                  </div>
                  <div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-[#FFC500] text-black font-semibold rounded-tl-none shadow-md' 
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
                  placeholder="اكتب استفسارك لخدمة العملاء..." 
                  className="flex-1 bg-[#0e1320] border border-[#222b42] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC500]"
                />
                <button 
                  type="submit" 
                  className="w-10 h-10 rounded-xl bg-[#FFC500] hover:bg-amber-400 text-black flex items-center justify-center transition shadow-md"
                >
                  <Send className="w-4 h-4 transform -scale-x-100" />
                </button>
              </form>
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
                <Bell className="w-4 h-4 text-[#FFC500]" />
                <h3 className="text-sm font-black text-white">مركز التنبيهات</h3>
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
                <span className="text-xs font-bold text-[#FFC500] block mb-1">مرحباً بك في يمن ريتنغ</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  حسابك الشخصي مفعل بنجاح، يمكنك الآن متابعة التقييمات والمطالبة بمنشآتك.
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

      {/* 5. EDIT PROFILE MODAL */}
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
              <div className="w-10 h-10 rounded-xl bg-[#FFC500]/20 text-[#FFC500] flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">تعديل الملف الشخصي</h3>
                <p className="text-xs text-slate-400">إدارة الاسم وبيانات الاتصال الخاصة بك</p>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await supabase.auth.updateUser({
                  data: { full_name: userData.name, phone: userData.phone }
                });
                alert('تم تحديث بياناتك بنجاح');
                setIsProfileModalOpen(false);
              } catch (err: any) {
                alert('حدث خطأ أثناء التحديث: ' + err?.message);
              }
            }} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={userData.name} 
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })} 
                  className="w-full bg-[#141a2c] border border-[#222b42] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFC500]" 
                  required 
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">رقم الهاتف</label>
                <input 
                  type="text" 
                  value={userData.phone} 
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })} 
                  className="w-full bg-[#141a2c] border border-[#222b42] rounded-xl p-3 text-white focus:outline-none focus:border-[#FFC500]" 
                  dir="ltr" 
                  placeholder="+967..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={userData.email} 
                  readOnly
                  className="w-full bg-[#141a2c]/60 border border-[#222b42] rounded-xl p-3 text-slate-400 focus:outline-none cursor-not-allowed" 
                  dir="ltr" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#222b42]">
                <button 
                  type="button" 
                  onClick={() => setIsProfileModalOpen(false)} 
                  className="px-4 py-2 rounded-xl bg-[#141a2c] text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-xl bg-[#FFC500] hover:bg-amber-400 text-black font-black transition"
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

export default UserProfilePage;
