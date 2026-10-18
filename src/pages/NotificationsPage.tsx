'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Bell, Heart, MessageCircle, Repeat2, UserPlus, CheckCircle2, 
  Trash2, ArrowRight, Check, Home, MessageSquare, User, Sparkles 
} from 'lucide-react';

export interface AppNotification {
  id: string;
  targetUserId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: 'like' | 'comment' | 'repost' | 'follow' | 'system';
  text: string;
  targetPostId?: string;
  createdAt: string;
  isRead: boolean;
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'verified'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const init = async () => {
      let uid = '';
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          uid = user.id;
          setCurrentUserId(user.id);
        } else {
          uid = localStorage.getItem('yr_guest_unique_id') || 'guest';
          setCurrentUserId(uid);
        }
      } catch (_) {
        uid = 'guest';
        setCurrentUserId(uid);
      }

      // جلب التنبيهات الحقيقية لهذا المستخدم
      const key = `yr_notifications_${uid}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch {
          setNotifications([]);
        }
      } else {
        // تنبيه ترحيبي أولي
        const welcomeNotif: AppNotification = {
          id: 'welcome-1',
          targetUserId: uid,
          actorId: 'system',
          actorName: 'فريق يمن ريتنج',
          actorAvatar: '',
          type: 'system',
          text: 'مرحباً بك في مجتمع يمن ريتنج! يمكنك الآن النشر والتفاعل ومتابعة المغردين بحرية.',
          createdAt: 'الآن',
          isRead: false
        };
        setNotifications([welcomeNotif]);
        localStorage.setItem(key, JSON.stringify([welcomeNotif]));
      }
    };

    init();
  }, []);

  // تحديد الكل كمقروء
  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    if (currentUserId) {
      localStorage.setItem(`yr_notifications_${currentUserId}`, JSON.stringify(updated));
    }
    showToast('تم تحديد جميع التنبيهات كمقروءة ✅');
  };

  // حذف تنبيه فردي
  const handleDeleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (currentUserId) {
      localStorage.setItem(`yr_notifications_${currentUserId}`, JSON.stringify(updated));
    }
    showToast('تم حذف التنبيه');
  };

  // النقر على التنبيه للانتقال
  const handleNotifClick = (n: AppNotification) => {
    // تمييز كمقروء
    const updated = notifications.map(item => item.id === n.id ? { ...item, isRead: true } : item);
    setNotifications(updated);
    if (currentUserId) {
      localStorage.setItem(`yr_notifications_${currentUserId}`, JSON.stringify(updated));
    }

    if (n.type === 'follow' && n.actorId !== 'system') {
      navigate(`/account?id=${n.actorId}`);
    } else {
      navigate('/feed');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-['Cairo',sans-serif] selection:bg-[#1D9BF0] selection:text-white pb-32" dir="rtl">
      
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1D9BF0] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* الهيدر العلوي */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-[#2F3336]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-zinc-800 text-white transition">
              <ArrowRight size={20} />
            </button>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>التنبيهات</span>
              {unreadCount > 0 && (
                <span className="bg-[#1D9BF0] text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>

          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-xs text-[#1D9BF0] hover:underline font-bold flex items-center gap-1"
            >
              <Check size={14} />
              <span>تحديد الكل كمقروء</span>
            </button>
          )}
        </div>

        {/* شريط التبويبات */}
        <div className="flex border-t border-[#2F3336] text-sm font-bold">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-center relative transition ${activeTab === 'all' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}
          >
            <span>الكل ({notifications.length})</span>
            {activeTab === 'all' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1D9BF0] rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('verified')}
            className={`flex-1 py-3 text-center relative transition ${activeTab === 'verified' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}
          >
            <span>التفاعلات</span>
            {activeTab === 'verified' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1D9BF0] rounded-full" />}
          </button>
        </div>
      </header>

      {/* قائمة التنبيهات الحقيقية */}
      <div className="divide-y divide-[#2F3336]">
        {notifications.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 text-xs px-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Bell size={28} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">صندوق التنبيهات فارغ</h3>
            <p className="text-xs text-[#71767B]">عندما يتفاعل أي شخص مع منشوراتك أو يتابعك، ستصلك التنبيهات هنا فوراً.</p>
          </div>
        ) : (
          notifications.map(n => {
            const getIcon = () => {
              if (n.type === 'like') return <Heart size={18} className="fill-rose-500 text-rose-500" />;
              if (n.type === 'comment') return <MessageCircle size={18} className="text-[#1D9BF0]" />;
              if (n.type === 'repost') return <Repeat2 size={18} className="text-emerald-400" />;
              if (n.type === 'follow') return <UserPlus size={18} className="text-yellow-400" />;
              return <Sparkles size={18} className="text-[#1D9BF0]" />;
            };

            return (
              <div 
                key={n.id}
                onClick={() => handleNotifClick(n)}
                className={`p-4 flex gap-3 transition cursor-pointer hover:bg-white/[0.02] ${
                  !n.isRead ? 'bg-[#1D9BF0]/[0.06]' : ''
                }`}
              >
                {/* الأيقونة */}
                <div className="shrink-0 mt-1">
                  {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {n.actorAvatar ? (
                        <img src={n.actorAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                          {n.actorName ? n.actorName[0] : '؟'}
                        </div>
                      )}
                      <span className="font-bold text-xs sm:text-sm text-white">{n.actorName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#71767B]">{n.createdAt}</span>
                      <button 
                        onClick={(e) => handleDeleteNotif(n.id, e)}
                        className="text-zinc-600 hover:text-rose-400 p-1 rounded-full transition"
                        title="حذف التنبيه"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {n.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* شريط التنقل السفلي مع جرس التنبيهات النشط */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-[#2F3336] py-2 px-6 flex items-center justify-around text-xs font-bold">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-[#71767B] hover:text-white transition">
          <Home size={22} />
          <span>الرئيسية</span>
        </button>

        <button onClick={() => navigate('/feed')} className="flex flex-col items-center gap-1 text-[#71767B] hover:text-[#1D9BF0] transition">
          <MessageSquare size={22} />
          <span>المنشورات</span>
        </button>

        <button onClick={() => navigate('/notifications')} className="flex flex-col items-center gap-1 text-[#1D9BF0] font-black transition relative">
          <div className="relative">
            <Bell size={22} className="stroke-[2.5]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">
                {unreadCount}
              </span>
            )}
          </div>
          <span>التنبيهات</span>
        </button>

        <button onClick={() => navigate('/account')} className="flex flex-col items-center gap-1 text-[#71767B] hover:text-[#1D9BF0] transition">
          <User size={22} />
          <span>الملف الشخصي</span>
        </button>
      </nav>

    </div>
  );
};
