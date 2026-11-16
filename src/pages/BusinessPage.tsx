import { ReplyBar } from '../components/community/ReplyBar';
import { XActionBar } from '../components/feed/XActionBar';
import { XVideoPlayer } from '../components/feed/XVideoPlayer';
import { SupportModal } from '../components/support/SupportModal';

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

import PostEngagementsModal from '../components/feed/PostEngagementsModal';
import { RichTextarea } from '../components/common/RichTextarea';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { ImageCropper } from '../components/common/ImageCropper';
import { HashtagText } from '../components/common/HashtagText';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XImagePlayer } from '../components/feed/XImagePlayer';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from "../lib/supabase";
import { getUserProfile, updateUserProfile, getUserPosts, createPost, deletePost, togglePostLike, toggleFollow, checkIsFollowing, toggleBlockUser, checkIsBlocked, uploadSocialImage, Profile, PostItem } from "../services/socialService";
import { Bookmark, ArrowRight, BarChart2,
  RotateCw,
  MoreHorizontal,
  MapPin,
  Calendar,
  Cake,
  CheckCircle2,
  Heart,
  MessageCircle,
  Repeat2,
  Share, Share2,
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
  Video,
  CreditCard, Building2 } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { ReportPage } from '../components/community/ReportPage';
import { CreateBusinessPageModal, BusinessPageDraft } from '../components/business/CreateBusinessPageModal';
import { getStoredBusinessPage, saveStoredBusinessPage, StoredBusinessPage } from '../utils/businessPageDraft';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorBadge?: any;
  text: string;
  image?: string;
  video?: string;
  video_url?: string;
  quote_text?: string;
  original?: any;
  isRepost?: boolean;
  isReposted?: boolean;
  originalId?: string;
  reposterId?: string;
  reposterName?: string;
  reposterUsername?: string;
  parent_id?: string | null;
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
  // 1. معالجة القيم الفارغة أو "none"
  if (!type || type === "none") return null;
  const bType = type === true ? "blue" : type;
  if (bType === "none") return null;

  // 2. خريطة الألوان الصحيحة
  const colors: Record<string, string> = { 
    blue: "#1D9BF0", 
    gold: "#EAB308", 
    gray: "#9CA3AF", 
    silver: "#9CA3AF" 
  };
  
  // 3. إذا كان اللون غير معروف، لا تعرض شيئاً
  const fill = colors[bType];
  if (!fill) return null;




  

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block flex-shrink-0 align-middle mr-1.5 drop-shadow-sm">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6s-2.95.875-3.6 2.148c-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5s.875 2.95 2.148 3.6c-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148s2.95-.875 3.6-2.148c.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z" fill={fill} />
      <path d="M9.8 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4-7 7z" fill="#000000" />
    </svg>
  );
};

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routerLocation = useLocation();
  const navState = (routerLocation.state as any) || {};
  const targetIdParam = searchParams.get('id');

  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem("yr_my_profile_cache");
    } catch { return true; }
  });
  const [showMySentToast, setShowMySentToast] = useState(false);

      const [viewingImagePost, setViewingImagePost] = useState<any>(null);

  
  const handleGlobalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 40) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    lastScrollY.current = currentScrollY;
  };


  
  

  const [ownedBusinessId, setOwnedBusinessId] = useState<string | null>(null);
  const [businessPage, setBusinessPage] = useState<StoredBusinessPage | null>(() => getStoredBusinessPage());
  const [isCreateBizModalOpen, setIsCreateBizModalOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('بدء...');
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // قائمة خيارات (...)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // بيانات الحساب المعروض الحقيقي
  const [profileId, setProfileId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [myName, setMyName] = useState<string>('مستخدم');
  const [myAvatar, setMyAvatar] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAvatarBehind, setIsAvatarBehind] = useState(false);
  const lastScrollY = useRef(0);
  const profileDetailsRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const avatarRowRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'avatar' | 'cover' | null>(null);
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const progress = Math.min(1, Math.max(0, y / 36));
      if (avatarRef.current) {
        const scale = 1 - progress * 0.55;
        const translateY = progress * 8;
        avatarRef.current.style.transform = `translateY(${translateY}px) scale(${scale})`;
        avatarRef.current.style.opacity = `${1 - progress}`;
      }
      setIsAvatarBehind(y > 16);
      setIsScrolled(y > 48);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
    
  const [coverUrl, setCoverUrl] = useState<string>('');

  // أرقام المتابعة الحقيقية
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [confirmUnfollowModal, setConfirmUnfollowModal] = useState(false);
  const [verificationType, setVerificationType] = useState<string>("none");
  const [isBlocked, setIsBlocked] = useState(false);
  const [isDmOpen, setIsDmOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; desc: string; onConfirm: () => void } | null>(null);
  const [dmContent, setDmContent] = useState("");

  // المنشورات
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'reposts' | 'media' | 'likes'>('posts');

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    const tabs: ('posts' | 'replies' | 'reposts' | 'media')[] = ['posts', 'replies', 'reposts', 'media'];
    const currentIndex = tabs.indexOf(activeTab as any);
    if (isLeftSwipe && currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
    if (isRightSwipe && currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
  };


  const [userPosts, setUserPosts] = useState<Post[]>(() => {
    try {
      const cached = localStorage.getItem("yr_my_account_posts");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  useEffect(() => {
    if (activeTab === 'replies' && userPosts.length > 0) {
      const parentIds = [...new Set(userPosts.filter(p => p.parent_id).map(p => p.parent_id))].filter(Boolean) as string[];
      if (parentIds.length > 0) {
        (async () => {
          const { data: parents, error } = await supabase
            .from('posts')
            .select('*')
            .in('id', parentIds);
          if (error || !parents || parents.length === 0) return;

          const authorIds = [...new Set(parents.map((p: any) => p.user_id).filter(Boolean))];
          const [{ data: profilesData }, likesRes, repostsRes] = await Promise.all([
            authorIds.length > 0
              ? supabase.from('profiles').select('id, full_name, username, avatar_url, verification_type, is_verified').in('id', authorIds)
              : Promise.resolve({ data: [] as any[] }),
            sessionUser?.id
              ? supabase.from('post_likes').select('post_id').eq('user_id', sessionUser.id).in('post_id', parentIds)
              : Promise.resolve({ data: [] as any[] }),
            sessionUser?.id
              ? supabase.from('post_reposts').select('post_id').eq('user_id', sessionUser.id).in('post_id', parentIds)
              : Promise.resolve({ data: [] as any[] }),
          ]);

          const profileMap = new Map((profilesData || []).map((pr: any) => [pr.id, pr]));
          const likedIds = new Set((likesRes.data || []).map((l: any) => l.post_id));
          const repostedIds = new Set((repostsRes.data || []).map((r: any) => r.post_id));

          const map: Record<string, any> = {};
          parents.forEach((p: any) => {
            const prof: any = profileMap.get(p.user_id);
            map[p.id] = {
              id: p.id,
              text: p.content || p.text || '',
              image: p.image_url || p.image || undefined,
              video_url: p.video_url || p.video || undefined,
              video: p.video_url || p.video || undefined,
              createdAt: p.created_at,
              createdAtDisplay: p.created_at ? new Date(p.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }) : '',
              authorId: p.user_id,
              authorName: prof?.full_name || 'مستخدم',
              authorUsername: prof?.username || 'user',
              authorAvatar: prof?.avatar_url || '',
              authorBadge: prof?.verification_type || (prof?.is_verified ? 'blue' : 'none'),
              likes: p.likes_count || p.likes || 0,
              isLiked: likedIds.has(p.id),
              likedBy: likedIds.has(p.id) && sessionUser?.id ? [sessionUser.id] : [],
              replies: p.comments_count || p.replies_count || p.replies || 0,
              reposts: p.reposts_count || p.reposts || 0,
              isReposted: repostedIds.has(p.id),
              views: p.views_count || p.views || 1,
            };
          });
          setParentTweets(map);
        })();
      }
    }
  }, [activeTab, userPosts, sessionUser?.id]);


  const filteredPosts = userPosts.filter(post => {
    if (activeTab === 'replies') return !!post.parent_id; // الردود
    if (activeTab === 'reposts') return post.isRepost && !post.quote_text; // إعادات النشر الصافية فقط مثل X
    if (activeTab === 'media') return post.image || post.video || post.video_url; // الفيديوهات والصور
    return (!post.isRepost || !!post.quote_text) && !post.parent_id && (!post.text || !post.text.startsWith('@')); // المنشورات والاقتباسات مثل X
  });


  // مزامنة التغريدات في الذاكرة الفورية تلقائياً للفتح الفوري مثل X
  useEffect(() => {
    if (userPosts && userPosts.length > 0) {
      try { localStorage.setItem("yr_my_account_posts", JSON.stringify(userPosts)); } catch(_) {}
    }
  }, [userPosts]);
  
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
  const [shareMenuPost, setShareMenuPost] = useState<any>(null);
  const [shareUsers, setShareUsers] = useState<any[]>([]);
  const [shareSearch, setShareSearch] = useState('');
  const [selectedShareUsers, setSelectedShareUsers] = useState<string[]>([]);
  const [isSendingShareDm, setIsSendingShareDm] = useState(false);

  useEffect(() => {
    if (!shareMenuPost) {
      setShareSearch('');
      setSelectedShareUsers([]);
      return;
    }
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, verification_type, is_verified')
          .limit(30);
        if (data) {
          setShareUsers(data.filter((u: any) => u.id !== sessionUser?.id));
        }
      } catch (_) {}
    })();
  }, [shareMenuPost, sessionUser?.id]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostText, setEditPostText] = useState('');
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
  const [viewingEngagementsPost, setViewingEngagementsPost] = useState<any>(null);
  const [quoteText, setQuoteText] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [viewingDetailPost, setViewingDetailPost] = useState<Post | null>(null);

  // 🔄 تحميل تعليقات viewingDetailPost تلقائياً
  useEffect(() => {
    const fetchOwnedBusiness = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: biz } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', session.user.id)
            .limit(1)
            .maybeSingle();
          if (biz) setOwnedBusinessId(biz.id);
        }
      } catch (err) {
        console.error('Error fetching owned business:', err);
      }
    };
    fetchOwnedBusiness();
  }, []);

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
  const [replyToPost, setReplyToPost] = useState<Post | null>(null);
  const [parentTweets, setParentTweets] = useState<Record<string, any>>({});
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
          .select('full_name, username, avatar_url')
          .eq('id', user.id)
          .single();
        if (myProfile) {
          setMyName(myProfile.full_name || myProfile.username || 'مستخدم');
          setMyAvatar(myProfile.avatar_url || user.user_metadata?.avatar_url || '');
        } else {
          setMyName(user.email?.split('@')[0] || 'مستخدم');
          setMyAvatar(user.user_metadata?.avatar_url || '');
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
            authorBadge: p.badgeType || p.authorBadge || p.profile?.verification_type || (p.profile?.is_verified ? "blue" : "none"),
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
              ...p,
              id: p.id,
              authorId: p.authorId || p.user_id,
              authorName: p.authorName || p.profile?.full_name || '',
              authorUsername: p.authorUsername || p.profile?.username || '',
              authorAvatar: p.authorAvatar || p.profile?.avatar_url || '',
              authorBadge: p.badgeType || p.authorBadge || p.profile?.verification_type || (p.profile?.is_verified ? 'blue' : 'none'),
              text: p.text || p.content,
              image: p.image || p.image_url || undefined,
              video_url: p.video_url || p.video || undefined,
              video: p.video_url || p.video || undefined,
              createdAt: p.createdAt || p.created_at,
              createdAtDisplay: p.createdAtDisplay || new Date(p.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
              likes: p.likes ?? p.likes_count ?? 0,
              likedBy: p.likedBy || [],
              isLiked: p.isLiked,
              isReposted: p.isReposted,
              replies: p.replies ?? p.comments_count ?? 0,
              reposts: p.reposts ?? p.reposts_count ?? 0,
              views: p.views ?? p.views_count ?? 1,
              isRepost: p.isRepost,
              quote_text: p.quote_text,
              original: p.original,
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
    // دالة لتحويل الهاشتاج إلى رابط قابل للنقر
  const renderBioText = (text: string) => {
    if (!text) return null;
    // هذا التعبير يبحث عن أي كلمة تبدأ بـ # وتحتوي على أحرف عربية أو إنجليزية أو أرقام
    const parts = text.split(/(#[\u0600-\u06FFa-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
      

  return (
          <span
            key={i}
            className="text-[#FFC500] hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/search?q=${encodeURIComponent(part)}`);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage(reader.result as string);
        setCropTarget(target);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async (base64: string) => {
    if (!cropTarget) return;
    try {
      showToast('جاري حفظ الصورة...');
      const res = await fetch(base64);
      const blob = await res.blob();
      const file = new File([blob], `crop_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const filePath = `posts/${cropTarget}_${profileId}_${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('social-media').upload(filePath, file, { upsert: true, contentType: 'image/jpeg' });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from('social-media').getPublicUrl(filePath);
      const url = pubData.publicUrl;

      if (cropTarget === 'avatar') {
        setAvatarUrl(url);
        await updateUserProfile(profileId, { avatar_url: url });
      } else {
        setCoverUrl(url);
        await updateUserProfile(profileId, { cover_url: url });
      }
      showToast("تم تحديث الصورة بنجاح ✅");
    } catch (err: any) {
      showToast("فشل رفع الصورة: " + (err.message || ''));
    } finally {
      setCropImage(null);
      setCropTarget(null);
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
  const performUnfollow = async () => {
    if (!sessionUser || !profileId) return;
    setConfirmUnfollowModal(false);
    try {
      const nowFollowing = await toggleFollow(sessionUser.id, profileId);
      setIsFollowing(nowFollowing);
      setFollowersCount(prev => Math.max(0, prev - 1));
      showToast(`ألغيت متابعة ${name}`);
    } catch (e) {
      showToast('فشل تحديث المتابعة');
    }
  };

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
        showToast(`تابعت ${name} بنجاح`);
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

  const getPostShareUrl = (post: any) => {
    const cleanId = (post?.originalId || post?.id || '').toString().replace(/^repost-/, '');
    return `${window.location.origin}/post/${cleanId}/engagements`;
  };

  const copyTextReliable = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.focus();
      el.select();
      el.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      if (ok) return true;
    } catch (_) {}
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    return false;
  };

  const loadQuotedPostById = async (postId: string) => {
    try {
      const cleanId = postId.replace(/^repost-/, '');
      const { data: postData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();
      if (error || !postData) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, verification_type, is_verified')
        .eq('id', postData.user_id)
        .maybeSingle();

      const originalData = {
        id: postData.id,
        authorId: postData.user_id,
        authorName: prof?.full_name || 'مستخدم',
        authorUsername: prof?.username || 'user',
        authorAvatar: prof?.avatar_url || '',
        text: postData.content || '',
        image: postData.image_url || undefined,
        createdAt: postData.created_at,
        badgeType: prof?.verification_type || (prof?.is_verified ? 'blue' : 'none'),
      };
      setQuoteOriginal(originalData as any);
      showToast('تم إرفاق التغريدة للاقتباس ✅');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasteUrl = async (e: React.ClipboardEvent) => {
    const text = e.clipboardData?.getData('text') || '';
    const match = text.match(/\/post\/([a-zA-Z0-9-]+)/) || text.match(/\/tweet\/([a-zA-Z0-9-]+)/);
    if (match) {
      e.preventDefault();
      await loadQuotedPostById(match[1]);
    }
  };

  const handleComposeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const urlMatch = val.match(/https?:\/\/[^\s]*\/(?:post|tweet)\/([a-zA-Z0-9-]+)(?:\/[^\s]*)?/) || val.match(/\/(?:post|tweet)\/([a-zA-Z0-9-]+)(?:\/[^\s]*)?/);
    if (urlMatch && !quoteOriginal) {
      const cleaned = val.replace(urlMatch[0], '').trim();
      setNewPostText(cleaned);
      loadQuotedPostById(urlMatch[1]);
      return;
    }
    setNewPostText(val);
  };

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

    
    try {
      let inserted: any = null;
      if (quoteOriginal) {
        const { data: repost, error: rErr } = await supabase.from('post_reposts').insert({
            post_id: quoteOriginal.id,
            user_id: profileId,
            quote_text: newPostText.trim()
        }).select().single();
        if (rErr) throw rErr;
        inserted = repost;
      } else {
        const { data, error: pErr } = await supabase.from("posts").insert({
          user_id: profileId,
          content: newPostText.trim(),
          image_url: finalImageUrl || null,
          video_url: finalVideoUrl || null,
          parent_id: replyToPost?.id || null,
        }).select().single();
        if (pErr) throw pErr;
        inserted = data;
      }

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
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        replies: 0,
        reposts: 0,
        views: 1,
        isRepost: !!quoteOriginal,
        quote_text: quoteOriginal ? newPostText.trim() : undefined,
        original: quoteOriginal ? quoteOriginal : undefined,
      };

      setUserPosts(prev => [realPost, ...prev]);
      setNewPostText("");
      setNewPostImage("");
      setNewPostFile(null);
      setReplyToPost(null);
      setIsPostModalOpen(false);
      setIsPostingModal(false);
      try {
        localStorage.removeItem('yr_global_feed');
        localStorage.removeItem('yr_community_feed');
        window.dispatchEvent(new Event('storage'));
      } catch(_) {}
      setShowMySentToast(true);
      setTimeout(() => setShowMySentToast(false), 4500);
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
      const targetPost = viewingDetailPost || activeCommentPost;
      if (!newCommentText.trim() || !sessionUser?.id || !targetPost) {
        return;
      }

    try {
      const postIdToUse = targetPost.id.startsWith('repost-') && targetPost.original?.id
        ? targetPost.original.id
        : targetPost.id;

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

      if (viewingDetailPost && viewingDetailPost.id === targetPost.id) {
        setViewingDetailPost((prev: any) => prev ? {
          ...prev,
          comments_count: (Number(prev.comments_count) || 0) + 1
        } : prev);
      }

      setUserPosts((prevPosts: any[]) =>
        prevPosts.map((p) =>
          p.id === postIdToUse
            ? { ...p, comments_count: (Number(p.comments_count) || 0) + 1 }
            : p
        )
      );

      showToast('تم إضافة الرد');
    } catch (e: any) {
      console.error('add comment error:', e);
      showToast('فشل: ' + (e?.message || 'خطأ'));
    }
  };

  


  const openAuthorProfile = (authorId: string, authorData?: { name?: string; avatarUrl?: string; username?: string }) => {
    setViewingDetailPost(null);
    const navState = authorData ? {
      name: authorData.name,
      avatarUrl: authorData.avatarUrl,
      username: authorData.username,
    } : undefined;
    if (authorId === currentUserId) {
      navigate('/account', { state: navState });
    } else {
      navigate('/account?id=' + authorId, { state: navState });
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
    setParentTweets(prev => {
      if (!prev[postId]) return prev;
      const pt = prev[postId];
      const nextLiked = !pt.isLiked;
      return {
        ...prev,
        [postId]: {
          ...pt,
          isLiked: nextLiked,
          likes: nextLiked ? (pt.likes || 0) + 1 : Math.max(0, (pt.likes || 0) - 1),
        }
      };
    });

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

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await supabase.auth.signOut();
    localStorage.removeItem('sb-auth-token');
    showToast('تم تسجيل الخروج بنجاح 👋');
    setTimeout(() => {
      navigate('/');
      window.location.reload();
    }, 300);
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
        <div className="w-14 h-14 rounded-3xl bg-[#141E30] border border-[#2F3336] flex items-center justify-center mb-5 text-[#FFC500] shadow-2xl">
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




  const handleSaveEdit = async () => {
    if (!editingPost || !editPostText.trim()) return;
    try {
      await supabase.from('posts').update({ content: editPostText }).eq('id', editingPost.id);
      // تحديث الواجهة
      if (typeof setUserPosts !== 'undefined') {
        setUserPosts((prev: any[]) => prev.map(p => p.id === editingPost.id ? { ...p, text: editPostText } : p));
      }
      setEditingPost(null);
      if (typeof showToast !== 'undefined') showToast('تم تعديل التغريدة بنجاح');
    } catch (e) {
      if (typeof showToast !== 'undefined') showToast('حدث خطأ أثناء التعديل');
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E7E9EA] font-['Tahoma',sans-serif] selection:bg-[#FFC500] selection:text-white pb-32" dir="rtl">
      {/* 1. الغلاف بنمط أبو شرواني */}
      <div className="sticky -top-12 z-40 w-full h-36 sm:h-40 overflow-hidden bg-black bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950">
        {coverUrl ? (
          <img src={coverUrl} alt="الغلاف" className="w-full h-full object-cover transition-all duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0B1528] via-[#050C18] to-black flex items-center justify-center text-zinc-700 text-xs font-bold">
            {isOwner && 'انقر على زر الكاميرا لإضافة غلاف'}
          </div>
        )}



        {/* أزرار الهيدر العلوية */}
        <div className="fixed top-3 left-3 right-3 flex items-center justify-between gap-2 z-50">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/feed')}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center transition active:scale-95 border border-white/10 shrink-0"
              title="رجوع"
            >
              <ArrowRight size={18} />
            </button>

            <div className={`flex flex-col min-w-0 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="text-white font-bold text-[15px] leading-tight truncate"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85)' }}
                >
                  {name || 'مستخدم يمن ريتنج'}
                </span>
                {verificationType && verificationType !== 'none' && (
                  <span className="shrink-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    <VerifiedBadge type={verificationType as any} size={15} />
                  </span>
                )}
              </div>
              <span
                className="text-white font-medium text-[11.5px] leading-tight mt-0.5 truncate"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85)' }}
              >
                {userPosts.filter(p => !p.parent_id).length.toLocaleString('ar-EG')} من المنشورات
              </span>
            </div>
          </div>

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
              <MoreHorizontal size={22} className="text-white" />
            </button>

            {isMenuOpen && createPortal(
              <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setIsMenuOpen(false)} />
                <div className="fixed top-[60px] left-3 w-44 bg-black/95 backdrop-blur-2xl border border-[#2F3336] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-1.5 z-[9999] text-xs animate-fade-in divide-y divide-[#2F3336]/60">
                  {isOwner ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setEditName(name); setEditPhone(phone); setEditUsername(username); setEditBio(bio); setEditLocation(location); setEditBirthDate(birthDate);
                          setIsEditModalOpen(true); setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <Edit3 size={16} className="text-[#FFC500] flex-shrink-0" />
                        <span className="text-white text-sm">تعديل</span>
                      </button>
                      <button
                        onClick={() => { setIsSupportOpen(true); setIsMenuOpen(false); }}
                        className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <MessageCircle size={16} className="text-[#FFC500] flex-shrink-0" />
                        <span className="text-white text-sm">الدعم الفني</span>
                      </button>
                      <button
                        onClick={() => { setIsMenuOpen(false); navigate('/account'); }}
                        className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <UserCheck size={16} className="text-[#FFC500] flex-shrink-0" />
                        <span className="text-white text-sm">الحساب الشخصي</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          setIsMenuOpen(false);
                          showToast('تم نسخ رابط صفحة المنشأة!');
                        }}
                        className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <Share2 size={16} className="text-[#FFC500] flex-shrink-0" />
                        <span className="text-white text-sm">مشاركة الصفحة</span>
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
                        <Share2 size={16} className="text-[#FFC500] flex-shrink-0" />
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
                      <button
                        onClick={() => { setIsSupportOpen(true); setIsMenuOpen(false); }}
                        className="w-full px-3 py-2.5 text-right hover:bg-white/10 active:bg-white/15 flex items-center gap-3 text-white font-bold transition rounded-xl"
                      >
                        <MessageCircle size={16} className="text-[#FFC500] flex-shrink-0" />
                        <span className="text-white text-sm">الدعم الفني</span>
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
              </>,
              document.body
            )}
          </div>
        </div>
      </div>

      {/* 2. الصورة الشخصية والشارة العلوية */}
      <div className="px-4 relative">
        <div className="flex justify-between items-end -mt-[28px] sm:-mt-[41px] mb-3">
          {/* الصورة الشخصية */}
          <div ref={avatarRef} className={`relative group origin-bottom will-change-transform ${isAvatarBehind ? 'z-10 pointer-events-none' : 'z-[45]'}`}>
            <div className="w-[84px] h-[84px] sm:w-[124px] sm:h-[124px] rounded-full border-4 border-black bg-zinc-950 overflow-hidden shadow-xl flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#182338] text-white flex items-center justify-center text-2xl font-black">
                  {name ? name[0] : '؟'}
                </div>
              )}
            </div>


          </div>

          {/* الجهة المقابلة للصورة: وثّق حسابك مثل أبو شرواني أو أزرار المتابعة */}
          <div className={`relative z-10 transition-all duration-300 ${isScrolled ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}>
            {isOwner ? (
              <button
                onClick={() => navigate('/premium')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-700 bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs font-bold transition"
              >
                <VerifiedBadge 
                  type={(verificationType && verificationType !== 'none') ? verificationType as any : 'blue'} 
                  size={16} 
                />
                <span>{(verificationType && verificationType !== 'none') ? 'ترقية الاشتراك' : 'وثّق حسابك'}</span>
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
                      ? 'bg-black border border-white text-white hover:bg-white/10'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isFollowing ? 'مُتابَع' : 'تابِع'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. الاسم والمعرف */}
        <div className="mt-1 relative z-10">
          <div className="flex items-center flex-nowrap min-w-0 w-full  gap-1.5 min-w-0 flex-1 flex-nowrap overflow-hidden" dir="rtl">
            <h1
              className="text-white select-text"
              style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.3' }}
            >
              {name || "مستخدم يمن ريتنج"}
            </h1>
            <VerifiedBadge type={verificationType} size={16} />
          </div>
          <p className="text-[15px] text-[#71767B] font-normal mt-0.5 select-text truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr" style={{ textAlign: 'right', lineHeight: '1.3' }}>
            @{username || 'business'}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs hover:opacity-85 transition"
          >
            <span className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={13}
                  className={s <= Math.round(bizRating) ? 'text-[#FFC500] fill-[#FFC500]' : 'text-[#71767B]'}
                />
              ))}
            </span>
            <span className="font-bold text-white">{bizRating > 0 ? bizRating.toFixed(1) : '0.0'}</span>
            <span className="text-[#71767B]">({bizReviewCount.toLocaleString('ar-EG')} تقييم)</span>
          </button>
        </div>

        {/* 4. النبذة التعريفية */}
        {bio ? (
          <p
            className="mt-2.5 text-[#E7E9EA] whitespace-pre-wrap"
            style={{ fontSize: '12px', fontWeight: 400, lineHeight: '1.4' }}
          >
            {renderBioText(bio)}
          </p>
        ) : isOwner ? (
          <p className="mt-2 text-xs text-zinc-600 italic cursor-pointer hover:text-zinc-400" onClick={() => setIsEditModalOpen(true)}>
            + أضف نبذة تعريفية عنك (Bio)
          </p>
        ) : null}

        {/* 5. البيانات (أيقونات رمادية هادئة) */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2.5 text-[11px] text-[#71767B]">
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
        <div className="flex items-center gap-4 mt-3 text-[11px]">
          <div 
            onClick={() => navigate(`/u/${username}?tab=following`)}
            className="hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="font-bold text-white truncate shrink max-w-[130px] sm:max-w-[150px]">{Number(followingCount || 0).toLocaleString('ar-EG')}</span>
            <span className="text-[#71767B]">متابَعاً</span>
          </div>
          <div 
            onClick={() => navigate(`/u/${username}?tab=followers`)}
            className="hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="font-bold text-white truncate shrink max-w-[130px] sm:max-w-[150px]">{Number(followersCount || 0).toLocaleString('ar-EG')}</span>
            <span className="text-[#71767B]">متابِعاً</span>
          </div>
        </div>

        {/* 7. أزرار الإجراء في الأسفل */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {isOwner ? (
            <button
              onClick={() => {
                setEditName(name); setEditPhone(phone); setEditUsername(username); setEditBio(bio); setEditLocation(location);
                setIsEditModalOpen(true);
              }}
              className="w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-white/10 active:scale-[0.98] text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>تعديل صفحة المنشأة</span>
            </button>
          ) : (
            <button
              onClick={handleToggleFollow}
              className={`w-full py-2 px-4 rounded-full font-bold text-sm transition flex items-center justify-center gap-1.5 ${
                isFollowing ? 'bg-black border border-white text-white hover:bg-white/10' : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              <span>{isFollowing ? 'مُتابَع' : 'تابِع'}</span>
            </button>
          )}

          {isOwner ? (
            <button
              onClick={() => navigate('/account')}
              className="w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-white/10 active:scale-[0.98] text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <UserCheck size={14} className="text-[#FFC500] shrink-0" />
              <span>الحساب الشخصي</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRateModalOpen(true)}
              className="w-full py-2 px-4 rounded-full border border-[#536471] hover:bg-white/10 active:scale-[0.98] text-white text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <Star size={14} className="text-[#FFC500] shrink-0" />
              <span>تقييم</span>
            </button>
          )}
        </div>
      </div>

      {/* 8. التبويبات (نمط X) */}
      <div className="sticky top-24 sm:top-28 z-[35] bg-black border-b border-[#2F3336]/40 flex items-center justify-around text-[14px]" ref={tabsRef}>
        {/* المنشورات */}
        <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3.5 flex items-center justify-center relative transition ${activeTab === 'posts' ? 'text-white font-bold' : 'text-[#71767B]'}`}>
          <div className="flex flex-row items-center gap-1.5 whitespace-nowrap">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z"></path></g></svg>
            {activeTab === 'posts' && <span>المنشورات</span>}
            {activeTab === 'posts' && <svg viewBox="0 0 24 24" fill="none" stroke="#FFC500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>}
          </div>
          {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-full" />}
        </button>

        {/* الردود */}
        <button onClick={() => setActiveTab('replies')} className={`flex-1 py-3.5 flex items-center justify-center relative transition ${activeTab === 'replies' ? 'text-white font-bold' : 'text-[#71767B]'}`}>
          <div className="flex flex-row items-center gap-1.5 whitespace-nowrap">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.133-3.544-8.133-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.312 2.688 6 6.005 6h2.067v2.31l5.854-3.24c1.876-1.04 3.034-2.99 3.034-5.03 0-3.316-2.689-6-6.129-6H9.756z"></path></g></svg>
            {activeTab === 'replies' && <span>الردود</span>}
            {activeTab === 'replies' && <svg viewBox="0 0 24 24" fill="none" stroke="#FFC500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>}
          </div>
          {activeTab === 'replies' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-full" />}
        </button>

        {/* إعادة النشر */}
        <button onClick={() => setActiveTab('reposts')} className={`flex-1 py-3.5 flex items-center justify-center relative transition ${activeTab === 'reposts' ? 'text-white font-bold' : 'text-[#71767B]'}`}>
          <div className="flex flex-row items-center gap-1.5 whitespace-nowrap">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
            {activeTab === 'reposts' && <span>إعادة النشر</span>}
            {activeTab === 'reposts' && <svg viewBox="0 0 24 24" fill="none" stroke="#FFC500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>}
          </div>
          {activeTab === 'reposts' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-full" />}
        </button>

        {/* الفيديوهات */}
        <button onClick={() => setActiveTab('media')} className={`flex-1 py-3.5 flex items-center justify-center relative transition ${activeTab === 'media' ? 'text-white font-bold' : 'text-[#71767B]'}`}>
          <div className="flex flex-row items-center gap-1.5 whitespace-nowrap">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><g><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v13c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-13c0-.276-.224-.5-.5-.5h-13zM9 9l7 3-7 3V9z"></path></g></svg>
            {activeTab === 'media' && <span>الفيديوهات</span>}
            {activeTab === 'media' && <svg viewBox="0 0 24 24" fill="none" stroke="#FFC500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>}
          </div>
          {activeTab === 'media' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-full" />}
        </button>
      
        {/* التقييمات */}
        <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-3.5 flex items-center justify-center relative transition ${activeTab === 'reviews' ? 'text-white font-bold' : 'text-[#71767B]'}`}>
          <div className="flex flex-row items-center gap-1.5 whitespace-nowrap">
            <Star className="w-4 h-4" />
            {activeTab === 'reviews' && <span>التقييمات</span>}
            {activeTab === 'reviews' && <svg viewBox="0 0 24 24" fill="none" stroke="#FFC500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"></polyline></svg>}
          </div>
          {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-full" />}
        </button>
      </div>
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="divide-y divide-[#2F3336]/40">
        {activeTab === 'reviews' ? (
          <div className="divide-y divide-[#2F3336]/40">
            {!isOwner && (
              <div className="p-3 flex justify-end">
                <button
                  onClick={() => setIsRateModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#FFC500] text-black text-xs font-bold flex items-center gap-1.5"
                >
                  <Star size={14} />
                  <span>قيّم المنشأة</span>
                </button>
              </div>
            )}
            {bizReviews.length === 0 ? (
              <div className="text-center min-h-[40vh] flex flex-col items-center justify-center px-4 text-[#71767B] text-xs">
                لا توجد تقييمات لهذه المنشأة بعد
              </div>
            ) : (
              bizReviews.map((rev) => (
                <div key={rev.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center text-xs font-bold">
                        {rev.authorAvatar ? (
                          <img src={rev.authorAvatar} alt={rev.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{rev.authorName?.[0] || 'م'}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{rev.authorName}</p>
                        {rev.authorUsername && (
                          <p className="text-[11px] text-[#71767B]" dir="ltr">@{rev.authorUsername}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#71767B]">{rev.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} className={s <= rev.stars ? 'text-[#FFC500] fill-[#FFC500]' : 'text-[#71767B]'} />
                    ))}
                  </div>
                  <p className="text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center min-h-[50vh] flex flex-col items-center justify-center px-4">
            <h3 className="text-sm font-bold text-white mb-1 truncate shrink max-w-[130px] sm:max-w-[150px]">
              {activeTab === 'posts' ? (isOwner ? 'لم تقم بنشر أي منشور بعد' : `لا توجد منشورات لـ ${name}`)
               : activeTab === 'replies' ? 'لا توجد ردود'
               : activeTab === 'reposts' ? 'لا توجد إعادات نشر'
               : 'لا توجد فيديوهات'}
            </h3>
            
            {isOwner && activeTab === 'posts' && (
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="yr-fab px-5 py-2.5 rounded-full bg-[#FFC500] text-white text-xs font-bold hover:bg-[#E5B200] transition shadow-lg"
              >
                اكتب تغريدة جديدة
              </button>
            )}
          </div>
        ) : (
          filteredPosts.map(post => {
            const parentTweet = activeTab === 'replies' && post.parent_id ? parentTweets[post.parent_id] : null;
            return (
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
              {post.isRepost && !post.quote_text && (
                <div className="flex items-center gap-2 text-[#71767B] text-[12px] font-bold mb-1.5 pr-[42px] select-none">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current shrink-0"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                  <span>{isOwner ? 'أعاد أنت النشر' : `أعاد ${post.reposterName || name} النشر`}</span>
                </div>
              )}

              {parentTweet && (
                <div
                  className="flex gap-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    const target = e.target as HTMLElement;
                    if (!target.closest('button') && !target.closest('a')) {
                      setViewingDetailPost(parentTweet);
                    }
                  }}
                >
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        openAuthorProfile(parentTweet.authorId, {
                          name: parentTweet.authorName,
                          avatarUrl: parentTweet.authorAvatar,
                          username: parentTweet.authorUsername,
                        });
                      }}
                      className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold text-white text-lg cursor-pointer hover:opacity-80 transition"
                    >
                      {parentTweet.authorAvatar ? (
                        <img src={parentTweet.authorAvatar} alt={parentTweet.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{parentTweet.authorName?.[0] || '؟'}</span>
                      )}
                    </div>
                    <div className="w-[2px] flex-1 bg-[#333639] mt-1.5 min-h-[20px] rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            openAuthorProfile(parentTweet.authorId, {
                              name: parentTweet.authorName,
                              avatarUrl: parentTweet.authorAvatar,
                              username: parentTweet.authorUsername,
                            });
                          }}
                          className="font-bold text-white text-[12.5px] hover:underline cursor-pointer truncate shrink max-w-[130px] sm:max-w-[150px]"
                        >
                          {parentTweet.authorName}
                        </span>
                        {parentTweet.authorBadge && parentTweet.authorBadge !== "none" && (
                          <svg
                            className="w-[14.5px] h-[14.5px] flex-shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{ color: parentTweet.authorBadge === "blue" ? "#1D9BF0" : parentTweet.authorBadge === "gold" ? "#FFD700" : "#71767B" }}
                          >
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.755 2.73 1.882 3.475-.038.2-.058.406-.058.617 0 2.21 1.71 4 3.918 4 .47 0 .92-.085 1.336-.25.52 1.335 1.828 2.25 3.337 2.25s2.816-.917 3.337-2.25c.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.21-.02-.417-.058-.617C21.745 15.23 22.5 13.96 22.5 12.5z" />
                            <path fill="#000000" d="M10.825 16.583l-3.66-3.66a.75.75 0 111.06-1.061l2.6 2.6 5.405-5.405a.75.75 0 111.06 1.061l-5.935 5.935a.75.75 0 01-1.06 0z" />
                          </svg>
                        )}
                        <span className="text-[#71767B] text-[11.5px] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">
                          @{parentTweet.authorUsername}
                        </span>
                        <span className="text-[#71767B] text-[10.5px] mx-0.5">·</span>
                        <span className="text-[#71767B] text-[10.5px] whitespace-nowrap shrink-0">
                          {formatTimeAgo(parentTweet.createdAt).relative}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuPost(parentTweet);
                        }}
                        className="text-[#71767B] hover:text-[#FFC500] p-1.5 rounded-full hover:bg-[#FFC500]/10 transition shrink-0"
                        title="المزيد"
                      >
                        <MoreHorizontal size={14} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />
                      </button>
                    </div>

                    <p className="-mt-1 text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap pr-0 -ml-8 pl-3 break-words font-normal select-text">
                      <HashtagText text={parentTweet.text} />
                    </p>

                    {parentTweet.video_url && (
                      <div className="mt-3">
                        <XVideoPlayer
                          src={parentTweet.video_url}
                          tweet={parentTweet}
                          authorName={parentTweet.authorName}
                          authorUsername={parentTweet.authorUsername}
                          authorAvatar={parentTweet.authorAvatar}
                          currentUserAvatar={myAvatar}
                          onReply={() => {
                            setReplyToPost(parentTweet);
                            setIsPostModalOpen(true);
                          }}
                          onLike={() => handleToggleLike(parentTweet.id)}
                          onViewEngagements={() => { window.location.href = `/post/${(parentTweet.id || '').replace('repost-', '')}/engagements`; }}
                          onRepost={() => setRepostMenu(parentTweet)}
                          onShare={() => setShareMenuPost(parentTweet)}
                          onBookmark={() => showToast('تمت الإضافة إلى العلامات المرجعية 🔖')}
                        />
                      </div>
                    )}

                    {parentTweet.image && !parentTweet.video_url && (
                      <div className="mt-3 rounded-2xl overflow-hidden border-0 max-h-96">
                        <img
                          src={parentTweet.image}
                          alt="الصورة"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingImagePost(parentTweet);
                          }}
                        />
                      </div>
                    )}

                    <XActionBar
                      isBusinessPost={true}
                      onRate={() => setIsRateModalOpen(true)}
                      tweet={parentTweet}
                      onReply={() => {
                        setReplyToPost(parentTweet);
                        setIsPostModalOpen(true);
                      }}
                      onRepost={(p) => setRepostMenu(p)}
                      onLike={() => handleToggleLike(parentTweet.id)}
                      onBookmark={() => {}}
                      onShare={(t) => setShareMenuPost(t)}
                    />
                  </div>
                </div>
              )}

              <div className={`flex gap-3 ${parentTweet ? 'pt-1' : ''}`}>
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold text-white text-lg truncate shrink max-w-[130px] sm:max-w-[150px]">
                  <div onClick={(e) => { e.stopPropagation(); openAuthorProfile(post.authorId, { name: post.authorName || name, avatarUrl: post.authorAvatar, username: post.authorUsername }); }} className="w-full h-full cursor-pointer hover:opacity-80 transition">
                  {post.authorAvatar ? (
                    <img src={post.authorAvatar} alt={post.authorName || name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{post.authorName?.[0] || name?.[0] || '؟'}</span>
                  )}
                  </div>
                  </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span onClick={(e) => { e.stopPropagation(); openAuthorProfile(post.authorId, { name: post.authorName || name, avatarUrl: post.authorAvatar, username: post.authorUsername }); }} className="font-bold text-white text-[12.5px] hover:underline cursor-pointer truncate truncate shrink max-w-[130px] sm:max-w-[150px]">{post.authorName || name}</span>
                      {post.authorBadge && post.authorBadge !== "none" && (
                        <svg className="w-[14.5px] h-[14.5px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"
                          style={{color: post.authorBadge === "blue" ? "#1D9BF0" : post.authorBadge === "gold" ? "#FFD700" : "#71767B"}}>
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.755 2.73 1.882 3.475-.038.2-.058.406-.058.617 0 2.21 1.71 4 3.918 4 .47 0 .92-.085 1.336-.25.52 1.335 1.828 2.25 3.337 2.25s2.816-.917 3.337-2.25c.416.165.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.21-.02-.417-.058-.617C21.745 15.23 22.5 13.96 22.5 12.5z"/>
                          <path fill="#000000" d="M10.825 16.583l-3.66-3.66a.75.75 0 111.06-1.061l2.6 2.6 5.405-5.405a.75.75 0 111.06 1.061l-5.935 5.935a.75.75 0 01-1.06 0z"/>
                        </svg>
                      )}
                      <span className="text-[#71767B] text-[11.5px] truncate truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{post.authorUsername || username}</span>
                      <span className="text-[#71767B] text-[10.5px] mx-0.5">·</span>
                      <span className="text-[#71767B] text-[10.5px] hover:underline cursor-pointer whitespace-nowrap shrink-0 whitespace-nowrap"  title={post.createdAtDisplay || post.createdAt}>
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
                      <MoreHorizontal size={14} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />
                    </button>
                  </div>

                  {/* اقتباس — نص + بطاقة */}
                  {post.isRepost && post.quote_text ? (
                    <div className="mt-2">
                      <p className="-mt-1 text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap pr-0 -ml-8 pl-3 break-words font-normal select-text">
                        <HashtagText text={post.quote_text} />
                      </p>
                      {(post.original || post.quote_text) && (
                        <>
                                                  {!post.original && (
                            <p className="text-[#71767B] text-xs py-2 text-center">التغريدة الأصلية غير متاحة</p>
                          )}
                          {post.original && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tweet/${post.original.id}`);
                                }}
                                className="mt-2.5 rounded-[12px] border border-white/[0.08] hover:bg-white/[0.02] transition cursor-pointer p-2.5 select-none overflow-hidden"
                              >
                                {/* رأس الاقتباس: أفاتار 20px + اسم + معرف + نقطة ووقت في سطر واحد */}
                                <div className="flex items-center flex-nowrap min-w-0 w-full  gap-1.5 text-xs mb-1.5 overflow-hidden" dir="rtl">
                                  <div className="w-[18px] h-[18px] rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                                    {post.original.authorAvatar ? (
                                      <img src={post.original.authorAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-white text-[10px] font-bold flex items-center justify-center w-full h-full">{post.original.authorName?.[0]}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink min-w-0 max-w-[130px] sm:max-w-[160px]">
                                    <span className="font-bold text-[#E7E9EA] truncate text-[13px]">{post.original.authorName}</span>
                                    {((post.original as any).badgeType || (post.original as any).authorBadge || (post.original as any).verification_type) && ((post.original as any).badgeType || (post.original as any).authorBadge || (post.original as any).verification_type) !== 'none' && (
                                      <VerifiedBadge type={((post.original as any).badgeType || (post.original as any).authorBadge || (post.original as any).verification_type) as any} size={14} />
                                    )}
                                  </div>
                                  <span className="text-[#71767B] truncate text-[12px] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{post.original.authorUsername}</span>
                                  {post.original.createdAt && (
                                    <>
                                      <span className="text-[#71767B] text-[11px] shrink-0">·</span>
                                      <span className="text-[#71767B] text-[12px] shrink-0">{post.original.createdAt}</span>
                                    </>
                                  )}
                                </div>

                                {/* نص التغريدة المقتبسة المتماسك */}
                                <p className={`text-[13px] text-[#E7E9EA] leading-[1.38] whitespace-pre-wrap line-clamp-4`}>
                                  <HashtagText text={post.original.text} expandable={false} />
                                </p>

                                {/* صورة المقتبس إن وجدت */}
                                {post.original.image && (
                                  <div className="mt-2.5 rounded-[10px] overflow-hidden max-h-60 bg-black">
                                    <img src={post.original.image} alt="" className="w-full h-full object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingImagePost(post.original); }} />
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                    </div>
                  ) : (
                    <p className="-mt-1 text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap pr-0 -ml-8 pl-3 break-words font-normal select-text">
                      <HashtagText text={post.text} />
                    </p>
                  )}

                  {/* فيديو المنشور */}
                  {(!post.isRepost || !post.quote_text) && (post.video_url || post.video) && (
                    <div className="mt-3">
                      <XVideoPlayer 
                      src={post.video_url || post.video} 
                      tweet={post} 
                      authorName={post.original?.authorName || name} 
                      authorUsername={post.original?.authorUsername || username} 
                      authorAvatar={post.original?.authorAvatar || avatarUrl} 
                      currentUserAvatar={myAvatar}
                      onReply={() => {
                        setReplyToPost(post);
                        setIsPostModalOpen(true);
                      }}
                      onLike={() => handleToggleLike(post.id)}
                  onViewEngagements={() => { window.location.href = `/post/${(viewingDetailPost?.id || '').replace('repost-', '')}/engagements`; }}
                      onRepost={() => setRepostMenu(post)}
                      onShare={() => setShareMenuPost(post)}
                      onBookmark={() => showToast('تمت الإضافة إلى العلامات المرجعية 🔖')}
                    />
                    </div>
                  )}

                  {(!post.isRepost || !post.quote_text) && post.image && !post.video_url && !post.video && (
                    <div className="mt-3 rounded-2xl overflow-hidden border-0 max-h-96">
                      <img src={post.image} alt="الصورة" className="w-full h-full object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingImagePost(post); }} />
                    </div>
                  )}

                                                                <XActionBar
                      isBusinessPost={true}
                      onRate={() => setIsRateModalOpen(true)}
                    tweet={post}
                    onReply={() => {
                      setReplyToPost(post);
                      setIsPostModalOpen(true);
                    }}
                    onRepost={(p) => setRepostMenu(p)}
                    onLike={() => handleToggleLike(post.id)}
                    onBookmark={() => {}}
                    onShare={(t) => setShareMenuPost(t)}
                    
                  />
                </div>
              </div>
            </article>
            );
          })
        )}
      </div>

      

      {/* شريط التنقل السفلي مع جرس التنبيهات */}
      

      {/* مودال تعديل الملف الشخصي (نمط X - شاشة كاملة) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto" dir="rtl">
          {/* إدخالات الملفات المخفية لربط الكاميرا */}
          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'avatar')} />
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'cover')} />

          {/* هيدر X العلوي */}
          <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-between px-4 h-[76px] border-b border-[#2F3336]">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:bg-white/10 p-1.5 rounded-full transition"
                title="رجوع"
              >
                <ArrowRight size={20} />
              </button>
              <h2 className="text-white font-bold text-[15px]">تعديل الملف الشخصي</h2>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleSaveProfile(e); }}
              disabled={savingProfile}
              className="px-4 py-1.5 text-white font-bold text-base rounded-full hover:bg-white/10 transition disabled:opacity-50"
            >
              حفظ
            </button>
          </div>

          <div className="flex-1 pb-24">
            {/* الغلاف مع زر الكاميرا */}
            <div className="relative w-full h-40 sm:h-48 bg-gradient-to-br from-[#0B1528] via-[#050C18] to-black">
              {coverUrl && <img src={coverUrl} alt="غلاف" className="w-full h-full object-cover" />}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition backdrop-blur-md border border-white/20"
                title="تغيير صورة الغلاف"
              >
                <Camera size={20} />
              </button>
            </div>

            {/* الصورة الشخصية مع زر الكاميرا */}
            <div className="px-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 -mt-12 sm:-mt-14 rounded-full border-4 border-black bg-zinc-950 overflow-hidden shadow-xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="صورة" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-[#182338]">
                    {name ? name[0] : '؟'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 hover:bg-black/30 flex items-center justify-center text-white transition"
                  title="تغيير الصورة"
                >
                  <Camera size={22} />
                </button>
              </div>
            </div>

            {/* الحقول المسطحة (نمط X) */}
            <div className="px-4 pt-6 space-y-4">
              {/* الاسم */}
              <div className="relative border-b border-[#2F3336] focus-within:border-[#FFC500] transition py-1">
                <label className="block text-[#71767B] text-xs font-bold mb-1">الاسم</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  maxLength={50}
                  className="w-full bg-transparent text-white text-base pb-2 outline-none placeholder-[#71767B]"
                  placeholder="اسمك الكامل"
                  required
                />
                <span className="absolute left-0 bottom-2 text-[10px] text-[#71767B]">{editName.length}/50</span>
              </div>

              {/* النبذة */}
              <div className="relative border-b border-[#2F3336] focus-within:border-[#FFC500] transition py-1">
                <label className="block text-[#71767B] text-xs font-bold mb-1">النبذة التعريفية</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  maxLength={160}
                  rows={2}
                  className="w-full bg-transparent text-white text-base pb-2 outline-none resize-none placeholder-[#71767B] overflow-hidden"
                  placeholder="عرّف بنفسك..."
                />
                <span className="absolute left-0 bottom-2 text-[10px] text-[#71767B]">{editBio.length}/160</span>
              </div>

              {/* الموقع */}
              <div className="relative border-b border-[#2F3336] focus-within:border-[#FFC500] transition py-1">
                <label className="block text-[#71767B] text-xs font-bold mb-1">الموقع الجغرافي</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-transparent text-white text-base pb-2 outline-none placeholder-[#71767B]"
                  placeholder="مثال: صنعاء، اليمن"
                />
              </div>

              {/* المعرّف */}
              <div className="relative border-b border-[#2F3336] focus-within:border-[#FFC500] transition py-1">
                <label className="block text-[#71767B] text-xs font-bold mb-1">المعرّف (@Username)</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-transparent text-white text-base pb-2 outline-none placeholder-[#71767B]"
                  placeholder="username"
                  dir="ltr"
                />
              </div>

              {/* الهاتف */}
              <div className="relative border-b border-[#2F3336] focus-within:border-[#FFC500] transition py-1">
                <label className="block text-[#71767B] text-xs font-bold mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  className="w-full bg-transparent text-white text-base pb-2 outline-none placeholder-[#71767B]"
                  placeholder="+967 77xxxxxxx"
                  dir="ltr"
                />
              </div>

              {/* زر تسجيل الخروج (أسفل الصفحة) */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 rounded-full border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال منشور جديد (تصميم منصة X المتوافق مع الكيبورد) */}
      
      {/* Custom Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center flex-nowrap min-w-0 w-full  justify-center p-4" dir="rtl">
          <div className="bg-[#16181C] border border-[#2F3336] rounded-2xl w-full max-w-[280px] p-5 flex flex-col items-center text-center shadow-2xl">
            <h3 className="text-white text-[16px] font-bold mb-1">تسجيل الخروج</h3>
            <p className="text-[#71767B] text-[13px] mb-5 leading-relaxed">هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟</p>
            <div className="flex gap-2 w-full">
              <button 
                onClick={confirmLogout}
                className="flex-1 bg-white text-black font-bold text-[13px] py-1.5 rounded-full hover:bg-gray-200 transition"
              >
                نعم
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-transparent border border-[#536471] text-white font-bold text-[13px] py-1.5 rounded-full hover:bg-white/10 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isPostModalOpen && (
        <div

 
          className="fixed inset-0 z-[150] bg-black text-white flex flex-col justify-between overflow-hidden" 
          dir="rtl"
          style={{ 
            height: modalHeight ? `${modalHeight}px` : '100dvh',
            maxHeight: modalHeight ? `${modalHeight}px` : '100dvh'
          }}
        >
          <input type="file" ref={postImageInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.type.startsWith('video/')) {
                  setNewPostFile(file);
                  setNewPostImage(URL.createObjectURL(file));
                } else {
                  const reader = new FileReader();
                  reader.onload = (ev) => { setNewPostImage(ev.target?.result as string); setNewPostFile(file); };
                  reader.readAsDataURL(file);
                }
              }
            }} />
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
            {replyToPost && (
              <div className="text-[#71767B] text-sm mb-2 flex items-center gap-2" dir="rtl">
                <span>رداً على</span>
                <span className="text-[#FFC500]">@{replyToPost.authorUsername || 'user'}</span>
                <button onClick={() => setReplyToPost(null)} className="text-rose-500 mr-auto hover:underline text-xs">إلغاء الرد</button>
              </div>
            )}
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
                  <RichTextarea
                    autoFocus
                    value={newPostText}
                    onChange={handleComposeTextChange}
                    placeholder="ماذا يحدث؟"
                    onPaste={handlePasteUrl}
                  />
                {quoteOriginal && (
                  <div className="rounded-[12px] border border-white/[0.08] p-2.5 mb-4 mt-2 select-none overflow-hidden relative" dir="rtl">
                    <button onClick={() => setQuoteOriginal(null)} className="absolute top-2 left-2 z-10 bg-black/60 p-1 rounded-full text-white"><X size={14} /></button>
                    <div className="flex items-center gap-1.5 text-xs mb-1.5 overflow-hidden">
                       <img src={quoteOriginal.authorAvatar} className="w-[18px] h-[18px] rounded-full object-cover shrink-0" />
                       <span className="font-bold text-[#E7E9EA] truncate text-[13px]">{quoteOriginal.authorName}</span>
                       <span className="text-[#71767B] truncate text-[12px] shrink max-w-[80px]" dir="ltr">@{quoteOriginal.authorUsername}</span>
                    </div>
                    <p className="text-[13px] text-[#E7E9EA] leading-[1.38] whitespace-pre-wrap line-clamp-3">
                       <HashtagText text={quoteOriginal.text} />
                    </p>
                    {quoteOriginal.image && <img src={quoteOriginal.image} className="mt-2 rounded-lg max-h-40 object-cover" />}
                  </div>
                )}

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
              <div className="flex items-center gap-1.5 text-xs font-mono select-none px-2 text-[#71767B] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">
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
              <RichTextarea
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
                className="flex-1 py-2.5 rounded-full text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition active:scale-95 truncate shrink max-w-[130px] sm:max-w-[150px]"
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
                setEditPostText(activeMenuPost.text);
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

      

      {/* زر + (FAB) — دائم الظهور */}
      {isOwner && activeTab === 'posts' && (
              <button
                onClick={() => setIsPostModalOpen(true)}
          className="yr-fab fixed bottom-6 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-black/60 transition"
          title="تغريدة جديدة"
        >
          <Plus size={24} className="stroke-[2.2] text-black" />
        </button>
      )}

      {/* Modal تفاصيل التغريدة */}
      {viewingDetailPost && (
        <div 
          className="fixed inset-0 z-[200] bg-black overflow-y-auto"
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
              <h2 className="text-white font-bold text-base">منشور</h2>
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
                    <span className="font-bold text-white text-[15px] truncate shrink max-w-[130px] sm:max-w-[150px]">{viewingDetailPost.authorName}</span>
                    <span className="text-[#71767B] text-[15px]">@{viewingDetailPost.authorUsername}</span>
                  </div>
                </div>
              </div>

              <p className="-mt-1 text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap pr-0 -ml-8 pl-3 break-words font-normal select-text">
                {viewingDetailPost.text}
              </p>

              {viewingDetailPost.image && (
                <div className="mt-3 rounded-2xl overflow-hidden border-0">
                  <img src={viewingDetailPost.image} alt="" className="w-full h-auto object-cover" />
                </div>
              )}

              {/* الوقت والتاريخ */}
              <div className="text-sm text-[#71767B] py-3 border-y border-white/[0.07] flex items-center gap-2 mt-3">
                <span>{formatTimeAndDate(viewingDetailPost.createdAt) || viewingDetailPost.createdAtDisplay || ''}</span>
                <span>·</span>
                <span>{viewingDetailPost.views || 1} مشاهدة</span>
              </div>

              {/* الأزرار بنظام X الموحد بالملي */}
              <div className="py-1 border-b border-[#2F3336]/40">
                <XActionBar
                      isBusinessPost={true}
                      onRate={() => setIsRateModalOpen(true)}
                  tweet={viewingDetailPost}
                  onReply={() => {
                    setActiveCommentPost(viewingDetailPost);
                    setViewingDetailPost(null);
                    loadComments(viewingDetailPost.id);
                  }}
                  onViewEngagements={() => { window.location.href = `/post/${(viewingDetailPost?.id || '').replace('repost-', '')}/engagements`; }}
                      onRepost={() => handleRepost(viewingDetailPost.id)}
                  onLike={() => handleToggleLike(viewingDetailPost.id)}
                  onBookmark={() => {}}
                  onShare={(t) => setShareMenuPost(t)}
                  
                />
              </div>

              {/* قائمة التعليقات */}
              {postComments.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white font-bold text-sm mb-3">
                    الردود ({postComments.length})
                  </h3>
                  {postComments.map((c) => (
                    <div key={c.id} className="p-3 border-b border-[#2F3336]/40 hover:bg-white/[0.01] transition">
                      <div className="flex gap-3">
                          <div onClick={() => openAuthorProfile(c.userId, { name: c.userName, avatarUrl: c.userAvatar, username: c.userUsername })} className="w-[42px] h-[42px] min-w-[42px] min-h-[42px] rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition">
                          {c.userAvatar ? (
                            <img src={c.userAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">{c.userName?.[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-nowrap min-w-0 w-full  gap-1.5 min-w-0 flex-1 flex-nowrap overflow-hidden" dir="rtl">
                              <span onClick={() => openAuthorProfile(c.userId, { name: c.userName, avatarUrl: c.userAvatar, username: c.userUsername })} className="font-bold text-[#E7E9EA] text-[13.5px] truncate shrink-0 cursor-pointer hover:underline">{c.userName}</span>
                              <span onClick={() => openAuthorProfile(c.userId, { name: c.userName, avatarUrl: c.userAvatar, username: c.userUsername })} className="text-[#71767B] text-[12px] truncate min-w-0 shrink cursor-pointer hover:underline truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{c.userUsername}</span>
                            <span className="text-[#71767B] text-[11px] shrink-0 mx-0.5">·</span>
                            <span className="text-[#71767B] text-[11px] shrink-0 whitespace-nowrap shrink-0 whitespace-nowrap" >
{formatTimeAgo(c.createdAt).relative || "الآن"}</span>
                          </div>
                          <p className="text-[#E7E9EA] text-[13px] mt-1 whitespace-pre-wrap leading-relaxed select-text">{c.content}</p>
                          
                          {/* أيقونات التفاعل بنظام X تحت المعلق */}
                          <div className="max-w-[320px] -mt-1">
                            <XActionBar
                      isBusinessPost={true}
                      onRate={() => setIsRateModalOpen(true)}
                              tweet={c}
                              onReply={() => {
                                const mention = "@" + (c.userUsername || c.userName || "").replace(/@/g, "") + " ";
                                setNewCommentText((prev) => (prev.includes(mention) ? prev : mention + prev));
                              }}
                              onLike={() => {}}
                              onShare={(t) => setShareMenuPost(t)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* شريط الرد الموحد الحديث أسفل تفاصيل المنشور */}
              <div className="sticky bottom-0 z-20 bg-black/95 backdrop-blur border-t border-[#2F3336] -mx-4 -mb-4 mt-4">
                <ReplyBar
                  value={newCommentText}
                  onChange={setNewCommentText}
                  onSubmit={(e) => { e && e.preventDefault(); handleSubmitComment(); }}
                  myAvatar={myAvatar || sessionUser?.user_metadata?.avatar_url || ''}
                  myName={myName || 'مستخدم'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* قائمة إعادة النشر / اقتباس */}
      {viewingEngagementsPost && (
        <PostEngagementsModal post={viewingEngagementsPost} onClose={() => setViewingEngagementsPost(null)} />
      )}

      {repostMenu && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col justify-end sm:justify-center items-center" onClick={() => setRepostMenu(null)}>
          <div className="w-full sm:w-[350px] bg-black sm:rounded-2xl rounded-t-2xl overflow-hidden pb-8 sm:pb-2 shadow-2xl" onClick={e => e.stopPropagation()} dir="rtl">
            
            <button onClick={() => { handleRepost(repostMenu.id); setRepostMenu(null); }} className="w-full flex items-center justify-start gap-4 px-5 py-4 hover:bg-[#181818] active:bg-[#181818] transition-colors cursor-pointer">
              <Repeat2 size={22} className={repostMenu.isReposted ? "text-emerald-400" : "text-white"} />
              <span className="text-white font-bold text-[15px]">{repostMenu.isReposted ? "التراجع عن إعادة النشر" : "إعادة النشر"}</span>
            </button>
            
            
            
            <button onClick={() => { setQuoteOriginal(repostMenu); setQuoteText(''); setIsQuoting(true); setRepostMenu(null); }} className="w-full flex items-center justify-start gap-4 px-5 py-4 hover:bg-[#181818] active:bg-[#181818] transition-colors cursor-pointer">
              <MessageCircle size={22} className="text-white" />
              <span className="text-white font-bold text-[15px]">اقتباس</span>
            </button>
            
          </div>
        </div>
      )}

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
          <RichTextarea
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
              <span className="font-bold text-white text-sm truncate shrink max-w-[130px] sm:max-w-[150px]">{quoteOriginal.authorName}</span>
              <span className="text-[#71767B] text-xs">@{quoteOriginal.authorUsername}</span>
            </div>
            <p className="text-white text-sm"><HashtagText text={quoteOriginal.text} /></p>
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

      {confirmUnfollowModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setConfirmUnfollowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[#16181C] border border-[#2F3336] p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-3 truncate shrink max-w-[130px] sm:max-w-[150px]">هل تريد إلغاء متابعة {name}؟</h3>
            <p className="text-[15px] text-[#71767B] mb-6 leading-relaxed">لن تظهر منشوراته بعد الآن في صفحتك الرئيسية. سيظل بإمكانك مشاهدة ملفه الشخصي ما لم تكن منشوراته محمية.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmUnfollowModal(false)} className="px-5 py-2 rounded-full text-sm font-bold text-white bg-transparent border border-[#536471] hover:bg-white/10 transition truncate shrink max-w-[130px] sm:max-w-[150px]">إلغاء</button>
              <button onClick={performUnfollow} className="px-5 py-2 rounded-full text-sm font-bold text-black bg-white hover:bg-[#E7E9EA] transition">إلغاء المتابعة</button>
            </div>
          </div>
        </div>
      )}

      {confirmUnfollowModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setConfirmUnfollowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[#16181C] border border-[#2F3336] p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-3 truncate shrink max-w-[130px] sm:max-w-[150px]">هل تريد إلغاء متابعة {name}؟</h3>
            <p className="text-[15px] text-[#71767B] mb-6 leading-relaxed">لن تظهر منشوراته بعد الآن في صفحتك الرئيسية. سيظل بإمكانك مشاهدة ملفه الشخصي ما لم تكن منشوراته محمية.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmUnfollowModal(false)} className="px-5 py-2 rounded-full text-sm font-bold text-white bg-transparent border border-[#536471] hover:bg-white/10 transition truncate shrink max-w-[130px] sm:max-w-[150px]">إلغاء</button>
              <button onClick={performUnfollow} className="px-5 py-2 rounded-full text-sm font-bold text-black bg-white hover:bg-[#E7E9EA] transition">إلغاء المتابعة</button>
            </div>
          </div>
        </div>
      )}


      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        currentUser={currentUserId ? { id: currentUserId, name: myName } : null}
      />

      {/* 🖼️ مشغل الصور العالمي للحساب */}
      {viewingImagePost && (
        <XImagePlayer
          src={viewingImagePost.image}
          tweet={viewingImagePost}
          authorName={viewingImagePost.authorName || name}
          authorUsername={viewingImagePost.authorUsername || username}
          authorAvatar={viewingImagePost.authorAvatar || avatarUrl}
          currentUserAvatar={avatarUrl}
          onClose={() => setViewingImagePost(null)}
          onReply={() => setViewingImagePost(null)}
          onLike={() => {}}
          onRepost={() => {}}
          onShare={() => setShareMenuPost(viewingImagePost)}
        />
      )}

  
      {/* مودال تعديل التغريدة */}
      {editingPost && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-black border border-[#2F3336] rounded-2xl w-full max-w-lg p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">تعديل التغريدة</h2>
              <button onClick={() => setEditingPost(null)} className="text-[#71767B] hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                <X size={20} />
              </button>
            </div>
            <RichTextarea
              className="w-full bg-transparent text-white text-[15px] leading-relaxed min-h-[120px] outline-none resize-none placeholder-[#71767B]"
              value={editPostText}
              onChange={(e) => setEditPostText(e.target.value)}
              placeholder="ماذا يجري؟"
            />
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#2F3336]">
              <button onClick={() => setEditingPost(null)} className="px-4 py-2 text-white font-bold rounded-full hover:bg-white/10 transition">إلغاء</button>
              <button onClick={handleSaveEdit} disabled={!editPostText.trim()} className="px-5 py-2 bg-[#FFC500] text-black font-bold rounded-full hover:bg-[#E5B200] transition disabled:opacity-50">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة المشاركة (نمط X الكامل) */}
      {shareMenuPost && (
        <div
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4"
          onClick={() => setShareMenuPost(null)}
        >
          <div
            className="w-full max-w-md bg-black rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-[#2F3336] flex flex-col max-h-[82vh]"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* مقبض السحب */}
            <div className="pt-3 pb-2 flex justify-center shrink-0">
              <div className="w-10 h-1 bg-[#333639] rounded-full" />
            </div>

            {/* شريط البحث */}
            <div className="px-4 pb-3 shrink-0">
              <div className="flex items-center gap-2.5 bg-[#202327] rounded-full px-4 py-2.5 border border-transparent focus-within:border-[#FFFFFF]">
                <svg className="w-4 h-4 text-[#71767B] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={shareSearch}
                  onChange={(e) => setShareSearch(e.target.value)}
                  placeholder="بحث"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder-[#71767B]"
                />
              </div>
            </div>

            {/* قائمة المستخدمين للإرسال في الدردشات */}
            <div className="flex-1 overflow-y-auto px-4 divide-y divide-[#2F3336]/30 min-h-[180px]">
              {shareUsers
                .filter((u) => {
                  const q = shareSearch.trim().toLowerCase();
                  if (!q) return true;
                  return (u.full_name || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
                })
                .map((u) => {
                  const isSelected = selectedShareUsers.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() =>
                        setSelectedShareUsers((prev) =>
                          prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                        )
                      }
                      className="w-full py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition text-right"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center text-white font-bold">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.full_name || ''} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(u.full_name || 'م')[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-bold text-white text-[14px] truncate">{u.full_name || 'مستخدم'}</span>
                            {(u.verification_type && u.verification_type !== 'none') || u.is_verified ? (
                              <VerifiedBadge type={(u.verification_type && u.verification_type !== 'none' ? u.verification_type : 'blue') as any} size={14} />
                            ) : null}
                          </div>
                          <div className="text-[#71767B] text-[13px] truncate text-right" dir="ltr">
                            @{u.username || 'user'}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                          isSelected ? 'border-[#FFC500] bg-[#FFC500]' : 'border-[#536471]'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              {shareUsers.length === 0 && (
                <div className="py-8 text-center text-[#71767B] text-xs">جاري تحميل قائمة الحسابات...</div>
              )}
            </div>

            {/* زر إرسال عند اختيار شخص أو أكثر */}
            {selectedShareUsers.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[#2F3336]/60 bg-black shrink-0">
                <button
                  type="button"
                  disabled={isSendingShareDm}
                  onClick={async () => {
                    if (!sessionUser?.id) {
                      showToast('يرجى تسجيل الدخول للمراسلة');
                      return;
                    }
                    setIsSendingShareDm(true);
                    try {
                      const url = getPostShareUrl(shareMenuPost);
                      const msgText = shareMenuPost.text ? `${shareMenuPost.text.slice(0, 80)}
${url}` : url;
                      await Promise.all(
                        selectedShareUsers.map((uid) =>
                          supabase.from('direct_messages').insert({
                            sender_id: sessionUser.id,
                            receiver_id: uid,
                            content: msgText,
                          })
                        )
                      );
                      showToast(`تم إرسال التغريدة إلى ${selectedShareUsers.length} حساب ✉️`);
                      setShareMenuPost(null);
                    } catch (_) {
                      showToast('تعذر إرسال التغريدة');
                    } finally {
                      setIsSendingShareDm(false);
                    }
                  }}
                  className="w-full py-2.5 rounded-full bg-[#FFC500] hover:bg-[#E5B200] text-black font-bold text-sm transition disabled:opacity-50"
                >
                  {isSendingShareDm ? 'جاري الإرسال...' : `إرسال (${selectedShareUsers.length})`}
                </button>
              </div>
            )}

            {/* شريط أيقونات المشاركة السفلي */}
            <div className="border-t border-[#2F3336] px-3 py-4 bg-black shrink-0">
              <div className="flex items-start justify-around gap-2">
                {/* الدردشات */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedShareUsers.length > 0) return;
                    const url = getPostShareUrl(shareMenuPost);
                    copyTextReliable(url);
                    setShareMenuPost(null);
                    navigate('/messages');
                  }}
                  className="flex flex-col items-center gap-1.5 group w-14"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0084FF] group-hover:opacity-90 flex items-center justify-center text-white transition active:scale-95">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.913 1.454 5.512 3.726 7.21V22l3.405-1.869c.909.252 1.871.388 2.869.388 5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.06 12.413l-2.548-2.718-4.97 2.718 5.468-5.805 2.61 2.718 4.908-2.718-5.468 5.805z" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-[#E7E9EA] truncate w-full text-center">الدردشات</span>
                </button>

                {/* واتساب */}
                <button
                  type="button"
                  onClick={() => {
                    const url = getPostShareUrl(shareMenuPost);
                    const txt = encodeURIComponent((shareMenuPost.text ? shareMenuPost.text.slice(0, 120) + '\n' : '') + url);
                    window.open(`https://wa.me/?text=${txt}`, '_blank');
                    setShareMenuPost(null);
                  }}
                  className="flex flex-col items-center gap-1.5 group w-14"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366] group-hover:opacity-90 flex items-center justify-center text-white transition active:scale-95">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.891-.125-.438-.141-.984-.328-1.703-.641-2.984-1.281-4.922-4.297-5.078-4.5-.141-.203-1.203-1.609-1.203-3.063s.766-2.172 1.031-2.469c.266-.297.578-.375.781-.375.188 0 .391 0 .563.016.172 0 .406-.063.641.484.25.578.828 2.016.906 2.156.078.156.125.328.031.531-.109.203-.156.328-.313.5-.141.172-.313.391-.438.516-.141.141-.297.297-.125.594.172.297.766 1.266 1.641 2.047 1.125 1 2.078 1.313 2.375 1.469.297.141.469.125.641-.078.172-.203.734-.859.938-1.156.203-.297.391-.25.656-.156.266.094 1.703.797 1.984.938.297.156.484.219.563.344.078.125.078.734-.172 1.438z" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-[#E7E9EA] truncate w-full text-center">واتساب</span>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={() => {
                    const url = encodeURIComponent(getPostShareUrl(shareMenuPost));
                    const txt = encodeURIComponent((shareMenuPost.text || '').slice(0, 120));
                    window.open(`https://t.me/share/url?url=${url}&text=${txt}`, '_blank');
                    setShareMenuPost(null);
                  }}
                  className="flex flex-col items-center gap-1.5 group w-14"
                >
                  <div className="w-12 h-12 rounded-full bg-[#2AABEE] group-hover:opacity-90 flex items-center justify-center text-white transition active:scale-95">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-[#E7E9EA] truncate w-full text-center">Telegram</span>
                </button>

                {/* نسخ الرابط */}
                <button
                  type="button"
                  onClick={async () => {
                    const url = getPostShareUrl(shareMenuPost);
                    const copied = await copyTextReliable(url);
                    showToast(copied ? 'تم نسخ رابط التغريدة' : 'تعذر نسخ الرابط');
                    setShareMenuPost(null);
                  }}
                  className="flex flex-col items-center gap-1.5 group w-14"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-[#E7E9EA] truncate w-full text-center">نسخ الرابط</span>
                </button>

                {/* مشاركة عبر... */}
                <button
                  type="button"
                  onClick={async () => {
                    const url = getPostShareUrl(shareMenuPost);
                    if (navigator.share) {
                      navigator.share({ title: 'Yemen Rating', text: shareMenuPost.text || '', url }).catch(() => {});
                    } else {
                      await copyTextReliable(url);
                      showToast('تم نسخ الرابط للمشاركة');
                    }
                    setShareMenuPost(null);
                  }}
                  className="flex flex-col items-center gap-1.5 group w-14"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="18" cy="5" r="2.5" />
                      <circle cx="6" cy="12" r="2.5" />
                      <circle cx="18" cy="19" r="2.5" />
                      <line x1="8.5" y1="13.5" x2="15.5" y2="17.5" />
                      <line x1="15.5" y1="6.5" x2="8.5" y2="10.5" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-[#E7E9EA] truncate w-full text-center">مشاركة عبر...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {cropImage && cropTarget && (
        <ImageCropper
          image={cropImage}
          aspect={cropTarget === 'avatar' ? 1 : 3}
          onCrop={handleCropSave}
          onCancel={() => { setCropImage(null); setCropTarget(null); }}
        />
      )}

      <RateBusinessModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        businessId={routeBusinessId || businessPage?.id || 'draft-business'}
        businessName={name || 'المنشأة'}
        businessAvatar={avatarUrl}
        reviewerName={myName || 'مستخدم'}
        reviewerUsername={navState?.viewerUsername}
        reviewerAvatar={myAvatar}
        onSubmit={({ businessId, stars, comment }) => {
          const res = addStoredBusinessReview({
            id: Date.now().toString(),
            businessId,
            authorName: myName || 'مستخدم',
            authorUsername: navState?.viewerUsername,
            authorAvatar: myAvatar,
            stars,
            comment,
            createdAt: 'الآن',
          });
          setBizReviews(res.reviews);
          setBizRating(res.avgRating);
          setBizReviewCount(res.count);
          showToast('تم تسجيل تقييمك بنجاح');
        }}
      />
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
    
    const toAr = (n) => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
    let relative = "";
    if (diffSec < 60) relative = "الآن";
    else if (diffMin < 60) relative = `${toAr(diffMin)} د`;
    else if (diffHour < 24) relative = `${toAr(diffHour)} س`;
    else if (diffDay < 7) relative = `${toAr(diffDay)} ي`;
    else {
      const d = toAr(date.getDate());
      const m = date.toLocaleDateString("ar-YE", { month: "short" });
      relative = `${d} ${m}`;
    }
    
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

