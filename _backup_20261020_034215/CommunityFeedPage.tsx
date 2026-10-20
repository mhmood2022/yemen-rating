'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  ArrowRight, Image as ImageIcon, Heart, MessageCircle, Repeat2, 
  Share, Plus, X, Pin, CheckCircle2, TrendingUp, Home, MessageSquare, 
  User, Flag, AlertTriangle, Send, ShieldAlert, Sparkles, Bell 
} from 'lucide-react';

interface Comment {
  id: string;
  image?: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface Tweet {
  id: string;
  createdAtDisplay?: string;
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


// دالة حفظ آمنة تحمي من QuotaExceededError وتضمن عدم امتلاء الذاكرة
const safeSetStorage = (key: string, data: any) => {
  try {
    let payload = data;
    // إذا كانت منشورات، نكتفي بأحدث 40 منشوراً لحماية المساحة
    if (Array.isArray(payload) && payload.length > 40) {
      payload = payload.slice(0, 40);
    }
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('Storage limit reached, auto-pruning...', err);
    try {
      // تفريغ المخلفات القديمة وحفظ الأحدث فقط
      if (Array.isArray(data)) {
        localStorage.setItem(key, JSON.stringify(data.slice(0, 20)));
      }
    } catch (_) {}
  }
};

const GLOBAL_FEED_KEY = 'yr_community_global_posts';
const USERS_DIR_KEY = 'yr_users_directory';
const REPORTS_KEY = 'yr_community_reports';

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'الآن';
    if (diffMin < 60) return `${diffMin}د`;
    if (diffHour < 24) return `${diffHour}س`;
    if (diffDay < 7) return `${diffDay}ي`;
    
    // أكثر من أسبوع — نعرض التاريخ
    return date.toLocaleDateString('ar-YE', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}


function formatTimeAndDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) return '';
    
    // تنسيق الوقت (مثال: 6:07 م)
    const time = date.toLocaleTimeString('ar-YE', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    // تنسيق التاريخ (مثال: 18 أكتوبر 2026)
    const dateFormatted = date.toLocaleDateString('ar-YE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    
    return `${time} · ${dateFormatted}`;
  } catch {
    return '';
  }
}

export const CommunityFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'forYou' | 'latest' | 'trending'>('forYou');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // بيانات المستخدم الحالي
  const [myName, setMyName] = useState('مستخدم');
  const [myUsername, setMyUsername] = useState('user');
  const [myAvatar, setMyAvatar] = useState('');

  // 🔄 جلب بيانات المستخدم الحالي من Supabase
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.warn('myProfile fetch:', error.message);
          return;
        }
        
        if (profile) {
          console.log('✅ myProfile loaded:', profile);
          if (profile.full_name) setMyName(profile.full_name);
          if (profile.username) setMyUsername(profile.username);
          if (profile.avatar_url) setMyAvatar(profile.avatar_url);
        }
      } catch (e) {
        console.warn('myProfile exception:', e);
      }
    })();
  }, []);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // صندوق التغريد
  const [tweetText, setTweetText] = useState('');
  const [tweetImage, setTweetImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const commentImageInputRef = useRef<HTMLInputElement>(null);
  const [commentImage, setCommentImage] = useState<string>('');
  const [commentImageFile, setCommentImageFile] = useState<File | null>(null);

  // نافذة الردود / التعليقات
  const [activeCommentTweet, setActiveCommentTweet] = useState<Tweet | null>(null);
  const [viewingDetailTweet, setViewingDetailTweet] = useState<Tweet | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // نافذة البلاغات
  const [reportingItem, setReportingItem] = useState<{
    type: 'post' | 'image' | 'account';
    targetId: string;
    targetName: string;
    targetAuthorId: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState('محتوى غير لائق أو مسيء');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // متابعة لوحة المفاتيح لرفع الفوتر بدقة فوقها
  const [viewportBottomOffset, setViewportBottomOffset] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
        setViewportBottomOffset(Math.max(0, offset));
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);


  const [tweets, setTweets] = useState<Tweet[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // إرسال تنبيه حقيقي للمغرد (في Supabase)
  const sendRealNotification = async (
    targetUid: string, 
    type: 'like' | 'comment' | 'repost' | 'follow', 
    msg: string, 
    postId?: string
  ) => {
    if (!targetUid || targetUid === currentUserId) return;
    
    try {
      console.log('🔔 SENDING NOTIFICATION:', { targetUid, type, currentUserId, myName });
      
      const { data, error } = await supabase.from('notifications').insert({
        user_id: targetUid,
        actor_id: currentUserId,
        actor_name: myName,
        actor_avatar: myAvatar,
        post_id: postId || null,
        title: msg.slice(0, 100),
        message: msg,
        type: type,
        read: false,
      }).select();
      
      if (error) {
        console.error('❌ Notification insert FAILED:', error);
        showToastMsg && showToastMsg('❌ فشل الإشعار: ' + error.message);
      } else {
        console.log('✅ Notification created:', data);
        showToastMsg && showToastMsg('✅ تم إرسال الإشعار');
      }
    } catch (e) {
      console.warn('Notification exception:', e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      let uid = "";
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          uid = session.user.id;
          setCurrentUserId(session.user.id);
        }
      } catch (_) {}

      try {
        // 1. جلب جميع التغريدات من السحابة عبر البروكسي النظيف
        const { data: dbPosts, error: postsErr } = await supabase
          .from('posts')
          .select('id, user_id, content, image_url, likes_count, comments_count, created_at')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (postsErr) {
          console.error('Posts fetch error:', postsErr);
          return;
        }
        let localUsers = {};
        try { localUsers = JSON.parse(localStorage.getItem('yr_users_directory') || '{}'); } catch(_) {}
        if (!Array.isArray(dbPosts) || dbPosts.length === 0) return;

        // 2. جلب جميع البروفايلات المرتبطة
        const userIds = [...new Set(dbPosts.map((p) => p.user_id))];
        let profileMap = new Map();
        try {
          const { data: dbProfiles, error: profErr } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', userIds);
          
          if (profErr) {
            console.error('Profiles fetch error:', profErr);
          } else {
            (dbProfiles || []).forEach((prof) => profileMap.set(prof.id, prof));
          }
        } catch (_) {}

        // 3. بناء قائمة المجتمع وعرض كل التغريدات (لكل المغردين)
        const cloudTweets = dbPosts.map((p) => {
          const author = profileMap.get(p.user_id);
          return {
            id: p.id,
            authorId: p.user_id,
            authorName: author?.full_name || "مستخدم يمن ريتنج",
            authorUsername: author?.username || "user",
            authorAvatar: author?.avatar_url || (localUsers[p.user_id]?.avatarUrl) || (p.user_id === uid ? myAvatar : "") || "",
            text: p.content,
            image: p.image_url || undefined,
            createdAt: p.created_at,
            createdAtDisplay: new Date(p.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: p.likes_count || 0,
            likedBy: [],
            reposts: 0,
            repostedBy: [],
            views: 1,
            comments: [],
            replies: p.comments_count || 0
          };
        });

        setTweets(cloudTweets);
        safeSetStorage(GLOBAL_FEED_KEY, cloudTweets);
      } catch (err) {
        console.error("خطأ في جلب تغريدات المجتمع:", err);
      }
    };
    loadData();

    // اشتراك Realtime لحظي بين جميع المتصفحات والحسابات
    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, (payload: any) => {
        loadData();
        const pId = payload?.new?.post_id || payload?.old?.post_id;
        if (pId) loadCommentsForPost(pId);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reposts' }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(postsChannel); };
  }, []);

  // دالة جلب التعليقات السحابية الحقيقية لأي تغريدة
  const loadCommentsForPost = async (postId: string) => {
    console.log('🔵 loadCommentsForPost:', postId);
    try {
      // 1) جلب التعليقات فقط (بدون JOIN)
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ comments query error:', error.message, error.code);
        return;
      }
      
      console.log('✅ comments fetched:', comments?.length || 0);
      
      if (!comments || comments.length === 0) {
        setViewingDetailTweet(prev => (prev && prev.id === postId ? { ...prev, comments: [], replies: 0 } : prev));
        setActiveCommentTweet(prev => (prev && prev.id === postId ? { ...prev, comments: [], replies: 0 } : prev));
        return;
      }
      
      // 2) جلب profiles يدوياً
      const userIds = [...new Set(comments.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      
      // 3) بناء التعليقات
      const mappedComments = comments.map((c: any) => {
        const profile = profileMap.get(c.user_id);
        return {
          id: c.id,
          authorId: c.user_id,
          authorName: profile?.full_name || 'مستخدم',
          authorUsername: profile?.username || 'user',
          authorAvatar: profile?.avatar_url || '',
          text: c.content,
          createdAt: new Date(c.created_at).toLocaleTimeString('ar-YE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        };
      });
      
      console.log('✅ mapped comments:', mappedComments.length);
      
      // 4) تحديث الحالات
      setViewingDetailTweet(prev => (prev && prev.id === postId ? { 
        ...prev, 
        comments: mappedComments, 
        replies: mappedComments.length 
      } : prev));
      
      setActiveCommentTweet(prev => (prev && prev.id === postId ? { 
        ...prev, 
        comments: mappedComments, 
        replies: mappedComments.length 
      } : prev));
      
      setTweets(prev => prev.map(t => t.id === postId ? { 
        ...t, 
        comments: mappedComments, 
        replies: mappedComments.length 
      } : t));
      
      console.log('✅ loadCommentsForPost DONE:', postId, '| comments:', mappedComments.length);
      
    } catch (err: any) {
      console.error('❌ loadCommentsForPost exception:', err?.message || err);
    }
  };

  // مراقبة فتح أي تغريدة لجلب تعليقاتها السحابية فوراً
  useEffect(() => {
    if (viewingDetailTweet?.id) {
      console.log('🔵 Opening tweet:', viewingDetailTweet.id, '— loading comments...');
      loadCommentsForPost(viewingDetailTweet.id);
    }
  }, [viewingDetailTweet?.id]);

  // 🔄 Realtime: تحميل تعليقات activeCommentTweet (زر 💬)
  useEffect(() => {
    if (activeCommentTweet?.id) {
      console.log('🔵 Opening comment modal:', activeCommentTweet.id, '— loading comments...');
      loadCommentsForPost(activeCommentTweet.id);
    }
  }, [activeCommentTweet?.id]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setTweetImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePostTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = tweetText.trim();
    if (!textToSend && !selectedFile && !tweetImage) {
      showToast('يرجى كتابة نص أو إرفاق صورة أولاً');
      return;
    }

    if (tweetText.length > 280) {
      showToast('تجاوزت الحد الأقصى (280 حرفاً)');
      return;
    }

    // فحص جلسة المستخدم الحقيقية
    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user;

    if (!activeUser) {
      showToast('يجب تسجيل الدخول أولاً لتتمكن من النشر الدائم سحابياً ⚠️');
      return;
    }

    let finalImageUrl: string | null = null;

    // رفع الصورة مضغوطة اقتصادياً إن وجدت
    if (selectedFile) {
      try {
        showToast('جاري ضغط ورفع الصورة سحابياً... ⏳');
        finalImageUrl = await uploadSocialImage(selectedFile, 'tweets');
      } catch (err: any) {
        showToast('تنبيه بالرفع: ' + (err.message || 'تعذر رفع الصورة'));
      }
    }

    // 1. الحفظ السحابي الدائم في جدول posts في Supabase
    showToast('جاري حفظ التغريدة سحابياً... ⏳');
    // 1. الحفظ السحابي الدائم عبر البروكسي الداخلي
    showToast("جاري نشر التغريدة سحابياً... ⏳");
    try {
      const resp = await fetch("/supabase-api/rest/v1/posts", {
        method: "POST",
        credentials: "omit",
        headers: {
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w",
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          user_id: activeUser.id,
          content: textToSend,
          image_url: finalImageUrl || null
        })
      });

      if (!resp.ok) {
        showToast("تعذر النشر، حاول مجدداً (" + resp.status + ")");
        return;
      }

      const postData = await resp.json();
      const insertedPost = Array.isArray(postData) ? postData[0] : postData;

      // بناء وعرض التغريدة فوراً على الحائط
      const newTweet: Tweet = {
        id: insertedPost?.id || Date.now().toString(),
        authorId: activeUser.id,
        authorName: myName,
        authorUsername: myUsername,
        authorAvatar: myAvatar,
        text: textToSend,
        image: finalImageUrl || undefined,
        createdAt: "الآن",
        likes: 0,
        likedBy: [],
        reposts: 0,
        repostedBy: [],
        views: 1,
        comments: []
      };

      setTweets([newTweet, ...tweets]);
      setTweetText("");
      setSelectedFile(null);
      setTweetImage(null);
      showToast("تم نشر التغريدة بنجاح! 🚀");
    } catch (err: any) {
      showToast("خطأ في الاتصال: " + err.message);
    }
    return;
    const insertedPost = Array.isArray(insertedData) ? insertedData[0] : insertedData;

    if (insertError) {
      console.error('Supabase post insert error:', insertError);
      alert(
        "رمز الخطأ: " + (insertError?.code || "لا يوجد") + "\n" +
        "الرسالة: " + (insertError?.message || "فارغة") + "\n" +
        "التفاصيل: " + (insertError?.details || "لا توجد") + "\n" +
        "تلميح: " + (insertError?.hint || "لا يوجد")
      );
      showToast("تعذر النشر، يرجى المحاولة ثانية");
      return;
return;
    }

    // بناء كائن التغريدة بنجاح من قاعدة البيانات
    const newTweet: Tweet = {
      id: insertedPost.id,
      authorId: activeUser.id,
      authorName: myName,
      authorUsername: myUsername,
      authorAvatar: myAvatar,
      text: insertedPost.content,
      image: insertedPost.image_url || undefined,
      createdAt: 'الآن',
      likes: 0,
      likedBy: [],
      reposts: 0,
      repostedBy: [],
      views: 1,
      comments: []
    };

    // إضافة التغريدة للخلاصة المحلية وتحديث الصفحة فوراً
    const updated = [newTweet, ...tweets];
    setTweets(updated);
    safeSetStorage(GLOBAL_FEED_KEY, updated);

    setTweetText('');
    setTweetImage('');
    setSelectedFile(null);
    showToast('تم نشر تغريدتك وحفظها في قاعدة البيانات سحابياً بنجاح! 🚀✅');
  };

  // إعجاب سليم ومنضبط
  const handleLike = (id: string) => {
    let targetTweet: Tweet | undefined;
    let nextIsLiked = false;

    const updated = tweets.map(t => {
      if (t.id === id) {
        const likedBy = t.likedBy || [];
        const isLiked = likedBy.includes(currentUserId);
        nextIsLiked = !isLiked;
        const nextLikedBy = isLiked ? likedBy.filter(uid => uid !== currentUserId) : [...likedBy, currentUserId];
        targetTweet = t;
        return {
          ...t,
          isLiked: nextIsLiked,
          likes: nextLikedBy.length,
          likedBy: nextLikedBy,
        };
      }
      return t;
    });

    setTweets(updated);
    safeSetStorage(GLOBAL_FEED_KEY, updated);

    if (targetTweet && nextIsLiked) {
      sendRealNotification(targetTweet.authorId, 'like', `أعجب ${myName} بمنشورك: "${targetTweet.text.slice(0, 35)}..."`, targetTweet.id);
    }
  };

  // إعادة التغريد
  const handleRepost = (id: string) => {
    let targetTweet: Tweet | undefined;
    let nextIsReposted = false;

    const updated = tweets.map(t => {
      if (t.id === id) {
        const repostedBy = t.repostedBy || [];
        const isReposted = repostedBy.includes(currentUserId);
        nextIsReposted = !isReposted;
        const nextReposted = isReposted ? repostedBy.filter(uid => uid !== currentUserId) : [...repostedBy, currentUserId];
        targetTweet = t;
        return {
          ...t,
          reposts: nextReposted.length,
          repostedBy: nextReposted,
        };
      }
      return t;
    });

    setTweets(updated);
    safeSetStorage(GLOBAL_FEED_KEY, updated);

    if (targetTweet && nextIsReposted) {
      sendRealNotification(targetTweet.authorId, 'repost', `أعاد ${myName} نشر تغريدتك`, targetTweet.id);
    }
    showToast(nextIsReposted ? 'تمت إعادة النشر! 🔁' : 'تم إلغاء إعادة النشر');
  };

  // إضافة رد
  
  const handleCommentImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، اختر صورة أقل من 4 ميجابايت');
      return;
    }
    setCommentImageFile(file);
    setCommentImage(URL.createObjectURL(file));
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetPost = viewingDetailTweet || activeCommentTweet;
    const textToSend = newCommentText.trim();
    if (!textToSend || !targetPost) return;

    if (textToSend.length > 280) {
      showToast('التعليق يجب أن لا يتجاوز 280 حرفاً');
      return;
    }

    const commentId = Date.now().toString();
    const newComment: Comment = {
      id: commentId,
      authorId: currentUserId || 'guest',
      authorName: myName || 'مستخدم',
      authorUsername: myUsername || 'user',
      authorAvatar: myAvatar || '',
      text: textToSend,
      image: commentImage || undefined,
      createdAt: 'الآن'
    };

    // 1. تحديث فوري فائق السرعة في الواجهة (Optimistic UI)
    const updated = tweets.map(t => {
      if (t.id === targetPost.id) {
        const existingComments = t.comments || [];
        const nextComments = [...existingComments, newComment];
        return {
          ...t,
          comments: nextComments,
          replies: nextComments.length
        };
      }
      return t;
    });

    setTweets(updated);
    safeSetStorage(GLOBAL_FEED_KEY, updated);

    // تحديث شاشة التفاصيل المفتوحة فوراً
    if (viewingDetailTweet && viewingDetailTweet.id === targetPost.id) {
      setViewingDetailTweet({
        ...viewingDetailTweet,
        comments: [...(viewingDetailTweet.comments || []), newComment]
      });
    }

    setNewCommentText('');
    setCommentImage('');
    setCommentImageFile(null);
    showToast('تم نشر ردك بنجاح! 💬');

    // إغلاق نافذة الرد تلقائياً والرجوع للخلاصة
    if (activeCommentTweet) {
      setActiveCommentTweet(null);
    }

    // 2. حفظ سحابي في الخلفية دون تعطيل الواجهة
    if (currentUserId && currentUserId !== 'guest') {
      supabase.from("post_comments").insert({
        post_id: targetPost.id,
        user_id: currentUserId,
        content: textToSend
      }).then(({ error }) => {
        if (!error) loadCommentsForPost(targetPost.id);
      });
    }

    sendRealNotification(targetPost.authorId, 'comment', `علّق ${myName} على منشورك: "${textToSend.slice(0, 30)}..."`, targetPost.id);
  };

  // إرسال البلاغ
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem) return;
    setSubmittingReport(true);

    const reportData = {
      id: Date.now().toString(),
      type: reportingItem.type,
      targetId: reportingItem.targetId,
      targetName: reportingItem.targetName,
      targetAuthorId: reportingItem.targetAuthorId,
      reporterId: currentUserId,
      reporterName: myName,
      reason: reportReason,
      details: reportDetails.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const allReports = JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
    safeSetStorage(REPORTS_KEY, [reportData, ...allReports]);

    try {
      await supabase.from('reports').insert([{
        reporter_id: currentUserId,
        reported_item_id: reportingItem.targetId,
        reason: reportReason,
        details: reportDetails.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
      }]).catch(() => {});
    } catch (_) {}

    setSubmittingReport(false);
    setReportingItem(null);
    setReportDetails('');
    showToast('تم استلام بلاغك وسيتم مراجعته من قِبل الإدارة فوراً 🛡️');
  };

  const displayedTweets = [...tweets].sort((a, b) => {
    if (activeTab === 'trending') return b.likes - a.likes;
    return 0;
  });

  const openAuthorProfile = (authorId: string, tweetData?: any) => {
    const navState = tweetData ? {
      name: tweetData.authorName,
      avatarUrl: tweetData.authorAvatar,
      username: tweetData.authorUsername,
    } : undefined;

    if (authorId === currentUserId) {
      navigate("/account", { state: navState });
    } else {
      navigate("/account?id=" + authorId, { state: navState });
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-['Cairo',sans-serif] selection:bg-[#1D9BF0] selection:text-white pb-32" dir="rtl">
      
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1D9BF0] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* الهيدر العلوي */}
      <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-[#2F3336]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/account')} title="ملفي الشخصي">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center font-bold">
                {myAvatar ? <img src={myAvatar} alt={myName} className="w-full h-full object-cover" /> : <span>{myName ? myName[0] : '؟'}</span>}
              </div>
            </button>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>تغريدات المجتمع</span>
              <span className="text-[#1D9BF0] text-sm">🌐</span>
            </h1>
          </div>

          <button 
            onClick={() => navigate('/account')}
            className="text-xs font-bold text-[#1D9BF0] bg-[#1D9BF0]/10 hover:bg-[#1D9BF0]/20 border border-[#1D9BF0]/30 px-3.5 py-1.5 rounded-full transition"
          >
            ملفي الشخصي
          </button>
        </div>

        {/* التبويبات */}
        <div className="flex border-t border-[#2F3336] text-sm font-bold">
          <button 
            onClick={() => setActiveTab('forYou')}
            className={`flex-1 py-3 text-center relative transition ${activeTab === 'forYou' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}
          >
            <span>لك (For You)</span>
            {activeTab === 'forYou' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1D9BF0] rounded-full" />}
          </button>

          <button 
            onClick={() => setActiveTab('latest')}
            className={`flex-1 py-3 text-center relative transition ${activeTab === 'latest' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}
          >
            <span>الأحدث</span>
            {activeTab === 'latest' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1D9BF0] rounded-full" />}
          </button>

          <button 
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-3 text-center relative transition flex items-center justify-center gap-1.5 ${activeTab === 'trending' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}
          >
            <TrendingUp size={15} />
            <span>الرائج</span>
            {activeTab === 'trending' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1D9BF0] rounded-full" />}
          </button>
        </div>
      </header>

      {/* صندوق التغريد السريع */}
      <div className="p-4 border-b border-[#2F3336]">
        <form onSubmit={handlePostTweet}>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 font-bold cursor-pointer" onClick={() => navigate('/account')}>
              {myAvatar ? <img src={myAvatar} alt={myName} className="w-full h-full object-cover" /> : <span>{myName ? myName[0] : '؟'}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <textarea 
                rows={3}
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="ماذا يحدث في مجتمعك؟ شارك تغريدتك للجميع..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
              />

              {tweetImage && (
                <div className="relative rounded-2xl overflow-hidden border border-[#2F3336] max-h-64 my-2">
                  <img src={tweetImage} alt="المعاينة" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setTweetImage('')}
                    className="absolute top-2 left-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#2F3336]/60 mt-1">
                <button 
                  type="button" 
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-[#1D9BF0] hover:bg-[#1D9BF0]/10 rounded-full transition"
                  title="إرفاق صورة"
                >
                  <ImageIcon size={20} />
                </button>

                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] active:scale-95 text-white font-black text-xs sm:text-sm transition shadow-[0_4px_15px_rgba(29,155,240,0.3)]"
                >
                  تغريد
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* حائط التغريدات */}
      <div className="divide-y divide-[#2F3336]">
        {displayedTweets.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-xs px-4">
            لا توجد منشورات حتى الآن في المجتمع. كن أول من يغرد!
          </div>
        ) : (
          displayedTweets.map(tweet => {
            const hasUserReposted = tweet.repostedBy?.includes(currentUserId);
            const hasUserLiked = tweet.likedBy?.includes(currentUserId);

            return (
              <article 
                key={tweet.id} 
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  // فتح التفاصيل إذا لم يكن النقر على زر أو رابط أو صورة البروفايل
                  if (!target.closest('button') && !target.closest('a')) {
                    setViewingDetailTweet(tweet);
                  }
                }}
                className="p-4 hover:bg-white/[0.02] cursor-pointer transition select-none"
              >
                {hasUserReposted && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2 mr-10">
                    <Repeat2 size={13} />
                    <span>أعدت نشر هذه التغريدة</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => openAuthorProfile(tweet.authorId, tweet)} className="shrink-0 self-start">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center font-bold">
                      {tweet.authorAvatar ? <img src={tweet.authorAvatar} alt={tweet.authorName} className="w-full h-full object-cover" /> : <span>{tweet.authorName ? tweet.authorName[0] : '؟'}</span>}
                    </div>
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          onClick={() => openAuthorProfile(tweet.authorId, tweet)}
                          className="font-bold text-white text-sm hover:underline cursor-pointer"
                        >
                          {tweet.authorName}
                        </span>
                        <span className="text-xs text-[#71767B] font-mono" dir="ltr">@{tweet.authorUsername}</span>
                        <span className="text-xs text-[#71767B]">·</span>
                        <span className="text-xs text-[#71767B]" title={tweet.createdAtDisplay || tweet.createdAt}>{formatTimeAgo(tweet.createdAt)}</span>
                      </div>

                      <button 
                        onClick={() => setReportingItem({
                          type: 'post',
                          targetId: tweet.id,
                          targetName: `تغريدة ${tweet.authorName}`,
                          targetAuthorId: tweet.authorId
                        })}
                        className="text-[#71767B] hover:text-rose-400 p-1 rounded-full transition"
                        title="إبلاغ عن المنشور"
                      >
                        <Flag size={14} />
                      </button>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-[#E7E9EA] whitespace-pre-wrap">
                      {tweet.text.split(' ').map((w, i) => 
                        w.startsWith('#') ? (
                          <span key={i} className="text-[#1D9BF0] font-semibold hover:underline cursor-pointer">{w} </span>
                        ) : (
                          w + ' '
                        )
                      )}
                    </p>

                    {tweet.image && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-[#2F3336] max-h-96 relative group">
                        <img src={tweet.image} alt="صورة التغريدة" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setReportingItem({
                            type: 'image',
                            targetId: tweet.id,
                            targetName: `صورة في تغريدة ${tweet.authorName}`,
                            targetAuthorId: tweet.authorId
                          })}
                          className="absolute bottom-2 left-2 bg-black/70 hover:bg-rose-600 text-white p-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                          title="إبلاغ عن الصورة"
                        >
                          <Flag size={12} />
                          <span>إبلاغ عن الصورة</span>
                        </button>
                      </div>
                    )}

                    {/* أزرار التفاعل */}
                    <div className="flex items-center justify-between text-xs text-[#71767B] mt-3.5 max-w-md">
                      <button 
                        onClick={() => setActiveCommentTweet(tweet)}
                        className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition group"
                        title="الردود"
                      >
                        <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10">
                          <MessageCircle size={16} />
                        </div>
                        <span>{tweet.comments?.length || tweet.replies || 0}</span>
                      </button>

                      <button 
                        onClick={() => handleRepost(tweet.id)}
                        className={`flex items-center gap-1.5 transition group ${hasUserReposted ? 'text-emerald-400 font-bold' : 'hover:text-emerald-400'}`}
                        title="إعادة التغريد"
                      >
                        <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                          <Repeat2 size={17} />
                        </div>
                        <span>{tweet.reposts || 0}</span>
                      </button>

                      <button 
                        onClick={() => handleLike(tweet.id)}
                        className={`flex items-center gap-1.5 transition group ${hasUserLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'}`}
                        title="إعجاب"
                      >
                        <div className="p-1.5 rounded-full group-hover:bg-rose-500/10">
                          <Heart size={16} className={hasUserLiked ? 'fill-current' : ''} />
                        </div>
                        <span>{tweet.likes || 0}</span>
                      </button>

                      <button 
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.origin + `/account?id=${tweet.authorId}`);
                          showToast('تم نسخ رابط التغريدة!');
                        }}
                        className="hover:text-[#1D9BF0] p-1.5 rounded-full transition hover:bg-[#1D9BF0]/10"
                      >
                        <Share size={15} />
                      </button>
                    </div>

                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* نافذة الردود */}
      {/* نافذة الرد بنظام منصة X المطابق 100% */}
      {activeCommentTweet && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between h-[100dvh] w-full max-w-lg mx-auto sm:h-auto sm:my-auto sm:rounded-3xl border border-[#2F3336] p-4 text-white overflow-hidden shadow-2xl" dir="rtl">
          
          {/* القسم العلوي: زر الإغلاق والرد والتوجيه */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336] mb-3">
              <button 
                type="button"
                onClick={() => setActiveCommentTweet(null)} 
                className="text-[#71767B] hover:text-white p-1.5 rounded-full hover:bg-zinc-900 transition"
              >
                <X size={20} />
              </button>

              <button
                type="button"
                onClick={handleAddComment}
                disabled={!newCommentText.trim() || newCommentText.length > 280}
                className="px-5 py-1.5 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-xs font-black transition active:scale-95 shadow-sm"
              >
                الردّ
              </button>
            </div>

            <div className="text-xs text-[#71767B] mb-3 flex items-center gap-1">
              <span>رداً على</span>
              <span className="text-[#1D9BF0] font-mono font-bold" dir="ltr">@{activeCommentTweet.authorUsername}</span>
            </div>

            {/* قالب كتابة الرد */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center font-bold">
                {myAvatar ? (
                  <img src={myAvatar} alt={myName} className="w-full h-full object-cover" />
                ) : (
                  <span>{myName ? myName[0] : '؟'}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <textarea
                  rows={4}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="انشر ردّك"
                  maxLength={280}
                  className="w-full bg-transparent text-white placeholder-[#71767B] text-sm focus:outline-none resize-none leading-relaxed break-words [overflow-wrap:anywhere]"
                  autoFocus
                />
                {commentImage && (
                  <div className="relative mt-2 mb-2 rounded-xl overflow-hidden border border-[#2F3336] max-h-48 bg-black">
                    <img src={commentImage} alt="معاينة" className="w-full h-auto object-cover max-h-48" />
                    <button
                      type="button"
                      onClick={() => { setCommentImage(''); setCommentImageFile(null); if (commentImageInputRef.current) commentImageInputRef.current.value = ''; }}
                      className="absolute top-2 left-2 p-1 bg-black/70 hover:bg-black rounded-full text-white transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* الفوتر الثابت: يرتفع تلقائياً فوق لوحة المفاتيح ومعه العداد */}
          <div className="mt-auto pt-3 border-t border-[#2F3336] bg-black transition-all duration-75" style={{ paddingBottom: Math.max(12, viewportBottomOffset) }}>
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 text-[#1D9BF0]">
                <input
                  type="file"
                  ref={commentImageInputRef}
                  onChange={handleCommentImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  type="button" 
                  onClick={() => commentImageInputRef.current?.click()}
                  className="p-2 hover:bg-[#1D9BF0]/10 rounded-full transition" 
                  title="إرفاق صورة من الاستوديو"
                >
                  <ImageIcon size={20} />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono select-none" dir="ltr">
                <span className={newCommentText.length > 280 ? 'text-rose-500 font-bold' : newCommentText.length >= 260 ? 'text-amber-400 font-bold' : 'text-[#71767B]'}>
                  {newCommentText.length}
                </span>
                <span className="text-zinc-600">/ 280</span>
                {newCommentText.length >= 260 && (
                  <span className="text-[10px] text-amber-400 mr-1 font-sans">
                    (متبقي {280 - newCommentText.length})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة عرض تفاصيل التغريدة الكاملة مع كل الردود (عند النقر على جسم التغريدة) */}
      {viewingDetailTweet && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col h-[100dvh] text-white overflow-hidden" dir="rtl">
          {/* شريط علوي */}
          <div className="h-14 border-b border-[#2F3336] px-4 flex items-center justify-between shrink-0 bg-black/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button onClick={() => setViewingDetailTweet(null)} className="p-2 hover:bg-zinc-900 rounded-full text-[#71767B] hover:text-white transition">
                <ArrowRight size={20} />
              </button>
              <h2 className="font-bold text-base">منشور</h2>
            </div>
          </div>

          {/* محتوى التغريدة والردود */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={viewingDetailTweet.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${viewingDetailTweet.authorId}`} 
                alt="" 
                className="w-12 h-12 rounded-full object-cover border border-[#2F3336]" 
              />
              <div>
                <p className="font-bold text-sm text-white">{viewingDetailTweet.authorName}</p>
                <p className="text-xs text-[#71767B] font-mono" dir="ltr">@{viewingDetailTweet.authorUsername}</p>
              </div>
            </div>

            <p className="text-base text-[#E7E9EA] leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
              {viewingDetailTweet.text}
            </p>

            {viewingDetailTweet.image && (
              <div className="rounded-2xl overflow-hidden border border-[#2F3336] max-h-[450px]">
                <img src={viewingDetailTweet.image} alt="" className="w-full h-auto object-cover" />
              </div>
            )}

            <div className="text-xs text-[#71767B] py-2 border-y border-[#2F3336] flex items-center gap-2">
              <span>{formatTimeAndDate(viewingDetailTweet.createdAt)}</span>
              <span>·</span>
              <span>{viewingDetailTweet.views || 1} مشاهدة</span>
            </div>

            {/* أزرار التفاعل في العرض الكامل */}
            <div className="flex items-center justify-around py-1 border-b border-[#2F3336] text-[#71767B]">
              <button onClick={() => { setActiveCommentTweet(viewingDetailTweet); setViewingDetailTweet(null); }} className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition">
                <MessageCircle size={18} />
                <span className="text-xs">{viewingDetailTweet?.comments?.length || 0}</span>
              </button>
              <button onClick={() => handleRepost(viewingDetailTweet.id)} className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                <Repeat2 size={18} />
                <span className="text-xs">{viewingDetailTweet.reposts || 0}</span>
              </button>
              <button onClick={() => handleLike(viewingDetailTweet.id)} className="flex items-center gap-1.5 hover:text-rose-500 transition">
                <Heart size={18} />
                <span className="text-xs">{viewingDetailTweet.likes || 0}</span>
              </button>
              <button onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); showToast('تم نسخ الرابط! 🔗'); } }} className="hover:text-white transition">
                <Share size={18} />
              </button>
            </div>

            {/* قائمة التعليقات السابقة كلها */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-[#71767B]">الردود ({viewingDetailTweet?.comments?.length || 0})</h3>
              {(!viewingDetailTweet?.comments || viewingDetailTweet?.comments.length === 0) ? (
                <div className="text-center py-8 text-zinc-500 text-xs">لا توجد ردود بعد. كن أول من يرد!</div>
              ) : (
                viewingDetailTweet?.comments.map(c => (
                  <div key={c.id} className="py-3 px-1 border-b border-[#2F3336]/60 flex gap-3 hover:bg-white/[0.01] transition">
                    
                    {/* صورة المستخدم على اليمين */}
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {c.authorAvatar ? (
                        <img src={c.authorAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{c.authorName ? c.authorName[0] : '؟'}</span>
                      )}
                    </div>

                    {/* تفاصيل التعليق بنظام X المفتوح */}
                    <div className="flex-1 min-w-0">
                      
                      {/* السطر العلوي: الاسم + اليوزر + الوقت */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white hover:underline cursor-pointer">
                          {c.authorName}
                        </span>
                        <span className="text-[11px] text-[#71767B] font-mono" dir="ltr">
                          @{c.authorUsername || 'user'}
                        </span>
                        <span className="text-xs text-[#71767B]">·</span>
                        <span className="text-[#71767B] text-[9px]" title={c.createdAtDisplay || c.createdAt}>
                          {formatTimeAgo(c.createdAt) || c.createdAtDisplay || 'الآن'}
                          <span className="text-[#536471] mr-1">· {new Date(c.createdAt).toLocaleDateString("ar-YE", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </span>
                      </div>

                      {/* نص التعليق */}
                      <p className="text-xs text-[#E7E9EA] mt-1.5 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap select-text">
                        {c.text}
                      </p>

                      {/* صورة التعليق إن وجدت */}
                      {c.image && (
                        <div className="mt-2.5 rounded-2xl overflow-hidden border border-[#2F3336] max-h-72 bg-black">
                          <img src={c.image} alt="مرفق الرد" className="w-full h-auto object-cover max-h-72" loading="lazy" />
                        </div>
                      )}

                      {/* أزرار التفاعل المصغرة بنظام X تحت كل تعليق */}
                      <div className="flex items-center justify-between text-[#71767B] text-[11px] mt-2.5 max-w-xs">
                        <button type="button" className="flex items-center gap-1 hover:text-[#1D9BF0] transition group">
                          <div className="p-1 rounded-full group-hover:bg-[#1D9BF0]/10">
                            <MessageCircle size={14} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-emerald-400 transition group">
                          <div className="p-1 rounded-full group-hover:bg-emerald-500/10">
                            <Repeat2 size={14} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-rose-500 transition group">
                          <div className="p-1 rounded-full group-hover:bg-rose-500/10">
                            <Heart size={14} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-white transition group">
                          <div className="p-1 rounded-full group-hover:bg-white/10">
                            <Share size={13} />
                          </div>
                        </button>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* شريط انشر ردك السفلي بنظام X كما في الصورة */}
          <div className="p-2.5 sm:p-3 border-t border-[#2F3336] bg-black shrink-0 transition-all duration-75" style={{ paddingBottom: Math.max(12, viewportBottomOffset) }}>
            <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
              
              {/* صورة المستخدم على اليمين أولاً */}
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center font-bold">
                {myAvatar ? (
                  <img src={myAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{myName ? myName[0] : '؟'}</span>
                )}
              </div>

              {/* حقل الإدخال الحقيقي الفوري */}
              <div className="flex-1 bg-[#16181C] border border-[#2F3336] rounded-full px-4 py-2 flex items-center gap-2 focus-within:border-[#1D9BF0]">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="انشر ردّك..."
                  maxLength={280}
                  className="flex-1 bg-transparent text-white text-xs placeholder-[#71767B] focus:outline-none"
                />

                {newCommentText.length > 0 && (
                  <span className={`text-[10px] font-mono select-none ${newCommentText.length > 280 ? 'text-rose-500 font-bold' : newCommentText.length >= 260 ? 'text-amber-400' : 'text-[#71767B]'}`}>
                    {280 - newCommentText.length}
                  </span>
                )}
              </div>

              {/* زر الرد الأزرق على اليسار */}
              <button
                type="submit"
                disabled={!newCommentText.trim() || newCommentText.length > 280}
                className="px-4 py-2 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-xs font-black transition active:scale-95 shrink-0"
              >
                الردّ
              </button>

            </form>
          </div>

        </div>
      )}

      {/* نافذة البلاغات */}
      {reportingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" dir="rtl">
          <div className="bg-[#000000] border border-rose-500/40 w-full max-w-md rounded-3xl p-5 sm:p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert size={20} />
                <h2 className="text-base font-black text-white">إبلاغ عن محتوى</h2>
              </div>
              <button onClick={() => setReportingItem(null)} className="text-[#71767B] hover:text-white p-1 rounded-full">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              تساعدنا البلاغات في الحفاظ على مجتمع يمن ريتنج آمناً ونظيفاً. يرجى اختيار سبب الإبلاغ:
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-bold mb-2">سبب البلاغ:</label>
                <div className="space-y-2">
                  {[
                    'محتوى غير لائق أو مسيء',
                    'احتيال أو انتحال شخصية أو سبام',
                    'معلومات كاذبة أو مضللة',
                    'مضايقة أو انتهاك للخصوصية',
                    'سبب آخر'
                  ].map((reason) => (
                    <label key={reason} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] cursor-pointer hover:border-zinc-500 transition">
                      <input 
                        type="radio" 
                        name="reportReason" 
                        value={reason} 
                        checked={reportReason === reason} 
                        onChange={(e) => setReportReason(e.target.value)}
                        className="accent-[#1D9BF0]"
                      />
                      <span className="text-zinc-200">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">تفاصيل إضافية (اختياري):</label>
                <textarea 
                  rows={3} 
                  value={reportDetails} 
                  onChange={(e) => setReportDetails(e.target.value)} 
                  placeholder="وضّح للإدارة سبب الإبلاغ باختصار..." 
                  className="w-full bg-[#16181C] border border-[#2F3336] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <AlertTriangle size={15} />
                  <span>{submittingReport ? 'جاري الإرسال...' : 'تأكيد إرسال البلاغ'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportingItem(null)}
                  className="py-3 px-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* شريط التنقل السفلي */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-[#2F3336] py-2 px-4 flex items-center justify-around text-xs font-bold">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-[#71767B] hover:text-white transition">
          <Home size={22} />
          <span>الرئيسية</span>
        </button>

        <button onClick={() => navigate('/feed')} className="flex flex-col items-center gap-1 text-[#1D9BF0] font-black transition">
          <MessageSquare size={22} className="stroke-[2.5]" />
          <span>المنشورات</span>
        </button>

        <button onClick={() => navigate('/notifications')} className="flex flex-col items-center gap-1 text-[#71767B] hover:text-[#1D9BF0] transition relative">
          <div className="relative">
            <Bell size={22} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">
                {unreadNotifs}
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

    
      <MobileBottomNav onNavigate={(path) => navigate(path)} />
</div>
  );
};
