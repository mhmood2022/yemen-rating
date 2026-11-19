import { XActionBar } from '../components/feed/XActionBar';

import { XVideoPlayer } from '../components/feed/XVideoPlayer';
import { XImagePlayer } from '../components/feed/XImagePlayer';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
'use client';

import PostEngagementsModal from '../components/feed/PostEngagementsModal';
import { RichTextarea } from '../components/common/RichTextarea';
import { HashtagText } from '../components/common/HashtagText';
import React, { useState, useEffect, useRef } from 'react';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ActiveUsersBar } from '../components/community/ActiveUsersBar';
import { ReplyBar } from '../components/community/ReplyBar';
import { ReportPage } from '../components/community/ReportPage';
import { RateBusinessModal } from '../components/reviews/RateBusinessModal';
import { getMyBusinessPage, submitBusinessReview, BusinessPageRecord } from '../services/businessPageService';
import { PhoneMarketPage } from './PhoneMarketPage';
import { JobsPage } from '../components/pages/JobsPage';
import { RealEstatePage } from '../components/pages/RealEstatePage';
import { AuctionsPage } from '../components/pages/AuctionsPage';
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
  MoreHorizontal, ChevronDown,
  Video,
  Globe,
  BarChart2,
  Share2,
  Smartphone,
  Briefcase,
  Building,
  Gavel,
  Users,
} from "lucide-react";

interface Comment {
  id: string;
  image?: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorBadge?: any;
  badgeType?: any;
  text: string;
  createdAt: string;
  likes?: number;
  replies?: number;
  reposts?: number;
  views?: number;
  likedBy?: string[];
  comments?: Comment[];
}

interface Tweet {
  id: string;
  user_id?: string;
  createdAtDisplay?: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorBadge?: any;
  badgeType?: any;
  text: string;
  image?: string;
  video?: string;
  video_url?: string;
  quote_text?: string;
  original?: any;
  originalId?: string;
  isRepost?: boolean;
  isReposted?: boolean;
  repostId?: string;
  reposterName?: string;
  reposterUsername?: string;
  reposterAvatar?: string;
  createdAt: string;
  isPinned?: boolean;
  likes: number;
  likedBy?: string[];
  isLiked?: boolean;
  reposts: number;
  repostedBy?: string[];
  views: number;
  views_count?: number;
  replies?: number;
  comments?: Comment[];
  isBusinessPost?: boolean;
  businessId?: string;
  isRated?: boolean;
}


// دالة حفظ آمنة تحمي من QuotaExceededError وتضمن عدم امتلاء الذاكرة
const safeSetStorage = (key: string, data: any) => {
  // ⏸️ معطل: نعتمد على Supabase فقط لتجنب فقدان البيانات
  console.log('safeSetStorage disabled');
};

const GLOBAL_FEED_KEY = 'yr_community_global_posts';
const USERS_DIR_KEY = 'yr_users_directory';
const REPORTS_KEY = 'yr_community_reports';

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
  const [viewingImagePost, setViewingImagePost] = useState<any>(null);

  const [showMySentToast, setShowMySentToast] = useState(false);

  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeMenuPost, setActiveMenuPost] = useState<any>(null);
  const [shareMenuPost, setShareMenuPost] = useState<any>(null);
  const routerLocation = useLocation();
  const [myBusinessPage, setMyBusinessPage] = useState<BusinessPageRecord | null>(null);
  const [publishAsBusiness, setPublishAsBusiness] = useState<boolean>(() => {
    try {
      const navIdentity = (routerLocation.state as any)?.communityIdentity;
      if (navIdentity === 'personal') return false;
      if (navIdentity === 'business') return true;
      const saved = localStorage.getItem('yr_community_identity');
      if (saved === 'personal') return false;
      return true;
    } catch {
      return true;
    }
  });
  const switchCommunityIdentity = (asBusiness: boolean) => {
    setPublishAsBusiness(asBusiness);
    try {
      localStorage.setItem('yr_community_identity', asBusiness ? 'business' : 'personal');
    } catch (_) {}
  };
  const [ratingTargetTweet, setRatingTargetTweet] = useState<any>(null);
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
          setShareUsers(data.filter((u: any) => u.id !== currentUserId));
        }
      } catch (_) {}
    })();
  }, [shareMenuPost, currentUserId]);
  const [hiddenTweetIds, setHiddenTweetIds] = useState<string[]>([]);
  const [editingTweet, setEditingTweet] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const reloadFeedRef = useRef<(() => void) | null>(null);
  const [hasActiveSpace, setHasActiveSpace] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUrlTab = searchParams.get('tab');
  const validUrlTabs = ['forYou', 'latest', 'trending', 'phones', 'jobs', 'properties', 'auctions'] as const;
  const [activeTab, setActiveTab] = useState<'forYou' | 'latest' | 'trending' | 'phones' | 'jobs' | 'properties' | 'auctions'>(
    validUrlTabs.includes(initialUrlTab as any) ? (initialUrlTab as any) : 'forYou'
  );
  useEffect(() => {
    setSwipeProgress(activeTab === 'forYou' ? 0 : 1);
    const currentParam = searchParams.get('tab') || 'forYou';
    if (currentParam !== activeTab) {
      if (activeTab === 'forYou') {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ tab: activeTab }, { replace: true });
      }
    }
  }, [activeTab]);

  // --- كود السحب الأفقي الآمن بين التبويبات ---
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let ignoreSwipe = false;
    const tabOrder: Array<'forYou' | 'latest' | 'phones' | 'jobs' | 'properties' | 'auctions'> = [
      'forYou', 'latest', 'phones', 'jobs', 'properties', 'auctions'
    ];

    const handleTouchStart = (e: TouchEvent) => {
      const targetEl = e.target as HTMLElement | null;
      const hasOpenOverlay = Boolean(
        document.querySelector('[data-no-tab-swipe="true"], .fixed.inset-0, [role="dialog"], [aria-modal="true"]')
      );
      ignoreSwipe = hasOpenOverlay || Boolean(targetEl?.closest('.no-scrollbar, .overflow-x-auto, input, textarea, select'));
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      setIsSwiping(!ignoreSwipe);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (ignoreSwipe) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const distX = touchStartX - currentX;
      const distY = touchStartY - currentY;

      if (Math.abs(distX) > Math.abs(distY)) {
        const maxSwipe = window.innerWidth * 0.25;
        const progress = Math.min(1, Math.abs(distX) / maxSwipe);
        if (activeTab === 'forYou' && distX > 0) setSwipeProgress(progress);
        else if (activeTab === 'latest' && distX < 0) setSwipeProgress(1 - progress);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      setIsSwiping(false);
      if (ignoreSwipe) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const distX = touchStartX - touchEndX;
      const distY = touchStartY - touchEndY;

      if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 55) {
        const idx = tabOrder.indexOf(activeTab as any);
        if (idx !== -1) {
          if (distX > 0 && idx < tabOrder.length - 1) setActiveTab(tabOrder[idx + 1]);
          else if (distX < 0 && idx > 0) setActiveTab(tabOrder[idx - 1]);
        }
      } else {
        setSwipeProgress(activeTab === 'forYou' ? 0 : 1);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab]);
  // ------------------------------

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // بيانات المستخدم الحالي
  const [myName, setMyName] = useState('مستخدم');
  const [myUsername, setMyUsername] = useState('user');
  const [myAvatar, setMyAvatar] = useState('');

  // 🔄 جلب بيانات المستخدم الحالي فورياً من الكاش ومطابقتها مع السحابة
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);
        const meta = user.user_metadata || {};
        if (meta.full_name || meta.name) setMyName(meta.full_name || meta.name);
        if (meta.avatar_url || meta.picture) setMyAvatar(meta.avatar_url || meta.picture);

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          if (profile.full_name) setMyName(profile.full_name);
          if (profile.username) setMyUsername(profile.username);
          if (profile.avatar_url) setMyAvatar(profile.avatar_url);
        }
      } catch (e) {
        console.warn("myProfile exception:", e);
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
  const [viewingEngagementsPost, setViewingEngagementsPost] = useState<any>(null);
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


  // ⚡ تحميل فوري من الكاش للقضاء على الشاشة الفارغة
  const [tweets, setTweets] = useState<Tweet[]>(() => {
    try {
      const cached = localStorage.getItem(GLOBAL_FEED_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  // 🌟 قائمة انتظار التغريدات الجديدة (مثل X)
  const [newPostsQueue, setNewPostsQueue] = useState<any[]>([]);
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
      
      const isBizNotif = Boolean(publishAsBusiness && myBusinessPage);
      const notifActorName = isBizNotif ? (myBusinessPage?.name || myName) : myName;
      const notifActorAvatar = isBizNotif ? (myBusinessPage?.avatarUrl || myAvatar) : myAvatar;
      const { data, error } = await supabase.from('notifications').insert({
        user_id: targetUid,
        actor_id: currentUserId,
        actor_name: notifActorName,
        actor_avatar: notifActorAvatar,
        post_id: postId || null,
        title: msg.slice(0, 100),
        message: msg,
        type: type,
        read: false,
      }).select();
      
      if (error) {
        console.error('❌ Notification insert FAILED:', error);
        showToast('❌ فشل الإشعار: ' + error.message);
      } else {
        console.log('✅ Notification created:', data);
        showToast('✅ تم إرسال الإشعار');
      }
    } catch (e) {
      console.warn('Notification exception:', e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
        try { localStorage.removeItem(GLOBAL_FEED_KEY); } catch(_) {}
      let uid = "";
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          uid = session.user.id;
          setCurrentUserId(session.user.id);
          getMyBusinessPage(session.user.id).then((biz) => {
            if (biz) {
              setMyBusinessPage(biz);
              try {
                const navIdentity = (routerLocation.state as any)?.communityIdentity;
                const saved = localStorage.getItem('yr_community_identity');
                if (navIdentity === 'personal' || (!navIdentity && saved === 'personal')) {
                  setPublishAsBusiness(false);
                } else {
                  setPublishAsBusiness(true);
                }
              } catch (_) {}
            }
          });
        }
      } catch (_) {}

      
    // عرض الكاش فوراً (مثل إكس)
    try {
      const cached = JSON.parse(localStorage.getItem(GLOBAL_FEED_KEY) || '[]');
      if (cached.length > 0) setTweets(cached);
    } catch(_) {}

    try {
      // 1. جلب جميع التغريدات من السحابة عبر البروكسي النظيف
    
                // جلب إعجابات وإعادات نشر المستخدم الحالي لضمان بقاء الألوان ثابتة
        let myLikedPostIds = new Set();
        let myRepostedPostIds = new Set();
        if (uid) {
          const { data: myLikes } = await supabase.from('post_likes').select('post_id').eq('user_id', uid);
          // جلب قائمة الأشخاص الذين يتابعهم المستخدم
          const { data: myFollows } = await supabase.from('follows').select('following_id').eq('follower_id', uid);
          if (myFollows) {
            setFollowingIds(myFollows.map((f: any) => f.following_id));
            console.log('تم جلب المتابعين:', myFollows.length); // للتأكد من عمله
          }
        
          myLikedPostIds = new Set((myLikes || []).map((l: any) => l.post_id));

          const { data: myUserReposts } = await supabase.from('post_reposts').select('post_id').eq('user_id', uid);
          myRepostedPostIds = new Set((myUserReposts || []).map((r: any) => r.post_id));
        }

        const { data: dbPosts, error: postsErr } = await supabase
          .from('posts')
          .select('id, user_id, business_id, content, image_url, video_url, likes_count, comments_count, reposts_count, created_at, views_count')
          .order('created_at', { ascending: false })
          .limit(30);
        
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
            .select('id, user_id, business_id, content, image_url, video_url, likes_count, comments_count, reposts_count, created_at, views_count')
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
        ])].filter((id): id is string => Boolean(id) && typeof id === "string" && id.length > 5);
        let profileMap = new Map();
        try {
          const { data: dbProfiles, error: profErr } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, verification_type, is_verified')
            .in('id', allUserIds);
          
          if (profErr) {
            console.error('Profiles fetch error:', profErr);
          } else {
            (dbProfiles || []).forEach((prof) => profileMap.set(prof.id, prof));
          }
        } catch (_) {}

        // 3. بناء قائمة المجتمع وعرض كل التغريدات (لكل المغردين)
        const bizIds = [...new Set(allPosts.map((p: any) => p.business_id).filter(Boolean))];
        let bizMap = new Map<string, any>();
        if (bizIds.length > 0) {
          const { data: dbBusinesses } = await supabase
            .from('businesses')
            .select('id, owner_id, name, slug, logo_url, is_verified, badge_type')
            .in('id', bizIds);
          (dbBusinesses || []).forEach((b: any) => bizMap.set(b.id, b));
        }

        const cloudTweets = dbPosts.map((p: any) => {
          const author = profileMap.get(p.user_id);
          const biz = p.business_id ? bizMap.get(p.business_id) : null;
          const bizBadge = biz ? (biz.badge_type && biz.badge_type !== 'none' ? biz.badge_type : (biz.is_verified ? 'gold' : 'none')) : null;
          return {
            id: p.id,
            parent_id: (p as any).parent_id,
            authorId: p.user_id,
            businessId: p.business_id || undefined,
            isBusinessPost: Boolean(p.business_id && biz),
            authorName: biz ? biz.name : (author?.full_name || "مستخدم يمن ريتنج"),
            badgeType: biz ? bizBadge : ((author as any)?.verification_type || (author as any)?.badge_type || (author?.is_verified ? 'blue' : 'none')),
            authorUsername: biz ? (biz.slug || "business") : (author?.username || "user"),
            authorAvatar: biz ? (biz.logo_url || "") : (author?.avatar_url || (localUsers[p.user_id]?.avatarUrl) || (p.user_id === uid ? myAvatar : "") || ""),
            text: p.content,
            image: p.image_url || undefined,
            video_url: p.video_url || undefined,
            video: p.video_url || undefined,
            createdAt: p.created_at,
            createdAtDisplay: new Date(p.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: p.likes_count || 0,
            isLiked: myLikedPostIds.has(p.id),
            likedBy: myLikedPostIds.has(p.id) ? [uid] : [],
            isReposted: myRepostedPostIds.has(p.id),
            reposts: p.reposts_count || 0,
            repostedBy: myRepostedPostIds.has(p.id) ? [uid] : [],
            views: p.views_count || 1,
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
            badgeType: (reposter as any).verification_type || (reposter as any).badge_type || (reposter.is_verified ? 'blue' : 'none'),
            authorUsername: reposter.username || 'user',
            authorAvatar: reposter.avatar_url || '',
            
            text: r.quote_text 
              ? r.quote_text 
              : (original?.content ?? 'التغريدة الأصلية غير متاحة'),
            image: r.quote_text 
              ? undefined 
              : (original?.image_url ?? undefined),
            
            original: r.quote_text ? {
              badgeType: originalAuthor?.verification_type || originalAuthor?.badge_type || (originalAuthor?.is_verified ? "blue" : "none"),
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
            views: original?.views_count || 1,
            reposts: 0,
            replies: original?.comments_count ?? 0,
            comments: [],
          };
        }).filter(Boolean);


                        
                const totalReposts = repostTweets.filter((t: any) => t && t.isRepost).length;
        const totalQuotes = repostTweets.filter((t: any) => t && t.quote_text).length;
        
        // عرض تنبيه للتشخيص

        
        const mergedTweets = [...cloudTweets, ...repostTweets].sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setTweets(mergedTweets);
        
        // 🔴 DEBUG: بعد setTweets
        setTimeout(() => {
          
        }, 1500);
        safeSetStorage(GLOBAL_FEED_KEY, mergedTweets);

        // تسجيل المشاهدة لكل تغريدة جديدة
        try {
          const viewed = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
          const updatedViewed = [...viewed];
          (dbPosts || []).forEach(post => {
            if (viewed.indexOf(post.id) === -1) {
              supabase.rpc('increment_post_views', { p_post_id: post.id }).then(({error}) => { if(error) console.error('RPC Error:', error); });
              updatedViewed.push(post.id);
            }
          });
          sessionStorage.setItem('viewed_posts', JSON.stringify(updatedViewed));
        } catch (e) {
          console.error('view tracking error', e);
        }
      } catch (err) {
        console.error("خطأ في جلب تغريدات المجتمع:", err);
      }
    };
    reloadFeedRef.current = loadData;
    loadData();

    // اشتراك Realtime لحظي بين جميع المتصفحات والحسابات
    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload: any) => {
        // التحقق: إذا كان المغرد هو أنا، نتجاهل الكبسولة لأن لدي إشعار خاص بي
        const myId = currentUserId || (await supabase.auth.getSession()).data?.session?.user?.id;
        if (myId && payload.new.user_id === myId) {
          return;
        }

        // إذا كان المغرد شخصاً آخر:
        try {
          let bizRow: any = null;
          if (payload.new.business_id) {
            const { data: bData } = await supabase.from('businesses').select('id, name, slug, logo_url, is_verified, badge_type').eq('id', payload.new.business_id).maybeSingle();
            bizRow = bData;
          }
          const { data: prof } = await supabase.from('profiles').select('avatar_url, full_name, username, verification_type, is_verified').eq('id', payload.new.user_id).single();
          const avatar = prof?.avatar_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
          const badgeType = prof?.verification_type || (prof?.is_verified ? 'blue' : null);

          // تجهيز التغريدة بنفس هيكل التغريدات القديمة لكي تظهر بشكل صحيح
          const formattedNewTweet = {
            id: payload.new.id,
            authorId: payload.new.user_id,
            businessId: payload.new.business_id || undefined,
            isBusinessPost: Boolean(payload.new.business_id && bizRow),
            authorName: bizRow ? bizRow.name : (prof?.full_name || 'مستخدم يمن ريتنج'),
            badgeType: bizRow ? (bizRow.badge_type && bizRow.badge_type !== 'none' ? bizRow.badge_type : (bizRow.is_verified ? 'gold' : 'none')) : ((prof as any)?.verification_type || (prof as any)?.badge_type || (prof?.is_verified ? 'blue' : 'none')),
            authorUsername: bizRow ? (bizRow.slug || 'business') : (prof?.username || 'user'),
            authorAvatar: bizRow ? (bizRow.logo_url || '') : avatar,
            text: payload.new.content,
            image: payload.new.image_url || undefined,
            video_url: payload.new.video_url || undefined,
            video: payload.new.video_url || undefined,
            createdAt: payload.new.created_at,
            createdAtDisplay: new Date(payload.new.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: 0,
            isLiked: false,
            likedBy: [],
            isReposted: false,
            reposts: 0,
            repostedBy: [],
            views: 1,
            comments: [],
            replies: 0
          };

          // إضافة المغرد الجديد بالترتيب وتجنب التكرار
          setNewPostsQueue(prev => {
            const filtered = prev.filter(p => p.id !== payload.new.id);
            return [formattedNewTweet, ...filtered];
          });
        } catch {
          setNewPostsQueue(prev => [payload.new, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, () => { loadData(); })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, () => { loadData(); })
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
            badgeType: (profile as any)?.verification_type || (profile as any)?.badge_type || (profile?.is_verified ? 'blue' : 'none'),


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
  const [followingIds, setFollowingIds] = useState<string[]>([]);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type.startsWith('video/') && file.size > 20971520) {
      showToast('حجم الفيديو كبير جداً! الحد الأقصى 20 ميجابايت للحفاظ على المساحة ⚠️');
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }
    
    // تثبيت الملف فوراً في الذاكرة
    setSelectedFile(file);
    setTweetImage(URL.createObjectURL(file));
  };

  
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
      setTweetText(cleaned);
      loadQuotedPostById(urlMatch[1]);
      return;
    }
    setTweetText(val);
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

    
    try {
      let insertedPost: any = null;
      let pErr: any = null;
      if (quoteOriginal) {
        const cleanQuoteId = (quoteOriginal.originalId || quoteOriginal.id || '').toString().replace(/^repost-/, '');
        const res = await supabase
          .from('post_reposts')
          .insert({
            post_id: cleanQuoteId,
            user_id: activeUser.id,
            quote_text: textToSend,
          })
          .select()
          .single();
        insertedPost = res.data;
        pErr = res.error;
      } else {
        const isBizIdentity = Boolean(publishAsBusiness && myBusinessPage);
        const res = await supabase
          .from('posts')
          .insert({
            user_id: activeUser.id,
            business_id: isBizIdentity && myBusinessPage ? myBusinessPage.id : null,
            content: textToSend,
            image_url: finalImageUrl || null,
            video_url: finalVideoUrl || null
          })
          .select()
          .single();
        insertedPost = res.data;
        pErr = res.error;
      }

      if (pErr) {
        setIsPosting(false);
        console.error("Supabase insert error:", pErr);
        showToast("تعذر النشر سحابياً: " + (pErr.message || "خطأ غير معروف"));
        return;
      }

      const useBiz = Boolean(publishAsBusiness && myBusinessPage && !quoteOriginal);
      const newTweet: Tweet = {
        id: quoteOriginal ? `repost-${insertedPost?.id || Date.now()}` : (insertedPost?.id || Date.now().toString()),
        authorId: activeUser.id,
        businessId: useBiz && myBusinessPage ? myBusinessPage.id : undefined,
        isBusinessPost: useBiz,
        authorName: useBiz && myBusinessPage ? myBusinessPage.name : myName,
        authorUsername: useBiz && myBusinessPage ? myBusinessPage.username : myUsername,
        authorAvatar: useBiz && myBusinessPage ? myBusinessPage.avatarUrl : myAvatar,
        badgeType: useBiz && myBusinessPage ? myBusinessPage.verificationType : undefined,
        text: textToSend,
        image: quoteOriginal ? undefined : (finalImageUrl || undefined),
        video_url: quoteOriginal ? undefined : (finalVideoUrl || undefined),
        video: quoteOriginal ? undefined : (finalVideoUrl || undefined),
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        reposts: 0,
        repostedBy: [],
        views: 1,
        comments: [],
        ...(quoteOriginal ? {
          isRepost: true,
          quote_text: textToSend,
          originalId: (quoteOriginal.originalId || quoteOriginal.id || '').toString().replace(/^repost-/, ''),
          original: quoteOriginal,
        } : {}),
      };

      setTweets([newTweet, ...tweets]);
      setQuoteOriginal(null);
      setTweetText('');
      setTweetImage('');
      setSelectedFile(null); if (imageInputRef.current) imageInputRef.current.value = '';
      setIsPostModalOpen(false);
      setIsPosting(false);
      setShowMySentToast(true);
      setTimeout(() => setShowMySentToast(false), 4500);
      // showToast تم استبداله بنافذة تم إرسال منشورك
    } catch (err: any) {
      setIsPosting(false);
      showToast("خطأ أثناء النشر: " + err.message);
    }
  };

  // إعجاب سليم ومنضبط
  const handleLike = async (id: string) => {
    if (!currentUserId) {
      showToast('يرجى تسجيل الدخول');
      return;
    }

    // 1. حساب الحالة الجديدة من الحالة الحالية (قبل setTweets)
    const tweet = tweets.find(t => t.id === id);
    if (!tweet) return;

    const likedBy = tweet.likedBy || [];
    const isLiked = likedBy.includes(currentUserId) || !!tweet.isLiked;
    const nextIsLiked = !isLiked;
    const nextLikedBy = nextIsLiked
      ? [...likedBy, currentUserId]
      : likedBy.filter((u: string) => u !== currentUserId);
    const nextLikesCount = nextLikedBy.length;

    // 2. تحديث الواجهة فوراً
    setTweets(prev => prev.map(t =>
      t.id === id
        ? { ...t, isLiked: nextIsLiked, likes: nextLikesCount, likedBy: nextLikedBy }
        : t
    ));

    // 3. الحفظ مع فحص الخطأ الفعلي
    try {
      if (nextIsLiked) {
        const { error: e1 } = await supabase
          .from('post_likes')
          .upsert({ post_id: id, user_id: currentUserId }, { onConflict: 'user_id,post_id' });
        if (e1) throw e1;

        const { error: e2 } = await supabase
          .from('posts').update({ likes_count: nextLikesCount }).eq('id', id);
        if (e2) throw e2;
      } else {
        const { error: e1 } = await supabase
          .from('post_likes').delete().eq('post_id', id).eq('user_id', currentUserId);
        if (e1) throw e1;

        const { error: e2 } = await supabase
          .from('posts').update({ likes_count: Math.max(0, nextLikesCount) }).eq('id', id);
        if (e2) throw e2;
      }
    } catch (err: any) {
      console.error('Like sync error:', err);
      // تراجع عن التحديث المحلي عند الفشل
      setTweets(prev => prev.map(t =>
        t.id === id ? { ...t, isLiked, likes: likedBy.length, likedBy } : t
      ));
      showToast('فشل حفظ الإعجاب: ' + (err?.message || ''));
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
      const useBizRepost = Boolean(publishAsBusiness && myBusinessPage);
      let checkQ = supabase
        .from('post_reposts')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', currentUserId);
      checkQ = useBizRepost && myBusinessPage ? checkQ.eq('business_id', myBusinessPage.id) : checkQ.is('business_id', null);
      const { data: existing, error: checkErr } = await checkQ.maybeSingle();

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
          .insert({
            post_id: id,
            user_id: currentUserId,
            business_id: useBizRepost && myBusinessPage ? myBusinessPage.id : null,
            quote_text: null
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
      // إرسال إلى Supabase (المصدر الرئيسي للوحة الإدارة)
      const { error: sbError } = await supabase.from('reports').insert({
        reporter_id: currentUserId || null,
        reporter_name: myName || 'مستخدم',
        reported_item_type: reportingItem.type === 'account' ? 'user' : 'post',
        reported_item_id: reportingItem.targetId,
        reported_user_id: reportingItem.targetAuthorId || null,
        reason: reportReason,
        details: reportDetails.trim() || null,
        status: 'PENDING',
      });
      
      if (sbError) {
        console.error('Supabase report error:', sbError);
      }
      
      // نسخة احتياطية في localStorage
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
      showToast && showToast('تعذر إرسال البلاغ، حاول مرة أخرى');
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

    const useBizComment = Boolean(publishAsBusiness && myBusinessPage);
    const commentId = Date.now().toString();
    const newComment: Comment = {
      id: commentId,
      authorId: currentUserId || 'guest',
      authorName: useBizComment ? (myBusinessPage?.name || 'منشأة') : (myName || 'مستخدم'),
      authorUsername: useBizComment ? (myBusinessPage?.username || 'business') : (myUsername || 'user'),
      authorAvatar: useBizComment ? (myBusinessPage?.avatarUrl || '') : (myAvatar || ''),
      text: textToSend,
      image: commentImage || undefined,
      createdAt: new Date().toISOString(),
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

    // 2. حفظ الرد في جدول posts (ليظهر في تبويب الردود) + post_comments
    if (currentUserId && currentUserId !== 'guest') {
      // حفظ في posts مع parent_id
      supabase.from("posts").insert({
        user_id: currentUserId,
        business_id: publishAsBusiness && myBusinessPage ? myBusinessPage.id : null,
        content: textToSend,
        parent_id: targetPost.id,
        image_url: commentImage || null
      }).then(({ error }) => {
        if (error) console.error('Error saving reply to posts:', error);
        else {
          showToast('تم حفظ الرد في ملفك الشخصي أيضاً ✅');
        }
      });

      // حفظ في post_comments (لنافذة التفاصيل)
      supabase.from("post_comments").insert({
        post_id: targetPost.id,
        user_id: currentUserId,
        content: textToSend
      }).then(({ error }) => {
        if (!error) loadCommentsForPost(targetPost.id);
      });
    }

    const commenterName = useBizComment ? (myBusinessPage?.name || myName) : myName;
    sendRealNotification(targetPost.authorId, 'comment', `علّق ${commenterName} على منشورك: "${textToSend.slice(0, 30)}..."`, targetPost.id);
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

  const handleSaveEdit = async () => {
    if (!editingTweet?.id || !editText.trim()) return;
    setIsSavingEdit(true);
    try {
      const postId = editingTweet.id.toString().replace('repost-', '');
      const nextText = editText.trim();
      const { error } = await supabase
        .from('posts')
        .update({ content: nextText })
        .eq('id', postId);
      if (error) throw error;

      setTweets(prev => prev.map(t => {
        if (t.id === editingTweet.id) return { ...t, text: nextText };
        if (t.original?.id === postId) {
          return { ...t, original: { ...t.original, text: nextText } };
        }
        return t;
      }));
      setViewingDetailTweet(prev => prev && prev.id === editingTweet.id ? { ...prev, text: nextText } : prev);
      setEditingTweet(null);
      setEditText('');
      showToast('تم حفظ التعديل');
    } catch (e: any) {
      showToast('فشل حفظ التعديل: ' + (e?.message || ''));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const displayedTweets = [...tweets]
      .filter(t => !hiddenTweetIds.includes(t.id))
      .filter(t => {
        if (activeTab === 'forYou') return true;
        const authorId = t.authorId || t.user_id;
        // عرض تغريدات المتابعين فقط (بدون تغريداتك الشخصية) للتأكد من عمل التبويب
        return followingIds.includes(authorId);
      })
      .sort((a, b) => {
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
    if (tweetData?.isBusinessPost || tweetData?.businessId || tweetData?.business_id) {
      const bizId = tweetData.businessId || tweetData.business_id || authorId;
      navigate(`/business-page/${bizId}`, {
        state: {
          id: bizId,
          name: tweetData.authorName,
          username: tweetData.authorUsername,
          avatarUrl: tweetData.authorAvatar,
          verificationType: tweetData.badgeType || tweetData.authorBadge || 'none',
          isOwner: authorId === currentUserId,
          viewerName: myName,
          viewerUsername: myUsername,
          viewerAvatar: myAvatar,
        },
      });
      return;
    }

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
        <div
          className="fixed top-[52px] left-1/2 -translate-x-1/2 z-[999999] bg-[#242D34] text-white px-4 py-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.85)] border border-white/20 flex items-center gap-2 select-none"
          style={{ direction: "rtl" }}
        >
          <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] fill-[#242D34] stroke-[#242D34] stroke-[2.5]">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
            </svg>
          </div>
          <span className="text-[12.5px] font-bold text-white font-['Tahoma',sans-serif] truncate shrink max-w-[130px] sm:max-w-[150px]">
            {toastMsg.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/g, "").trim()}
          </span>
        </div>
      )}

      <input type="file" ref={imageInputRef} className="hidden" accept="image/*,video/*" onChange={handleImageUpload} />

      {/* 💬 إشعار صاحب المنشور: تم إرسال منشورك (مطابق للكبسولة بالملي) */}
      {showMySentToast && (
        <div
          className="fixed top-[52px] left-1/2 -translate-x-1/2 z-[99999] w-[190px] bg-[#242D34] text-white rounded-[16px] py-[8px] px-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.85)] border border-white/20 flex flex-col items-center gap-[6px] select-none overflow-hidden"
          style={{ direction: "ltr" }}
        >
          {/* علامة مائية لشعار X */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
            <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>

          {/* الصف العلوي: الصح يمين والنص يسار في العرض العربي */}
          <div className="flex items-center justify-center gap-2 w-full relative z-10" style={{ direction: "rtl" }}>
            <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] fill-[#242D34] stroke-[#242D34] stroke-[2.5]">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
              </svg>
            </div>
            <span className="text-[12px] font-bold tracking-tight text-white font-['Tahoma',sans-serif] truncate shrink max-w-[130px] sm:max-w-[150px]">تم إرسال منشورك</span>
          </div>

          {/* زر عرض المنشور الرمادي الأنيق */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setShowMySentToast(false);
            }}
            className="w-full h-[28px] bg-[#3A444C] hover:bg-[#485560] active:scale-[0.98] transition-all text-white font-bold text-[11.5px] rounded-[8px] cursor-pointer border border-white/10 outline-none text-center shadow-md relative z-10 flex items-center justify-center"
          >
            عرض المنشور
          </button>
        </div>
      )}

      {/* 🚀 كبسولة X الدقيقة هندسياً: هوامش متساوية متناسقة 100% بدون تشوه بصري */}
      {newPostsQueue.length > 0 && (
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTweets(prev => [...newPostsQueue, ...prev]);
            setNewPostsQueue([]);
          }}
          className="fixed top-[52px] left-1/2 -translate-x-1/2 z-50 bg-[#FFC500] hover:bg-[#fab700] active:scale-95 transition-all duration-150 h-[36px] w-auto max-w-[95vw] pl-[11px] pr-[11px] rounded-full inline-flex items-center gap-[8px] shadow-[0_4px_16px_rgba(0,0,0,0.35)] cursor-pointer border-none outline-none select-none box-border"
          style={{ direction: "ltr" }}
        >
          {/* حاوية الأفاتارات المتداخلة بهامش أيسر مريح وموزون بالملي */}
          <div className="inline-flex items-center flex-shrink-0">
            {[...newPostsQueue.slice(0, 10)].reverse().map((item, idx) => (
              <img
                key={idx}
                src={item.authorAvatar || "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"}
                alt="avatar"
                className="w-[28px] h-[28px] rounded-full object-cover shrink-0 block border-[1.5px] border-[#FFC500] box-border shadow-sm"
                style={{
                  marginLeft: idx === 0 ? "0px" : "-9px",
                  zIndex: idx + 1,
                  position: "relative",
                }}
              />
            ))}
          </div>

          {/* سهم منصة X الأصلي النظيف في الطرف الأيمن */}
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[13px] h-[13px] fill-white shrink-0 block font-bold">
            <path d="M12 4.5l6.5 6.5-1.4 1.4L13 8.3V20h-2V8.3L7.9 12.4 6.5 11l6.5-6.5z"></path>
          </svg>
        </button>
      )}

      {/* الهيدر العلوي بنمط منصة X الأصلي */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md">
        {/* الشريط العلوي */}
        <div className={`px-4 flex items-center justify-between relative transition-all duration-300 overflow-hidden ${(isScrolled || ['phones', 'jobs', 'properties', 'auctions'].includes(activeTab)) ? 'h-0 py-0 opacity-0 pointer-events-none' : 'h-[58px] py-2.5 opacity-100'}`}>
          {(() => {
            const isBizHeader = Boolean(publishAsBusiness && myBusinessPage);
            const headerAvatar = isBizHeader ? (myBusinessPage?.avatarUrl || '') : myAvatar;
            const headerName = isBizHeader ? (myBusinessPage?.name || 'المنشأة') : myName;
            return (
              <button
                onClick={() => {
                  if (isBizHeader && myBusinessPage) {
                    navigate(`/business-page/${myBusinessPage.id}`, {
                      state: {
                        ...myBusinessPage,
                        isOwner: true,
                        viewerName: myName,
                        viewerUsername: myUsername,
                        viewerAvatar: myAvatar,
                      },
                    });
                  } else {
                    navigate("/account");
                  }
                }}
                title={isBizHeader ? (myBusinessPage?.name || "صفحة المنشأة") : "ملفي الشخصي"}
                className="relative group flex-shrink-0"
              >
                <div className="w-[38px] h-[38px] rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center font-bold shrink-0 shadow-sm">
                  {headerAvatar ? (
                    <img src={headerAvatar} alt={headerName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-[15px] font-bold">{headerName ? headerName[0] : "؟"}</span>
                  )}
                </div>
                <span className="absolute bottom-[1px] right-[1px] w-[9px] h-[9px] bg-emerald-500 rounded-full border-[1.5px] border-black" />
              </button>
            );
          })()}

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/yr-community-logo.png" alt="Yemen Rating" className="w-7 h-7 object-contain hover:opacity-85 transition" />
          </div>

          <button onClick={() => navigate("/premium")} className="px-3 py-1 rounded-full bg-[#202327] hover:bg-[#2c3035] text-white text-[12px] font-bold flex flex-row-reverse items-center gap-1.5 transition active:scale-95 shadow-sm">
            <span>ترقية</span>
            <svg className="w-[18px] h-[18px] text-[#FFC500] fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zm-12.7 3.7l-3.3-3.3 1.4-1.4 1.9 1.9 5.3-5.3 1.4 1.4-6.7 6.7z" />
            </svg>
          </button>
        </div>

        {/* التبويبات بتصميم صفحة المنشأة */}
        <div className="bg-black border-b border-[#2F3336]/40 flex items-center justify-around text-[14px]">
          {[
            { id: 'forYou', label: 'لك', icon: Sparkles },
            { id: 'latest', label: 'متابعة', icon: Users },
            { id: 'phones', label: 'سوق الهواتف', icon: Smartphone },
            { id: 'jobs', label: 'الوظائف', icon: Briefcase },
            { id: 'properties', label: 'العقارات', icon: Building },
            { id: 'auctions', label: 'المزادات', icon: Gavel },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className={`flex-1 py-3.5 flex items-center justify-center relative transition ${
                  isActive ? 'text-white font-bold' : 'text-[#71767B]'
                }`}
              >
                <div className="flex flex-row items-center gap-1 whitespace-nowrap px-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  {isActive && <span className="text-[12.5px]">{tab.label}</span>}
                  {isActive && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#FFC500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </div>
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t-full" />}
              </button>
            );
          })}
        </div>
      </header>

      {/* حائط التغريدات والأقسام */}
      <div key={activeTab} className="animate-[fadeIn_0.3s_ease-in-out]">
        {activeTab === 'phones' ? (
          <div className="pb-24">
            <PhoneMarketPage onNavigate={(path) => navigate(path)} embedded />
          </div>
        ) : activeTab === 'jobs' ? (
          <div className="pb-24">
            <JobsPage embedded />
          </div>
        ) : activeTab === 'properties' ? (
          <div className="pb-24">
            <RealEstatePage embedded />
          </div>
        ) : activeTab === 'auctions' ? (
          <div className="pb-24">
            <AuctionsPage embedded />
          </div>
        ) : displayedTweets.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-xs px-4">
            {activeTab === 'forYou' 
          ? 'لا توجد منشورات حتى الآن في المجتمع. كن أول من يغرد!' 
          : 'أنت لا تتابع أحداً بعد. ابدأ بمتابعة الأشخاص لتظهر تغريداتهم هنا.'}
          </div>
        ) : (
displayedTweets.map(tweet => {
            
            const hasUserReposted = tweet.repostedBy?.includes(currentUserId);
            const hasUserLiked = tweet.likedBy?.includes(currentUserId);

            return (
              <article
                key={tweet.id}
                className="p-3 border-b border-[#2F3336]/40 hover:bg-white/[0.03] transition cursor-pointer"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target.closest('button') && !target.closest('a')) {
                    setViewingDetailTweet(tweet);
                  }
                }}
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold text-white text-lg truncate shrink max-w-[130px] sm:max-w-[150px]">
                    <div onClick={(e) => { e.stopPropagation(); openAuthorProfile(tweet.authorId, tweet); }} className="w-full h-full cursor-pointer hover:opacity-80 transition">
                      {tweet.authorAvatar ? (
                        <img src={tweet.authorAvatar} alt={tweet.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{tweet.authorName?.[0] || '؟'}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-nowrap min-w-0 w-full gap-1">
                        <span onClick={(e) => { e.stopPropagation(); openAuthorProfile(tweet.authorId, tweet); }} className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate shrink max-w-[130px] sm:max-w-[180px]">{tweet.authorName}</span>
                        {tweet.badgeType && tweet.badgeType !== "none" && tweet.badgeType !== false && (
                          <VerifiedBadge type={tweet.badgeType as any} size={14.5} className="shrink-0" />
                        )}
                        <span className="text-[11.5px] text-[#71767B] truncate shrink max-w-[90px] sm:max-w-[120px]" dir="ltr">@{tweet.authorUsername?.replace(/@.*$/, "")}</span>
                        <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
                        <span className="text-[#71767B] text-[10.5px] hover:underline cursor-pointer whitespace-nowrap shrink-0"  title={tweet.createdAtDisplay || tweet.createdAt}>
{formatTimeAgo(tweet.createdAt).relative}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuPost(tweet);
                        }}
                        className="text-[#71767B] hover:text-[#FFC500] p-1.5 rounded-full hover:bg-[#FFC500]/10 transition shrink-0"
                        title="المزيد"
                      >
                        <MoreHorizontal size={14} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />
                      </button>
</div>
                    
                    {/* نص التغريدة العادي */}
                    {!tweet.isRepost && tweet.text && (
                      <p className="-mt-1 text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap pr-0 -ml-8 pl-3 break-words font-normal select-text">
                        <HashtagText text={tweet.text} />
                      </p>
                    )}
                    
                    {/* اقتباس — نص + بطاقة */}
                    {tweet.isRepost && tweet.quote_text ? (
                      <div className="mt-2">
                        <p className="-mt-1 text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap pr-0 -ml-8 pl-3 break-words font-normal select-text">
                          <HashtagText text={tweet.quote_text} />
                        </p>
                        {(tweet.original || tweet.quote_text) && (
                          <>
                            {!tweet.original && (
                              <p className="text-[#71767B] text-xs py-2 text-center">التغريدة الأصلية غير متاحة</p>
                            )}
                            {tweet.original && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tweet/${tweet.original.id}`);
                                }}
                                className="mt-2.5 rounded-[12px] border border-white/[0.08] hover:bg-white/[0.02] transition cursor-pointer p-2.5 select-none overflow-hidden"
                              >
                                {/* رأس الاقتباس: أفاتار 20px + اسم + معرف + نقطة ووقت في سطر واحد */}
                                <div className="flex items-center flex-nowrap min-w-0 w-full gap-1 text-[15px] mb-1.5 overflow-hidden" dir="rtl">
                                  <div className="w-[18px] h-[18px] rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                                    {tweet.original.authorAvatar ? (
                                      <img src={tweet.original.authorAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-white text-[10px] font-bold flex items-center justify-center w-full h-full">{tweet.original.authorName?.[0]}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink min-w-0 max-w-[130px] sm:max-w-[180px]">
  <span className="font-bold text-[#E7E9EA] truncate text-[13px]">{tweet.original.authorName}</span>
  {tweet.original.badgeType && tweet.original.badgeType !== "none" && tweet.original.badgeType !== false && (
    <VerifiedBadge type={tweet.original.badgeType as any} size={14} className="shrink-0" />
  )}
</div>
                                  <span className="text-[#71767B] text-[14px] truncate shrink max-w-[90px]" dir="ltr">@{tweet.original?.authorUsername?.replace(/@.*$/, "") || tweet.original?.authorUsername}</span>
                                  {tweet.original.createdAt && (
                                    <>
                                      <span className="text-[#71767B] text-[13px] shrink-0 mx-0.5">·</span>
                                      <span className="text-[#71767B] text-[13px] shrink-0 whitespace-nowrap">{formatTimeAgo(tweet.original.createdAt).relative}</span>
                                    </>
                                  )}
                                </div>

                                {/* نص التغريدة المقتبسة المتماسك */}
                                <p className="text-[13px] text-[#E7E9EA] leading-[1.38] whitespace-pre-wrap line-clamp-4">
                                  <HashtagText text={tweet.original.text} expandable={false} />
                                </p>

                                {/* صورة المقتبس إن وجدت */}
                                {tweet.original.image && (
                                  <div className="mt-2.5 rounded-[10px] overflow-hidden max-h-60 bg-black">
                                    <img src={tweet.original.image} alt="" className="w-full h-full object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingImagePost(tweet.original); }} />
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : null}

                    {/* فيديو التغريدة العادية */}
                    {!tweet.isRepost && (tweet.video_url || tweet.video) && (
                      <div className="mt-3">
                        <XVideoPlayer 
                          src={tweet.video_url || tweet.video} 
                          tweet={tweet} 
                          authorName={tweet.original?.authorName || tweet.authorName} 
                          authorUsername={tweet.original?.authorUsername || tweet.authorUsername} 
                          authorAvatar={tweet.original?.authorAvatar || tweet.authorAvatar} 
                          currentUserAvatar={myAvatar}
                          onReply={() => setViewingDetailTweet(tweet)}
                          onLike={() => handleLike(tweet.id)}
                          onViewEngagements={() => setViewingEngagementsPost(tweet)}
                          onRepost={() => setRepostMenu(tweet)}
                          onShare={(t) => setShareMenuPost(t)}
                          onBookmark={() => showToast('تمت الإضافة إلى العلامات المرجعية 🔖')}
                        />
                      </div>
                    )}

                    {/* صورة التغريدة العادية */}
                    {!tweet.isRepost && tweet.image && !tweet.video_url && !tweet.video && (
                      <div className="mt-3 rounded-2xl overflow-hidden border-0 max-h-96">
                        <img src={tweet.image} alt="الصورة" className="w-full h-full object-cover cursor-pointer" onClick={(e) => { e.stopPropagation(); setViewingImagePost(tweet); }} />
                      </div>
                    )}

                    {/* أزرار التفاعل الرسمية بنظام X المطابق بالملي */}
                    <XActionBar
                      tweet={tweet}
                      onReply={() => setViewingDetailTweet(tweet)}
                      onRepost={(p) => setRepostMenu(p)}
                      onLike={() => handleLike(tweet.id)}
                      onBookmark={() => {}}
                      onRate={(t) => setRatingTargetTweet(t)}
                      onShare={(t) => setShareMenuPost(t)}
                      currentUserId={currentUserId}
                    />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>


      {/* نافذة عرض تفاصيل التغريدة الكاملة مع كل الردود (عند النقر على جسم التغريدة) */}
      {/* قائمة إعادة النشر / اقتباس */}
      {viewingEngagementsPost && (
        <PostEngagementsModal post={viewingEngagementsPost} onClose={() => setViewingEngagementsPost(null)} />
      )}

      {ratingTargetTweet && (
        <RateBusinessModal
          isOpen={Boolean(ratingTargetTweet)}
          onClose={() => setRatingTargetTweet(null)}
          businessId={ratingTargetTweet.businessId || ratingTargetTweet.business_id || ratingTargetTweet.authorId}
          businessName={ratingTargetTweet.authorName || 'المنشأة'}
          businessAvatar={ratingTargetTweet.authorAvatar}
          reviewerName={myName || 'مستخدم'}
          reviewerUsername={myUsername}
          reviewerAvatar={myAvatar}
          onSubmit={async ({ businessId, stars, comment }) => {
            const res = await submitBusinessReview({ businessId, stars, comment });
            if (res.error) {
              showToast('تعذر حفظ التقييم: ' + res.error);
              return;
            }
            setTweets((prev) =>
              prev.map((item) =>
                item.id === ratingTargetTweet.id ? { ...item, isRated: true } : item
              )
            );
            showToast(`تم تسجيل تقييمك بنجاح (${res.avgRating.toFixed(1)} ★)`);
          }}
        />
      )}

      {repostMenu && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col justify-end sm:justify-center items-center" onClick={() => setRepostMenu(null)}>
          <div className="w-full sm:w-[350px] bg-black sm:rounded-2xl rounded-t-2xl overflow-hidden pb-8 sm:pb-2 shadow-2xl" onClick={e => e.stopPropagation()} dir="rtl">
            {myBusinessPage && (
              <div className="flex items-center gap-2 px-5 pt-4 pb-2 border-b border-[#2F3336]/50">
                <button
                  type="button"
                  onClick={() => switchCommunityIdentity(false)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition ${!publishAsBusiness ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-black text-[#71767B] border-[#2F3336]'}`}
                >
                  {myName || 'الحساب الشخصي'}
                </button>
                <button
                  type="button"
                  onClick={() => switchCommunityIdentity(true)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition ${publishAsBusiness ? 'bg-[#FFC500] text-black border-[#FFC500]' : 'bg-black text-[#71767B] border-[#2F3336]'}`}
                >
                  {myBusinessPage.name}
                </button>
              </div>
            )}
            
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
                if (!currentUserId || !quoteText.trim()) return;
                try {
                  const cleanPostId = (quoteOriginal.originalId || quoteOriginal.id || '').toString().replace('repost-', '');
                  const { error } = await supabase.from('post_reposts').upsert({
                    post_id: cleanPostId,
                    user_id: currentUserId,
                    quote_text: quoteText.trim()
                  }, {
                    onConflict: 'user_id,post_id'
                  });
                  if (error) throw error;
                  showToast('تم الاقتباس');
                  setIsQuoting(false);
                  setQuoteText('');
                  setQuoteOriginal(null);
                  
                  // إعادة جلب التغريدات لتظهر فوراً (بدون إعادة تحميل الصفحة)
                  setTimeout(() => {
                    reloadFeedRef.current?.();
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
          <RichTextarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="أضف تعليقك..."
            onPaste={handlePasteUrl}
          />
          <div className="rounded-[12px] border border-white/[0.08] p-2.5 mb-4 select-none overflow-hidden" dir="rtl">
            {/* رأس الاقتباس: أفاتار 18px + اسم + معرف في سطر واحد متناسق */}
            <div className="flex items-center gap-1.5 text-xs mb-1.5 overflow-hidden">
              <img
                src={quoteOriginal.authorAvatar || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'}
                alt=""
                className="w-[18px] h-[18px] rounded-full object-cover shrink-0"
              />
              <span className="font-bold text-[#E7E9EA] truncate text-[13px]">{quoteOriginal.authorName}</span>
              <span className="text-[#71767B] truncate text-[12px] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{quoteOriginal.authorUsername}</span>
            </div>
            {/* نص الاقتباس المتماسك بنمط X */}
            <p className="text-[13px] text-[#E7E9EA] leading-[1.38] font-['Tahoma',sans-serif] whitespace-pre-wrap">
              <HashtagText text={quoteOriginal.text} />
            </p>
          </div>
        </div>
      )}

      {viewingDetailTweet && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col h-[100dvh] text-white overflow-hidden" dir="rtl">
          {/* شريط علوي */}
          <div className="h-14 border-b border-[#2F3336]/40 px-4 flex items-center justify-between shrink-0 bg-black ">
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
                <p className="font-['Tahoma'] font-bold text-sm text-white truncate shrink max-w-[130px] sm:max-w-[150px]">{viewingDetailTweet.authorName}</p>
                <p className="font-['Tahoma'] text-[11px] text-[#71767B] font-normal font-['Tahoma'] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{viewingDetailTweet.authorUsername}</p>
              </div>
            </div>

            <p className="-mt-1 text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap pr-0 -ml-8 pl-3 break-words font-normal select-text">
              {viewingDetailTweet.text}
            </p>

            {viewingDetailTweet.image && (
              <div className="rounded-2xl overflow-hidden border-0 max-h-[450px]">
                <img src={viewingDetailTweet.image} alt="" className="w-full h-auto object-cover" />
              </div>
            )}

            <div className="text-[11px] text-[#71767B] py-2 border-y border-white/[0.07] flex items-center gap-2">
              <span>{formatTimeAndDate(viewingDetailTweet.createdAt)}</span>
              <span>·</span>
              <span>{viewingDetailTweet.views || 1} مشاهدة</span>
            </div>

            {/* أزرار التفاعل في العرض الكامل بنظام X */}
            <div className="flex items-center justify-between py-1 border-b border-[#2F3336]/40 text-[#71767B] w-full px-2">
              <div className="flex-1 max-w-[425px]">
                <XActionBar
                  tweet={viewingDetailTweet}
                  onReply={() => { /* التفاعل المباشر مع شريط الرد الحديث */ }}
                  onRepost={() => handleRepost(viewingDetailTweet.id)}
                  onLike={() => handleLike(viewingDetailTweet.id)}
                  onBookmark={() => showToast("تمت الإضافة إلى العلامات المرجعية 🔖")}
                  onShare={(t) => setShareMenuPost(t)}
                  currentUserId={currentUserId}
                />
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setReportingItem({ type: 'post', targetId: viewingDetailTweet.id, targetName: viewingDetailTweet.authorName || 'مستخدم', targetAuthorId: viewingDetailTweet.authorId || '' });
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
                viewingDetailTweet?.comments.map(c => {
                      const commentAsTweet = {
                        id: c.id,
                        authorId: c.authorId,
                        authorName: c.authorName,
                        authorUsername: c.authorUsername,
                        authorAvatar: c.authorAvatar,
                        badgeType: c.badgeType || c.authorBadge,
                        text: c.text,
                        image: c.image,
                        createdAt: c.createdAt,
                        likes: c.likes || 0,
                        replies: c.replies || 0,
                        reposts: c.reposts || 0,
                        views: c.views || 1,
                        likedBy: c.likedBy || [],
                        comments: c.comments || []
                      };

                      
  

  return (
                        <div
                          key={c.id}
                          onClick={() => setViewingDetailTweet(commentAsTweet)}
                          className="py-3 px-1 border-b border-[#2F3336]/40 flex gap-3 hover:bg-white/[0.02] transition cursor-pointer"
                        >
                          {/* صورة المعلق بالحجم الطبيعي 42px */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              openAuthorProfile(c.authorId, c);
                            }}
                            className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] aspect-square rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition"
                          >
                            {c.authorAvatar ? (
                              <img src={c.authorAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{c.authorName ? c.authorName[0] : "؟"}</span>
                            )}
                          </div>

                          {/* تفاصيل التعليق */}
                          <div className="flex-1 min-w-0">
                            {/* رأس التعليق */}
                            <div className="flex items-center flex-nowrap min-w-0 w-full  flex-nowrap min-w-0 w-full  gap-1.5 min-w-0 flex-1 flex-nowrap overflow-hidden" dir="rtl">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAuthorProfile(c.authorId, c);
                                }}
                                className="font-bold text-[13.5px] text-[#E7E9EA] hover:underline cursor-pointer flex items-center gap-0.5 truncate shrink-0 max-w-[130px] sm:max-w-[160px]"
                              >
                                <span className="truncate">{c.authorName}</span>
                                {(c.badgeType || c.authorBadge) && (
                                  <VerifiedBadge type={(c.badgeType || c.authorBadge) as any} size={14} />
                                )}
                              </span>
                              <span className="text-[12px] text-[#71767B] font-normal truncate min-w-0 shrink truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">
                                @{c.authorUsername ? c.authorUsername.replace(/@.*$/, "") : "user"}
                              </span>
                              <span className="text-[11px] text-[#71767B] shrink-0 mx-0.5">·</span>
                              <span className="text-[11px] text-[#71767B] font-normal shrink-0 whitespace-nowrap shrink-0 whitespace-nowrap" >
{formatTimeAgo(c.createdAt).relative}
                              </span>
                            </div>

                            {/* نص التعليق */}
                            <p className="text-[13px] text-[#E7E9EA] mt-1 leading-relaxed break-words whitespace-pre-wrap select-text">
                              <HashtagText text={c.text} />
                            </p>

                            {/* صورة التعليق إن وجدت */}
                            {c.image && (
                              <div className="mt-2.5 rounded-2xl overflow-hidden border-0 max-h-72 bg-black">
                                <img src={c.image} alt="مرفق الرد" className="w-full h-auto object-cover max-h-72" loading="lazy" />
                              </div>
                            )}

                            {/* أزرار التفاعل بنظام X مع فتح التعليق والرد عليه */}
                            <div className="max-w-[320px] -mt-1" onClick={(e) => e.stopPropagation()}>
                              <XActionBar
                                tweet={c}
                                onReply={() => {
                                  const mention = "@" + (c.authorUsername || c.authorName || "").replace(/@/g, "") + " ";
                                  setNewCommentText((prev) => (prev.includes(mention) ? prev : mention + prev));
                                  // تم إلغاء النافذة القديمة والاعتماد على شريط الرد الموحد الحديث
                                  showToast("الرد على @" + (c.authorUsername || c.authorName || ""));
                                }}
                                onLike={() => {}}
                                onShare={(t) => setShareMenuPost(c)}
                                currentUserId={currentUserId}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
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
          onSubmit={async (reason) => {
            try {
              const { error: sbError } = await supabase.from('reports').insert({
                reporter_id: currentUserId || null,
                reporter_name: myName || 'مستخدم',
                reported_item_type: reportingItem.type === 'account' ? 'user' : 'post',
                reported_item_id: reportingItem.targetId,
                reported_user_id: reportingItem.targetAuthorId || null,
                reason: reason,
                details: null,
                status: 'PENDING',
              });
              if (sbError) console.error('Supabase report error:', sbError);
              
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
            } catch (e) {
              console.error(e);
              showToast('تعذر إرسال البلاغ');
            }
          }}
        />
      )}

      {/* شريط التنقل السفلي */}
      

    
      {/* قائمة ⋮ — للمجتمع */}
      {activeMenuPost && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end justify-center p-2" onClick={() => setActiveMenuPost(null)}>
          <div className="w-full max-w-xs bg-black rounded-2xl overflow-hidden mb-16 shadow-2xl border border-[#2F3336]" onClick={(e) => e.stopPropagation()}>
            
            {/* الخيارات التي تظهر فقط لصاحب التغريدة */}
            {activeMenuPost.authorId === currentUserId ? (
              <>
                <button onClick={() => { showToast('التثبيت قريباً'); setActiveMenuPost(null); }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                  <span>تثبيت على الملف الشخصي</span>
                </button>
                <button onClick={() => { showToast('الإفصاح قريباً'); setActiveMenuPost(null); }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
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
                }} className="w-full p-4 text-right text-[#F4212E] font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span>حذف المنشور</span>
                </button>
                <button onClick={() => { showToast('تغيير الردود قريباً'); setActiveMenuPost(null); }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  <span>تغيير من يمكنه الرد</span>
                </button>
                {/* الإبلاغ لصاحب التغريدة */}
                <button onClick={() => {
                  setReportingItem({ type: 'post', targetId: activeMenuPost.id, targetName: activeMenuPost.authorName || 'مستخدم', targetAuthorId: activeMenuPost.authorId || '' });
                  setActiveMenuPost(null);
                }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>
                  <span>إبلاغ</span>
                </button>
              </>
            ) : (
              /* الخيارات التي تظهر للمستخدمين الآخرين (الزوار) */
              <>
                <button onClick={() => handleNotInterested(activeMenuPost.id)} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>لست مهتماً بهذا المنشور</span>
                </button>
                <button onClick={() => handleUnfollow(activeMenuPost.authorId)} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/></svg>
                  <span>إلغاء متابعة @{activeMenuPost.authorUsername}</span>
                </button>
                <button onClick={() => handleMute(activeMenuPost.authorId)} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                  <span>كتم @{activeMenuPost.authorUsername}</span>
                </button>
                <button onClick={() => handleBlock(activeMenuPost.authorId)} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-[#FFC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                  <span>حظر @{activeMenuPost.authorUsername}</span>
                </button>
                {/* الإبلاغ للزوار */}
                <button onClick={() => {
                  setReportingItem({ type: 'post', targetId: activeMenuPost.id, targetName: activeMenuPost.authorName || 'مستخدم', targetAuthorId: activeMenuPost.authorId || '' });
                  setActiveMenuPost(null);
                }} className="w-full p-4 text-right text-white font-bold hover:bg-white/5 transition border-b border-[#2F3336]/40 flex items-center gap-3 text-sm">
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
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336]/40 mb-4">
              <h2 className="text-base font-black text-white">تعديل التغريدة</h2>
              <button onClick={() => setEditingTweet(null)} className="text-[#71767B] hover:text-white p-1 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <RichTextarea
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
      {!['phones', 'jobs', 'properties', 'auctions'].includes(activeTab) && (
      <button
        onClick={() => setIsPostModalOpen(true)}
        className="yr-fab transition-transform duration-300 fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-black/60 transition"
        title="تغريدة جديدة"
      >
        <Plus size={24} className="stroke-[2.2] text-black" />
      </button>
      )}

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
            {myBusinessPage && !quoteOriginal && (
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => switchCommunityIdentity(false)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                    !publishAsBusiness
                      ? 'bg-[#FFC500] text-black border-[#FFC500]'
                      : 'bg-black text-[#71767B] border-[#2F3336] hover:text-white'
                  }`}
                >
                  {myName || 'الحساب الشخصي'}
                </button>
                <button
                  type="button"
                  onClick={() => switchCommunityIdentity(true)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                    publishAsBusiness
                      ? 'bg-[#FFC500] text-black border-[#FFC500]'
                      : 'bg-black text-[#71767B] border-[#2F3336] hover:text-white'
                  }`}
                >
                  {myBusinessPage.name}
                </button>
              </div>
            )}
            <div className="flex items-start gap-3 flex-1">
              {/* صورة الأفاتار فقط أعلى اليمين */}
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center font-bold shrink-0 mt-1">
                {(publishAsBusiness && myBusinessPage ? myBusinessPage.avatarUrl : myAvatar) ? (
                  <img
                    src={publishAsBusiness && myBusinessPage ? myBusinessPage.avatarUrl : myAvatar}
                    alt={publishAsBusiness && myBusinessPage ? myBusinessPage.name : myName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm">
                    {publishAsBusiness && myBusinessPage
                      ? (myBusinessPage.name?.[0] || 'م')
                      : (myName ? myName[0] : '؟')}
                  </span>
                )}
              </div>

              {/* حقل الكتابة مدمج تماماً في السواد مع مؤشر عمودي متحرك بلون المنصة */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="relative w-full">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden text-transparent text-[17px] leading-[26px] p-0 font-normal select-none"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    <span>{tweetText.slice(0, 250)}</span>
                    {tweetText.length > 250 && (
                      <mark className="bg-[#782229] text-transparent rounded-sm py-0.5">
                        {tweetText.slice(250)}
                      </mark>
                    )}
                  </div>
                  <RichTextarea
                    autoFocus
                    value={tweetText}
                    onPaste={handlePasteUrl}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    onChange={(e) => {
                      handleComposeTextChange(e);
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea relative z-10 w-full bg-transparent text-white text-[17px] leading-[26px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none overflow-hidden caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', wordBreak: 'break-word', overflowWrap: 'break-word', minHeight: '120px' }}
                  />
                  {quoteOriginal && (
                    <div className="rounded-[12px] border border-white/[0.08] p-2.5 mb-4 mt-2 select-none overflow-hidden relative" dir="rtl">
                      <button
                        type="button"
                        onClick={() => setQuoteOriginal(null)}
                        className="absolute top-2 left-2 z-10 bg-black/70 hover:bg-black p-1 rounded-full text-white"
                      >
                        <X size={14} />
                      </button>
                      <div className="flex items-center gap-1.5 text-xs mb-1.5 overflow-hidden">
                        {quoteOriginal.authorAvatar ? (
                          <img src={quoteOriginal.authorAvatar} alt="" className="w-[18px] h-[18px] rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-[18px] h-[18px] rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {quoteOriginal.authorName?.[0] || '؟'}
                          </div>
                        )}
                        <span className="font-bold text-[#E7E9EA] truncate text-[13px]">{quoteOriginal.authorName}</span>
                        <span className="text-[#71767B] truncate text-[12px] shrink max-w-[80px]" dir="ltr">@{quoteOriginal.authorUsername}</span>
                      </div>
                      <p className="text-[13px] text-[#E7E9EA] leading-[1.38] whitespace-pre-wrap line-clamp-3">
                        <HashtagText text={quoteOriginal.text} expandable={false} />
                      </p>
                      {quoteOriginal.image && <img src={quoteOriginal.image} alt="" className="mt-2 rounded-lg max-h-40 object-cover" />}
                    </div>
                  )}
                </div>

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
              <div className="flex items-center gap-1.5 text-xs font-mono select-none px-2 text-[#71767B] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">
                <span className={tweetText.length > 280 ? "text-rose-500 font-bold" : tweetText.length >= 260 ? "text-[#FFC500] font-bold" : "text-zinc-500"}>
                  {tweetText.length}
                </span>
                <span>/ 280</span>
              </div>
            </div>
          </div>
        </div>
      )}
{/* 🖼️ مشغل الصور العالمي */}
      {viewingImagePost && (
        <XImagePlayer
          src={viewingImagePost.image}
          tweet={viewingImagePost}
          authorName={viewingImagePost.authorName || viewingImagePost.original?.authorName}
          authorUsername={viewingImagePost.authorUsername || viewingImagePost.original?.authorUsername}
          authorAvatar={viewingImagePost.authorAvatar || viewingImagePost.original?.authorAvatar}
          currentUserAvatar={myAvatar}
          onClose={() => setViewingImagePost(null)}
          onReply={() => {
            const t = viewingImagePost;
            setViewingImagePost(null);
            setViewingDetailTweet(t);
          }}
          onLike={() => handleLike(viewingImagePost.id)}
          onRepost={() => {
            const t = viewingImagePost;
            setViewingImagePost(null);
            setRepostMenu(t);
          }}
          onShare={(t) => setShareMenuPost(t)}
        />
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
                    if (!currentUserId) {
                      showToast('يرجى تسجيل الدخول للمراسلة');
                      return;
                    }
                    setIsSendingShareDm(true);
                    try {
                      const url = getPostShareUrl(shareMenuPost);
                      const msgText = shareMenuPost.text ? `${shareMenuPost.text.slice(0, 80)}\n${url}` : url;
                      await Promise.all(
                        selectedShareUsers.map((uid) =>
                          supabase.from('direct_messages').insert({
                            sender_id: currentUserId,
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
    </div>
  );
};
