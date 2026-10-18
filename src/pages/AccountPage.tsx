
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
  ArrowRight, RotateCw, MoreHorizontal, MapPin, Calendar, 
  Cake, CheckCircle2, Heart, MessageCircle, Repeat2, Share, Plus, 
  Camera, X, Image as ImageIcon, Pin, Trash2, Edit3, Loader2,
  Home, MessageSquare, User, Phone, Mail, LogOut, UserPlus, UserCheck, Lock
, Bell , AlertTriangle } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';

interface Post {
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
  const colors: Record<string, string> = { blue: "#1D9BF0", gold: "#EAB308", gray: "#829AAB" };
  const fill = colors[bType] || "#1D9BF0";
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
            id: p.id,
            authorId: p.user_id,
            authorName: p.profile?.full_name || name,
            authorUsername: p.profile?.username || username,
            authorAvatar: p.profile?.avatar_url || '',
            authorBadge: p.profile?.verification_type || (p.profile?.is_verified ? "blue" : "none"),
            text: p.content,
            image: p.image_url || undefined,
            createdAt: new Date(p.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: p.likes_count || 0,
            likedBy: [],
            isLiked: p.isLiked,
            replies: p.comments_count || 0,
            reposts: p.reposts_count || 0,
            views: p.views_count || 1
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
              createdAt: new Date(p.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
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
      showToast('تم حفظ التعديلات بنجاح! ✅');
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
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostImage) {
      showToast("يرجى كتابة نص أو إرفاق صورة");
      return;
    }

    if (!sessionUser || !profileId || profileId === "guest") {
      showToast("يرجى تسجيل الدخول أولاً لتتمكن من النشر");
      setAuthModalOpen(true);
      return;
    }

    showToast("جاري نشر التغريدة سحابياً... ⏳");

    try {
      const { data: inserted, error: pErr } = await supabase.from("posts").insert({
        user_id: profileId,
        content: newPostText.trim(),
        image_url: newPostImage || null
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
        image: newPostImage || undefined,
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
      setIsPostModalOpen(false);
      showToast("تم نشر التغريدة وحفظها في السحابة بنجاح! 🚀");
    } catch (err: any) {
      console.error("Post error:", err);
      showToast("حدث خطأ أثناء النشر: " + (err.message || ""));
    }
  };

  // إعجاب حقيقي
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
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-['Cairo',sans-serif]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D9BF0]" />
      </div>
    );
  }

  // إذا لم يكن مسجل دخول وليس هناك بروفايل لشخص آخر يتصفحه: عرض شاشة تسجيل الدخول
  if (!sessionUser && !targetIdParam) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-['Cairo',sans-serif]" dir="rtl">
        <div className="w-20 h-20 rounded-3xl bg-[#141E30] border border-[#2F3336] flex items-center justify-center mb-5 text-[#1D9BF0] shadow-2xl">
          <Lock size={36} />
        </div>
        <h2 className="text-xl font-black mb-2">تسجيل الدخول إلى حسابك</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
          سجّل دخولك بحسابك الحقيقي للوصول إلى ملفك الشخصي، وتغيير صورتك وغلافك، ومشاركة تغريداتك مع مجتمع يمن ريتنج.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="w-full max-w-xs py-3.5 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] active:scale-95 text-white font-black text-sm transition shadow-[0_8px_25px_rgba(29,155,240,0.4)]"
        >
          تسجيل الدخول / إنشاء حساب
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => { setAuthModalOpen(false); loadProfile(); }} defaultMode="login" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-['Cairo',sans-serif] selection:bg-[#1D9BF0] selection:text-white pb-32" dir="rtl">
      
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] bg-[#16181C]/95 backdrop-blur-2xl border border-[#2F3336] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-[0_12px_40px_rgba(0,0,0,0.9)] animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#1D9BF0] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {isOwner && (
        <>
          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'avatar')} />
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'cover')} />
          <input type="file" ref={postImageInputRef} className="hidden" accept="image/*" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              const compressed = await compressImage(f, 1000, 1000, 0.85);
              setNewPostImage(compressed);
            }
          }} />
        </>
      )}

      {/* 1. الغلاف */}
      <div className="relative w-full h-44 sm:h-52 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950">
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
            className="absolute bottom-3 left-3 bg-black/70 hover:bg-black/90 active:scale-95 text-white p-2.5 rounded-full backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 text-xs font-bold shadow-lg z-10"
            title="تغيير صورة الغلاف"
          >
            <Camera size={16} />
            <span className="hidden sm:inline">تغيير الغلاف</span>
          </button>
        )}

        {/* أزرار الهيدر */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
          <button 
            onClick={() => navigate(-1)} 
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95"
            title="رجوع"
          >
            <ArrowRight size={20} />
          </button>

          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => window.location.reload()} 
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95"
            >
              <RotateCw size={17} />
            </button>
            <button 
              onClick={() => navigate('/feed')} 
              title="تغريدات المجتمع"
              className="w-9 h-9 rounded-full bg-[#1D9BF0]/30 hover:bg-[#1D9BF0]/50 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95"
            >
              <MessageSquare size={17} />
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  title="خيارات الحساب"
                  className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95 relative"
                >
                  <MoreHorizontal size={19} />
                </button>

                
                
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute left-0 top-12 w-44 bg-[#16181C]/95 backdrop-blur-2xl border border-[#2F3336] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-1.5 z-50 text-xs animate-fade-in divide-y divide-[#2F3336]/60">
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
                            <Share size={16} className="text-zinc-400 flex-shrink-0" />
                            <span className="text-white text-sm">مشاركة</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              showToast("تم إرسال البلاغ");
                            }}
                            className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                          >
                            <AlertTriangle size={16} className="text-zinc-400 flex-shrink-0" />
                            <span className="text-white text-sm">إبلاغ</span>
                          </button>
                          <div className="pt-1">
                            <button
                              onClick={handleToggleBlock}
                              className="w-full px-3.5 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                            >
                              <Lock size={16} className={isBlocked ? "text-[#1D9BF0] flex-shrink-0" : "text-rose-500 flex-shrink-0"} />
                              <span className="text-white text-sm">{isBlocked ? "إلغاء الحظر" : "حظر"}</span>
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

      {/* 2. الصورة الشخصية والشارة */}
      <div className="px-4 relative">
        <div className="flex justify-between items-end -mt-14 sm:-mt-16 mb-3">
          
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-black bg-zinc-950 overflow-hidden shadow-2xl flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#182338] text-white flex items-center justify-center text-3xl font-black">
                  {name ? name[0] : '؟'}
                </div>
              )}
            </div>

            {isOwner && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] active:scale-95 text-white border-2 border-black shadow-lg transition"
                title="تغيير الصورة الشخصية"
              >
                <Camera size={16} />
              </button>
            )}
          </div>

          {/* زر المتابعة أو شارة التوثيق */}
          {isOwner ? (
            <button
              onClick={() => showToast("حسابك معتمد ونشط في المنصة ✨")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D9BF0]/15 border border-[#1D9BF0]/40 text-[#1D9BF0] text-xs font-bold hover:bg-[#1D9BF0]/25 transition"
            >
              <span>حساب معتمد</span>
              <VerifiedBadge type={verificationType || "blue"} size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDmOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
                title="مراسلة خاصة"
              >
                <Mail size={16} className="text-[#1D9BF0]" />
                <span className="hidden sm:inline">رسالة</span>
              </button>
  
            <button 
              onClick={handleToggleFollow}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black transition active:scale-95 shadow-md ${
                isFollowing 
                  ? 'bg-zinc-800 text-white border border-zinc-700 hover:bg-rose-500/20 hover:text-rose-400'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={15} />
                  <span>تتابعه</span>
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>متابعة</span>
                </>
              )}
            </button>
            </div>
          )}
        </div>

        {/* 3. الاسم والمعرف */}
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
    <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
      {name || "مستخدم يمن ريتنج"}
    </h1>
    <VerifiedBadge type={verificationType} size={22} />
  </div>
          </div>
          <p className="text-sm text-[#71767B] font-mono mt-0.5" dir="ltr">@{username || 'user'}</p>
        </div>

        {/* 4. النبذة */}
        {bio ? (
          <p className="mt-3 text-sm text-[#E7E9EA] leading-relaxed whitespace-pre-wrap">
            {bio}
          </p>
        ) : isOwner ? (
          <p className="mt-2 text-xs text-zinc-600 italic cursor-pointer hover:text-zinc-400" onClick={() => setIsEditModalOpen(true)}>
            + أضف نبذة تعريفية عنك (Bio)
          </p>
        ) : null}

        {/* 5. البيانات الحقيقية */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-xs text-[#71767B]">
          {isOwner && email && (
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Mail size={14} className="text-[#1D9BF0]" />
              <span dir="ltr">{email}</span>
            </div>
          )}
          {isOwner && phone && (
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Phone size={14} className="text-[#1D9BF0]" />
              <span dir="ltr">{phone}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
          {isOwner && birthDate && (
            <div className="flex items-center gap-1.5">
              <Cake size={14} />
              <span>{birthDate}</span>
            </div>
          )}
          {joinDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{joinDate}</span>
            </div>
          )}
        </div>

        {/* 6. المتابعون والمتابَعون الفعليون */}
        <div className="flex items-center gap-5 mt-3.5 text-xs">
          <div className="hover:underline cursor-pointer">
            <button 
              onClick={() => navigate(`/u/${username}?tab=following`)}
              className="hover:underline cursor-pointer"
            >
              <span className="font-extrabold text-white ml-1">{followingCount}</span>
            </button>
            <span className="text-[#71767B]">متابَعة</span>
          </div>
          <div className="hover:underline cursor-pointer">
            <button 
              onClick={() => navigate(`/u/${username}?tab=followers`)}
              className="hover:underline cursor-pointer"
            >
              <span className="font-extrabold text-white ml-1">{followersCount}</span>
            </button>
            <span className="text-[#71767B]">متابِعًا</span>
          </div>
        </div>

        {/* 7. أزرار الإجراء */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {isOwner ? (
            <button 
              onClick={() => {
                setEditName(name);
                setEditPhone(phone);
                setEditUsername(username);
                setEditBio(bio);
                setEditLocation(location);
                setEditBirthDate(birthDate);
                setIsEditModalOpen(true);
              }}
              className="w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-[#181818] active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <Edit3 size={15} />
              <span>تعديل الملفّ الشخصيّ</span>
            </button>
          ) : (
            <button 
              onClick={handleToggleFollow}
              className={`w-full py-2 px-4 rounded-full font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
                isFollowing ? 'border border-zinc-700 bg-zinc-900 text-white' : 'bg-white text-black'
              }`}
            >
              {isFollowing ? 'إلغاء المتابعة' : 'متابعة الحساب'}
            </button>
          )}

          <button 
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast('تم نسخ رابط الملف الشخصي!');
            }}
            className="w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-[#181818] active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5"
          >
            <Share size={15} />
            <span>مشاركة</span>
          </button>
        </div>
      </div>

      {/* 8. التبويبات */}
      <div className="mt-4 border-b border-[#2F3336] flex items-center justify-around text-sm font-bold">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`py-3 flex-1 flex items-center justify-center gap-1.5 relative transition ${
            activeTab === 'posts' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'
          }`}
        >
          <span>المنشورات ({userPosts.length})</span>
        
          {activeTab === 'posts' && <div className="absolute bottom-0 w-16 h-1 bg-white rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveTab('likes')}
          className={`py-3 flex-1 flex items-center justify-center relative transition ${
            activeTab === 'likes' ? 'text-white font-black' : 'text-[#71767B] hover:text-white'
          }`}
        >
          <Heart size={18} />
          {activeTab === 'likes' && <div className="absolute bottom-0 w-8 h-1 bg-white rounded-full" />}
        </button>
      </div>

      {/* 9. المنشورات الفعلية الحقيقية فقط */}
      <div className="divide-y divide-[#2F3336]">
        {userPosts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <h3 className="text-sm font-bold text-white mb-1">
              {isOwner ? 'لم تقم بنشر أي منشور بعد' : `لا توجد منشورات لـ ${name}`}
            </h3>
            <p className="text-xs text-[#71767B] mb-4">
              {isOwner ? 'انقر على زر (+) بالأسفل لتنشر أول تغريدة وتشاركها مع الجميع!' : 'عندما ينشر هذا المستخدم تغريدات، ستظهر هنا فوراً.'}
            </p>
            {isOwner && (
              <button 
                onClick={() => setIsPostModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#1D9BF0] text-white text-xs font-bold hover:bg-[#1A8CD8] transition shadow-lg"
              >
                اكتب تغريدة جديدة ✍️
              </button>
            )}
          </div>
        ) : (
          userPosts.map(post => (
            <article key={post.id} className="p-4 hover:bg-white/[0.02] transition">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold">
                  {post.authorAvatar ? (
                    <img src={post.authorAvatar} alt={post.authorName || name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{post.authorName?.[0] || name?.[0] || '؟'}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white text-sm">{post.authorName || name}</span>
                      <span className="text-xs text-[#71767B] font-mono">@{post.authorUsername || username}</span>
                      <span className="text-xs text-[#71767B]">·</span>
                      <span className="text-xs text-[#71767B]">{post.createdAt}</span>
                    </div>
                    {isOwner && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-[#71767B] hover:text-rose-500 p-1 rounded-full transition"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-[#E7E9EA] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {post.text}
                  </p>

                  {post.image && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-[#2F3336] max-h-96">
                      <img src={post.image} alt="الصورة" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-xs text-[#71767B] mt-3.5">
                    <button 
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition ${post.isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'}`}
                    >
                      <Heart size={16} className={post.isLiked ? 'fill-current' : ''} />
                      <span>{post.likes}</span>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" dir="rtl">
          <div className="bg-[#000000] border border-[#2F3336] w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none" 
                  required
                />
              </div>

              <div>
                <label className="block text-[#71767B] font-bold mb-1">رقم الهاتف</label>
                <input 
                  type="tel" 
                  value={editPhone} 
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none font-mono" 
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none font-mono" 
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[#71767B] font-bold mb-1">النبذة التعريفية (Bio)</label>
                <textarea 
                  rows={3} 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none" 
                  placeholder="اكتب نبذتك الشخصية..."
                />
              </div>

              <div>
                <label className="block text-[#71767B] font-bold mb-1">الموقع / المدينة</label>
                <input 
                  type="text" 
                  value={editLocation} 
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16181C] border border-[#2F3336] text-white focus:border-[#1D9BF0] focus:outline-none" 
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

      {/* مودال منشور جديد */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" dir="rtl">
          <div className="bg-[#000000] border border-[#2F3336] w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4">
              <h2 className="text-base font-black">منشور جديد</h2>
              <button onClick={() => setIsPostModalOpen(false)} className="text-[#71767B] hover:text-white p-1 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold">
                  {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" /> : <span>{name ? name[0] : '؟'}</span>}
                </div>
                <textarea 
                  rows={4}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="ماذا يحدث؟ اكتب منشورك..."
                  maxLength={280}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none"
                  autoFocus
                />
              </div>

              {newPostImage && (
                <div className="relative rounded-2xl overflow-hidden border border-[#2F3336] max-h-60">
                  <img src={newPostImage} alt="معاينة" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setNewPostImage('')}
                    className="absolute top-2 left-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

                <div className="flex items-center justify-between pt-3 border-t border-[#2F3336]">
                  <button
                    type="button"
                    onClick={() => postImageInputRef.current?.click()}
                    className="p-2 text-[#1D9BF0] hover:bg-[#1D9BF0]/10 rounded-full transition"
                    title="إرفاق صورة"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-mono select-none" dir="ltr">
                      <span className={newPostText.length > 280 ? "text-rose-500 font-bold" : newPostText.length >= 260 ? "text-amber-400 font-bold" : "text-zinc-500"}>
                        {newPostText.length}
                      </span>
                      <span className="text-zinc-600">/ 280</span>
                      {newPostText.length >= 260 && (
                        <span className="text-[10px] text-amber-400 mr-1">
                          (متبقي {280 - newPostText.length})
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={(!newPostText.trim() && !newPostImage) || newPostText.length > 280}
                      className="px-5 py-2 rounded-full bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold text-sm transition"
                    >
                      نشر
                    </button>
                  </div>
                </div>
            </form>
          </div>
        </div>
      )}

    
      {/* مودال التواصل الخاص */}
      {isDmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#16181C] border border-[#2F3336] rounded-3xl p-5 shadow-2xl animate-scale-up text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336] mb-4">
              <button onClick={() => setIsDmOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-full"><X size={18} /></button>
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <span>مراسلة خاصة مع {name}</span>
                <Mail size={16} className="text-[#1D9BF0]" />
              </h3>
            </div>
            <form onSubmit={handleSendDm} className="space-y-4">
              <textarea
                value={dmContent}
                onChange={(e) => setDmContent(e.target.value)}
                placeholder="اكتب رسالتك الخاصة هنا..."
                rows={4}
                className="w-full bg-black/60 border border-[#2F3336] rounded-2xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1D9BF0] resize-none"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsDmOpen(false)} className="px-4 py-2 rounded-full text-xs font-bold text-zinc-400 hover:bg-white/5 transition">إلغاء</button>
                <button type="submit" className="px-6 py-2 rounded-full text-xs font-black bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white transition shadow-lg active:scale-95">إرسال ✉️</button>
              </div>
            </form>
          </div>
        </div>
      )}

    
      {/* نافذة تأكيد الإجراءات الفاخرة بنمط إكس */}
      {confirmModal?.open && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xs bg-[#16181C] border border-[#2F3336] rounded-3xl p-5 shadow-2xl text-center animate-scale-up" dir="rtl">
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
                className="flex-1 py-2.5 rounded-full text-xs font-black bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white transition active:scale-95 shadow-md shadow-blue-900/30"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

    
      <MobileBottomNav onNavigate={(path) => navigate(path)} />
</div>
  );
};
