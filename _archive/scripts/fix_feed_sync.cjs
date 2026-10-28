const fs = require('fs');

const fileContent = `'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { uploadSocialImage } from '../services/socialService';
import {
  ArrowRight, Image as ImageIcon, Heart, MessageCircle, Repeat2,
  Share, Plus, X, Pin, CheckCircle2, TrendingUp, Home, MessageSquare,
  User, Flag, AlertTriangle, Send, Sparkles, Bell, Loader2
} from 'lucide-react';

const GLOBAL_FEED_KEY = 'yr_community_global_posts';
const USERS_DIR_KEY = 'yr_users_directory_v1';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface Tweet {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  image?: string;
  createdAt: string;
  isPinned?: boolean;
  likes: number;
  likedBy?: string[];
  reposts: number;
  repostedBy?: string[];
  views: number;
  comments?: Comment[];
}

export function CommunityFeedPage() {
  const navigate = useNavigate();

  // المستخدم الحالي والجلسة
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [myName, setMyName] = useState<string>('مستخدم');
  const [myUsername, setMyUsername] = useState<string>('user');
  const [myAvatar, setMyAvatar] = useState<string>('');

  // التغريدات
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // حقول النشر
  const [tweetText, setTweetText] = useState('');
  const [tweetImageFile, setTweetImageFile] = useState<File | null>(null);
  const [tweetImagePreview, setTweetImagePreview] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // التعليقات
  const [activeCommentTweet, setActiveCommentTweet] = useState<Tweet | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // البلاغات
  const [reportingTweet, setReportingTweet] = useState<Tweet | null>(null);
  const [reportReason, setReportReason] = useState('محتوى غير لائق أو مسيء');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // التنبيهات
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. مزامنة الجلسة بدقة فائقة
  const syncUserSession = async (session: any) => {
    const user = session?.user || null;
    setCurrentUser(user);
    if (user) {
      setCurrentUserId(user.id);
      const meta = user.user_metadata || {};
      const fallbackName = meta.full_name || meta.name || user.email?.split('@')[0] || 'مستخدم يمن ريتنج';
      const fallbackUsername = meta.username || user.email?.split('@')[0] || `user_${user.id.substring(0, 5)}`;
      const fallbackAvatar = meta.avatar_url || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${user.id}\`;

      setMyName(fallbackName);
      setMyUsername(fallbackUsername);
      setMyAvatar(fallbackAvatar);

      // استرجاع أحدث بيانات من جدول profiles
      try {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (prof) {
          if (prof.full_name && prof.full_name !== 'مستخدم جديد') setMyName(prof.full_name);
          if (prof.username && !prof.username.startsWith('user_')) setMyUsername(prof.username);
          if (prof.avatar_url) setMyAvatar(prof.avatar_url);
        }
      } catch (_) {}
    } else {
      setCurrentUserId('');
      setMyName('حساب زائر');
      setMyUsername('guest');
      setMyAvatar('https://api.dicebear.com/7.x/bottts/svg?seed=guest');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. تحميل جميع تغريدات المجتمع (تغريدات سابقة + سحابية)
  const loadAllTweets = async () => {
    setIsLoading(true);
    try {
      // قراءة التغريدات السابقة المحفوظة
      const localFeed: Tweet[] = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || '[]');

      // محاولة قراءة التغريدات من Supabase ودمجها
      let cloudTweets: Tweet[] = [];
      try {
        const { data: dbPosts } = await supabase
          .from('posts')
          .select(\`
            id, user_id, content, image_url, likes_count, comments_count, reposts_count, views_count, created_at,
            profile:profiles!posts_user_id_fkey (id, full_name, username, avatar_url, is_verified)
          \`)
          .order('created_at', { ascending: false });

        if (dbPosts && dbPosts.length > 0) {
          cloudTweets = dbPosts.map((p: any) => ({
            id: p.id,
            authorId: p.user_id,
            authorName: p.profile?.full_name || 'مستخدم يمن ريتنج',
            authorUsername: p.profile?.username || 'user',
            authorAvatar: p.profile?.avatar_url || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${p.user_id}\`,
            text: p.content,
            image: p.image_url || undefined,
            createdAt: new Date(p.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
            likes: p.likes_count || 0,
            likedBy: [],
            reposts: p.reposts_count || 0,
            views: p.views_count || 1,
            comments: []
          }));
        }
      } catch (e) {
        console.warn('Could not fetch cloud posts, showing local:', e);
      }

      // دمج التغريدات السحابية والمحلية بدون تكرار
      const seenIds = new Set<string>();
      const combined: Tweet[] = [];

      for (const t of cloudTweets) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          combined.push(t);
        }
      }

      for (const t of localFeed) {
        if (!seenIds.has(t.id)) {
          seenIds.add(t.id);
          combined.push(t);
        }
      }

      setTweets(combined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllTweets();
  }, []);

  // 3. اختيار صورة للتغريدة
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، اختر صورة أقل من 4 ميجابايت');
      return;
    }

    setTweetImageFile(file);
    setTweetImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setTweetImageFile(null);
    setTweetImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 4. نشر التغريدة سحابياً ومحلياً
  const handlePostTweet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('يرجى تسجيل الدخول أو النقر على "حسابي" أولاً للتغريد');
      return;
    }

    const trimmed = tweetText.trim();
    if (!trimmed && !tweetImageFile) {
      showToast('يرجى كتابة نص التغريدة أو إرفاق صورة أولاً');
      return;
    }

    if (tweetText.length > 280) {
      showToast('تجاوزت الحد الأقصى (280 حرفاً)');
      return;
    }

    setIsPosting(true);
    try {
      let uploadedUrl: string | undefined = undefined;

      // رفع الصورة سحابياً إن وجدت
      if (tweetImageFile) {
        try {
          showToast('جاري رفع صورة التغريدة... ⏳');
          uploadedUrl = await uploadSocialImage(tweetImageFile, 'tweets');
        } catch (upErr: any) {
          console.warn('Storage upload error, continuing:', upErr);
        }
      }

      const activeUserId = currentUser?.id || currentUserId || \`user_\${Date.now()}\`;
      const tweetId = Date.now().toString();

      const newTweet: Tweet = {
        id: tweetId,
        authorId: activeUserId,
        authorName: myName,
        authorUsername: myUsername,
        authorAvatar: myAvatar,
        text: tweetText,
        image: uploadedUrl || tweetImagePreview || undefined,
        createdAt: 'الآن',
        likes: 0,
        likedBy: [],
        reposts: 0,
        views: 1,
        comments: []
      };

      // إضافة المنشور في الواجهة والمحلي فوراً
      const updated = [newTweet, ...tweets];
      setTweets(updated);
      try {
        localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(updated.slice(0, 50)));
      } catch (_) {}

      // حفظ في جدول posts في Supabase
      if (currentUser?.id) {
        supabase.from('posts').insert({
          id: tweetId.length > 30 ? tweetId : undefined,
          user_id: currentUser.id,
          content: tweetText,
          image_url: uploadedUrl || null
        }).then(() => {});
      }

      setTweetText('');
      clearImage();
      showToast('تم نشر تغريدتك في خلاصة المجتمع بنجاح! 🚀');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء النشر');
    } finally {
      setIsPosting(false);
    }
  };

  // 5. الإعجاب
  const handleLike = (id: string) => {
    const activeUid = currentUserId || 'guest';
    const updated = tweets.map(t => {
      if (t.id === id) {
        const likedBy = t.likedBy || [];
        const isLiked = likedBy.includes(activeUid);
        const nextLikedBy = isLiked ? likedBy.filter(u => u !== activeUid) : [...likedBy, activeUid];
        return {
          ...t,
          likes: nextLikedBy.length,
          likedBy: nextLikedBy
        };
      }
      return t;
    });

    setTweets(updated);
    try {
      localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(updated.slice(0, 50)));
    } catch (_) {}

    // محاولة حفظ في Supabase
    if (currentUser?.id) {
      supabase.from('post_likes').insert({ post_id: id, user_id: currentUser.id }).catch(() => {
        supabase.from('post_likes').delete().match({ post_id: id, user_id: currentUser.id }).catch(() => {});
      });
    }
  };

  // 6. إضافة تعليق
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentTweet) return;

    if (newCommentText.length > 280) {
      showToast('التعليق يجب أن لا يتجاوز 280 حرفاً');
      return;
    }

    const commentObj: Comment = {
      id: Date.now().toString(),
      authorId: currentUserId || 'guest',
      authorName: myName,
      authorUsername: myUsername,
      authorAvatar: myAvatar,
      text: newCommentText.trim(),
      createdAt: 'الآن'
    };

    const updated = tweets.map(t => {
      if (t.id === activeCommentTweet.id) {
        const nextComments = [...(t.comments || []), commentObj];
        return {
          ...t,
          comments: nextComments
        };
      }
      return t;
    });

    setTweets(updated);
    try {
      localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(updated.slice(0, 50)));
    } catch (_) {}

    const freshTarget = updated.find(t => t.id === activeCommentTweet.id);
    if (freshTarget) setActiveCommentTweet(freshTarget);

    // حفظ في Supabase
    if (currentUser?.id) {
      supabase.from('post_comments').insert({
        post_id: activeCommentTweet.id,
        user_id: currentUser.id,
        content: newCommentText.trim()
      }).catch(() => {});
    }

    setNewCommentText('');
    showToast('تم نشر تعليقك بنجاح! 💬');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 md:pb-8 selection:bg-amber-500/20" dir="rtl">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black px-5 py-2.5 rounded-full font-bold shadow-2xl flex items-center gap-2 border border-amber-400 text-xs md:text-sm animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الشريط العلوي الثابت */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-zinc-800/80 rounded-full transition text-zinc-400 hover:text-white"
              title="رجوع"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-amber-500 text-xl font-black">X</span>
              <span>خلاصة المجتمع</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 hover:bg-zinc-800/80 rounded-full transition text-zinc-400 hover:text-white"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/account')}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-full border border-zinc-700 text-xs font-bold transition"
            >
              <img src={myAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span>{myName.split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-2xl mx-auto border-x border-zinc-800 min-h-screen">
        
        {/* مربع كتابة التغريدة */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/40">
          <form onSubmit={handlePostTweet}>
            <div className="flex gap-3">
              <img
                src={myAvatar}
                alt={myName}
                className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  placeholder="ماذا يحدث في السوق والشركات اليمنية اليوم؟"
                  rows={3}
                  className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none resize-none"
                />

                {/* معاينة الصورة المرفقة */}
                {tweetImagePreview && (
                  <div className="relative mt-2 mb-3 rounded-xl overflow-hidden border border-zinc-800 max-h-72 bg-black">
                    <img
                      src={tweetImagePreview}
                      alt="مرفق التغريدة"
                      className="w-full h-auto object-cover max-h-72"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 left-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* شريط الأدوات والعداد */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-850 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-full transition flex items-center justify-center"
                      title="إرفاق صورة"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-mono">
                      <span className={tweetText.length > 280 ? 'text-rose-500 font-bold' : tweetText.length > 250 ? 'text-amber-400 font-semibold' : 'text-zinc-500'}>
                        {tweetText.length}
                      </span>
                      <span className="text-zinc-600">/ 280</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isPosting || tweetText.length > 280 || (!tweetText.trim() && !tweetImageFile)}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-4 py-1.5 rounded-full text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري النشر...</span>
                        </>
                      ) : (
                        <span>تغريد</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* قائمة التغريدات */}
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">جاري تحميل خلاصة المجتمع...</p>
          </div>
        ) : tweets.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
            <MessageSquare className="w-12 h-12 text-zinc-700" />
            <p className="text-sm font-bold text-zinc-400">لا توجد تغريدات حتى الآن</p>
            <p className="text-xs text-zinc-600">كن أول من ينشر تغريدة في مجتمع يمن ريتنج!</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {tweets.map(t => {
              const isLiked = t.likedBy?.includes(currentUserId || 'guest') || false;
              const commentsCount = t.comments?.length || 0;

              return (
                <article key={t.id} className="p-4 hover:bg-zinc-950/60 transition flex gap-3">
                  <img
                    src={t.authorAvatar || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${t.authorId}\`}
                    alt={t.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-800 shrink-0 cursor-pointer"
                    onClick={() => navigate(\`/account?userId=\${t.authorId}\`)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          onClick={() => navigate(\`/account?userId=\${t.authorId}\`)}
                          className="font-bold text-sm text-white hover:underline cursor-pointer"
                        >
                          {t.authorName}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono" dir="ltr">@{t.authorUsername}</span>
                        <span className="text-zinc-600 text-xs">·</span>
                        <span className="text-xs text-zinc-500">{t.createdAt}</span>
                      </div>

                      <button
                        onClick={() => setReportingTweet(t)}
                        className="text-zinc-600 hover:text-rose-400 p-1 rounded-full transition"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-zinc-200 leading-relaxed break-words whitespace-pre-line">
                      {t.text}
                    </p>

                    {t.image && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800 max-h-96 bg-black">
                        <img
                          src={t.image}
                          alt="مرفق المنشور"
                          loading="lazy"
                          className="w-full h-auto object-cover max-h-96"
                        />
                      </div>
                    )}

                    {/* أزرار التفاعل */}
                    <div className="flex items-center justify-between mt-3 text-zinc-500 text-xs max-w-md pt-1">
                      <button
                        onClick={() => setActiveCommentTweet(t)}
                        className="flex items-center gap-1.5 hover:text-sky-400 group transition"
                      >
                        <div className="p-1.5 group-hover:bg-sky-500/10 rounded-full transition">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span>{commentsCount}</span>
                      </button>

                      <button
                        onClick={() => showToast('ميزة إعادة النشر قيد التطوير')}
                        className="flex items-center gap-1.5 hover:text-emerald-400 group transition"
                      >
                        <div className="p-1.5 group-hover:bg-emerald-500/10 rounded-full transition">
                          <Repeat2 className="w-4 h-4" />
                        </div>
                        <span>{t.reposts || 0}</span>
                      </button>

                      <button
                        onClick={() => handleLike(t.id)}
                        className={\`flex items-center gap-1.5 group transition \${isLiked ? 'text-rose-500' : 'hover:text-rose-500'}\`}
                      >
                        <div className="p-1.5 group-hover:bg-rose-500/10 rounded-full transition">
                          <Heart className={\`w-4 h-4 \${isLiked ? 'fill-rose-500 text-rose-500' : ''}\`} />
                        </div>
                        <span>{t.likes || 0}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(window.location.href);
                            showToast('تم نسخ رابط المنشور! 🔗');
                          }
                        }}
                        className="flex items-center gap-1.5 hover:text-amber-400 group transition"
                      >
                        <div className="p-1.5 group-hover:bg-amber-500/10 rounded-full transition">
                          <Share className="w-4 h-4" />
                        </div>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* نافذة التعليقات */}
      {activeCommentTweet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-500" />
                <span>الردود والتعليقات ({activeCommentTweet.comments?.length || 0})</span>
              </h3>
              <button
                onClick={() => setActiveCommentTweet(null)}
                className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 divide-y divide-zinc-800 space-y-3">
              {(activeCommentTweet.comments || []).length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  لا توجد ردود بعد. شارك برأيك أولاً!
                </div>
              ) : (
                activeCommentTweet.comments?.map(c => (
                  <div key={c.id} className="pt-3 first:pt-0 flex gap-2.5">
                    <img
                      src={c.authorAvatar || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${c.authorId}\`}
                      alt={c.authorName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-zinc-200">{c.authorName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono" dir="ltr">@{c.authorUsername}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-300 break-words">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-zinc-800 bg-zinc-950">
              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="اكتب ردك... (بحد أقصى 280 حرفاً)"
                  maxLength={280}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <div className="text-[10px] text-zinc-500 font-mono">{newCommentText.length}/280</div>
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || newCommentText.length > 280}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black p-2 rounded-full transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityFeedPage;
`;

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', fileContent, 'utf8');
console.log('COMMUNITY_FEED_RESTORED_AND_SYNCED_SUCCESSFULLY');
