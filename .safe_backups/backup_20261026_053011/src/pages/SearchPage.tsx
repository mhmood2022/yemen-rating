import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, X, SlidersHorizontal, User, Sparkles, Clock, Users, Image as ImageIcon, Heart, MessageCircle, Repeat2, Share, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type FilterType = 'top' | 'latest' | 'people' | 'media';

interface UserResult {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  is_verified?: boolean;
}

interface PostResult {
  id: string;
  content: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  reposts_count?: number;
  author?: UserResult;
}

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('top');
  const [users, setUsers] = useState<UserResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  // دالة البحث
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      setHasSearched(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      const searchTerm = `%${query}%`;

      try {
        // 1. البحث في المستخدمين (profiles)
        if (filter === 'top' || filter === 'latest' || filter === 'people') {
          const { data: usersData } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, is_verified')
            .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
            .limit(10);
          setUsers(usersData || []);
        } else {
          setUsers([]);
        }

        // 2. البحث في المنشورات (posts)
        if (filter === 'top' || filter === 'latest' || filter === 'media') {
          let postQuery = supabase
            .from('posts')
            .select('id, content, image_url, user_id, created_at')
            .ilike('content', searchTerm)
            .limit(15);

          if (filter === 'media') {
            postQuery = postQuery.not('image_url', 'is', null);
          }

          if (filter === 'latest') {
            postQuery = postQuery.order('created_at', { ascending: false });
          }

          const { data: postsData } = await postQuery;

          if (postsData && postsData.length > 0) {
            const userIds = [...new Set(postsData.map(p => p.user_id))];
            const { data: authorsData } = await supabase
              .from('profiles')
              .select('id, full_name, username, avatar_url, is_verified')
              .in('id', userIds);

            const postsWithAuthors = postsData.map(post => ({
              ...post,
              author: authorsData?.find(a => a.id === post.user_id)
            }));
            setPosts(postsWithAuthors);
          } else {
            setPosts([]);
          }
        } else {
          setPosts([]);
        }

      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, filter]);

  // تنسيق التاريخ
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('ar-EG', { month: 'short' })}`;
  };

  // التبويبات
  const tabs = [
    { id: 'top', label: 'الأعلى', icon: Sparkles },
    { id: 'latest', label: 'الأحدث', icon: Clock },
    { id: 'people', label: 'الأشخاص', icon: Users },
    { id: 'media', label: 'الوسائط', icon: ImageIcon },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-black text-white font-['Tahoma',sans-serif] pb-24" style={{ fontFamily: 'Tahoma, sans-serif' }}>
      {/* الشريط العلوي الثابت */}
      <div className="sticky top-0 bg-black z-20 border-b border-[#2F3336]">
        {/* شريط البحث */}
        <div className="flex items-center gap-2 p-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#111111] rounded-full transition">
            <ArrowRight size={20} className="text-white" />
          </button>
          <div className="flex-1 relative flex items-center bg-[#111111] rounded-full px-3 py-2 border border-transparent focus-within:border-[#2F3336] transition">
            <Search size={18} className="text-zinc-500 mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في يمن ريتنج..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-[#2F3336] rounded-full transition">
                <X size={16} className="text-zinc-500" />
              </button>
            )}
          </div>
          <button className="p-2 hover:bg-[#111111] rounded-full transition">
            <SlidersHorizontal size={20} className="text-[#FFC500]" />
          </button>
        </div>

        {/* تبويبات التصفية */}
        <div className="flex items-center overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={`relative flex-1 min-w-[90px] flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC500] rounded-t-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* حالة التحميل */}
      {loading && <div className="text-center py-10 text-zinc-500 text-sm">جاري البحث...</div>}

      {/* لا توجد نتائج */}
      {!loading && hasSearched && users.length === 0 && posts.length === 0 && (
        <div className="text-center py-20 text-zinc-500 text-sm px-4">
          لا توجد نتائج مطابقة لـ "{query}"
        </div>
      )}

      {/* عرض النتائج */}
      {!loading && (users.length > 0 || posts.length > 0) && (
        <div>
          {/* قسم الأشخاص (يظهر فقط في تبويب الأشخاص أو الأعلى) */}
          {(filter === 'top' || filter === 'people') && users.length > 0 && (
            <div className="border-b border-[#2F3336]">
              {filter === 'top' && <h3 className="px-4 py-3 text-lg font-bold">أشخاص</h3>}
              {users.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => navigate(`/account?id=${user.id}`)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#080808] cursor-pointer transition border-b border-[#2F3336] last:border-0"
                >
                  <div className="w-12 h-12 rounded-full bg-[#2F3336] overflow-hidden shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><User size={24} className="text-zinc-500" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-[15px] font-bold text-white truncate">{user.full_name}</p>
                      {user.is_verified && <BadgeCheck size={16} className="text-[#FFC500] shrink-0" />}
                    </div>
                    <p className="text-[14px] text-zinc-500 truncate">@{user.username}</p>
                  </div>
                  <button className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded-full hover:bg-gray-200 transition">
                    متابعة
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* قسم المنشورات */}
          {(filter === 'top' || filter === 'latest' || filter === 'media') && posts.length > 0 && (
            <div>
              {filter === 'top' && posts.length > 0 && <h3 className="px-4 py-3 text-lg font-bold">منشورات</h3>}
              {posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/feed?postId=${post.id}`)}
                  className="px-4 py-3 border-b border-[#2F3336] hover:bg-[#080808] cursor-pointer transition"
                >
                  {/* رأس المنشور */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#2F3336] overflow-hidden shrink-0">
                      {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><User size={20} className="text-zinc-500" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-bold text-white truncate">{post.author?.full_name || 'مستخدم'}</span>
                        {post.author?.is_verified && <BadgeCheck size={14} className="text-[#FFC500] shrink-0" />}
                        <span className="text-zinc-500 truncate">@{post.author?.username || 'user'}</span>
                        <span className="text-zinc-500">·</span>
                        <span className="text-zinc-500">{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                    <MoreHorizontal size={18} className="text-zinc-500 shrink-0" />
                  </div>

                  {/* محتوى المنشور */}
                  <p className="text-[15px] leading-[1.5] text-[#E7E9EA] mb-3 whitespace-pre-wrap">{post.content}</p>

                  {/* صورة المنشور */}
                  {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-[#2F3336] mt-2 mb-3">
                      <img src={post.image_url} alt="مرفق" className="w-full h-auto max-h-80 object-cover" />
                    </div>
                  )}

                  {/* أزرار التفاعل */}
                  <div className="flex items-center justify-between text-zinc-500 max-w-md">
                    <button className="flex items-center gap-1 hover:text-[#FFC500] transition"><MessageCircle size={18} /><span className="text-xs">{post.comments_count || 0}</span></button>
                    <button className="flex items-center gap-1 hover:text-[#00BA7C] transition"><Repeat2 size={18} /><span className="text-xs">{post.reposts_count || 0}</span></button>
                    <button className="flex items-center gap-1 hover:text-[#F91880] transition"><Heart size={18} /><span className="text-xs">{post.likes_count || 0}</span></button>
                    <button className="flex items-center gap-1 hover:text-[#FFC500] transition"><Share size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* الحالة الابتدائية */}
      {!hasSearched && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <Search size={48} className="text-[#2F3336] mb-4" />
          <p className="text-[20px] text-white font-bold mb-1">ابحث في يمن ريتنج</p>
          <p className="text-[15px] text-zinc-500">جرب البحث عن أشخاص، كلمات مفتاحية، أو وسائط.</p>
        </div>
      )}
    </div>
  );
};
