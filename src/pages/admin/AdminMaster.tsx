import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminLogin } from './auth/AdminLogin';
import { 
  Menu, ShieldAlert, LogOut, Bell, 
  ShieldCheck, AlertTriangle, DollarSign, Gavel, Star, CheckCheck, X, ArrowRight, Briefcase 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getAccess, AccessInfo } from '../../lib/access';

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
  const [notifTab, setNotifTab] = useState<'unread' | 'all'>('all');
  const navigate = useNavigate();

  const [access, setAccess] = useState<AccessInfo | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      // فحص جلسة المشرف العام الحصرية
      const s = localStorage.getItem('yr_admin_session');
      if (s) {
        try {
          const parsed = JSON.parse(s);
          if (parsed.authenticated && parsed.email === 'info.yemenrating@gmail.com') {
            if (!alive) return;
            setIsAuthenticated(true);
            setChecking(false);
            return;
          }
        } catch {}
      }

      const a = await getAccess();
      if (!alive) return;
      setAccess(a);
      const isMahmoud = a?.email?.toLowerCase() === 'info.yemenrating@gmail.com';
      setIsAuthenticated(isMahmoud || a.isStaff);
      setChecking(false);
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setTimeout(load, 0);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  // جلب كل أنشطة وإشعارات الموقع
  const fetchAllNotifications = async () => {
    try {
      const allAlerts: SystemNotification[] = [];

      // أ) المصدر الأساسي: جدول admin_notifications في Supabase
      if (supabase) {
        const { data: dbNotifs, error: dbErr } = await supabase
          .from("admin_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(60);

        if (dbNotifs && !dbErr) {
          dbNotifs.forEach((n: any) => {
            allAlerts.push({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type || "system",
              link: n.link || "/admin",
              is_read: !!n.is_read,
              created_at: n.created_at || new Date().toISOString()
            });
          });
        }

        // ب) جلب طلبات إثبات الملكية من business_claims
        const { data: bClaims } = await supabase
          .from("business_claims")
          .select("*, businesses(name)")
          .eq("status", "PENDING")
          .order("created_at", { ascending: false });

        if (bClaims) {
          bClaims.forEach((c: any) => {
            const bName = c.businesses?.name || "منشأة تجارية";
            allAlerts.push({
              id: `claim-${c.id}`,
              title: `🛡️ طلب توثيق ملكية: ${bName}`,
              message: `مقدم الطلب: ${c.claimant_name || "مستخدم"} (${c.claimant_phone || ""})`,
              type: "claim",
              link: "/admin/claims",
              is_read: false,
              created_at: c.created_at || new Date().toISOString()
            });
          });
        }
      }

      // ترتيب كل الإشعارات زمنياً من الأحدث للأقدم
      allAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allAlerts);
      setUnreadCount(allAlerts.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching admin hub notifications:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllNotifications();
      const interval = setInterval(fetchAllNotifications, 10000);

      // استماع لحظي Realtime لتحديث الإشعارات فور وصولها
      let channel: any = null;
      if (supabase) {
        channel = supabase.channel("admin-notifs-realtime")
          .on("postgres_changes", { event: "*", schema: "public", table: "admin_notifications" }, () => {
            fetchAllNotifications();
          })
          .subscribe();
      }

      return () => {
        clearInterval(interval);
        if (channel && supabase) supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    localStorage.removeItem('yr_admin_session');
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    window.location.reload();
  };

  // أيقونة ولون مخصص لكل نشاط
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job_application":
      case "job":
        return <Briefcase className="text-[#38BDF8] shrink-0" size={16} />;
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

  
  // حذف إشعار فردي ومنع عودته نهائياً
  const handleDismissNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const dismissed = JSON.parse(localStorage.getItem("yr_dismissed_notifications") || "[]");
      if (!dismissed.includes(id)) {
        dismissed.push(id);
        localStorage.setItem("yr_dismissed_notifications", JSON.stringify(dismissed));
      }
    } catch(err) {}

    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      setUnreadCount(updated.filter(n => !n.is_read).length);
      return updated;
    });
  };

  // مسح كافة الإشعارات الحالية ومنع عودتها نهائياً
  const handleClearAllNotifications = () => {
    try {
      const currentIds = notifications.map(n => n.id);
      const dismissed = JSON.parse(localStorage.getItem("yr_dismissed_notifications") || "[]");
      const combined = Array.from(new Set([...dismissed, ...currentIds]));
      localStorage.setItem("yr_dismissed_notifications", JSON.stringify(combined));
      localStorage.removeItem("yr_admin_notifications");
    } catch(err) {}

    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotificationClick = async (item: SystemNotification) => {
    setNotificationsOpen(false);

    // تحديث الإشعار فورياً كمقروء في الواجهة
    if (!item.is_read) {
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      if (supabase && !item.id.startsWith("claim-") && !item.id.startsWith("req-")) {
        await supabase
          .from("admin_notifications")
          .update({ is_read: true })
          .eq("id", item.id);
      }
    }

    // الانتقال التلقائي للصفحة الخاصة بالطلب
    if (item.link) {
      navigate(item.link);
    } else {
      setSelectedNotification(item);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      if (supabase) {
        await supabase
          .from("admin_notifications")
          .update({ is_read: true })
          .eq("is_read", false);
      }
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#070A10] flex items-center justify-center text-white font-['Cairo']">
        جارٍ التحقق من الصلاحيات...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin access={access} />;
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
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs sm:bg-transparent"
                    onClick={() => setNotificationsOpen(false)}
                    aria-hidden="true"
                  />

                  {/* لوحة الإشعارات المتوافقة مع الهاتف والكمبيوتر */}
                  <div className="fixed sm:absolute top-16 sm:top-full left-2 right-2 sm:left-0 sm:right-auto sm:mt-2 sm:w-[410px] bg-[#0B0F17] border border-[#1F2937] rounded-2xl shadow-2xl p-3 z-50 text-right max-h-[85vh] sm:max-h-[520px] flex flex-col font-['Cairo']">
                    {/* رأس القائمة */}
                    <div className="flex justify-between items-center pb-2.5 border-b border-[#1F2937]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Bell size={15} className="text-[#FFC500]" /> مركز تنبيهات المنصة
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] text-[#FFC500] hover:text-[#fde047] font-bold flex items-center gap-1 bg-[#FFC500]/10 hover:bg-[#FFC500]/20 px-2 py-0.5 rounded-md transition cursor-pointer"
                        >
                          <CheckCheck size={13} /> تحديد الكل كمقروء
                        </button>
                      )}
                    </div>

                    {/* تبويبات الفرز: غير المقروءة vs الكل */}
                    <div className="flex items-center gap-1.5 p-1 bg-[#121620] rounded-xl my-2 border border-[#1F2937]/60">
                      <button
                        type="button"
                        onClick={() => setNotifTab('unread')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          notifTab === 'unread'
                            ? 'bg-[#1F2937] text-white shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>الجديدة (غير مقروءة)</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 text-[10px] bg-[#EF4444] text-white font-black rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifTab('all')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          notifTab === 'all'
                            ? 'bg-[#1F2937] text-white shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>كل التنبيهات</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          ({notifications.length})
                        </span>
                      </button>
                    </div>

                    {/* قائمة الإشعارات */}
                    {(() => {
                      const displayed = notifTab === 'unread'
                        ? notifications.filter(n => !n.is_read)
                        : notifications;

                      if (displayed.length === 0) {
                        return (
                          <div className="text-center py-10 px-4">
                            <div className="w-12 h-12 rounded-full bg-[#161D2B] text-gray-500 flex items-center justify-center mx-auto mb-2">
                              <Bell size={22} />
                            </div>
                            <p className="text-xs font-bold text-gray-300">
                              {notifTab === 'unread'
                                ? "🎉 رائع! تم الاطلاع على كافة التنبيهات الجديدة."
                                : "لا توجد أي أنشطة أو تنبيهات مسجلة."}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              تصل التنبيهات هنا لحظياً عند حدوث أي نشاط جديد
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-1.5 max-h-[340px] overflow-y-auto no-scrollbar pr-0.5">
                          {displayed.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleNotificationClick(item)}
                              className={`p-2.5 rounded-xl transition cursor-pointer border text-right group relative ${
                                item.is_read
                                  ? 'bg-[#111622]/60 border-[#1F2937]/40 hover:bg-[#161D2B]'
                                  : 'bg-[#161F30] border-[#2563EB]/40 hover:border-[#FFC500]/60 shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 p-1.5 rounded-lg bg-[#0B0F17] border border-[#1F2937]">
                                  {getNotificationIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center text-[11px] mb-0.5">
                                    <span className="font-bold text-white group-hover:text-[#FFC500] transition truncate flex items-center gap-1.5">
  {item.title}
  {item.is_read ? (
    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-normal">تمت المراجعة ✔️</span>
  ) : (
    <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded font-bold">جديد 🔵</span>
  )}
</span>
                                    <span className="text-[9px] text-gray-400 shrink-0 font-mono">
                                      {new Date(item.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#CBD5E1] leading-relaxed line-clamp-2">
                                    {item.message}
                                  </p>
                                </div>
                                {!item.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-[#38BDF8] shrink-0 mt-1.5 animate-pulse" title="إشعار غير مقروء" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* تذييل القائمة */}
                    <div className="pt-2.5 border-t border-[#1F2937] mt-2 flex justify-between items-center text-[10px] text-gray-400">
                      <span>تحديث لحظي ومباشر (Realtime) ⚡</span>
                      <button
                        type="button"
                        onClick={() => { setNotificationsOpen(false); navigate('/admin/jobs?tab=applications'); }}
                        className="text-[#38BDF8] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        طلبات التوظيف ⬅️
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
