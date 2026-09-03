import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminLogin } from './auth/AdminLogin';
import { Menu, ShieldAlert, LogOut, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminMaster: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  
  // حالات الإشعارات التفاعلية
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('yr_admin_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        localStorage.removeItem('yr_admin_session');
      }
    }
    setChecking(false);
  }, []);

  // جلب الإشعارات والطلبات المعلقة من قاعدة البيانات
  const fetchPendingNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('id, applicant_name, applicant_role, entity_type, notes, created_at')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (data) {
        setPendingRequests(data);
        setPendingCount(data.length);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingNotifications();
      // تحديث تلقائي دوري كل 20 ثانية لتنبيه الإدارة بأي طلب جديد
      const interval = setInterval(fetchPendingNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('yr_admin_session');
    setIsAuthenticated(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#070A10] flex items-center justify-center text-white font-['Cairo']">
        جارٍ التحقق من الصلاحيات...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-white flex font-['Cairo',sans-serif]">
      {/* القائمة الجانبية */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:mr-[280px]">
        {/* الهيدر الثابت مع جرس الإشعارات */}
        <header className="fixed top-0 left-0 right-0 lg:right-[280px] h-16 bg-[#0B0F17] flex items-center justify-between px-4 lg:px-8 z-40 border-b border-[#1F2937]/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-[#161D2B] text-white lg:hidden hover:bg-[#1F2937] transition cursor-pointer"
              aria-label="فتح القائمة"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]">
              <ShieldAlert size={16} className="text-[#FFC500]" />
              <span className="hidden sm:inline">نظام الإدارة الداخلي لمنصة Yemen Rating</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* زر جرس الإشعارات التفاعلي */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg bg-[#161D2B] text-gray-300 hover:text-white hover:bg-[#1F2937] transition cursor-pointer"
                title="إشعارات النظام"
              >
                <Bell size={18} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* القائمة المنسدلة للإشعارات */}
              {notificationsOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#0B0F17] border border-[#1F2937] rounded-xl shadow-2xl p-3 z-50 text-right">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1F2937] mb-2">
                    <span className="text-xs font-bold text-[#FFC500] flex items-center gap-1.5">
                      <Bell size={14} /> إشعارات طلبات التوثيق
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {pendingCount} طلب معلق
                    </span>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-5 text-xs text-gray-400">
                      لا توجد طلبات إثبات ملكية معلقة حالياً.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                      {pendingRequests.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/admin/claims');
                          }}
                          className="p-2.5 rounded-lg bg-[#161D2B]/80 hover:bg-[#1F2937] transition cursor-pointer border border-[#1F2937]"
                        >
                          <div className="flex justify-between items-center text-[10px] text-[#FFC500] font-bold">
                            <span>طلب إثبات ملكية جديد</span>
                            <span className="text-gray-400 text-[9px]">
                              {new Date(req.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white mt-1">
                            {req.applicant_name} ({req.applicant_role || 'مفوض رسمي'})
                          </p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {req.notes || 'بانتظار مراجعة الإدارة والاعتماد'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/admin/claims');
                    }}
                    className="w-full mt-2.5 py-1.5 rounded-lg bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition cursor-pointer"
                  >
                    عرض كل طلبات التوثيق والاعتماد
                  </button>
                </div>
              )}
            </div>

            {/* زر الخروج الآمن */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>خروج آمن</span>
            </button>
          </div>
        </header>

        {/* مساحة المحتوى */}
        <main className="flex-1 pt-16 p-4 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
