import { XVideoPlayer } from '../components/feed/XVideoPlayer';

// تنظيف أمان لمنع امتلاء localStorage وضمان وجود مساحة لرمز جلسة Supabase
try {
  const cleanKey = 'yr_storage_cleaned_v2';
  if (!localStorage.getItem(cleanKey)) {
    // إزالة السجلات المتضخمة القديمة فقط مع الحفاظ على بيانات الدخول
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('yr_x_') || k.startsWith('yr_user_profile_') || k === 'yr_community_reports')) {
        localStorage.removeItem(k);
      }
    }
    localStorage.setItem(cleanKey, 'true');
  }
} catch (_) {}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from "../lib/supabase";
import { getUserProfile, updateUserProfile, getUserPosts, createPost, deletePost, togglePostLike, toggleFollow, checkIsFollowing, toggleBlockUser, checkIsBlocked, uploadSocialImage, Profile, PostItem } from "../services/socialService";
import {
  ArrowRight,
  RotateCw,
  MoreHorizontal,
  MapPin,
  Calendar,
  Cake,
  CheckCircle2,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Plus,
  Camera,
  X,
  Image as ImageIcon,
  Pin,
  Trash2,
  Edit3,
  Loader2,
  Home,
  MessageSquare,
  User,
  Phone,
  Mail,
  LogOut,
  UserPlus,
  UserCheck,
  Lock,
  BarChart,
  Bell,
  AlertTriangle,
  Flag,
  Globe,
  Video
} from "lucide-react";
import { AuthModal } from '../components/auth/AuthModal';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { ReportPage } from '../components/community/ReportPage';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  image?: string;
  createdAt: string;
  createdAtDisplay?: string;
  isPinned?: boolean;
  likes: number;
  likedBy?: string[];
  replies: number;
  reposts: number;
  views: number;
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
const FOLLOWS_KEY = 'yr_social_follows'; // { [followerId]: [followingIds] }

// دالة تصغير وضغط الصور الذكية حتى تعمل على أي هاتف دون تجاوز الذاكرة
const compressImage = (file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export const VerifiedBadge: React.FC<{ type?: string | boolean; size?: number }> = ({ type, size = 19 }) => {
  if (!type || type === "none" || type === false) return null;
  const bType = type === true ? "blue" : type;
  const colors: Record<string, string> = { blue: "#1D9BF0", gold: "#EAB308", gray: "#9CA3AF", silver: "#9CA3AF" };
  const fill = colors[bType] || "#FFC500";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block flex-shrink-0 align-middle mr-1.5 drop-shadow-sm">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6s-2.95.875-3.6 2.148c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z" fill={fill} />
      <path d="M9.8 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4-7 7z" fill="#FFFFFF" />
    </svg>
  );
};

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routerLocation = useLocation();
  const navState = (routerLocation.state as any) || {};
  const targetIdParam = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('بدء...');
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // قائمة خيارات (...)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // بيانات الحساب المعروض الحقيقي
  const [profileId, setProfileId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [myName, setMyName] = useState<string>('مستخدم');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>('');

  // أرقام المتابعة الحقيقية
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [verificationType, setVerificationType] = useState<string>("none");
  const [isBlocked, setIsBlocked] = useState(false);
  const [isDmOpen, setIsDmOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; desc: string; onConfirm: () => void } | null>(null);
  const [dmContent, setDmContent] = useState("");

  // المنشورات
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'reposts' | 'media' | 'likes'>('posts');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  
function formatTimeAndDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const time = date.toLocaleTimeString('ar-YE', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
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

const [activeMenuPost, setActiveMenuPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [reportingItem, setReportingItem] = useState<{
    type: 'post' | 'image' | 'account';
    targetId: string;
    targetName: string;
    targetAuthorId: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState('محتوى غير لائق أو مسيء');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [repostMenu, setRepostMenu] = useState<Post | null>(null);
  const [isRepostDisabled, setIsRepostDisabled] = useState(false);
  const [quoteOriginal, setQuoteOriginal] = useState<Post | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [viewingDetailPost, setViewingDetailPost] = useState<Post | null>(null);

  // 🔄 تحميل تعليقات viewingDetailPost تلقائياً
  useEffect(() => {
    // جلب اسم المستخدم الحالي
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single();
          if (profile) setMyName(profile.full_name || profile.username || 'مستخدم');
        }
      } catch {}
    })();

    if (viewingDetailPost?.id) {
      loadComments(viewingDetailPost.id);
    }
  }, [viewingDetailPost?.id]);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // المودالات
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // حقول التعديل
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // منشور جديد
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostFile, setNewPostFile] = useState<File | null>(null);
  const [isPostingModal, setIsPostingModal] = useState(false);
  const [modalHeight, setModalHeight] = useState<number | null>(null);

  // 📱 ضبط ارتفاع النافذة بدقة متناهية مع لوحة مفاتيح الجوال
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


  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. فحص الجلسة الحقيقية وتحميل الحساب الحقيقي
  const loadProfile = async (currentUserParam?: any) => {
    try {
      const user = currentUserParam !== undefined ? currentUserParam : (await supabase.auth.getUser()).data.user;
      setSessionUser(user);
      
      // تحديث currentUserId و myName
      if (user) {
        setCurrentUserId(user.id);
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();
        if (myProfile) {
          setMyName(myProfile.full_name || myProfile.username || 'مستخدم');
        } else {
          setMyName(user.email?.split('@')[0] || 'مستخدم');
        }
      }
      const myId = user?.id || "";
      const targetId = targetIdParam || myId;
      
      console.log('🟢 DEBUG:', { targetId, targetIdParam, myId, profileId });
      console.log('🟢 targetId:', targetId, '| myId:', myId);

      if (!targetId) {
        setLoading(false);
        return;
      }

      const viewingOwner = (targetId === myId);

      // قراءة الجسر الذكي القادم من المجتمع في 0 ثانية
      if (navState && navState.name) {
        setName(navState.name);
        if (navState.username) setUsername(navState.username);
        if (navState.avatarUrl) setAvatarUrl(navState.avatarUrl);
        setLoading(false);
      }

      setIsOwner(viewingOwner);
      setProfileId(targetId);

      // بديل فوري في 0 ثانية لحسابي من بيانات الجلسة حتى لا تنتظر الصفحة
      if (viewingOwner && user) {
        const meta = user.user_metadata || {};
        setName(meta.full_name || meta.name || user.email?.split("@")[0] || "مستخدم يمن ريتنج");
        setUsername(meta.username || user.email?.split("@")[0] || "user");
        if (meta.avatar_url) setAvatarUrl(meta.avatar_url);
        if (meta.bio) setBio(meta.bio);
        setEmail(user.email || "");
        setPhone(meta.phone || user.phone || "");
        if (user.created_at) {
          const d = new Date(user.created_at);
          const months = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
          setJoinDate("انضم في " + months[d.getMonth()] + " " + d.getFullYear());
        }
        // إزالة شاشة التحميل فوراً لحسابك
        setLoading(false);
      }

      // جلب السحابة مع حماية أقصاها 2.5 ثانية لمنع أي تعليق
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject("timeout"), 2500));

      try {
        const pData: any = await getUserProfile(targetId);
        if (pData) {
          if (pData.full_name) setName(pData.full_name); else if (navState.name) setName(navState.name);
          if (pData.username) setUsername(pData.username); else if (navState.username) setUsername(navState.username);
          if (pData.avatar_url) setAvatarUrl(pData.avatar_url); else if (navState.avatarUrl) setAvatarUrl(navState.avatarUrl);
          if (pData.cover_url) setCoverUrl(pData.cover_url);
          if (pData.bio) setBio(pData.bio);
          if (pData.location) setLocation(pData.location);
          setFollowersCount(pData.followers_count || 0);
          setFollowingCount(pData.following_count || 0);
          setVerificationType(pData.verification_type || (pData.is_verified ? "blue" : "none"));
        }
      } catch (_) {}

      // فحص المتابعة والحظر
      if (myId && myId !== targetId) {
        try {
          const [following, blocked]: any = await Promise.race([
            Promise.all([checkIsFollowing(myId, targetId), checkIsBlocked(myId, targetId)]),
            timeoutPromise
          ]);
          setIsFollowing(!!following);
          setIsBlocked(!!blocked);
        } catch (_) {}
      }

      // جلب التغريدات
      try {
        console.log('🟢 Before getUserPosts — targetId:', targetId, '| myId:', myId);
        const dbPosts: any = await getUserPosts(targetId, myId);
        
        const errMsg = (window as any).__lastGetUserPostsError;
        if (errMsg) {
          
        }
        console.log('🟢 After getUserPosts — got:', dbPosts?.length || 0, 'posts');
        if (dbPosts && dbPosts[0]) console.log('   first:', dbPosts[0].content);
        if (Array.isArray(dbPosts)) {
          console.log('🟢 About to setUserPosts with:', dbPosts.length);
              setUserPosts(dbPosts.map((p: any) => ({
            ...p,
            id: p.id,
            authorId: p.authorId || p.user_id,
            authorName: p.authorName || p.profile?.full_name || name,
            authorUsername: p.authorUsername || p.profile?.username || username,
            authorAvatar: p.authorAvatar || p.profile?.avatar_url || '',
            authorBadge: p.authorBadge || p.profile?.verification_type || (p.profile?.is_verified ? "blue" : "none"),
            text: p.text || p.content,
            image: p.image || p.image_url || undefined,
            video_url: p.video_url || p.video || undefined,
            video: p.video_url || p.video || undefined,
            createdAt: p.createdAt || p.created_at,
            createdAtDisplay: p.createdAtDisplay || new Date(p.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: p.likes || p.likes_count || 0,
            likedBy: p.likedBy || [],
            isLiked: p.isLiked,
            replies: p.replies || p.comments_count || 0,
            reposts: p.reposts || p.reposts_count || 0,
            views: p.views || p.views_count || 1,
            isRepost: p.isRepost,
            quote_text: p.quote_text,
            original: p.original,
          })));
        }
      } catch (_) {}

    } catch (e) {
      console.error("LoadProfile error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryLoad = async () => {
      if (cancelled) return;
      attempts++;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          
          loadProfile(session.user);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.error('🟢 Session not found after', maxAttempts, 'attempts');
          loadProfile(null);
          return;
        }
        
        setTimeout(tryLoad, 500);
      } catch (e) {
        console.error('🟢 getSession error:', e);
        if (attempts < maxAttempts) setTimeout(tryLoad, 500);
      }
    };
    
    tryLoad();
    
    return () => {
      cancelled = true;
    };
  }, [targetIdParam]);


  // 🔄 Realtime للتغريدات في صفحة الحساب
  useEffect(() => {
    if (!profileId || profileId === 'guest') return;
    
    const channel = supabase
      .channel(`account-posts-${profileId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'posts',
        filter: `user_id=eq.${profileId}`,
      }, async () => {
        try {
          const dbPosts: any = await getUserPosts(profileId, sessionUser?.id);
          if (Array.isArray(dbPosts)) {
            setUserPosts(dbPosts.map((p: any) => ({
              id: p.id,
              authorId: p.user_id,
              authorName: p.profile?.full_name || '',
              authorUsername: p.profile?.username || '',
              authorAvatar: p.profile?.avatar_url || '',
              authorBadge: p.profile?.verification_type || (p.profile?.is_verified ? 'blue' : 'none'),
              text: p.content,
              image: p.image_url || undefined,
              video_url: p.video_url || p.video || undefined,
              video: p.video_url || p.video || undefined,
              createdAt: p.created_at,
              createdAtDisplay: new Date(p.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
              likes: p.likes_count || 0,
              likedBy: [],
              isLiked: p.isLiked,
              replies: p.comments_count || 0,
              reposts: p.reposts_count || 0,
              views: p.views_count || 1,
            })));
          }
        } catch (_) {}
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'post_likes',
      }, async () => {
        try {
          const dbPosts: any = await getUserPosts(profileId, sessionUser?.id);
          if (Array.isArray(dbPosts)) {
            setUserPosts((prev: any) => prev.map((p: any) => {
              const fresh = dbPosts.find((dp: any) => dp.id === p.id);
              return fresh ? { ...p, likes: fresh.likes_count || 0, isLiked: fresh.isLiked } : p;
            }));
          }
        } catch (_) {}
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [profileId, sessionUser?.id]);

  // تغيير وحفظ الصور مع الضغط التلقائي
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('جاري تجهيز الصورة...');
      // ضغط وتصغير الصورة لتخزين فوري بدون أي أخطاء
      const maxWidth = target === 'avatar' ? 180 : 600;
      const maxHeight = target === 'avatar' ? 180 : 250;
      const compressedDataUrl = await compressImage(file, maxWidth, maxHeight, 0.6);

      if (target === 'avatar') {
        setAvatarUrl(compressedDataUrl);
      } else {
        setCoverUrl(compressedDataUrl);
      }

      // حفظ فوري في بيانات الحساب
      const usersDir = JSON.parse(localStorage.getItem(USERS_DIR_KEY) || '{}');
      if (usersDir[profileId]) {
        if (target === 'avatar') usersDir[profileId].avatarUrl = compressedDataUrl;
        if (target === 'cover') usersDir[profileId].coverUrl = compressedDataUrl;
        safeSetStorage(USERS_DIR_KEY, usersDir);
      }

      // مزامنة الصورة في جميع تغريداته
      if (target === 'avatar') {
        const globalFeed: Post[] = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || '[]');
        const updatedFeed = globalFeed.map(t => t.authorId === profileId ? { ...t, authorAvatar: compressedDataUrl } : t);
        localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(updatedFeed));
        setUserPosts(updatedFeed.filter(t => t.authorId === profileId));
      }

      // محاولة الحفظ في Supabase Auth
// لا نخزن الصور الضخمة في جلسة Supabase لمنع QuotaExceededError

      if (profileId && profileId !== "guest") {
        const pObj = target === "avatar" ? { avatar_url: compressedDataUrl } : { cover_url: compressedDataUrl };
        supabase.auth.getSession().then(({ data: { session } }) => {
        const uToken = session?.access_token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w";
        fetch("/supabase-api/rest/v1/profiles?id=eq." + profileId, {
          method: "PATCH",
          credentials: "omit",
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubXVuY3hrZnlva25tcWVqZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MjAyNDgsImV4cCI6MjEwNjM5NjI0OH0.brz_j92R3j1FmDUyryxpaoIfn4vK_rcZjelYaCd5T0w",
            "Authorization": "Bearer " + uToken,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify(pObj)
        }).catch(console.error);
      });
      }
      showToast(target === "avatar" ? "تم تغيير الصورة الشخصية بنجاح! ✅" : "تم تغيير الغلاف بنجاح! ✅");
    } catch (err) {
      console.error(err);
      showToast('تعذر معالجة الصورة، يرجى تجربة صورة أخرى');
    }
  };

  // حفظ التعديلات
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    const updated = {
      id: profileId,
      name: editName.trim() || name,
      phone: editPhone.trim(),
      username: editUsername.trim() || username,
      bio: editBio.trim(),
      location: editLocation.trim(),
      birthDate: editBirthDate.trim(),
      avatarUrl,
      coverUrl,
    };

    setName(updated.name);
    setPhone(updated.phone);
    setUsername(updated.username);
    setBio(updated.bio);
    setLocation(updated.location);
    setBirthDate(updated.birthDate);

    // حفظ في دليل المستخدمين
    const usersDir = JSON.parse(localStorage.getItem(USERS_DIR_KEY) || '{}');
    usersDir[profileId] = { ...usersDir[profileId], ...updated };
    safeSetStorage(USERS_DIR_KEY, usersDir);

    // تحديث اسم المغرد في تغريداته
    const globalFeed: Post[] = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || '[]');
    const synced = globalFeed.map(t => t.authorId === profileId ? { ...t, authorName: updated.name, authorUsername: updated.username } : t);
    localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(synced));
    setUserPosts(synced.filter(t => t.authorId === profileId));

    try {
      if (sessionUser) {
        // نرسل البيانات النصية فقط إلى Supabase Auth حتى لا يتضخم رمز الجلسة auth-token
        await supabase.auth.updateUser({
          data: {
            full_name: updated.name,
            phone: updated.phone,
            username: updated.username,
            bio: updated.bio,
          }
        }).catch(() => {});
        if (profileId && profileId !== "guest") {
          await supabase.from("profiles").update({
            full_name: updated.name,
            username: updated.username,
            phone: updated.phone,
            bio: updated.bio,
            location: updated.location
          }).eq("id", profileId);
        }
      }
      showToast('تم حفظ التعديلات بنجاح');
      setIsEditModalOpen(false);
    } catch (_) {
      showToast('تم الحفظ محلياً بنجاح!');
      setIsEditModalOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };

  // نظام المتابعة الحقيقي (Supabase)
  const handleToggleFollow = async () => {
    if (!sessionUser) {
      showToast('يرجى تسجيل الدخول أولاً لتتمكن من المتابعة!');
      setAuthModalOpen(true);
      return;
    }
    const myId = sessionUser.id;
    const targetId = profileId;
    if (!targetId || myId === targetId) return;
    
    try {
      const nowFollowing = await toggleFollow(myId, targetId);
      setIsFollowing(nowFollowing);
      
      if (nowFollowing) {
        setFollowersCount(prev => prev + 1);
        showToast(`تابعت ${name} بنجاح! ⭐`);
      } else {
        setFollowersCount(prev => Math.max(0, prev - 1));
        showToast(`ألغيت متابعة ${name}`);
      }
    } catch (e: any) {
      console.error('Toggle follow error:', e);
      showToast('فشل تحديث المتابعة');
    }
  };

  // إنشاء منشور حقيقي
  const handleCreatePost = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isPostingModal) return;

    if (!newPostText.trim() && !newPostFile && !newPostImage) {
      showToast("يرجى كتابة نص أو إرفاق وسائط أولاً ⚠️");
      return;
    }

    if (!sessionUser || !profileId || profileId === "guest") {
      showToast("يرجى تسجيل الدخول أولاً لتتمكن من النشر");
      setAuthModalOpen(true);
      return;
    }

    setIsPostingModal(true);
    let finalImageUrl: string | null = null;
    let finalVideoUrl: string | null = null;

    let fileToUpload = newPostFile;
    if (!fileToUpload && newPostImage && newPostImage.startsWith('data:')) {
      try {
        const res = await fetch(newPostImage);
        const blob = await res.blob();
        fileToUpload = new File([blob], `image_${profileId}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      } catch (_) {}
    }
    if (fileToUpload) {
      try {
        if (fileToUpload.type.startsWith('video/')) {
          showToast("جاري رفع الفيديو سحابياً... ⏳");
          const ext = fileToUpload.name.split('.').pop() || 'mp4';
          const filePath = `posts/video_${profileId}_${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from('social-media')
            .upload(filePath, fileToUpload, {
              upsert: true,
              contentType: fileToUpload.type || 'video/mp4'
            });
          if (upErr) throw upErr;
          const { data: pubData } = supabase.storage.from('social-media').getPublicUrl(filePath);
          finalVideoUrl = pubData.publicUrl;
        } else {
          showToast("جاري رفع الصورة سحابياً... ⏳");
          const ext = fileToUpload.name.split('.').pop() || 'jpg';
          const filePath = `posts/image_${profileId}_${Date.now()}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from('social-media')
            .upload(filePath, fileToUpload, {
              upsert: true,
              contentType: fileToUpload.type || 'image/jpeg'
            });
          if (upErr) throw upErr;
          const { data: pubData } = supabase.storage.from('social-media').getPublicUrl(filePath);
          finalImageUrl = pubData.publicUrl;
        }
      } catch (err: any) {
        setIsPostingModal(false);
        showToast("فشل رفع الملف: " + (err.message || 'خطأ في التخزين'));
        return;
      }
    }

    showToast("جاري نشر التغريدة سحابياً... ⏳");
    try {
      const { data: inserted, error: pErr } = await supabase.from("posts").insert({
        user_id: profileId,
        content: newPostText.trim(),
        image_url: finalImageUrl || null,
        video_url: finalVideoUrl || null,
      }).select().single();

      if (pErr) throw pErr;

      const realPost: Post = {
        id: inserted?.id || Date.now().toString(),
        authorId: profileId,
        authorName: name,
        authorUsername: username,
        authorAvatar: avatarUrl,
        authorBadge: verificationType,
        text: newPostText.trim(),
        image: finalImageUrl || undefined,
        video: finalVideoUrl || undefined,
        video_url: finalVideoUrl || undefined,
        createdAt: "الآن",
        likes: 0,
        likedBy: [],
        replies: 0,
        reposts: 0,
        views: 1,
      };

      setUserPosts(prev => [realPost, ...prev]);
      setNewPostText("");
      setNewPostImage("");
      setNewPostFile(null);
      setIsPostModalOpen(false);
      setIsPostingModal(false);
      showToast("تم نشر تغريدتك بنجاح! 🚀✨");
    } catch (err: any) {
      setIsPostingModal(false);
      console.error("Post error:", err);
      showToast("حدث خطأ أثناء النشر: " + (err.message || ""));
    }
  };

  const loadComments = async (postId: string) => {
    setLoadingComments(true);
    try {
      const { data: comments, error } = await supabase
        .from('post_comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!comments || comments.length === 0) {
        setPostComments([]);
        return;
      }
      
      const userIds = [...new Set(comments.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      
      const mapped = comments.map((c: any) => {
        const profile = profileMap.get(c.user_id);
        return {
          id: c.id,
          userId: c.user_id,
          userName: profile?.full_name || 'مستخدم',
          userUsername: profile?.username || 'user',
          userAvatar: profile?.avatar_url || '',
          content: c.content,
          createdAt: c.created_at,
          createdAtDisplay: new Date(c.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        };
      });
      
      setPostComments(mapped);
    } catch (e) {
      console.error('loadComments error:', e);
      setPostComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newCommentText.trim() || !sessionUser?.id || !activeCommentPost) {
      return;
    }
    
    try {
      const postIdToUse = activeCommentPost.id.startsWith('repost-') && activeCommentPost.original?.id 
        ? activeCommentPost.original.id 
        : activeCommentPost.id;
      
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postIdToUse,
          user_id: sessionUser.id,
          content: newCommentText.trim(),
        });
      
      if (error) throw error;
      
      setNewCommentText('');
      await loadComments(postIdToUse);
      showToast('تم إضافة الرد');
    } catch (e: any) {
      console.error('add comment error:', e);
      showToast('فشل: ' + (e?.message || 'خطأ'));
    }
  };

  const handleRepost = async (postId: string) => {
    if (!sessionUser?.id) {
      showToast('يرجى تسجيل الدخول');
      return;
    }
    
    try {
      // تحقق من وجود إعادة تغريد
      const { data: existing } = await supabase
        .from('post_reposts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', sessionUser.id)
        .maybeSingle();
      
      if (existing) {
        // إلغاء
        await supabase
          .from('post_reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', sessionUser.id);
        
        setUserPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, reposts: Math.max(0, (p.reposts || 0) - 1) } : p
        ));
        showToast('تم إلغاء إعادة النشر');
      } else {
        // إعادة جديدة
        await supabase
          .from('post_reposts')
          .insert({ post_id: postId, user_id: sessionUser.id });
        
        setUserPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, reposts: (p.reposts || 0) + 1 } : p
        ));
        showToast('تمت إعادة النشر');
      }
    } catch (e: any) {
      console.error('repost error:', e);
      showToast('فشل: ' + (e?.message || 'خطأ'));
    }
  };

  const handleToggleLike = (postId: string) => {
    const myId = sessionUser?.id || 'guest';
    const updated = userPosts.map(p => {
      if (p.id === postId) {
        const likedBy = p.likedBy || [];
        const isCurrentlyLiked = likedBy.includes(myId);
        const nextLikedBy = isCurrentlyLiked ? likedBy.filter(id => id !== myId) : [...likedBy, myId];
        return {
          ...p,
          isLiked: !isCurrentlyLiked,
          likes: nextLikedBy.length,
          likedBy: nextLikedBy,
        };
      }
      return p;
    });
    setUserPosts(updated);

    const globalFeed: Post[] = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || '[]');
    const synced = globalFeed.map(t => {
      if (t.id === postId) {
        const likedBy = t.likedBy || [];
        const isLiked = likedBy.includes(myId);
        const nextLikedBy = isLiked ? likedBy.filter(id => id !== myId) : [...likedBy, myId];
        return {
          ...t,
          isLiked: !isLiked,
          likes: nextLikedBy.length,
          likedBy: nextLikedBy,
        };
      }
      return t;
    });
    localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(synced));
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('هل تريد حذف هذا المنشور؟')) {
      const updated = userPosts.filter(p => p.id !== postId);
      setUserPosts(updated);

      const globalFeed: Post[] = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || '[]');
      localStorage.setItem(GLOBAL_FEED_KEY, JSON.stringify(globalFeed.filter(t => t.id !== postId)));
      supabase.from("posts").delete().eq("id", postId).then(() => {});
      showToast("تم حذف المنشور");
    }
  };

  // تسجيل الخروج
  
  // حظر الحساب (بدون نوافذ أندرويد الافتراضية)
  const handleToggleBlock = () => {
    setIsMenuOpen(false);
    if (!sessionUser) {
      showToast("يرجى تسجيل الدخول أولاً");
      setAuthModalOpen(true);
      return;
    }
    const willBlock = !isBlocked;
    setConfirmModal({
      open: true,
      title: willBlock ? "حظر @" + (username || name) : "إلغاء حظر @" + (username || name),
      desc: willBlock ? "لن يتمكن هذا الحساب من متابعتك أو رؤية منشوراتك." : "ستتمكن من رؤية منشوراته والتفاعل معه مجدداً.",
      onConfirm: async () => {
        const res = await toggleBlockUser(sessionUser.id, profileId);
        setIsBlocked(res);
        showToast(res ? "تم حظر الحساب" : "تم إلغاء الحظر");
      }
    });
  };

  // إرسال رسالة خاصة
  const handleSendDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) {
      showToast("يرجى تسجيل الدخول للمراسلة");
      setAuthModalOpen(true);
      return;
    }
    if (!dmContent.trim()) return;
    try {
      await supabase.from("direct_messages").insert({
        sender_id: sessionUser.id,
        receiver_id: profileId,
        content: dmContent.trim()
      });
      setDmContent("");
      setIsDmOpen(false);
      showToast("تم إرسال الرسالة الخاصة بنجاح ✉️");
    } catch (_) {
      showToast("تعذر إرسال الرسالة");
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      await supabase.auth.signOut();
      localStorage.removeItem('sb-auth-token');
      showToast('تم تسجيل الخروج بنجاح 👋');
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-['Tahoma',sans-serif]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFC500]" />
      </div>
    );
  }

  // إذا لم يكن مسجل دخول وليس هناك بروفايل لشخص آخر يتصفحه: عرض شاشة تسجيل الدخول
  if (!sessionUser && !targetIdParam) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-['Tahoma',sans-serif]" dir="rtl">
        <div className="w-20 h-20 rounded-3xl bg-[#141E30] border border-[#2F3336] flex items-center justify-center mb-5 text-[#FFC500] shadow-2xl">
          <Lock size={36} />
        </div>
        <h2 className="text-xl font-black mb-2">تسجيل الدخول إلى حسابك</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
          سجّل دخولك بحسابك الحقيقي للوصول إلى ملفك الشخصي، وتغيير صورتك وغلافك، ومشاركة تغريداتك مع مجتمع يمن ريتنج.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="w-full max-w-xs py-3.5 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-white font-black text-sm transition shadow-[0_8px_25px_rgba(29,155,240,0.4)]"
        >
          تسجيل الدخول / إنشاء حساب
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => { setAuthModalOpen(false); loadProfile(); }} defaultMode="login" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-['Tahoma',sans-serif] selection:bg-[#FFC500] selection:text-white pb-32" dir="rtl">
      
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] bg-black/95 backdrop-blur-2xl border border-[#2F3336] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-[0_12px_40px_rgba(0,0,0,0.9)] animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#FFC500] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {isOwner && (
        <>
          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'avatar')} />
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'cover')} />
          <input type="file" ref={postImageInputRef} className="hidden" accept="image/*,video/*" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.type.startsWith('video/')) {
                setNewPostFile(f);
                setNewPostImage(URL.createObjectURL(f));
              } else {
                try {
                  const compressed = await compressImage(f, 1200, 1200, 0.85);
                  setNewPostImage(compressed);
                  const res = await fetch(compressed);
                  const blob = await res.blob();
                  const compressedFile = new File([blob], f.name.replace(/\.[^.]+$/, '.jpg') || 'image.jpg', { type: 'image/jpeg' });
                  setNewPostFile(compressedFile);
                } catch (_) {
                  setNewPostFile(f);
                  setNewPostImage(URL.createObjectURL(f));
                }
              }
            }
          }} />
        </>
      )}

      {/* 1. الغلاف بنمط أبو شرواني */}
      <div className="relative w-full h-36 sm:h-40 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950">
        {coverUrl ? (
          <img src={coverUrl} alt="الغلاف" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0B1528] via-[#050C18] to-black flex items-center justify-center text-zinc-700 text-xs font-bold">
            {isOwner && 'انقر على زر الكاميرا لإضافة غلاف'}
          </div>
        )}

        {isOwner && (
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-2.5 left-2.5 bg-black/60 hover:bg-black/90 active:scale-95 text-white/90 p-2 rounded-full border border-white/10 transition backdrop-blur-md z-10"
            title="تغيير صورة الغلاف"
          >
            <Camera size={15} />
          </button>
        )}

        {/* أزرار الهيدر العلوية */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 border border-white/10"
            title="رجوع"
          >
            <ArrowRight size={18} />
          </button>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => window.location.reload()}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 border border-white/10"
            >
              <RotateCw size={16} />
            </button>
            <button
              onClick={() => navigate('/feed')}
              title="تغريدات المجتمع"
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 border border-white/10"
            >
              <MessageSquare size={16} />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="خيارات الحساب"
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 border border-white/10"
            >
              <MoreHorizontal size={18} />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute left-0 top-12 w-44 bg-black/95 backdrop-blur-2xl border border-[#2F3336] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-1.5 z-50 text-xs animate-fade-in divide-y divide-[#2F3336]/60">
                  {isOwner ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setEditName(name); setEditPhone(phone); setEditUsername(username); setEditBio(bio); setEditLocation(location); setEditBirthDate(birthDate);
                          setIsEditModalOpen(true); setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <Edit3 size={16} className="text-zinc-400 flex-shrink-0" />
                        <span className="text-white text-sm">تعديل</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2.5 text-right hover:bg-rose-500/15 active:bg-rose-500/20 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <LogOut size={16} className="text-rose-500 flex-shrink-0" />
                        <span className="text-white text-sm">خروج</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          setIsMenuOpen(false);
                          showToast("تم نسخ الرابط");
                        }}
                        className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <Share size={16} className="text-[#FFC500] flex-shrink-0" />
                        <span className="text-white text-sm">مشاركة</span>
                      </button>
                      <button
                        onClick={() => {
                          setReportingItem({
                            type: 'account',
                            targetId: profileId || '',
                            targetName: name || 'مستخدم',
                            targetAuthorId: profileId || ''
                          });
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <AlertTriangle size={16} className="text-[#FFC500] flex-shrink-0" />
                        <span className="text-white text-sm">إبلاغ عن @{username}</span>
                      </button>
                      <div className="pt-1">
                        <button
                          onClick={handleToggleBlock}
                          className="w-full px-3.5 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                        >
                          <Lock size={16} className="text-[#FFC500] flex-shrink-0" />
                          <span className="text-white text-sm">{isBlocked ? `إلغاء حظر @${username}` : `حظر @${username}`}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. الصورة الشخصية والشارة العلوية */}
      <div className="px-4 relative">
        <div className="flex justify-between items-end -mt-10 sm:-mt-12 mb-3">
          {/* الصورة الشخصية */}
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-black bg-zinc-950 overflow-hidden shadow-xl flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#182338] text-white flex items-center justify-center text-2xl font-black">
                  {name ? name[0] : '؟'}
                </div>
              )}
            </div>

            {isOwner && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-90 text-black border-2 border-black shadow-md transition"
                title="تغيير الصورة الشخصية"
              >
                <Camera size={13} />
              </button>
            )}
          </div>

          {/* الجهة المقابلة للصورة: وثّق حسابك مثل أبو شرواني أو أزرار المتابعة */}
          <div>
            {isOwner ? (
              <button
                onClick={() => showToast("حسابك نشط وموثق في المنصة ✨")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-700 bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs font-bold transition"
              >
                <VerifiedBadge type="blue" size={15} />
                <span>وثّق حسابك</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDmOpen(true)}
                  className="w-9 h-9 rounded-full border border-[#536471] hover:bg-white/10 active:scale-95 text-white flex items-center justify-center transition"
                  title="مراسلة خاصة"
                >
                  <Mail size={16} />
                </button>
                <button
                  onClick={handleToggleFollow}
                  className={`px-5 py-1.5 rounded-full text-sm font-bold transition active:scale-95 ${
                    isFollowing
                      ? 'bg-transparent text-white border border-[#536471] hover:border-red-600 hover:text-red-500'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isFollowing ? 'تتابعه' : 'تابع'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. الاسم والمعرف */}
        <div className="mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1
              className="text-white select-text"
              style={{ fontSize: '20px', fontWeight: 700, lineHeight: '1.3' }}
            >
              {name || "مستخدم يمن ريتنج"}
            </h1>
            <VerifiedBadge type={verificationType} size={20} />
          </div>
          <p className="text-[15px] text-[#71767B] font-normal mt-0.5 text-right select-text">
            @{username || 'user'}
          </p>
        </div>

        {/* 4. النبذة التعريفية */}
        {bio ? (
          <p
            className="mt-3 text-[#E7E9EA] whitespace-pre-wrap"
            style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.4' }}
          >
            {bio}
          </p>
        ) : isOwner ? (
          <p className="mt-2 text-xs text-zinc-600 italic cursor-pointer hover:text-zinc-400" onClick={() => setIsEditModalOpen(true)}>
            + أضف نبذة تعريفية عنك (Bio)
          </p>
        ) : null}

        {/* 5. البيانات (أيقونات رمادية هادئة) */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-3 text-sm text-[#71767B]">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin size={15} />
              <span>{location}</span>
            </div>
          )}
          {joinDate && (
            <div className="flex items-center gap-1">
              <Calendar size={15} />
              <span>{joinDate}</span>
            </div>
          )}
          {isOwner && email && (
            <div className="flex items-center gap-1">
              <Mail size={15} />
              <span dir="ltr">{email}</span>
            </div>
          )}
          {isOwner && phone && (
            <div className="flex items-center gap-1">
              <Phone size={15} />
              <span dir="ltr">{phone}</span>
            </div>
          )}
        </div>

        {/* 6. عداد المتابعين (أرقام بيضاء عريضة وكلمات رمادية) */}
        <div className="flex items-center gap-4 mt-3.5 text-sm">
          <div 
            onClick={() => navigate(`/u/${username}?tab=following`)}
            className="hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="font-bold text-white">{followingCount}</span>
            <span className="text-[#71767B]">متابَعاً</span>
          </div>
          <div 
            onClick={() => navigate(`/u/${username}?tab=followers`)}
            className="hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="font-bold text-white">{followersCount}</span>
            <span className="text-[#71767B]">متابِعاً</span>
          </div>
        </div>

        {/* 7. أزرار الإجراء في الأسفل (مطابقة لصورة أبو شرواني) */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {isOwner ? (
            <button
              onClick={() => {
                setEditName(name); setEditPhone(phone); setEditUsername(username); setEditBio(bio); setEditLocation(location); setEditBirthDate(birthDate);
                setIsEditModalOpen(true);
              }}
              className="w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-white/10 active:scale-[0.98] text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>تعديل الملفّ الشخصيّ</span>
            </button>
          ) : (
            <button
              onClick={handleToggleFollow}
              className={`w-full py-2 px-4 rounded-full font-bold text-sm transition flex items-center justify-center gap-1.5 ${
                isFollowing ? 'border border-[#536471] bg-transparent text-white' : 'bg-white text-black'
              }`}
            >
              <span>{isFollowing ? 'تتابعه' : 'تابع'}</span>
            </button>
          )}

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast('تم نسخ رابط الملف الشخصي!');
            }}
            className="w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-white/10 active:scale-[0.98] text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>مشاركة</span>
          </button>
        </div>
      </div>

      {/* 8. التبويبات */}
      <div className="mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`py-3 flex-1 flex items-center justify-center gap-1.5 relative transition ${
            activeTab === 'posts' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="7" y1="8" x2="17" y2="8" />
                          <line x1="7" y1="12" x2="17" y2="12" />
                          <line x1="7" y1="16" x2="12" y2="16" />
                        </svg>
                        <span>المنشورات ({userPosts.length})</span>
                      </span>
        
          {activeTab === 'posts' && <div className="absolute bottom-0 w-16 h-1 bg-white rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveTab('likes')}
          className={`py-3 flex-1 flex items-center justify-center relative transition ${
            activeTab === 'likes' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'
          }`}
        >
          <Heart size={16} />
          {activeTab === 'likes' && <div className="absolute bottom-0 w-8 h-1 bg-white rounded-full" />}
        </button>
      </div>

      {/* 9. المنشورات الفعلية الحقيقية فقط */}
      <div className="divide-y divide-[#2F3336]/40">
        {userPosts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <h3 className="text-sm font-bold text-white mb-1">
              {isOwner ? 'لم تقم بنشر أي منشور بعد' : `لا توجد منشورات لـ ${name}`}
            </h3>
            <p className="text-[11px] text-[#71767B] mb-4">
              {isOwner ? 'انقر على زر (+) بالأسفل لتنشر أول تغريدة وتشاركها مع الجميع!' : 'عندما ينشر هذا المستخدم تغريدات، ستظهر هنا فوراً.'}
            </p>
            {isOwner && (
              <button 
                onClick={() => setIsPostModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#FFC500] text-white text-xs font-bold hover:bg-[#E5B200] transition shadow-lg"
              >
                اكتب تغريدة جديدة
              </button>
            )}
          </div>
        ) : (
          userPosts.map(post => (
            <article 
              key={post.id} 
              className="p-3 border-b border-[#2F3336]/40 hover:bg-white/[0.03] transition cursor-pointer"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('button') && !target.closest('a')) {
                  setViewingDetailPost(post);
                }
              }}
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold text-white text-lg">
                  {post.authorAvatar ? (
                    <img src={post.authorAvatar} alt={post.authorName || name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{post.authorName?.[0] || name?.[0] || '؟'}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-[13px] hover:underline cursor-pointer cursor-pointer cursor-pointer truncate">{post.authorName || name}</span>
                      {post.authorBadge && post.authorBadge !== "none" && (
                        <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"
                          style={{color: post.authorBadge === "blue" ? "#FFC500" : post.authorBadge === "gold" ? "#FFD700" : "#71767B"}}>
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.755 2.73 1.882 3.475-.038.2-.058.406-.058.617 0 2.21 1.71 4 3.918 4 .47 0 .92-.085 1.336-.25.52 1.335 1.828 2.25 3.337 2.25s2.816-.917 3.337-2.25c.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.21-.02-.417-.058-.617C21.745 15.23 22.5 13.96 22.5 12.5z"/>
                          <path fill="white" d="M10.825 16.583l-3.66-3.66a.75.75 0 111.06-1.061l2.6 2.6 5.405-5.405a.75.75 0 111.06 1.061l-5.935 5.935a.75.75 0 01-1.06 0z"/>
                        </svg>
                      )}
                      <span className="text-[#71767B] text-[13px] truncate">@{post.authorUsername || username}</span>
                      <span className="text-[#71767B] text-[13px]">·</span>
                      <span className="text-[#71767B] text-[12px] hover:underline cursor-pointer" title={post.createdAtDisplay || post.createdAt}>
                        {formatTimeAgo(post.createdAt).relative}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuPost(post);
                      }}
                      className="text-[#71767B] hover:text-[#FFC500] p-1.5 rounded-full hover:bg-[#FFC500]/10 transition shrink-0"
                      title="المزيد"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* اقتباس — نص + بطاقة */}
                  {post.isRepost && post.quote_text ? (
                    <div className="mt-2">
                      <p className="text-[15px] leading-5 text-[#E7E9EA] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                        {post.quote_text}
                      </p>
                      {(post.original || post.quote_text) && (
                        <div className="mt-2 border border-[#1a2331] rounded-xl p-2.5">
                          {!post.original && (
                            <p className="text-[#71767B] text-xs py-2 text-center">التغريدة الأصلية غير متاحة</p>
                          )}
                          {post.original && (
                            <>

                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                              {post.original.authorAvatar ? (
                                <img src={post.original.authorAvatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white text-[10px] font-bold flex items-center justify-center w-full h-full">
                                  {post.original.authorName?.[0]}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-white text-[12px] font-['Tahoma']">{post.original.authorName}</span>
                            <span className="text-[#71767B] text-[11px]">@{post.original.authorUsername}</span>
                          </div>
                          <p className="text-white text-sm whitespace-pre-wrap">{post.original.text}</p>
                          {post.original.image && (
                            <img src={post.original.image} alt="" className="w-full rounded-lg mt-2 max-h-48 object-cover" />
                          )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-[15px] leading-5 text-[#E7E9EA] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {post.text}
                    </p>
                  )}

                  {/* فيديو المنشور */}
                  {!post.isRepost && (post.video_url || post.video) && (
                    <div className="mt-3">
                      <XVideoPlayer src={post.video_url || post.video} />
                    </div>
                  )}

                  {!post.isRepost && post.image && !post.video_url && !post.video && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-[#2F3336]/30 max-h-96">
                      <img src={post.image} alt="الصورة" className="w-full h-full object-cover" />
                    </div>
                  )}

                                              <div className="flex items-center justify-between mt-3 max-w-md">
                              {/* 💬 التعليقات */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert("زر التعليقات يعمل!");
                                  setActiveCommentPost(post);
                                  loadComments(post.id.startsWith('repost-') && post.original?.id ? post.original.id : post.id);
                                }}
                                className="flex items-center gap-1.5 text-[#71767B] hover:text-[#FFC500] transition group"
                                title="الردود"
                              >
                                <div className="p-1.5 rounded-full group-hover:bg-[#FFC500]/10">
                                  <MessageCircle size={16} />
                                </div>
                                <span className="text-[11px]">{post.replies || 0}</span>
                              </button>

                              {/* 🔁 إعادة التغريد */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRepostMenu(post);
                                }}
                                className="flex items-center gap-1.5 text-[#71767B] hover:text-emerald-400 transition group"
                                title="إعادة التغريد"
                              >
                                <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                                  <Repeat2 size={16} />
                                </div>
                                <span className="text-[11px]">{post.reposts || 0}</span>
                              </button>

                              {/* ❤️ الإعجاب */}
                              <button
                                onClick={() => handleToggleLike(post.id)}
                                className={`flex items-center gap-1.5 text-[#71767B] transition group ${post.isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'}`}
                                title="إعجاب"
                              >
                                <div className="p-1.5 rounded-full group-hover:bg-rose-500/10">
                                  <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                                </div>
                                <span className="text-[11px]">{post.likes || 0}</span>
                              </button>

                              {/* 📊 المشاهدات */}
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 text-[#71767B] hover:text-[#FFC500] transition group"
                                title="المشاهدات"
                              >
                                <div className="p-1.5 rounded-full group-hover:bg-[#FFC500]/10">
                                  <BarChart size={16} />
                                </div>
                                <span className="text-[11px]">{post.views || 0}</span>
                              </button>
                            </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      

      {/* شريط التنقل السفلي مع جرس التنبيهات */}
      

      {/* مودال تعديل الملف الشخصي */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black  flex items-center justify-center p-3 sm:p-4" dir="rtl">
          <div className="bg-[#000000] border border-[#2F3336] w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336]/40 mb-4">
              <h2 className="text-base font-black">تعديل الملفّ الشخصيّ</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#71767B] hover:text-white p-1 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#71767B] font-bold mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#2F3336] text-white focus:border-[#FFC500] focus:outline-none" 
                  required
                />
              </div>

              <div>
                <label className="block text-[#71767B] font-bold mb-1">رقم الهاتف</label>
                <input 
                  type="tel" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#2F3336] text-white focus:border-[#FFC500] focus:outline-none font-mono" 
                  placeholder="+967 77xxxxxxx"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[#71767B] font-bold mb-1">المعرّف (@Username)</label>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#2F3336] text-white focus:border-[#FFC500] focus:outline-none font-mono" 
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[#71767B] font-bold mb-1">النبذة التعريفية (Bio)</label>
                <textarea 
                  rows={3} 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#2F3336] text-white focus:border-[#FFC500] focus:outline-none" 
                  placeholder="اكتب نبذتك الشخصية..."
                />
              </div>

              <div>
                <label className="block text-[#71767B] font-bold mb-1">الموقع / المدينة</label>
                <input 
                  type="text" 
                  value={editLocation} 
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#2F3336] text-white focus:border-[#FFC500] focus:outline-none" 
                  placeholder="صنعاء، اليمن"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3 rounded-full bg-white hover:bg-zinc-200 active:scale-98 text-black font-extrabold text-sm transition"
                >
                  {savingProfile ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-full border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <LogOut size={15} />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال منشور جديد (تصميم منصة X المتوافق مع الكيبورد) */}
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

          {/* الشريط العلوي */}
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
                onClick={handleCreatePost}
                disabled={isPostingModal || (!newPostText.trim() && !newPostFile && !newPostImage) || newPostText.length > 280}
                className="px-5 py-1.5 rounded-full bg-[#FFC500] hover:bg-[#E5B200] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-black font-black text-sm transition shadow-md flex items-center gap-1.5"
              >
                {isPostingModal ? 'جاري النشر...' : 'نشر'}
              </button>
            </div>
          </div>

          {/* محتوى الكتابة: الأفاتار وبجانبه المؤشر الصغير المتحرك وباقي الصفحة سوداء بالكامل */}
          <div className="flex-1 min-h-0 px-4 pt-2 overflow-y-auto flex flex-col bg-black">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center font-bold shrink-0 mt-1">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-sm">{name ? name[0] : '؟'}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col">
                <div className="relative w-full">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden text-transparent text-[17px] leading-[26px] p-0 font-normal select-none"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    <span>{newPostText.slice(0, 250)}</span>
                    {newPostText.length > 250 && (
                      <mark className="bg-[#782229] text-transparent rounded-sm py-0.5">
                        {newPostText.slice(250)}
                      </mark>
                    )}
                  </div>
                  <textarea
                    autoFocus
                    value={newPostText}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    onChange={(e) => {
                      setNewPostText(e.target.value);
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea relative z-10 w-full bg-transparent text-white text-[17px] leading-[26px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none overflow-hidden caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', wordBreak: 'break-word', overflowWrap: 'break-word', minHeight: '120px' }}
                  />
                </div>

                {/* معاينة الوسائط عند اختيارها */}
                {newPostImage && (
                  <div className="relative rounded-[16px] overflow-hidden border border-zinc-800 max-h-56 sm:max-h-64 my-3 bg-zinc-950 shrink-0">
                    {newPostFile?.type.startsWith('video/') ? (
                      <video src={newPostImage} controls className="w-full max-h-56 sm:max-h-64 object-contain mx-auto" />
                    ) : (
                      <img src={newPostImage} alt="المعاينة" className="w-full max-h-56 sm:max-h-64 object-contain mx-auto" />
                    )}
                    <button
                      type="button"
                      onClick={() => { setNewPostImage(''); setNewPostFile(null); }}
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

          {/* الشريط السفلي: خط نحيل باهت والأيقونات الصفراء ترتفع فوق لوحة المفاتيح مباشرة */}
          <div className="shrink-0 bg-black border-t border-zinc-800/60 pb-2">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#FFC500] px-4 py-2">
              <Globe size={15} />
              <span>يمكن للجميع الرد</span>
            </div>

            <div className="flex items-center justify-between px-3 pt-1">
              <div className="flex items-center gap-3 sm:gap-4 text-[#FFC500]">
                {/* معرض الصور */}
                <button
                  type="button"
                  onClick={() => {
                    if (postImageInputRef.current) {
                      postImageInputRef.current.accept = "image/*";
                      postImageInputRef.current.click();
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
                    if (postImageInputRef.current) {
                      postImageInputRef.current.accept = "video/*";
                      postImageInputRef.current.click();
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
                <span className={newPostText.length > 280 ? "text-rose-500 font-bold" : newPostText.length >= 260 ? "text-[#FFC500] font-bold" : "text-zinc-500"}>
                  {newPostText.length}
                </span>
                <span>/ 280</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* مودال التواصل الخاص */}
      {isDmOpen && (
        <div className="fixed inset-0 z-50 bg-black  flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-black border border-[#2F3336] rounded-3xl p-5 shadow-2xl animate-scale-up text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336]/40 mb-4">
              <button onClick={() => setIsDmOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-full"><X size={18} /></button>
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <span>مراسلة خاصة مع {name}</span>
                <Mail size={16} className="text-[#FFC500]" />
              </h3>
            </div>
            <form onSubmit={handleSendDm} className="space-y-4">
              <textarea
                value={dmContent}
                onChange={(e) => setDmContent(e.target.value)}
                placeholder="اكتب رسالتك الخاصة هنا..."
                rows={4}
                className="w-full bg-black border border-[#2F3336] rounded-2xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFC500] resize-none"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsDmOpen(false)} className="px-4 py-2 rounded-full text-xs font-bold text-zinc-400 hover:bg-white/5 transition">إلغاء</button>
                <button type="submit" className="px-6 py-2 rounded-full text-xs font-black bg-[#FFC500] hover:bg-[#E5B200] text-white transition shadow-lg active:scale-95">إرسال ✉️</button>
              </div>
            </form>
          </div>
        </div>
      )}

    
      {/* نافذة تأكيد الإجراءات الفاخرة بنمط إكس */}
      {confirmModal?.open && (
        <div className="fixed inset-0 z-[200] bg-black  flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xs bg-black border border-[#2F3336] rounded-3xl p-5 shadow-2xl text-center animate-scale-up" dir="rtl">
            <h3 className="text-base font-black text-white mb-1.5">{confirmModal.title}</h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">{confirmModal.desc}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-full text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition active:scale-95"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 py-2.5 rounded-full text-xs font-black bg-[#FFC500] hover:bg-[#E5B200] text-white transition active:scale-95 shadow-md shadow-blue-900/30"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

    
      {activeMenuPost && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center p-2" onClick={() => setActiveMenuPost(null)}>
          <div className="w-full max-w-xs bg-black rounded-2xl overflow-hidden mb-16 shadow-2xl border border-[#2F3336]" onClick={(e) => e.stopPropagation()}>
            
            {/* تعديل (يظهر فقط إذا كان المالك) */}
            {isOwner && (
              <button onClick={() => {
                setEditingPost(activeMenuPost);
                setIsEditModalOpen(true);
                setActiveMenuPost(null);
              }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <span>تعديل</span>
              </button>
            )}

            {/* حذف (يظهر فقط إذا كان المالك) */}
            {isOwner && (
              <button onClick={() => {
                handleDeletePost(activeMenuPost.id);
                setActiveMenuPost(null);
              }} className="w-full p-4 text-right text-[#F4212E] font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>حذف</span>
              </button>
            )}

            

            {/* إبلاغ */}
            <button onClick={() => {
              if (activeMenuPost) {
                setReportingItem({
                  type: 'post',
                  targetId: activeMenuPost.id,
                  targetName: activeMenuPost.authorName || 'مستخدم',
                  targetAuthorId: activeMenuPost.authorId || ''
                });
              }
              setActiveMenuPost(null);
            }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
              <span>إبلاغ</span>
            </button>

            {/* نسخ الرابط */}
            <button onClick={() => {
              navigator.clipboard?.writeText(window.location.origin + `/account?id=${activeMenuPost.authorId}`);
              showToast('تم نسخ الرابط!');
              setActiveMenuPost(null);
            }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
              <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
              <span>نسخ الرابط</span>
            </button>

            {/* إلغاء */}
            <button onClick={() => setActiveMenuPost(null)} className="w-full p-4 text-center text-white/60 font-bold hover:bg-white/5 transition text-sm">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* نافذة الردود - نسخة من /feed */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col h-[100dvh] text-white overflow-hidden" dir="rtl">
          {/* شريط علوي */}
          <div className="h-14 border-b border-[#2F3336]/40 px-4 flex items-center justify-between shrink-0 bg-black">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveCommentPost(null)} className="p-2 hover:bg-zinc-900 rounded-full text-[#71767B] hover:text-white transition">
                <ArrowRight size={20} />
              </button>
              <h2 className="font-bold text-base">منشور</h2>
            </div>
          </div>

          {/* محتوى التغريدة والردود */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={activeCommentPost.authorAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + activeCommentPost.authorId}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-[#2F3336]"
              />
              <div>
                <p className="font-['Tahoma'] font-bold text-sm text-white">{activeCommentPost.authorName}</p>
                <p className="font-['Tahoma'] text-[11px] text-[#71767B] font-normal" dir="ltr">@{activeCommentPost.authorUsername}</p>
              </div>
            </div>

            <p className="font-['Tahoma'] text-[14px] leading-[1.5] text-[#E7E9EA] break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
              {activeCommentPost.text}
            </p>

            {activeCommentPost.image && (
              <div className="rounded-2xl overflow-hidden border border-[#2F3336]/30 max-h-[450px]">
                <img src={activeCommentPost.image} alt="" className="w-full h-auto object-cover" />
              </div>
            )}

            <div className="text-[11px] text-[#71767B] py-2 border-y border-[#2F3336] flex items-center gap-2">
              <span>{formatTimeAndDate(activeCommentPost.createdAt)}</span>
              <span>·</span>
              <span>{activeCommentPost.views || 1} مشاهدة</span>
            </div>

            {/* أزرار التفاعل في العرض الكامل */}
            <div className="flex items-center justify-around py-1 border-b border-[#2F3336]/40 text-[#71767B]">
              <button className="flex items-center gap-1.5 hover:text-[#FFC500] transition">
                <MessageCircle size={16} />
                <span className="text-xs">{postComments.length}</span>
              </button>
              <button onClick={() => handleRepost(activeCommentPost.id)} className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                <Repeat2 size={16} />
                <span className="text-xs">{activeCommentPost.reposts || 0}</span>
              </button>
              <button onClick={() => handleToggleLike(activeCommentPost.id)} className="flex items-center gap-1.5 hover:text-rose-500 transition">
                <Heart size={16} />
                <span className="text-xs">{activeCommentPost.likes || 0}</span>
              </button>
              <button onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); showToast('تم نسخ الرابط!'); } }} className="hover:text-white transition">
                <Share size={16} />
              </button>
            </div>

            {/* قائمة التعليقات */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-[#71767B]">الردود ({postComments.length})</h3>
              {loadingComments ? (
                <div className="text-center py-8 text-zinc-500 text-xs">جاري التحميل...</div>
              ) : postComments.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">لا توجد ردود بعد. كن أول من يرد!</div>
              ) : (
                postComments.map(c => (
                  <div key={c.id} className="py-3 px-1 border-b border-[#2F3336]/40/60 flex gap-3 hover:bg-white/[0.01] transition">
                    <div className="w-[30px] h-[30px] rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {c.userAvatar ? (
                        <img src={c.userAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{c.userName ? c.userName[0] : '؟'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white hover:underline cursor-pointer">{c.userName}</span>
                        <span className="text-[11px] text-[#71767B] font-mono" dir="ltr">@{c.userUsername || 'user'}</span>
                        <span className="text-[11px] text-[#71767B]">·</span>
                        <span className="text-[#71767B] text-[9px]" title={c.createdAtDisplay || c.createdAt}>{formatTimeAgo(c.createdAt).relative || c.createdAtDisplay || 'الآن'}</span>
                      </div>
                      <p className="font-['Tahoma'] text-xs text-[#E7E9EA] mt-1.5 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap select-text">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* شريط الكتابة السفلي */}
          <div className="p-3 border-t border-[#2F3336] bg-black shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitComment(); }} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold">{name ? name[0] : '؟'}</span>
                )}
              </div>
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="انشر ردّك..."
                className="flex-1 bg-[#111111] border border-[#2F3336] rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFC500]"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim() || newCommentText.length > 280}
                className="px-4 py-2 bg-[#FFC500] text-black font-bold text-xs rounded-full hover:bg-[#E5B200] transition disabled:opacity-40"
              >
                ردّ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* زر + (FAB) — دائم الظهور */}
      {isOwner && (
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="fixed bottom-24 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(255,197,0,0.3)] transition"
          title="تغريدة جديدة"
        >
          <Plus size={28} className="stroke-[2.5]" />
        </button>
      )}

      {/* Modal تفاصيل التغريدة */}
      {viewingDetailPost && (
        <div 
          className="fixed inset-0 z-50 bg-black  overflow-y-auto"
          onClick={() => setViewingDetailPost(null)}
          dir="rtl"
        >
          <div 
            className="max-w-2xl mx-auto min-h-screen bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black backdrop-blur border-b border-[#2F3336]/40 p-3 flex items-center gap-4">
              <button 
                onClick={() => setViewingDetailPost(null)}
                className="text-white hover:bg-white/10 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
              <h2 className="text-white font-bold text-lg">التغريدة</h2>
            </div>

            {/* Tweet body */}
            <div className="p-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {viewingDetailPost.authorAvatar ? (
                    <img src={viewingDetailPost.authorAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-lg">{viewingDetailPost.authorName?.[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white text-[15px]">{viewingDetailPost.authorName}</span>
                    <span className="text-[#71767B] text-[15px]">@{viewingDetailPost.authorUsername}</span>
                  </div>
                </div>
              </div>

              <p className="text-white text-[17px] mt-3 whitespace-pre-wrap break-words leading-relaxed">
                {viewingDetailPost.text}
              </p>

              {viewingDetailPost.image && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-[#2F3336]/30">
                  <img src={viewingDetailPost.image} alt="" className="w-full h-auto object-cover" />
                </div>
              )}

              {/* الوقت والتاريخ */}
              <div className="text-sm text-[#71767B] py-3 border-y border-[#2F3336] flex items-center gap-2 mt-3">
                <span>{formatTimeAndDate(viewingDetailPost.createdAt) || viewingDetailPost.createdAtDisplay || ''}</span>
                <span>·</span>
                <span>{viewingDetailPost.views || 1} مشاهدة</span>
              </div>

              {/* الأزرار */}
              <div className="flex items-center justify-around py-3 border-b border-[#2F3336]/40 text-[#71767B]">
                <button
                  onClick={() => {
                    setActiveCommentPost(viewingDetailPost);
                    setViewingDetailPost(null);
                    loadComments(viewingDetailPost.id);
                  }}
                  className="flex items-center gap-1.5 hover:text-[#FFC500] transition"
                >
                  <MessageCircle size={16} />
                  <span className="text-sm">{viewingDetailPost.replies || 0}</span>
                </button>

                <button
                  onClick={() => handleRepost(viewingDetailPost.id)}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition"
                >
                  <Repeat2 size={16} />
                  <span className="text-sm">{viewingDetailPost.reposts || 0}</span>
                </button>

                <button
                  onClick={() => handleToggleLike(viewingDetailPost.id)}
                  className={`flex items-center gap-1.5 transition ${viewingDetailPost.isLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}
                >
                  <Heart size={18} className={viewingDetailPost.isLiked ? 'fill-current' : ''} />
                  <span className="text-sm">{viewingDetailPost.likes || 0}</span>
                </button>

                <button className="hover:text-[#FFC500] transition">
                  <BarChart size={18} />
                </button>
              </div>

              {/* قائمة التعليقات */}
              {postComments.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-bold text-sm mb-3">
                    الردود ({postComments.length})
                  </h3>
                  {postComments.map((c) => (
                    <div key={c.id} className="p-3 border-b border-[#2F3336]/40">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {c.userAvatar ? (
                            <img src={c.userAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">{c.userName?.[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-bold text-white">{c.userName}</span>
                            <span className="text-[#71767B]">@{c.userUsername}</span>
                            <span className="text-[#71767B]">·</span>
                            <span className="text-[#71767B] text-xs" title={c.createdAtDisplay || c.createdAt}>
                              {formatTimeAgo(c.createdAt).relative || c.createdAtDisplay || 'الآن'}
                              <span className="text-[9px] text-[#536471] mr-1">· {new Date(c.createdAt).toLocaleDateString("ar-YE", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </span>
                          </div>
                          <p className="text-white text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* قائمة إعادة النشر / اقتباس */}
      {repostMenu && (
        <div className="fixed inset-0 z-[60] bg-black flex items-end justify-center p-2" onClick={() => setRepostMenu(null)}>
          <div className="w-full max-w-md bg-black rounded-2xl overflow-hidden mb-20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { handleRepost(repostMenu.id); setRepostMenu(null); }}
              className="w-full p-3 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm"
            >
              <Repeat2 size={20} className="text-emerald-400" />
              <span>إعادة النشر</span>
            </button>
            <button
              onClick={() => { setQuoteOriginal(repostMenu); setIsQuoting(true); setRepostMenu(null); }}
              className="w-full p-3 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm"
            >
              <MessageCircle size={20} className="text-[#FFC500]" />
              <span>اقتباس</span>
            </button>
            <button onClick={() => setRepostMenu(null)} className="w-full p-3 text-center text-white/60 font-bold hover:bg-white/5 transition">
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
                if (!sessionUser?.id || !quoteText.trim()) return;
                try {
                  const { error } = await supabase.from('post_reposts').upsert({
                    post_id: quoteOriginal.id,
                    user_id: sessionUser.id,
                    quote_text: quoteText.trim()
                  }, { onConflict: 'user_id,post_id' });
                  
                  if (error) {
                    if (error.message?.includes('uuid')) {
                      throw new Error('التغريدة الأصلية غير صالحة للاقتباس');
                    }
                    if (error.message?.includes('row-level')) {
                      throw new Error('ليس لديك صلاحية الاقتباس');
                    }
                    throw error;
                  }
                  showToast('تم الاقتباس ✅');
                  setIsQuoting(false); setQuoteText(''); setQuoteOriginal(null);
                  setTimeout(() => window.location.reload(), 500);
                } catch (e: any) {
                  showToast('تعذر الاقتباس: ' + (e?.message || 'خطأ غير متوقع'));
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
          <div className="border border-[#2F3336] rounded-2xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                {quoteOriginal.authorAvatar ? <img src={quoteOriginal.authorAvatar} alt="" className="w-full h-full object-cover" /> : <span>{quoteOriginal.authorName?.[0]}</span>}
              </div>
              <span className="font-bold text-white text-sm">{quoteOriginal.authorName}</span>
              <span className="text-[#71767B] text-xs">@{quoteOriginal.authorUsername}</span>
            </div>
            <p className="text-white text-sm">{quoteOriginal.text}</p>
          </div>
        </div>
      )}

      {/* Modal الإبلاغ */}
      {reportingItem && (
        <ReportPage
          type="account"
          onClose={() => setReportingItem(null)}
          onSubmit={async (reason) => {
            if (!reportingItem) return;
            try {
              console.log('📤 SENDING REPORT:', {
                  reporter_id: currentUserId || null,
                  reporter_name: myName || 'مستخدم',
                  reported_item_type: reportingItem.type === 'account' ? 'user' : 'post',
                  reported_item_id: reportingItem.targetId,
                  reported_user_id: reportingItem.targetAuthorId,
                  reason: reason,
                  status: 'PENDING',
                });
              const { error } = await supabase
                .from('reports')
                .insert({
                  reported_item_type: reportingItem.type === 'account' ? 'user' : 'post',
                  reported_item_id: reportingItem.targetId,
                  reported_user_id: reportingItem.targetAuthorId,
                  reporter_id: currentUserId || null,
                  reporter_name: myName || 'مستخدم',
                  reason: reason,
                  details: null,
                  status: 'PENDING',
                  created_at: new Date().toISOString(),
                });
              if (error) throw error;
              showToast('تم إرسال بلاغك بنجاح');
            } catch (err) {
              console.error('Report error:', err);
              showToast('حدث خطأ أثناء إرسال البلاغ');
            }
          }}
          authorName={reportingItem.targetName}
          authorUsername={''}
        />
      )}

      <MobileBottomNav onNavigate={(path) => navigate(path)} />
</div>
  );
};

/** تنسيق الوقت النسبي للمنشورات باللغة العربية */
function formatTimeAgo(dateStr: string): { relative: string; absolute: string } {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    let relative = '';
    if (diffSec < 60) relative = 'الآن';
    else if (diffMin < 60) relative = `${diffMin}د`;
    else if (diffHour < 24) relative = `${diffHour}س`;
    else if (diffDay < 7) relative = `${diffDay}ي`;
    else relative = date.toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' });
    
    const absolute = date.toLocaleDateString('ar-YE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    
    return { relative, absolute };
  } catch {
    return { relative: '', absolute: '' };
  }
}

