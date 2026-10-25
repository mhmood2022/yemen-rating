import { XVideoPlayer } from '../components/feed/XVideoPlayer';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ActiveUsersBar } from '../components/community/ActiveUsersBar';
import { ReplyBar } from '../components/community/ReplyBar';
import { ReportPage } from '../components/community/ReportPage';
import {
  ArrowRight,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Plus,
  X,
  Pin,
  CheckCircle2,
  TrendingUp,
  Home,
  MessageSquare,
  User,
  Flag,
  AlertTriangle,
  Send,
  ShieldAlert,
  Sparkles,
  Bell,
  BarChart,
  MoreHorizontal,
  Video,
  Globe
} from "lucide-react";

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
  // ⏸️ معطل: نعتمد على Supabase فقط لتجنب فقدان البيانات
  console.log('safeSetStorage disabled');
};

const GLOBAL_FEED_KEY = 'yr_community_global_posts';
const USERS_DIR_KEY = 'yr_users_directory';
const REPORTS_KEY = 'yr_community_reports';

function formatTimeAgo(dateStr: string): string {
  try {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
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
    return date.toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' });
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
  const [activeMenuPost, setActiveMenuPost] = useState<any>(null);
  const [hiddenTweetIds, setHiddenTweetIds] = useState<string[]>([]);
  const [editingTweet, setEditingTweet] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
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
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  // 📱 ضبط ارتفاع النافذة بدقة متناهية مع لوحة مفاتيح الجوال
  const [modalHeight, setModalHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!isPostModalOpen) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const updateHeight = () => {
      setModalHeight(vv.height);
    };

    updateHeight();
    vv.addEventListener('resize', updateHeight);
    vv.addEventListener('scroll', updateHeight);

    return () => {
      vv.removeEventListener('resize', updateHeight);
      vv.removeEventListener('scroll', updateHeight);
    };
  }, [isPostModalOpen]);

  const [isPosting, setIsPosting] = useState(false);
  const [tweetImage, setTweetImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const commentImageInputRef = useRef<HTMLInputElement>(null);
  const [commentImage, setCommentImage] = useState<string>('');
  const [commentImageFile, setCommentImageFile] = useState<File | null>(null);

  // نافذة الردود / التعليقات
  const [activeCommentTweet, setActiveCommentTweet] = useState<Tweet | null>(null);
  const [repostMenu, setRepostMenu] = useState<Tweet | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteOriginal, setQuoteOriginal] = useState<Tweet | null>(null);
  const [viewingDetailTweet, setViewingDetailTweet] = useState<Tweet | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [reportingItem, setReportingItem] = useState<{
    type: 'post' | 'image' | 'account';
    targetId: string;
    targetName: string;
    targetAuthorId: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState('محتوى غير لائق أو مسيء');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportStep, setReportStep] = useState(1);


  // نافذة البلاغات

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
  const [expandedTweets, setExpandedTweets] = useState<Record<string, boolean>>({});
  const [debugMessage, setDebugMessage] = useState<string>('...');

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
          .select('id, user_id, content, image_url, video_url, likes_count, comments_count, reposts_count, created_at')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (postsErr) {
          console.error('Posts fetch error:', postsErr);
          return;
        }
        // جلب إعادة النشر
        const { data: dbReposts } = await supabase
          .from('post_reposts')
          .select('id, post_id, user_id, quote_text, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        // جلب التغريدات الأصلية للإعادات (لضمان ظهورها حتى لو كانت قديمة)
        const repostedPostIds = (dbReposts || []).map((r: any) => r.post_id);
        let originalPostsMap = new Map();
        if (repostedPostIds.length > 0) {
          const { data: originals } = await supabase
            .from('posts')
            .select('id, user_id, content, image_url, video_url, likes_count, comments_count, reposts_count, created_at')
            .in('id', repostedPostIds);
          (originals || []).forEach((p: any) => originalPostsMap.set(p.id, p));
        }
        
        // دمج dbPosts + originals
        const allPosts = [...(dbPosts || [])];
        originalPostsMap.forEach((p: any, id: string) => {
          if (!allPosts.find((dp: any) => dp.id === id)) {
            allPosts.push(p);
          }
        });
        
        let localUsers = {};
        try { localUsers = JSON.parse(localStorage.getItem('yr_users_directory') || '{}'); } catch(_) {}
        if (!Array.isArray(dbPosts)) return;

        // 2. جلب جميع البروفايلات المرتبطة
        const allUserIds = [...new Set([
          ...allPosts.map((p: any) => p.user_id),
          ...(dbReposts || []).map((r: any) => r.user_id),
          ...(dbPosts || []).map((p: any) => p.user_id),
        ])];
        let profileMap = new Map();
        try {
          const { data: dbProfiles, error: profErr } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', allUserIds);
          
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
            video_url: p.video_url || undefined,
            video: p.video_url || undefined,
            createdAt: p.created_at,
            createdAtDisplay: new Date(p.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: p.likes_count || 0,
            likedBy: [],
            reposts: p.reposts_count || 0,
            repostedBy: [],
            views: 1,
            comments: [],
            replies: p.comments_count || 0
          };
        });

        // بناء التغريدات المُعاد نشرها
        const repostTweets: any[] = (dbReposts || []).map((r: any) => {
          const original = allPosts.find((p: any) => p.id === r.post_id);
          const reposter = profileMap.get(r.user_id);
          
          if (!reposter) return null; // نتخطى فقط إذا كان المُعيد غير موجود
          
          const originalAuthor = original ? profileMap.get(original.user_id) : null;
          
          return {
            id: `repost-${r.id}`,
            repostId: r.id,
            isRepost: true,
            quote_text: r.quote_text,
            
            reposterName: reposter.full_name || 'مستخدم',
            reposterUsername: reposter.username || 'user',
            reposterAvatar: reposter.avatar_url || '',
            
            authorId: r.user_id,
            authorName: reposter.full_name || 'مستخدم',
            authorUsername: reposter.username || 'user',
            authorAvatar: reposter.avatar_url || '',
            
            text: r.quote_text 
              ? r.quote_text 
              : (original?.content ?? 'التغريدة الأصلية غير متاحة'),
            image: r.quote_text 
              ? undefined 
              : (original?.image_url ?? undefined),
            
            original: r.quote_text ? {
              id: original?.id ?? 'deleted',
              authorName: originalAuthor?.full_name ?? 'مستخدم',
              authorUsername: originalAuthor?.username ?? 'user',
              authorAvatar: originalAuthor?.avatar_url ?? '',
              text: original?.content ?? 'التغريدة الأصلية غير متاحة',
              image: original?.image_url ?? null,
            } : null,
            
            originalId: original?.id ?? 'deleted',
            createdAt: r.created_at,
            createdAtDisplay: new Date(r.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: original?.likes_count ?? 0,
            reposts: 0,
            replies: original?.comments_count ?? 0,
            views: 1,
            comments: [],
          };
        }).filter(Boolean);


                        
                const totalReposts = repostTweets.filter((t: any) => t && t.isRepost).length;
        const totalQuotes = repostTweets.filter((t: any) => t && t.quote_text).length;
        
        // عرض تنبيه للتشخيص

        
        setTweets([...cloudTweets, ...repostTweets]);
        
        // 🔴 DEBUG: بعد setTweets
        setTimeout(() => {
          
        }, 1500);
        safeSetStorage(GLOBAL_FEED_KEY, [...cloudTweets, ...repostTweets]);
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
        try {
      // 1) جلب التعليقات فقط (بدون JOIN)
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ comments query error:', error.message, error.code);
        return;
      }
      
      
      
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
          createdAt: c.created_at,
          createdAtDisplay: new Date(c.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
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
            loadCommentsForPost(viewingDetailTweet.id);
    }
  }, [viewingDetailTweet?.id]);

  // 🔄 Realtime: تحميل تعليقات activeCommentTweet (زر 💬)
  useEffect(() => {
    if (activeCommentTweet?.id) {
            loadCommentsForPost(activeCommentTweet.id);
    }
  }, [activeCommentTweet?.id]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // تثبيت الملف فوراً في الذاكرة
    setSelectedFile(file);
    setTweetImage(URL.createObjectURL(file));
  };

  const handlePostTweet = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isPosting) return;

    const textToSend = tweetText.trim();
    if (!textToSend && !selectedFile && !tweetImage) {
      showToast('يرجى كتابة نص أو إرفاق وسائط أولاً ⚠️');
      return;
    }

    if (tweetText.length > 280) {
      showToast('تجاوزت الحد الأقصى (280 حرفاً)');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user;

    if (!activeUser) {
      showToast('يجب تسجيل الدخول أولاً لتتمكن من النشر سحابياً ⚠️');
      return;
    }

    setIsPosting(true);
    let finalImageUrl: string | null = null;
    let finalVideoUrl: string | null = null;

    if (selectedFile) {
      try {
        if (selectedFile.type.startsWith('video/')) {
          showToast('جاري رفع الفيديو سحابياً... ⏳');
          const ext = selectedFile.name.split('.').pop() || 'mp4';
          const filePath = `posts/video_${activeUser.id}_${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('social-media')
            .upload(filePath, selectedFile, {
              upsert: true,
              contentType: selectedFile.type || 'video/mp4'
            });
          if (uploadError) throw uploadError;
          const { data: pubData } = supabase.storage.from('social-media').getPublicUrl(filePath);
          finalVideoUrl = pubData.publicUrl;
        } else {
          showToast('جاري رفع الصورة سحابياً... ⏳');
          const ext = selectedFile.name.split('.').pop() || 'jpg';
          const filePath = `posts/image_${activeUser.id}_${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('social-media')
            .upload(filePath, selectedFile, {
              upsert: true,
              contentType: selectedFile.type || 'image/jpeg'
            });
          if (uploadError) throw uploadError;
          const { data: pubData } = supabase.storage.from('social-media').getPublicUrl(filePath);
          finalImageUrl = pubData.publicUrl;
        }
      } catch (err: any) {
        setIsPosting(false);
        showToast('فشل رفع الوسائط: ' + (err.message || 'خطأ في التخزين'));
        return;
      }
    }

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
          image_url: finalImageUrl || null,
          video_url: finalVideoUrl || null
        })
      });

      if (!resp.ok) {
        setIsPosting(false);
        showToast("تعذر النشر، كود الخطأ: " + resp.status);
        return;
      }

      const postData = await resp.json();
      const insertedPost = Array.isArray(postData) ? postData[0] : postData;

      const newTweet: Tweet = {
        id: insertedPost?.id || Date.now().toString(),
        authorId: activeUser.id,
        authorName: myName,
        authorUsername: myUsername,
        authorAvatar: myAvatar,
        text: textToSend,
        image: finalImageUrl || undefined,
        video_url: finalVideoUrl || undefined,
        video: finalVideoUrl || undefined,
        createdAt: "الآن",
        likes: 0,
        likedBy: [],
        reposts: 0,
        repostedBy: [],
        views: 1,
        comments: []
      };

      setTweets([newTweet, ...tweets]);
      setTweetText('');
      setTweetImage('');
      setSelectedFile(null); if (imageInputRef.current) imageInputRef.current.value = '';
      setIsPostModalOpen(false);
      setIsPosting(false);
      showToast("تم نشر تغريدتك بنجاح! 🚀✨");
    } catch (err: any) {
      setIsPosting(false);
      showToast("خطأ أثناء النشر: " + err.message);
    }
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
  const handleRepost = async (id: string) => {
    if (!currentUserId) {
      showToast('يرجى تسجيل الدخول');
      return;
    }

    try {
      // 1) التحقق من وجود إعادة نشر سابقة
      const { data: existing, error: checkErr } = await supabase
        .from('post_reposts')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (checkErr) {
        console.error('Check repost error:', checkErr);
      }

      let nextIsReposted = false;

      if (existing) {
        // إلغاء إعادة النشر
        const { error: delErr } = await supabase
          .from('post_reposts')
          .delete()
          .eq('id', existing.id);
        
        if (delErr) throw delErr;
        nextIsReposted = false;
        showToast('تم إلغاء إعادة النشر');
      } else {
        // إعادة نشر جديدة
        const { error: insErr } = await supabase
          .from('post_reposts')
          .upsert({
            post_id: id,
            user_id: currentUserId,
            quote_text: null
          }, {
            onConflict: 'user_id,post_id',
            ignoreDuplicates: true
          });
        
        if (insErr) throw insErr;
        nextIsReposted = true;
        showToast('تمت إعادة النشر! 🔁');
        
        // إشعار لصاحب التغريدة
        const targetTweet = tweets.find(t => t.id === id);
        if (targetTweet) {
          sendRealNotification(targetTweet.authorId, 'repost', `أعاد ${myName} نشر تغريدتك`, targetTweet.id);
        }
      }

      // 2) تحديث الواجهة
      const updated = tweets.map(t => {
        if (t.id === id) {
          const repostedBy = t.repostedBy || [];
          const nextReposted = nextIsReposted 
            ? [...repostedBy, currentUserId] 
            : repostedBy.filter(uid => uid !== currentUserId);
          
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

    } catch (error: any) {
      console.error('Repost error:', error);
      showToast('حدث خطأ: ' + (error?.message || 'خطأ غير معروف'));
    }
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
  
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItem) return;
    setSubmittingReport(true);
    try {
      const reportData = {
        id: crypto.randomUUID(),
        type: reportingItem.type,
        targetId: reportingItem.targetId,
        targetName: reportingItem.targetName,
        targetAuthorId: reportingItem.targetAuthorId,
        reason: reportReason,
        details: reportDetails.trim(),
        created_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('yr_community_reports') || '[]');
      localStorage.setItem('yr_community_reports', JSON.stringify([reportData, ...existing]));
      if (typeof showToast === 'function') {
        showToast('تم استلام بلاغك وسيتم مراجعته من قِبل الإدارة فوراً 🛡️');
      } else {
        alert('تم استلام بلاغك بنجاح 🛡️');
      }
      setReportingItem(null);
      setReportDetails('');
      setReportReason('محتوى غير لائق أو مسيء');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingReport(false);
    }
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

    // تحديث الردود داخل نافذة المنشور المفتوحة دون إغلاقها
    setActiveCommentTweet(prev =>
      prev && prev.id === targetPost.id
        ? { ...prev, comments: [...(prev.comments || []), newComment] }
        : prev
    );

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
  const repostsCount = tweets.filter((t: any) => t.isRepost).length;
        
  const handleNotInterested = (tweetId: string) => {
    setHiddenTweetIds(prev => [...prev, tweetId]);
    setActiveMenuPost(null);
    showToast('لن نعرض لك هذه التغريدة مرة أخرى');
  };


  const handleUnfollow = async (authorId: string) => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    try {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', authorId);
      
      setActiveMenuPost(null);
      showToast('تم إلغاء المتابعة');
    } catch (err) {
      console.error('Unfollow error:', err);
      showToast('حدث خطأ أثناء إلغاء المتابعة');
    }
  };


  const handleBlock = (authorId: string) => {
    setHiddenTweetIds(prev => [...prev, authorId]);
    setActiveMenuPost(null);
    showToast('تم حظر المستخدم (مؤقتاً)');
  };

  const handleMute = (authorId: string) => {
    setHiddenTweetIds(prev => [...prev, authorId]);
    setActiveMenuPost(null);
    showToast('تم كتم المستخدم (مؤقتاً)');
  };

  const displayedTweets = [...tweets].filter(t => !hiddenTweetIds.includes(t.id)).sort((a, b) => {
    // الترتيب حسب التبويب
    if (activeTab === 'trending') return b.likes - a.likes;
    if (activeTab === 'forYou') {
      // ترتيب حسب التاريخ (الأحدث أولاً) — يشمل الاقتباسات
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    }
    // latest — الأحدث أيضاً
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  
  
  // 🔴 DEBUG حاسم: إظهار الأرقام على الشاشة
  if (typeof window !== 'undefined') {
    (window as any).__debugFinal = {
      tweetsTotal: tweets.length,
      tweetsReposts: tweets.filter((t: any) => t?.isRepost).length,
      tweetsQuotes: tweets.filter((t: any) => t?.quote_text).length,
      displayedTotal: displayedTweets.length,
      displayedReposts: displayedTweets.filter((t: any) => t?.isRepost).length,
    };
    
  }

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
    <div className="min-h-screen bg-black text-[#E7E9EA] font-['Tahoma',sans-serif] selection:bg-[#FFC500] selection:text-white pb-32" dir="rtl">
      {/* DEBUG */}
      

      
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] bg-[#FFC500] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      <input type="file" ref={imageInputRef} className="hidden" accept="image/*,video/*" onChange={handleImageUpload} />

      {/* الهيدر العلوي */}
      <header className="sticky top-0 z-40 bg-black  border-b border-[#2F3336]">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/account')} title="ملفي الشخصي">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center font-bold">
                {myAvatar ? <img src={myAvatar} alt={myName} className="w-full h-full object-cover" /> : <span>{myName ? myName[0] : '؟'}</span>}
              </div>
            </button>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>تغريدات المجتمع</span>
              <span className="text-[#FFC500] text-sm">🌐</span>
            </h1>
          </div>

          <button 
            onClick={() => navigate('/account')}
            className="text-xs font-bold text-[#FFC500] bg-[#FFC500]/10 hover:bg-[#FFC500]/20 border border-[#FFC500]/30 px-3.5 py-1.5 rounded-full transition"
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
            {activeTab === 'forYou' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#FFC500] rounded-full" />}
          </button>

          <button 
            onClick={() => setActiveTab('latest')}
            className={`flex-1 py-3 text-center relative transition ${activeTab === 'latest' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}
          >
            <span>الأحدث</span>
            {activeTab === 'latest' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#FFC500] rounded-full" />}
          </button>

          <button 
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-3 text-center relative transition flex items-center justify-center gap-1.5 ${activeTab === 'trending' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'}`}
          >
            <TrendingUp size={15} />
            <span>الرائج</span>
            {activeTab === 'trending' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#FFC500] rounded-full" />}
          </button>
        </div>
      </header>

      

      {/* حائط التغريدات */}
      <div className="divide-y divide-[#2F3336]">
      {/* المستخدمون أصحاب أحدث التغريدات */}
      <ActiveUsersBar
        users={[...tweets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .filter((t, i, arr) => t.authorId && t.authorAvatar && arr.findIndex(x => x.authorId === t.authorId) === i)
          .slice(0, 10)
          .map(t => ({ id: t.authorId, name: t.authorName || '', avatar: t.authorAvatar, tweetData: t }))}
        onTweetClick={setViewingDetailTweet}
      />

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
                          if (!target.closest('button') && !target.closest('a')) {
                            setViewingDetailTweet(tweet);
                          }
                        }}
                        className="p-4 hover:bg-white/[0.02] cursor-pointer transition select-none border-b border-[#2F3336]"
                      >
                        {/* رأس الاقتباس - صاحب الاقتباس */}
                        <div className="flex gap-3">
                          <button onClick={() => openAuthorProfile(tweet.authorId, tweet)} className="shrink-0 self-start">
                            <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center font-bold shrink-0">
                              {tweet.authorAvatar ? <img src={tweet.authorAvatar} alt={tweet.authorName} className="w-full h-full object-cover" /> : <span>{tweet.authorName ? tweet.authorName[0] : '؟'}</span>}
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between w-full">
                              <div className="flex items-center gap-1 flex-wrap flex-1 min-w-0">
                                <span onClick={() => openAuthorProfile(tweet.authorId, tweet)} className="font-bold text-white text-[14px] font-semibold hover:underline cursor-pointer flex items-center gap-1">
                                  {tweet.authorName}
                                  {/* شارة التوثيق - تظهر إذا كان المستخدم موثقاً */}
                                  {tweet.badgeType && (
                                  <img 
                                    src={
                                      tweet.badgeType === 'blue' ? '/badges/blue.png' :
                                      tweet.badgeType === 'yellow' ? '/badges/yellow.png' :
                                      tweet.badgeType === 'gray' ? '/badges/gray.png' : '/badges/blue.png'
                                    } 
                                    alt="موثق" 
                                    className="w-[18px] h-[18px] object-contain inline-block shrink-0 mt-[1px]" 
                                    style={{ marginRight: '2px' }}
                                  />
                                )}
                                </span>
                                <span className="text-[11px] text-[#71767B] font-normal font-['Tahoma']" dir="ltr">@{tweet.authorUsername}</span>
                                <span className="text-[11px] text-[#71767B]">·</span>
                                <span className="text-[11px] text-[#71767B] font-['Tahoma']" title={tweet.createdAtDisplay || tweet.createdAt}>{formatTimeAgo(tweet.createdAt)}</span>

                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuPost(tweet);
                                }}
                                className="text-[#71767B] hover:text-[#FFC500] p-1.5 rounded-full hover:bg-[#FFC500]/10 transition shrink-0"
                                title="المزيد"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                            </div>
                            
                            {/* النص العادي (للتغريدة العادية) */}
                            {!tweet.quote_text && tweet.text && (
                              <p className="font-['Tahoma'] mt-2 text-[14px] leading-[1.5] text-[#E7E9EA] font-['Tahoma'] whitespace-pre-wrap">
                                {tweet.text.split(' ').map((w, i) =>
                                  w.startsWith('#') ? (
                                    <span key={i} className="text-[#FFC500] font-semibold hover:underline cursor-pointer">{w} </span>
                                  ) : (
                                    w + ' '
                                  )
                                )}
                              </p>
                            )}
                            
                            {/* نص الاقتباس */}
                            {tweet.quote_text && (
                              <div className="mt-2">
                                <p className={`text-[15px] leading-[1.5] text-[#E7E9EA] whitespace-pre-wrap ${expandedTweets[tweet.id] ? '' : 'line-clamp-6'}`}>
                                  {tweet.quote_text.split(' ').map((w, i) =>
                                    w.startsWith('#') ? (
                                      <span key={i} className="text-[#FFC500] font-semibold hover:underline cursor-pointer">{w} </span>
                                    ) : (
                                      w + ' '
                                    )
                                  )}
                                </p>
                                {tweet.quote_text.length > 280 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedTweets(prev => ({...prev, [tweet.id]: !prev[tweet.id]}));
                                    }}
                                    className="text-[#FFC500] text-[10px] font-bold mt-1 hover:underline"
                                  >
                                    {expandedTweets[tweet.id] ? 'عرض أقل' : 'عرض المزيد'}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* بطاقة التغريدة الأصلية */}
                            {tweet.original && (
                              <div className="mt-3 border border-[#1a2331] rounded-xl p-2.5 transition">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                                    {tweet.original.authorAvatar ? (
                                      <img src={tweet.original.authorAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-white text-[10px] font-bold flex items-center justify-center w-full h-full">{tweet.original.authorName?.[0]}</span>
                                    )}
                                  </div>
                                  <span className="font-semibold text-white text-[12px]">{tweet.original.authorName}</span>
                                  <span className="text-[#71767B] text-[11px]">@{tweet.original.authorUsername}</span>
                                </div>
                                <p className={`text-white text-sm whitespace-pre-wrap ${expandedTweets['orig-'+tweet.id] ? '' : 'line-clamp-4'}`}>{tweet.original.text}</p>
                                
                                {tweet.original.image && (
                                  <img src={tweet.original.image} alt="" className="w-full rounded-lg mt-2 max-h-48 object-cover" />
                                )}
                              </div>
                            )}
                            
                            {/* فيديو التغريدة العادية */}
                            {(tweet.video_url || tweet.video) && (
                              <div className="mt-3">
                                <XVideoPlayer src={tweet.video_url || tweet.video} />
                              </div>
                            )}

                            {/* صورة التغريدة العادية */}
                            {tweet.image && !(tweet.video_url || tweet.video) && (
                              <div className="mt-3 rounded-2xl overflow-hidden border border-[#2F3336] max-h-96">
                                <img src={tweet.image} alt="صورة" className="w-full h-full object-cover" />
                              </div>
                            )}

                            {/* أزرار التفاعل */}
                            <div className="flex items-center justify-between mt-3 max-w-md text-[#71767B]">
                              {/* 💬 تعليق */}
                              <button onClick={() => setViewingDetailTweet(tweet)} className="flex items-center gap-1.5 hover:text-[#FFC500] transition group">
                                <div className="p-1.5 rounded-full group-hover:bg-[#FFC500]/10"><MessageCircle size={16} /></div>
                                <span className="text-[11px]">{tweet.replies || 0}</span>
                              </button>
                              
                              {/* 🔁 إعادة / اقتباس */}
                              <button onClick={(e) => { e.stopPropagation(); setRepostMenu(tweet); }} className="flex items-center gap-1.5 hover:text-emerald-400 transition group">
                                <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10"><Repeat2 size={16} /></div>
                                <span className="text-[11px]">{tweet.reposts || 0}</span>
                              </button>
                              
                              {/* ❤️ إعجاب */}
                              <button onClick={() => handleLike(tweet.id)} className={`flex items-center gap-1.5 transition group ${tweet.likedBy?.includes(currentUserId) ? 'text-rose-500' : 'hover:text-rose-500'}`}>
                                <div className="p-1.5 rounded-full group-hover:bg-rose-500/10"><Heart size={16} className={tweet.likedBy?.includes(currentUserId) ? 'fill-current' : ''} /></div>
                                <span className="text-[11px]">{tweet.likes || 0}</span>
                              </button>
                              
                              {/* 📊 مشاهدات */}
                              <button className="flex items-center gap-1.5 hover:text-[#FFC500] transition group" title="المشاهدات">
                                <div className="p-1.5 rounded-full group-hover:bg-[#FFC500]/10"><BarChart size={16} /></div>
                                <span className="text-[11px]">{tweet.views || 1}</span>
                              </button>
                              
                              

                            </div>
                          </div>
                        </div>
                      </article>
            );
          })
        )}
      </div>

      {/* نافذة المنشور والردود - تصميم كامل */}
      {activeCommentTweet && (
        <div
          className="fixed inset-0 z-[80] bg-black flex flex-col h-[100dvh] w-full text-white overflow-hidden"
          dir="rtl"
        >
          {/* الشريط العلوي */}
          <div className="h-14 border-b border-[#2F3336] px-4 flex items-center shrink-0 bg-black">
            <button
              type="button"
              onClick={() => setActiveCommentTweet(null)}
              className="p-2 -mr-2 rounded-full hover:bg-white/10"
              aria-label="إغلاق"
            >
              <ArrowRight size={20} />
            </button>
            <h2 className="font-bold text-base mr-3">منشور</h2>
          </div>

          {/* محتوى المنشور والردود قابل للتمرير */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
            <article className="border-b border-[#2F3336] pb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {activeCommentTweet.authorAvatar ? (
                    <img
                      src={activeCommentTweet.authorAvatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold">
                      {activeCommentTweet.authorName?.[0] || "؟"}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="font-bold text-[15px] break-words">
                      {activeCommentTweet.authorName}
                    </span>
                    <span className="text-[#71767B] text-sm" dir="ltr">
                      @{activeCommentTweet.authorUsername}
                    </span>
                  </div>

                  <p className="mt-2 text-[15px] leading-6 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {activeCommentTweet.text}
                  </p>

                  {activeCommentTweet.image && (
                    <img
                      src={activeCommentTweet.image}
                      alt="صورة المنشور"
                      className="mt-3 w-full max-h-[420px] object-contain rounded-2xl border border-[#2F3336] bg-black"
                    />
                  )}

                  <div className="mt-3 text-xs text-[#71767B]">
                    {formatTimeAndDate(activeCommentTweet.createdAt)}
                    {" · "}
                    {activeCommentTweet.views || 1} مشاهدة
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2F3336] text-sm text-[#71767B]">
                    <MessageCircle size={17} />
                    <span>{activeCommentTweet.comments?.length || 0} رد</span>
                  </div>
                </div>
              </div>
            </article>

            {/* قائمة الردود */}
            <section className="pt-3 pb-4">
              <h3 className="font-bold text-sm mb-3">
                الردود ({activeCommentTweet.comments?.length || 0})
              </h3>

              {!activeCommentTweet.comments?.length ? (
                <p className="text-sm text-[#71767B] py-6 text-center">
                  لا توجد ردود بعد. كن أول من يرد على هذا المنشور.
                </p>
              ) : (
                <div>
                  {activeCommentTweet.comments.map((comment) => (
                    <article
                      key={comment.id}
                      className="flex gap-3 py-3 border-b border-[#2F3336]"
                    >
                      <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                        {comment.authorAvatar ? (
                          <img
                            src={comment.authorAvatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold">
                            {comment.authorName?.[0] || "؟"}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2">
                          <span className="font-bold text-sm break-words">
                            {comment.authorName}
                          </span>
                          <span className="text-[#71767B] text-xs" dir="ltr">
                            @{comment.authorUsername || "user"}
                          </span>
                          <span className="text-[#71767B] text-xs">
                            {comment.createdAtDisplay || formatTimeAndDate(comment.createdAt)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          {comment.text}
                        </p>

                        {comment.image && (
                          <img
                            src={comment.image}
                            alt="صورة الرد"
                            className="mt-2 max-h-64 max-w-full rounded-xl border border-[#2F3336] object-contain"
                          />
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* شريط كتابة الرد الثابت أسفل الشاشة */}
          <div
            className="shrink-0 border-t border-[#2F3336] bg-black px-3 pt-3"
            style={{ paddingBottom: Math.max(12, viewportBottomOffset) }}
          >
            {commentImage && (
              <div className="relative mb-2 max-h-36 overflow-hidden rounded-xl border border-[#2F3336]">
                <img
                  src={commentImage}
                  alt="معاينة صورة الرد"
                  className="max-h-36 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCommentImage("");
                    setCommentImageFile(null);
                    if (commentImageInputRef.current) {
                      commentImageInputRef.current.value = "";
                    }
                  }}
                  className="absolute top-2 left-2 rounded-full bg-black p-1.5 text-white"
                  aria-label="إزالة الصورة"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => handleAddComment(e)}
              className="flex items-end gap-2"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                {myAvatar ? (
                  <img src={myAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold">{myName?.[0] || "؟"}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 rounded-2xl border border-[#2F3336] bg-[#16181C] px-3 py-2">
                <textarea
                  rows={1}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="انشر ردّك..."
                  maxLength={280}
                  className="w-full max-h-24 resize-none bg-transparent text-sm leading-6 text-white placeholder-[#71767B] focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-[#FFC500]">
                    <input
                      type="file"
                      ref={commentImageInputRef}
                      onChange={handleCommentImageSelect}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => commentImageInputRef.current?.click()}
                      className="rounded-full p-1.5 hover:bg-[#FFC500]/10"
                      title="إرفاق صورة"
                    >
                      <ImageIcon size={19} />
                    </button>
                  </div>

                  <span
                    className={`text-[10px] ${newCommentText.length >= 260 ? "text-amber-400" : "text-[#71767B]"}`}
                    dir="ltr"
                  >
                    {newCommentText.length}/280
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!newCommentText.trim() || newCommentText.length > 280}
                className="shrink-0 rounded-full bg-[#FFC500] px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
              >
                رد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة عرض تفاصيل التغريدة الكاملة مع كل الردود (عند النقر على جسم التغريدة) */}
      {/* قائمة إعادة النشر / اقتباس */}
      {repostMenu && (
        <div className="fixed inset-0 z-[60] bg-black flex items-end justify-center p-2" onClick={() => setRepostMenu(null)}>
          <div className="w-full max-w-md bg-[#16181C] rounded-2xl overflow-hidden mb-20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                handleRepost(repostMenu.id);
                setRepostMenu(null);
              }}
              className="w-full px-4 py-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3"
            >
              <Repeat2 size={20} className="text-emerald-400" />
              <span>إعادة النشر</span>
            </button>
            <button
              onClick={() => {
                setQuoteOriginal(repostMenu);
                setQuoteText('');
                setIsQuoting(true);
                setRepostMenu(null);
              }}
              className="w-full px-4 py-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3"
            >
              <MessageCircle size={20} className="text-[#FFC500]" />
              <span>اقتباس</span>
            </button>
            <button
              onClick={() => setRepostMenu(null)}
              className="w-full p-3 text-center text-white/60 font-bold hover:bg-white/5 transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* نافذة الاقتباس */}
      {isQuoting && quoteOriginal && (
        <div className="fixed inset-0 z-[70] bg-black flex flex-col p-4" dir="rtl">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { setIsQuoting(false); setQuoteOriginal(null); }} className="text-white p-2">
              <X size={24} />
            </button>
            <button
              onClick={async () => {
                if (!currentUserId || !quoteText.trim()) return;
                try {
                  const { error } = await supabase.from('post_reposts').upsert({
                    post_id: quoteOriginal.id,
                    user_id: currentUserId,
                    quote_text: quoteText.trim()
                  }, {
                    onConflict: 'user_id,post_id'
                  });
                  if (error) throw error;
                  showToast('تم الاقتباس ✅');
                  setIsQuoting(false);
                  setQuoteText('');
                  setQuoteOriginal(null);
                  
                  // إعادة جلب التغريدات لتظهر فوراً (بدون إعادة تحميل الصفحة)
                  setTimeout(() => {
                    if (typeof loadData === 'function') {
                      loadData();
                    }
                  }, 500);
                } catch (e: any) {
                  showToast('فشل: ' + (e?.message || ''));
                }
              }}
              disabled={!quoteText.trim()}
              className="px-4 py-1.5 bg-[#FFC500] text-white rounded-full font-bold text-sm disabled:opacity-50"
            >
              اقتباس
            </button>
          </div>
          <textarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="أضف تعليقك..."
            className="w-full bg-transparent text-white text-lg placeholder-[#71767B] resize-none focus:outline-none mb-4"
            rows={3}
          />
          <div className="border border border-[#2F3336] rounded-xl p-2.5 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <img src={quoteOriginal.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-bold text-white text-sm">{quoteOriginal.authorName}</span>
              <span className="text-[#71767B] text-xs">@{quoteOriginal.authorUsername}</span>
            </div>
            <p className="font-['Tahoma'] text-white text-sm">{quoteOriginal.text}</p>
          </div>
        </div>
      )}

      {viewingDetailTweet && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col h-[100dvh] text-white overflow-hidden" dir="rtl">
          {/* شريط علوي */}
          <div className="h-14 border-b border-[#2F3336] px-4 flex items-center justify-between shrink-0 bg-black ">
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
                <p className="font-['Tahoma'] font-bold text-sm text-white">{viewingDetailTweet.authorName}</p>
                <p className="font-['Tahoma'] text-[11px] text-[#71767B] font-normal font-['Tahoma']" dir="ltr">@{viewingDetailTweet.authorUsername}</p>
              </div>
            </div>

            <p className="font-['Tahoma'] text-[14px] leading-[1.5] text-[#E7E9EA] font-['Tahoma'] break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
              {viewingDetailTweet.text}
            </p>

            {viewingDetailTweet.image && (
              <div className="rounded-2xl overflow-hidden border border-[#2F3336] max-h-[450px]">
                <img src={viewingDetailTweet.image} alt="" className="w-full h-auto object-cover" />
              </div>
            )}

            <div className="text-[11px] text-[#71767B] py-2 border-y border-[#2F3336] flex items-center gap-2">
              <span>{formatTimeAndDate(viewingDetailTweet.createdAt)}</span>
              <span>·</span>
              <span>{viewingDetailTweet.views || 1} مشاهدة</span>
            </div>

            {/* أزرار التفاعل في العرض الكامل */}
            <div className="flex items-center justify-around py-1 border-b border-[#2F3336] text-[#71767B]">
              <button onClick={() => { setActiveCommentTweet(viewingDetailTweet); setViewingDetailTweet(null); }} className="flex items-center gap-1.5 hover:text-[#FFC500] transition">
                <MessageCircle size={16} />
                <span className="text-xs">{viewingDetailTweet?.comments?.length || 0}</span>
              </button>
              <button onClick={() => handleRepost(viewingDetailTweet.id)} className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                <Repeat2 size={16} />
                <span className="text-xs">{viewingDetailTweet.reposts || 0}</span>
              </button>
              <button onClick={() => handleLike(viewingDetailTweet.id)} className="flex items-center gap-1.5 hover:text-rose-500 transition">
                <Heart size={16} />
                <span className="text-xs">{viewingDetailTweet.likes || 0}</span>
              </button>
              <button onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); showToast('تم نسخ الرابط! 🔗'); } }} className="hover:text-white transition">
                <Share size={16} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setReportingItem({
                    type: 'post',
                    targetId: tweet.id,
                    targetName: tweet.authorName || 'مستخدم',
                    targetAuthorId: tweet.authorId || ''
                  });
                }} 
                className="hover:text-rose-500 transition p-1"
                title="إبلاغ عن التغريدة"
              >
                <Flag size={16} />
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
                    <div className="w-[30px] h-[30px] rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
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
                        <span className="text-[11px] text-[#71767B]">·</span>
                        <span className="text-[#71767B] text-[9px]" title={c.createdAtDisplay || c.createdAt}>
                          {formatTimeAgo(c.createdAt).relative || c.createdAtDisplay || 'الآن'}
                        </span>
                      </div>

                      {/* نص التعليق */}
                      <p className="font-['Tahoma'] text-xs text-[#E7E9EA] mt-1.5 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap select-text">
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
                        <button type="button" className="flex items-center gap-1 hover:text-[#FFC500] transition group">
                          <div className="p-1 rounded-full group-hover:bg-[#FFC500]/10">
                            <MessageCircle size={16} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-emerald-400 transition group">
                          <div className="p-1 rounded-full group-hover:bg-emerald-500/10">
                            <Repeat2 size={16} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-rose-500 transition group">
                          <div className="p-1 rounded-full group-hover:bg-rose-500/10">
                            <Heart size={16} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-white transition group">
                          <div className="p-1 rounded-full group-hover:bg-white/10">
                            <Share size={16} />
                          </div>
                        </button>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* شريط الكتابة الموحد مع صفحة الحساب */}
          <ReplyBar
            value={newCommentText}
            onChange={setNewCommentText}
            onSubmit={handleAddComment}
            myAvatar={myAvatar}
            myName={myName}
            onImageSelect={(file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                setCommentImage(reader.result as string);
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
      )}

      {/* نافذة البلاغات */}
      {reportingItem && (
        <ReportPage
          onClose={() => setReportingItem(null)}
          onSubmit={(reason) => {
            const reportData = {
              id: crypto.randomUUID(),
              type: reportingItem.type,
              targetId: reportingItem.targetId,
              targetName: reportingItem.targetName,
              targetAuthorId: reportingItem.targetAuthorId,
              reason: reason,
              details: '',
              created_at: new Date().toISOString(),
            };
            const existing = JSON.parse(localStorage.getItem('yr_community_reports') || '[]');
            localStorage.setItem('yr_community_reports', JSON.stringify([reportData, ...existing]));
            showToast('تم إرسال بلاغك بنجاح');
          }}
        />
      )}

      {/* شريط التنقل السفلي */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black  border-t border-[#2F3336] py-2 px-4 flex items-center justify-around text-xs font-bold">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-[#71767B] hover:text-white transition">
          <Home size={22} />
          <span>الرئيسية</span>
        </button>

        <button onClick={() => navigate('/feed')} className="flex flex-col items-center gap-1 text-[#FFC500] font-black transition">
          <MessageSquare size={22} className="stroke-[2.5]" />
          <span>المنشورات</span>
        </button>

        <button onClick={() => navigate('/notifications')} className="flex flex-col items-center gap-1 text-[#71767B] hover:text-[#FFC500] transition relative">
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

        <button onClick={() => navigate('/account')} className="flex flex-col items-center gap-1 text-[#71767B] hover:text-[#FFC500] transition">
          <User size={22} />
          <span>الملف الشخصي</span>
        </button>
      </nav>

    
      {/* قائمة ⋮ — للمجتمع */}
      {activeMenuPost && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center p-2" onClick={() => setActiveMenuPost(null)}>
          <div className="w-full max-w-xs bg-black rounded-2xl overflow-hidden mb-16 shadow-2xl border border-[#2F3336]" onClick={(e) => e.stopPropagation()}>
            
            {/* الخيارات التي تظهر فقط لصاحب التغريدة */}
            {activeMenuPost.authorId === currentUserId ? (
              <>
                <button onClick={() => { showToast('التثبيت قريباً'); setActiveMenuPost(null); }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                  <span>تثبيت على الملف الشخصي</span>
                </button>
                <button onClick={() => { showToast('الإفصاح قريباً'); setActiveMenuPost(null); }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                  <span>الإفصاح عن المحتوى</span>
                </button>
                <button onClick={() => {
                  if (activeMenuPost.id) {
                    supabase.from('posts').delete().eq('id', activeMenuPost.id).then(() => {
                      setTweets(prev => prev.filter(t => t.id !== activeMenuPost.id));
                      setActiveMenuPost(null);
                      showToast('تم حذف المنشور');
                    });
                  }
                }} className="w-full p-4 text-right text-[#F4212E] font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span>حذف المنشور</span>
                </button>
                <button onClick={() => { showToast('تغيير الردود قريباً'); setActiveMenuPost(null); }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  <span>تغيير من يمكنه الرد</span>
                </button>
                {/* الإبلاغ لصاحب التغريدة */}
                <button onClick={() => {
                  setReportingItem({ type: 'post', targetId: activeMenuPost.id, targetName: activeMenuPost.authorName || 'مستخدم', targetAuthorId: activeMenuPost.authorId || '' });
                  setActiveMenuPost(null);
                }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                  <span>إبلاغ</span>
                </button>
              </>
            ) : (
              /* الخيارات التي تظهر للمستخدمين الآخرين (الزوار) */
              <>
                <button onClick={() => handleNotInterested(activeMenuPost.id)} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>لست مهتماً بهذا المنشور</span>
                </button>
                <button onClick={() => handleUnfollow(activeMenuPost.authorId)} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg>
                  <span>إلغاء متابعة @{activeMenuPost.authorUsername}</span>
                </button>
                <button onClick={() => handleMute(activeMenuPost.authorId)} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                  <span>كتم @{activeMenuPost.authorUsername}</span>
                </button>
                <button onClick={() => handleBlock(activeMenuPost.authorId)} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                  <span>حظر @{activeMenuPost.authorUsername}</span>
                </button>
                {/* الإبلاغ للزوار */}
                <button onClick={() => {
                  setReportingItem({ type: 'post', targetId: activeMenuPost.id, targetName: activeMenuPost.authorName || 'مستخدم', targetAuthorId: activeMenuPost.authorId || '' });
                  setActiveMenuPost(null);
                }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336] flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                  <span>الإبلاغ عن المنشور</span>
                </button>
              </>
            )}
            
            <button onClick={() => setActiveMenuPost(null)} className="w-full p-4 text-center text-white/60 font-bold hover:bg-white/5 transition text-sm">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {!reportingItem && !viewingDetailTweet && <MobileBottomNav onNavigate={(path) => navigate(path)} />}

      
      {/* نافذة تعديل التغريدة */}
      {editingTweet && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4" onClick={() => setEditingTweet(null)}>
          <div className="bg-[#16181C] border border-[#2F3336] rounded-2xl w-full max-w-md p-5 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4">
              <h2 className="text-base font-black text-white">تعديل التغريدة</h2>
              <button onClick={() => setEditingTweet(null)} className="text-[#71767B] hover:text-white p-1 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-[#111111] border border-[#2F3336] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#FFC500] resize-none h-32"
              placeholder="عدل تغريدتك..."
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingTweet(null)} className="flex-1 py-2.5 rounded-xl border border-[#2F3336] text-white font-bold text-sm hover:bg-white/5 transition">إلغاء</button>
              <button onClick={handleSaveEdit} disabled={isSavingEdit || !editText.trim()} className="flex-1 py-2.5 rounded-xl bg-[#FFC500] text-black font-bold text-sm hover:bg-[#E5B200] transition disabled:opacity-50">
                {isSavingEdit ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإبلاغ المنبثقة */}
      

      {/* زر + (FAB) — يفتح نافذة التغريد المنبثقة */}
      <button
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-24 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(255,197,0,0.35)] transition"
        title="تغريدة جديدة"
      >
        <Plus size={28} className="stroke-[3]" />
      </button>


      {/* نافذة التغريد المنبثقة بكامل الشاشة (تصميم منصة X) */}
      {isPostModalOpen && (
        <div 
          className="fixed inset-0 z-[150] bg-black text-white flex flex-col justify-between overflow-hidden" 
          dir="rtl"
          style={{ 
            height: modalHeight ? `${modalHeight}px` : '100dvh',
            maxHeight: modalHeight ? `${modalHeight}px` : '100dvh'
          }}
        >
          
          {/* كود صارم لإلغاء أي مستطيل أو إطار تركيز من المتصفح */}
          <style>{`
            .clean-tweet-textarea,
            .clean-tweet-textarea:focus,
            .clean-tweet-textarea:active,
            .clean-tweet-textarea:focus-visible {
              outline: none !important;
              border: none !important;
              box-shadow: none !important;
              -webkit-box-shadow: none !important;
              -webkit-tap-highlight-color: transparent !important;
            }
          `}</style>

          {/* الشريط العلوي: إلغاء / مسودات / نشر */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-black">
            <button
              type="button"
              onClick={() => setIsPostModalOpen(false)}
              className="text-white hover:text-zinc-300 p-1 rounded-full transition active:scale-95"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-4">
              <span className="text-[#FFC500] text-sm font-bold cursor-pointer hover:underline hidden sm:inline">
                المسوّدات
              </span>

              <button
                onClick={handlePostTweet}
                disabled={isPosting || (!tweetText.trim() && !selectedFile) || tweetText.length > 280}
                className="px-5 py-1.5 rounded-full bg-[#FFC500] hover:bg-[#E5B200] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-black font-black text-sm transition shadow-md flex items-center gap-1.5"
              >
                {isPosting ? 'جاري النشر...' : 'نشر'}
              </button>
            </div>
          </div>

          {/* محتوى الكتابة: الأفاتار وبجانبه المؤشر الصغير المتحرك مباشرة وباقي الصفحة سوداء */}
          <div className="flex-1 min-h-0 px-4 pt-2 overflow-y-auto flex flex-col bg-black">
            <div className="flex items-start gap-3 flex-1">
              {/* صورة الأفاتار فقط أعلى اليمين */}
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center font-bold shrink-0 mt-1">
                {myAvatar ? (
                  <img src={myAvatar} alt={myName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm">{myName ? myName[0] : '؟'}</span>
                )}
              </div>

              {/* حقل الكتابة مدمج تماماً في السواد مع مؤشر عمودي متحرك بلون المنصة */}
              <div className="flex-1 min-w-0 flex flex-col">
                <textarea
                  autoFocus
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  placeholder="ماذا يحدث؟"
                  className="clean-tweet-textarea w-full bg-transparent text-white text-[17px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none leading-relaxed min-h-[120px] caret-[#FFC500]"
                  style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
                />

                {/* معاينة الوسائط عند اختيارها */}
                {tweetImage && (
                  <div className="relative rounded-[16px] overflow-hidden border border-zinc-800 max-h-56 sm:max-h-64 my-3 bg-zinc-950 shrink-0">
                    {selectedFile?.type.startsWith('video/') ? (
                      <video src={tweetImage} controls className="w-full max-h-56 sm:max-h-64 object-contain mx-auto" />
                    ) : (
                      <img src={tweetImage} alt="المعاينة" className="w-full max-h-56 sm:max-h-64 object-contain mx-auto" />
                    )}
                    <button
                      type="button"
                      onClick={() => { setTweetImage(''); setSelectedFile(null); if (imageInputRef.current) imageInputRef.current.value = ''; }}
                      className="absolute top-2 left-2 bg-black/80 hover:bg-black text-white p-1.5 rounded-full transition backdrop-blur-md"
                      title="إزالة"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* الشريط السفلي: خط نحيل باهت والأيقونات الصفراء ترتفع وتنخفض مع الكيبورد */}
          <div className="shrink-0 bg-black border-t border-zinc-800/60 pb-2">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#FFC500] px-4 py-2">
              <Globe size={15} />
              <span>يمكن للجميع الرد</span>
            </div>

            {/* الأيقونات باللون الأصفر متناسقة ومتباعدة طبق الأصل */}
            <div className="flex items-center justify-between px-3 pt-1">
              <div className="flex items-center gap-3 sm:gap-4 text-[#FFC500]">
                {/* معرض الصور */}
                <button
                  type="button"
                  onClick={() => {
                    if (imageInputRef.current) {
                      imageInputRef.current.accept = "image/*";
                      imageInputRef.current.click();
                    }
                  }}
                  className="p-1.5 hover:bg-[#FFC500]/10 rounded-full transition active:scale-90"
                  title="صور"
                >
                  <ImageIcon size={21} />
                </button>

                {/* الفيديو */}
                <button
                  type="button"
                  onClick={() => {
                    if (imageInputRef.current) {
                      imageInputRef.current.accept = "video/*";
                      imageInputRef.current.click();
                    }
                  }}
                  className="p-1.5 hover:bg-[#FFC500]/10 rounded-full transition active:scale-90"
                  title="فيديو"
                >
                  <Video size={21} />
                </button>
              </div>

              {/* عداد الحروف (280) */}
              <div className="flex items-center gap-1.5 text-xs font-mono select-none px-2 text-[#71767B]" dir="ltr">
                <span className={tweetText.length > 280 ? "text-rose-500 font-bold" : tweetText.length >= 260 ? "text-[#FFC500] font-bold" : "text-zinc-500"}>
                  {tweetText.length}
                </span>
                <span>/ 280</span>
              </div>
            </div>
          </div>
        </div>
      )}
</div>
  );
};
