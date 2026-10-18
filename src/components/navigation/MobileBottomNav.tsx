import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Bell, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const MobileBottomNav: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // 🔔 جلب عداد الإشعارات + Realtime
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setUnreadCount(0); return; }
        
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);
        
        setUnreadCount(count || 0);
      } catch (e) {
        console.warn('Nav notif count error:', e);
      }
    };
    load();
    
    const channel = supabase
      .channel('bottom-nav-notif')
      .on('postgres_changes', { 
        event: '*', schema: 'public', table: 'notifications' 
      }, load)
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);

  const go = (path: string) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  };

  const items = [
    { path: '/', label: 'الرئيسية', icon: Home },
    { path: '/feed', label: 'المنشورات', icon: MessageSquare },
    { path: '/notifications', label: 'التنبيهات', icon: Bell },
    { path: '/account', label: 'الملف الشخصي', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-[#2F3336] pb-[env(safe-area-inset-bottom,0px)]"
      dir="rtl"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || 
            (item.path !== '/' && currentPath.startsWith(item.path));
          const isNotifications = item.path === '/notifications';
          
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive ? 'text-[#1D9BF0]' : 'text-[#71767B] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
