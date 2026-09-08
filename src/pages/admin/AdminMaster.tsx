import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminLogin } from './auth/AdminLogin';
import { 
  Menu, ShieldAlert, LogOut, Bell, 
  ShieldCheck, AlertTriangle, DollarSign, Gavel, Star, CheckCheck, X, ArrowRight 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export const AdminMaster: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  
  // حالات مركز الإشعارات الشامل
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<SystemNotification | null>(null);
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

  // جلب كل أنشطة وإشعارات الموقع (توثيق، بلاغات، عمولات، مزادات)
  const fetchAllNotifications = async () => {
    try {
      // 1. جلب الإشعارات العامة من admin_notifications
      const { data: generalNotes } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // 2. جلب طلبات إثبات الملكية المعلقة من verification_requests
      const { data: pendingClaims } = await supabase
        .from('verification_requests')
        .select('id, applicant_name, applicant_role, notes, created_at')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      const claimsMapped: SystemNotification[] = (pendingClaims || []).map((c: any) => ({
        id: `claim-${c.id}`,
        title: '🛡️ طلب إثبات ملكية جديد',
        message: `مقدم الطلب: ${c.applicant_name} (${c.applicant_role || 'مفوض'}) - ${c.notes || ''}`,
        type: 'claim',
        link: '/admin/claims',
        is_read: false,
        created_at: c.created_at
      }));

      // دمج وترتيب كل الأنشطة زمنياً
      const combined: SystemNotification[] = [
        ...claimsMapped,
        ...((generalNotes as SystemNotification[]) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(combined);
      setUnreadCount(combined.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching admin hub notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllNotifications();
      const interval = setInterval(fetchAllNotifications, 15000); // فحص دوري كل 15 ثانية
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('yr_admin_session');
    setIsAuthenticated(false);
  };

  // أيقونة ولون مخصص لكل نشاط
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'claim':
      case 'verification':
        return <ShieldCheck className="text-[#FFC500] shrink-0" size={16} />;
      case 'report':
      case 'dispute':
        return <AlertTriangle className="text-[#EF4444] shrink-0" size={16} />;
      case 'commission':
        return <DollarSign className="text-[#10B981] shrink-0" size={16} />;
      case 'auction':
        return <Gavel className="text-[#3B82F6] shrink-0" size={16} />;
      case 'review':
        return <Star className="text-[#F59E0B] shrink-0" size={16} />;
      default:
        return <Bell className="text-gray-400 shrink-0" size={16} />;
    }
  };

  const handleNotificationClick = async (item: SystemNotification) => {
    setNotificationsOpen(false);

    if (!item.id.startsWith('claim-')) {
      await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', item.id);
    }

    // فتح نافذة تفاصيل الإشعار بالكامل
    setSelectedNotification(item);
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
        {/* الشريط العلوي مع مركز الإشعارات الشامل */}
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
              <span className="hidden sm:inline">لوحة التحكم والإدارة — Yemen Rating</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* جرس الإشعارات الشامل */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg bg-[#161D2B] text-gray-300 hover:text-white hover:bg-[#1F2937] transition cursor-pointer"
                title="مركز إشعارات المنصة"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#EF4444] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* القائمة المنسدلة الشاملة */}
              {notificationsOpen && (
                <>
                  {/* خلفية لإغلاق القائمة عند النقر خارجها */}
                  <div
                    className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
                    onClick={() => setNotificationsOpen(false)}
                    aria-hidden="true"
                  />
                  {/* لوحة الإشعارات المتوافقة مع الهاتف والكمبيوتر */}
                  <div className="fixed sm:absolute top-16 sm:top-full left-2 right-2 sm:left-0 sm:right-auto sm:mt-2 sm:w-96 bg-[#0B0F17] border border-[#1F2937] rounded-xl shadow-2xl p-3 z-50 text-right max-h-[80vh] sm:max-h-[500px] flex flex-col">
                  <div className="flex justify-between items-center pb-2 border-b border-[#1F2937] mb-2">
                    <span className="text-xs font-bold text-[#FFC500] flex items-center gap-1.5">
                      <Bell size={14} /> مركز تنبيهات وأنشطة المنصة
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {unreadCount} تنبيه نشط
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      لا توجد أنشطة أو تنبيهات جديدة حالياً.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-2.5 rounded-lg transition cursor-pointer border ${
                            item.is_read 
                              ? 'bg-[#121620] border-[#1F2937]/50 opacity-75' 
                              : 'bg-[#161D2B] border-[#1F2937] hover:border-[#FFC500]/50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">{getNotificationIcon(item.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-white truncate">{item.title}</span>
                                <span className="text-gray-400 text-[9px] shrink-0 mr-1">
                                  {new Date(item.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-[#D1D5DB] mt-1 leading-snug line-clamp-2">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#1F2937] mt-2 flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">تحديث لحظي لجميع الأنشطة</span>
                    <button
                      onClick={() => { setNotificationsOpen(false); navigate('/admin/claims'); }}
                      className="text-[#FFC500] hover:underline font-bold"
                    >
                      إدارة التوثيق ⬅️
                    </button>
                  </div>
                </div>
                </>
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
      {/* نافذة تفاصيل الإشعار المنبثقة الشاملة */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="bg-[#0B0F17] border border-[#1F2937] rounded-2xl p-5 max-w-md w-full shadow-2xl text-right text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#FFC500]">
                {getNotificationIcon(selectedNotification.type)}
                <span>{selectedNotification.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 rounded-lg bg-[#161D2B] text-gray-400 hover:text-white hover:bg-[#1F2937] transition cursor-pointer"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-[#D1D5DB] bg-[#121620] p-3.5 rounded-xl border border-[#1F2937]/50">
              <p className="font-semibold text-sm text-white mb-1">تفاصيل التنبيه الكاملة:</p>
              <p className="whitespace-pre-wrap leading-normal text-zinc-300 font-medium">
                {selectedNotification.message}
              </p>
            </div>

            <div className="flex justify-between items-center text-[11px] text-gray-400">
              <span>تاريخ ووقت التنبيه:</span>
              <span className="font-mono text-zinc-300">
                {new Date(selectedNotification.created_at).toLocaleString("ar-YE", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </span>
            </div>

            <div className="pt-2 border-t border-[#1F2937] flex items-center gap-2">
              {selectedNotification.link && (
                <button
                  type="button"
                  onClick={() => {
                    const link = selectedNotification.link;
                    setSelectedNotification(null);
                    if (link) navigate(link);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>الانتقال للمعاينة والإجراء</span>
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2.5 rounded-xl bg-[#161D2B] hover:bg-[#1F2937] text-gray-300 text-xs font-bold transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
