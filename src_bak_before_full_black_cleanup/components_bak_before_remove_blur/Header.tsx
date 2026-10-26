import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { YRLogo } from './common/YRLogo';
import { AuthModal } from './auth/AuthModal';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigateHome?: () => void;
  onNavigateNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateNotifications,
  unreadNotificationsCount = 0,
}) => {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationsCount);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔔 عداد الإشعارات (DB + Realtime)
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
        console.warn('Header count error:', e);
      }
    };
    load();
    
    const channel = supabase
      .channel('header-notif-badge')
      .on('postgres_changes', { 
        event: '*', schema: 'public', table: 'notifications' 
      }, load)
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAccountClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/account');
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div dir="rtl" className="w-full max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between font-['Tahoma',sans-serif]">
        {/* اليمين: القائمة + الشعار */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="text-white hover:text-[#FFC500] transition-colors p-1"
            title="القائمة"
          >
            <Menu size={24} className="stroke-[2.5]" />
          </button>
          <div onClick={onNavigateHome} className="cursor-pointer">
            <YRLogo />
          </div>
        </div>

        {/* اليسار: بحث + حسابي + جرس */}
        <div className="flex items-center gap-2">
          {/* 🆕 زر البحث */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="text-zinc-200 hover:text-[#FFC500] transition-colors p-1.5"
            title="بحث"
          >
            <Search size={20} className="stroke-[2.2]" />
          </button>

          {/* زر حسابي */}
          <button
            type="button"
            onClick={handleAccountClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-[#FFC500] border border-yellow-500/30 transition-all text-xs font-bold"
            title="حسابي"
          >
            <User size={18} className="stroke-[2.2]" />
            <span className="hidden sm:inline">حسابي</span>
          </button>

          {/* 🔔 جرس الإشعارات */}
          <button
            type="button"
            onClick={onNavigateNotifications}
            className="text-zinc-200 hover:text-[#FFC500] transition-colors p-1 relative"
            title="الإشعارات"
          >
            <Bell size={21} className="stroke-[2.2]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#DC2626] text-white text-[10px] font-black flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 🆕 نافذة البحث */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black  flex items-start justify-center pt-20 p-4"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#16181C] border border-[#2F3336] rounded-2xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-white text-sm">البحث</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مستخدم، منشور، منشأة..."
                  autoFocus
                  className="w-full pr-10 pl-3 py-2.5 bg-black border border-[#2F3336] rounded-xl text-white text-sm focus:border-[#1D9BF0] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-3 py-2.5 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white rounded-xl text-sm font-bold transition"
              >
                بحث
              </button>
            </form>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
