'use client';

import React, { useState, useEffect } from 'react';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Bell, Heart, MessageCircle, Repeat2, UserPlus, CheckCircle2,
  Trash2, ArrowRight, Check, Sparkles
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
  const [sp] = useSearchParams();
  const isBizScope = sp.get('scope') === 'business';
  const bizId = sp.get('businessId') || '';
  const bizName = sp.get('businessName') || '';

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'verified'>('all');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const matchesScope = (n: any) => {
    const title = String(n?.title || '');
    const msg = String(n?.message || '');
    const isBiz = title.startsWith('[BIZ') || msg.includes('لصفحة المنشأة');
    if (isBizScope) {
      if (!isBiz) return false;
      if (bizId && title.includes('[BIZ:')) return title.includes(`[BIZ:${bizId}]`);
      if (bizName) return msg.includes(bizName) || String(n?.actor_name || '') === bizName;
      return true;
    }
    return !isBiz;
  };

  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCurrentUserId('');
          setNotifications([]);
          return;
        }
        setCurrentUserId(user.id);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) { setNotifications([]); return; }

        const mapped = (data || []).filter(matchesScope).map((n: any) => ({
          id: n.id,
          targetUserId: n.user_id,
          actorId: n.actor_id || 'system',
          actorName: n.actor_name || 'فريق يمن ريتنج',
          actorAvatar: n.actor_avatar || '',
          type: n.type || 'system',
          text: n.message || n.title || '',
          targetPostId: n.post_id || null,
          createdAt: new Date(n.created_at).toLocaleString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
          isRead: n.read || false,
        }));
        setNotifications(mapped);
      } catch {
        setNotifications([]);
      }
    };

    loadFromDB();

    const channel = supabase
      .channel(`notifications-changes-${isBizScope ? bizId || 'biz' : 'acc'}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n: any = payload.new;
        if (!currentUserId || n.user_id !== currentUserId || !matchesScope(n)) return;
        setNotifications((prev) => [{
          id: n.id,
          targetUserId: n.user_id,
          actorId: n.actor_id || 'system',
          actorName: n.actor_name || 'فريق يمن ريتنج',
          actorAvatar: n.actor_avatar || '',
          type: n.type || 'system',
          text: n.message || n.title || '',
          targetPostId: n.post_id || null,
          createdAt: 'الآن',
          isRead: false,
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, isBizScope, bizId, bizName]);

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (currentUserId && unreadIds.length > 0) {
      try {
        await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
      } catch {}
    }
    showToast('تم تحديد جميع التنبيهات كمقروءة');
  };

  const handleDeleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try { await supabase.from('notifications').delete().eq('id', id); } catch {}
    showToast('تم حذف التنبيه');
  };

  const handleNotifClick = async (n: AppNotification) => {
    setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
    try { await supabase.from('notifications').update({ read: true }).eq('id', n.id); } catch {}
    if (isBizScope) {
      navigate(bizId ? `/owner?id=${bizId}` : '/owner');
    } else if (n.type === 'follow' && n.actorId !== 'system') {
      navigate(`/account?id=${n.actorId}`);
    } else {
      navigate('/feed');
    }
  };

  const visibleList = activeTab === 'verified' ? notifications.filter((n) => n.type !== 'system') : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-['Tahoma',sans-serif] pb-32" dir="rtl">
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#FFC500] text-black px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} /><span>{toastMsg}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-black border-b border-[#2F3336]">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-zinc-800 text-white transition cursor-pointer"><ArrowRight size={20} /></button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2 truncate">
                <span>{isBizScope ? 'تنبيهات المنشأة' : 'تنبيهات الحساب'}</span>
                {unreadCount > 0 && <span className="bg-[#FFC500] text-black text-[11px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </h1>
              {isBizScope && bizName && <p className="text-[11px] text-[#71767B] truncate">{bizName}</p>}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="text-xs text-[#FFC500] hover:underline font-bold flex items-center gap-1 shrink-0 cursor-pointer">
              <Check size={14} /><span>تحديد الكل كمقروء</span>
            </button>
          )}
        </div>

        <div className="flex border-t border-[#2F3336] text-sm font-bold">
          <button onClick={() => setActiveTab('all')} className={`flex-1 py-3 text-center relative transition cursor-pointer ${activeTab === 'all' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}>
            <span>الكل ({notifications.length})</span>
            {activeTab === 'all' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#FFC500] rounded-full" />}
          </button>
          <button onClick={() => setActiveTab('verified')} className={`flex-1 py-3 text-center relative transition cursor-pointer ${activeTab === 'verified' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}>
            <span>التفاعلات</span>
            {activeTab === 'verified' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#FFC500] rounded-full" />}
          </button>
        </div>
      </header>

      <div className="divide-y divide-[#2F3336]">
        {visibleList.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 text-xs px-4">
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400"><Bell size={28} /></div>
            <h3 className="text-sm font-bold text-white mb-1">صندوق التنبيهات فارغ</h3>
            <p className="text-xs text-[#71767B]">{isBizScope ? 'لا توجد تنبيهات خاصة بهذه المنشأة حالياً.' : 'عندما يتفاعل أي شخص مع منشوراتك أو اشتراكات حسابك، ستصلك التنبيهات هنا.'}</p>
          </div>
        ) : (
          visibleList.map((n) => {
            const getIcon = () => {
              if (n.type === 'like') return <Heart size={18} className="fill-rose-500 text-rose-500" />;
              if (n.type === 'comment') return <MessageCircle size={18} className="text-[#FFC500]" />;
              if (n.type === 'repost') return <Repeat2 size={18} className="text-emerald-400" />;
              if (n.type === 'follow') return <UserPlus size={18} className="text-yellow-400" />;
              return <Sparkles size={18} className="text-[#FFC500]" />;
            };
            return (
              <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-4 flex gap-3 transition cursor-pointer hover:bg-white/[0.02] ${!n.isRead ? 'bg-[#FFC500]/[0.06]' : ''}`}>
                <div className="shrink-0 mt-1">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {n.actorAvatar ? <img src={n.actorAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" /> : <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">{n.actorName ? n.actorName[0] : '؟'}</div>}
                      <span className="font-bold text-xs sm:text-sm text-white truncate">{n.actorName}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[#71767B]">{n.createdAt}</span>
                      <button onClick={(e) => handleDeleteNotif(n.id, e)} className="text-zinc-600 hover:text-rose-400 p-1 rounded-full transition cursor-pointer" title="حذف التنبيه"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">{n.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isBizScope && <MobileBottomNav onNavigate={(path) => navigate(path)} />}
    </div>
  );
};
