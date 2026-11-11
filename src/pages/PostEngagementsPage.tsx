import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Repeat2, Edit3, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { XActionBar } from '../components/feed/XActionBar';
import { XImagePlayer } from '../components/feed/XImagePlayer';
import { XVideoPlayer } from '../components/feed/XVideoPlayer';
import { VerifiedBadge } from '../components/common/VerifiedBadge'; 
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';

export default function PostEngagementsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // التحديد الافتراضي: الاقتباسات
  const [activeTab, setActiveTab] = useState<'quotes' | 'reposts'>('quotes');
  
  const [repostUsers, setRepostUsers] = useState<any[]>([]);
  const [quoteTweets, setQuoteTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const [expandedTweets, setExpandedTweets] = useState<any>({});
  const [viewingImagePost, setViewingImagePost] = useState<any>(null);
  const [viewingDetailTweet, setViewingDetailTweet] = useState<any>(null);
  const [repostMenu, setRepostMenu] = useState<any>(null);
  const myAvatar = '';

  // متغيرات الشريط السفلي
  const [showNav, setShowNav] = useState(true);

  // متغيرات السحب السلس
  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => alert(msg);
  const handleLike = () => {};
  const openAuthorProfile = (authorId: string) => { if(authorId) navigate(`/account?id=${authorId}`); };
  const formatTimeAgo = (date: string) => { return 'الآن'; };

  // دالة إخفاء وإظهار الشريط السفلي (مضمونة)
  
  
  


  // مزامنة التبويبات مع السحب
  const handleTabScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = Math.abs(e.currentTarget.scrollLeft);
    const width = e.currentTarget.clientWidth;
    if (scrollLeft > width / 2) {
      setActiveTab('reposts'); // في RTL، السحب لليسار يظهر التبويب الثاني
    } else {
      setActiveTab('quotes');
    }
  };

  // الانتقال السلس عند الضغط على التبويب
  const scrollToTab = (tab: 'reposts' | 'quotes') => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    // في RTL: التبويب الأول (الاقتباسات) هو 0، والثاني (إعادة النشر) هو -width
    const scrollX = tab === 'quotes' ? 0 : -width;
    containerRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });
    setActiveTab(tab);
  };

  // عند فتح الصفحة، تأكد من أننا في تبويب الاقتباسات
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0; // 0 في RTL يعني العنصر الأول (الاقتباسات)
    }
  }, [loading]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', session.user.id);
        if (follows) {
          setFollowingIds(new Set(follows.map(f => f.following_id)));
        }
      }
    });
  }, []);

  const handleFollowToggle = async (targetUserId: string) => {
    if (!currentUserId) {
      showToast('يرجى تسجيل الدخول أولاً');
      return;
    }
    const isFollowing = followingIds.has(targetUserId);
    
    setFollowingIds(prev => {
      const next = new Set(prev);
      if (isFollowing) next.delete(targetUserId);
      else next.add(targetUserId);
      return next;
    });

    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', targetUserId);
      } else {
        await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetUserId });
      }
    } catch (err) {
      console.error(err);
      setFollowingIds(prev => {
        const next = new Set(prev);
        if (!isFollowing) next.delete(targetUserId);
        else next.add(targetUserId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (!id) return;
    const cleanId = id.replace('repost-', '');
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: postData } = await supabase.from('posts').select('*').eq('id', cleanId).single();
        const { data: engagements } = await supabase.from('post_reposts').select('user_id, quote_text, created_at').eq('post_id', cleanId).order('created_at', { ascending: false });

        const all = engagements || [];
        
        const quotesData = all.filter(r => r.quote_text && r.quote_text.trim() !== '');
        const plainReposts = all.filter(r => !r.quote_text || r.quote_text.trim() === '');

        const userIds = [...new Set([...all.map(r => r.user_id), postData?.user_id])].filter(Boolean);
        let profilesMap: any = {};
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
          profiles?.forEach(p => profilesMap[p.id] = p);
        }

        const originalAuthor = profilesMap[postData.user_id];

        setRepostUsers(plainReposts.map(r => ({ 
          ...r, 
          profile: profilesMap[r.user_id] 
        })));

        const formattedQuotes = quotesData.map(r => {
          const reposter = profilesMap[r.user_id] || {};
          return {
            id: `repost-${r.id}`, 
            isRepost: true, 
            quote_text: r.quote_text, 
            reposterName: reposter.full_name || 'مستخدم',
            authorId: r.user_id, 
            authorName: reposter.full_name || 'مستخدم', 
            authorUsername: reposter.username || 'user',
            authorAvatar: reposter.avatar_url || '', 
            badgeType: reposter.verification_type || (reposter.is_verified ? 'blue' : null),
            text: r.quote_text,
            likes: postData?.likes_count || 0,
            views: postData?.views_count || 0,
            replies: postData?.comments_count || 0,
            reposts: postData?.reposts_count || 0,
            original: { 
              id: postData.id, 
              authorId: postData.user_id, 
              authorName: originalAuthor?.full_name || 'مستخدم', 
              authorUsername: originalAuthor?.username || 'user', 
              authorAvatar: originalAuthor?.avatar_url || '', 
              text: postData.content, 
              image: postData.image_url,
              video_url: postData.video_url,
              createdAt: formatTimeAgo(r.created_at) 
            },
            createdAt: r.created_at,
          };
        });
        setQuoteTweets(formattedQuotes);

      } catch (err) { console.error(err); }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden" dir="rtl">
      
      <div className="flex-1 overflow-y-auto pb-24">
        
        <div className="flex items-center justify-between px-4 py-2 bg-black">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowRight size={20} /></button>
            <h1 className="font-bold text-[20px]">مشاركات المنشور</h1>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowUpDown size={20} /></button>
        </div>
        
        <div className="flex border-b border-[#2F3336] bg-black sticky top-0 z-50">
          <button 
            onClick={() => scrollToTab('quotes')} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className={`flex-1 py-4 text-center font-bold text-[15px] bg-transparent border-none outline-none transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'quotes' ? 'text-white' : 'text-[#71767B]'}`}
          >
            <Edit3 size={18} /> الاقتباسات {quoteTweets.length > 0 ? <span className="text-[#71767B] text-[13px]">{quoteTweets.length}</span> : <span className="text-[#71767B] text-lg leading-none">.</span>}
            {activeTab === 'quotes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] bg-white rounded-full w-32"></div>}
          </button>
          <button 
            onClick={() => scrollToTab('reposts')} 
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className={`flex-1 py-4 text-center font-bold text-[15px] bg-transparent border-none outline-none transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'reposts' ? 'text-white' : 'text-[#71767B]'}`}
          >
            <Repeat2 size={18} /> أعيد النشر من قبل {repostUsers.length > 0 ? <span className="text-[#71767B] text-[13px]">{repostUsers.length}</span> : <span className="text-[#71767B] text-lg leading-none">.</span>}
            {activeTab === 'reposts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[4px] bg-white rounded-full w-32"></div>}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div 
            ref={containerRef}
            onScroll={handleTabScroll}
            className="flex overflow-x-auto snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* الشاشة الأولى (الاقتباسات) - في RTL تأتي على اليسار */}
            <div className="min-w-full snap-start">
              {quoteTweets.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-12 px-8 text-center">
                  <h3 className="text-white font-extrabold text-[24px] mb-2">لا توجد اقتباسات حتى الآن</h3>
                </div>
              ) : (
                quoteTweets.map(tweet => (
                  <article key={tweet.id} className="px-4 pt-3 pb-2.5 hover:bg-white/[0.02] cursor-pointer transition select-none border-b border-[#2F3336]/40">
                    <div className="flex gap-3">
                      <button onClick={() => openAuthorProfile(tweet.authorId)} className="shrink-0 self-start">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center font-bold shrink-0 text-white text-lg">
                          {tweet.authorAvatar ? <img src={tweet.authorAvatar} alt={tweet.authorName} className="w-full h-full object-cover" /> : <span>{tweet.authorName ? tweet.authorName[0] : '؟'}</span>}
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" dir="rtl">
                            <span onClick={() => openAuthorProfile(tweet.authorId)} className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer flex items-center gap-0.5 truncate shrink-0 max-w-[130px] sm:max-w-[180px]">
                              <span className="truncate">{tweet.authorName}</span>
                              {tweet.badgeType && <VerifiedBadge type={tweet.badgeType as any} size={14.5} />}
                            </span>
                            <span className="text-[11.5px] text-[#71767B] font-normal truncate min-w-0 shrink" dir="ltr">@{tweet.authorUsername?.replace(/@.*$/, "")}</span>
                            <span className="text-[10.5px] text-[#71767B] shrink-0 mx-0.5">·</span>
                            <span className="text-[10.5px] text-[#71767B] font-normal shrink-0 whitespace-nowrap">{formatTimeAgo(tweet.createdAt)}</span>
                          </div>
                        </div>

                        {tweet.quote_text && (
                          <div className="mt-2">
                            <p className={`text-[15px] leading-[1.5] text-[#E7E9EA] whitespace-pre-wrap ${expandedTweets[tweet.id] ? '' : 'line-clamp-6'}`}>
                              {tweet.quote_text}
                            </p>
                          </div>
                        )}

                        {tweet.original && (
                          <div className="mt-2.5 rounded-[12px] border border-white/[0.08] hover:bg-white/[0.02] transition cursor-pointer p-2.5 select-none overflow-hidden">
                            <div className="flex items-center gap-1.5 text-xs mb-1.5 overflow-hidden" dir="rtl">
                              <div onClick={() => openAuthorProfile(tweet.original?.authorId)} className="w-[18px] h-[18px] rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 cursor-pointer">
                                {tweet.original.authorAvatar ? (<img src={tweet.original.authorAvatar} alt="" className="w-full h-full object-cover" />) : (<span className="text-white text-[10px] font-bold flex items-center justify-center w-full h-full">{tweet.original.authorName?.[0]}</span>)}
                              </div>
                              <span onClick={() => openAuthorProfile(tweet.original?.authorId)} className="font-bold text-[#E7E9EA] truncate text-[13px] hover:underline cursor-pointer">{tweet.original.authorName}</span>
                              <span className="text-[#71767B] truncate text-[12px]" dir="ltr">@{tweet.original.authorUsername}</span>
                            </div>
                            <p className={`text-[13px] text-[#E7E9EA] leading-[1.38] whitespace-pre-wrap ${expandedTweets['orig-'+tweet.id] ? '' : 'line-clamp-4'}`}>
                              {tweet.original.text}
                            </p>
                            
                            {tweet.original.image && (
                              <div className="mt-2.5 rounded-[10px] overflow-hidden max-h-60 bg-black cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingImagePost({ image: tweet.original.image, authorName: tweet.original.authorName, authorUsername: tweet.original.authorUsername, authorAvatar: tweet.original.authorAvatar, text: tweet.original.text }); }}>
                                <img src={tweet.original.image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            
                            {tweet.original.video_url && (
                              <div className="mt-2.5 rounded-[10px] overflow-hidden max-h-60 bg-black" onClick={e => e.stopPropagation()}>
                                <XVideoPlayer src={tweet.original.video_url} />
                              </div>
                            )}
                          </div>
                        )}

                        {tweet.image && !(tweet.video_url || tweet.video) && (
                          <div className="mt-3 rounded-2xl overflow-hidden border-0 max-h-96">
                            <img src={tweet.image} alt="صورة" className="w-full h-full object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingImagePost(tweet); }} />
                          </div>
                        )}

                        <XActionBar
                          tweet={tweet}
                          onReply={() => setViewingDetailTweet(tweet)}
                          onRepost={(t: any) => setRepostMenu(t)}
                          onLike={() => handleLike(tweet.id)}
                          onBookmark={() => showToast("تمت الإضافة إلى العلامات المرجعية 🔖")}
                          onShare={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(window.location.href);
                              showToast('تم نسخ الرابط');
                            }
                          }}
                          onViewEngagements={() => {}}
                          currentUserId={currentUserId}
                        />
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* الشاشة الثانية (إعادة النشر) - في RTL تأتي على اليمين */}
            <div className="min-w-full snap-start">
              {repostUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-12 px-8 text-center">
                  <h3 className="text-white font-extrabold text-[24px] mb-2">لا يوجد من أعاد النشر بعد</h3>
                </div>
              ) : (
                repostUsers.map((item, idx) => {
                  const isFollowing = followingIds.has(item.user_id);
                  return (
                    <div key={idx} className="flex items-start justify-between px-4 py-3 border-b border-[#2F3336] hover:bg-white/[0.02] transition-colors" dir="rtl">
                      <div className="flex gap-3 w-full overflow-hidden">
                        <img 
                          src={item.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profile?.full_name || 'User')}&background=random`} 
                          onClick={() => openAuthorProfile(item.user_id)}
                          className="w-[40px] h-[40px] rounded-full object-cover shrink-0 cursor-pointer" 
                          alt="" 
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span onClick={() => openAuthorProfile(item.user_id)} className="text-white font-bold text-[14.5px] truncate hover:underline cursor-pointer">{item.profile?.full_name || 'مستخدم'}</span>
                            {(item.profile?.is_verified || item.profile?.verification_type) && (
                              <VerifiedBadge type={item.profile?.verification_type || 'blue'} size={14} />
                            )}
                          </div>
                          <span className="text-[#71767B] text-[14px] truncate">@{item.profile?.username || 'user'}</span>
                          {(item.profile?.bio || item.profile?.description) && (
                            <p className="text-[#E7E9EA] text-[13.5px] mt-0.5 line-clamp-2 leading-[1.3]">{item.profile?.bio || item.profile?.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 mr-3 self-center">
                        {item.user_id === currentUserId ? null : (
                          <button 
                            onClick={() => handleFollowToggle(item.user_id)} 
                            className={`font-bold text-[13px] px-3.5 py-1.5 rounded-full transition-colors ${isFollowing ? 'bg-transparent border border-[#536471] text-white hover:border-red-500 hover:bg-red-500/10 hover:text-red-500' : 'bg-white text-black hover:bg-gray-200'}`}
                          >
                            {isFollowing ? 'تتابع' : 'متابعة'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {viewingImagePost && (
        <XImagePlayer
          src={viewingImagePost.image}
          tweet={viewingImagePost}
          authorName={viewingImagePost.authorName}
          authorUsername={viewingImagePost.authorUsername}
          authorAvatar={viewingImagePost.authorAvatar}
          currentUserAvatar={myAvatar}
          onClose={() => setViewingImagePost(null)}
          onReply={() => {}}
          onLike={() => {}}
          onRepost={() => {}}
          onShare={() => {}}
        />
      )}

      {/* الشريط السفلي مع حركة الاختفاء المضمونة */}
      <div>
        <MobileBottomNav />
      </div>
    </div>
  );
}
