import React, { useState, useEffect } from 'react';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MobileBottomNav } from '../../components/navigation/MobileBottomNav';

interface FollowUser {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  is_verified?: boolean;
  is_following?: boolean;
  follows_me?: boolean;
}

export default function FollowersPage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') || 'followers') as 'followers' | 'following';
  
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetName, setTargetName] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!username) return;
    (async () => {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
      const col = isUUID ? 'id' : 'username';
      
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .eq(col, username)
        .single();
      
      if (data) {
        setTargetUserId(data.id);
        setTargetName(data.full_name || username);
        
        const [f1, f2] = await Promise.all([
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', data.id),
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', data.id),
        ]);
        setFollowersCount(f1.count || 0);
        setFollowingCount(f2.count || 0);
      }
    })();
  }, [username]);

  useEffect(() => {
    if (!targetUserId) return;
    
    (async () => {
      setLoading(true);
      try {
        const whereCol = activeTab === 'followers' ? 'following_id' : 'follower_id';
        const selectCol = activeTab === 'followers' ? 'follower_id' : 'following_id';
        
        const { data: rows } = await supabase
          .from('follows')
          .select(selectCol)
          .eq(whereCol, targetUserId);
        
        if (!rows || rows.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }
        
        const ids = rows.map((r: any) => r[selectCol]);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, bio, is_verified')
          .in('id', ids);
        
        const allFollows: { follower_id: string; following_id: string }[] = [];
        if (currentUserId) {
          const { data: myF } = await supabase
            .from('follows')
            .select('follower_id, following_id');
          (myF || []).forEach((f: any) => allFollows.push(f));
        }
        
        const myFollowingIds = allFollows
          .filter(f => f.follower_id === currentUserId)
          .map(f => f.following_id);
        
        const list = (profiles || []).map((p: any) => ({
          id: p.id,
          full_name: p.full_name || 'مستخدم',
          username: p.username || 'user',
          avatar_url: p.avatar_url || '',
          bio: p.bio || '',
          is_verified: p.is_verified,
          verification_type: p.verification_type,
          is_following: myFollowingIds.includes(p.id),
          follows_me: allFollows.some(f => f.follower_id === p.id && f.following_id === currentUserId),
        }));
        
        setUsers(list);
      } catch (e) {
        console.warn('fetch error:', e);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [targetUserId, activeTab, currentUserId]);

  const handleToggle = async (userId: string, currently: boolean) => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    try {
      if (currently) {
        await supabase.from('follows').delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);
      } else {
        await supabase.from('follows').insert({
          follower_id: currentUserId,
          following_id: userId,
        });
      }
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_following: !currently } : u
      ));
    } catch (e) {
      console.warn('toggle failed:', e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-['Cairo',sans-serif] pb-20" dir="rtl">
      <div className="sticky top-0 z-10 bg-black  border-b border-[#2F3336]">
        <div className="px-4 py-2 flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -mr-2 hover:bg-[#181818] rounded-full transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg leading-tight">{targetName || username}</h1>
            <p className="text-xs text-[#71767B]">{followersCount + followingCount} متابع</p>
          </div>
        </div>

        <div className="flex">
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-4 text-sm font-bold transition relative ${
              activeTab === 'followers' ? 'text-white' : 'text-[#71767B] hover:bg-[#181818]'
            }`}
          >
            المتابعون
            <span className="text-[#71767B] font-normal mr-1">{followersCount}</span>
            {activeTab === 'followers' && (
              <div className="absolute bottom-0 right-1/4 left-1/4 h-1 bg-[#FFC500] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-4 text-sm font-bold transition relative ${
              activeTab === 'following' ? 'text-white' : 'text-[#71767B] hover:bg-[#181818]'
            }`}
          >
            المتابَعون
            <span className="text-[#71767B] font-normal mr-1">{followingCount}</span>
            {activeTab === 'following' && (
              <div className="absolute bottom-0 right-1/4 left-1/4 h-1 bg-[#FFC500] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#71767B]">جاري التحميل...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 px-4">
          <h2 className="text-[#E7E9EA] text-2xl font-black mb-2">لا يوجد أحد بعد</h2>
          <p className="text-[#71767B] text-sm">
            {activeTab === 'followers' 
              ? `عندما يتابعك أحد، سيظهر هنا.` 
              : `عندما تتابع أحداً، سيظهر هنا.`}
          </p>
        </div>
      ) : (
        <div>
          {users.map(u => (
            <div
              key={u.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-[#080808] transition border-b border-[#2F3336] cursor-pointer"
              onClick={() => navigate(`/u/${u.username}`)}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FFC500] flex-shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-white font-bold text-lg">
                    {u.full_name?.[0] || '؟'}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[15px] text-white truncate">
                    {u.full_name}
                  </span>
                  {(u.verification_type || u.is_verified) && (
                    <VerifiedBadge 
                      type={(u.verification_type || (u.is_verified ? 'blue' : null)) as any} 
                      size={16} 
                    />
                  )}
                </div>
                <div className="text-[15px] text-[#71767B] truncate">@{u.username}</div>
                {u.bio && (
                  <p className="text-[15px] text-[#E7E9EA] mt-0.5 line-clamp-2">{u.bio}</p>
                )}
                {u.follows_me && (
                  <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-[#16181C] rounded text-[11px] text-[#71767B]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    يتابعك
                  </div>
                )}
              </div>

              {currentUserId && currentUserId !== u.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(u.id, !!u.is_following);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition flex-shrink-0 ${
                    u.is_following
                      ? 'bg-transparent border border-[#536471] text-white hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'
                      : 'bg-white text-black hover:bg-[#E7E9EA]'
                  }`}
                >
                  {u.is_following ? 'متابَع' : 'متابعة'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    
      <MobileBottomNav onNavigate={(path) => navigate(path)} />
</div>
  );
}
