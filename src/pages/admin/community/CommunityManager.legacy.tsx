import { MobileCommunityView } from './mobile/MobileCommunityView';
import { useIsMobile } from './shared/useIsMobile';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Users, ShieldAlert, Trash2, CheckCircle2, 
  Search, Shield, Video, RefreshCw, AlertTriangle, 
  Eye, EyeOff, Filter, ChevronRight, ChevronLeft, MessageCircle, 
  FileText, ShieldCheck, XCircle, UserX, UserCheck, X, ExternalLink
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAdmin } from '../../../context/AdminContext';
import { VerifiedBadge, BadgeType } from '../../../components/common/VerifiedBadge';

interface PostItem {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  created_at: string;
  is_hidden?: boolean;
  status?: string;
  quote_text?: string;
  original_post_id?: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorBadge?: BadgeType;
}

interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
}

interface ProfileItem {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  verification_type?: BadgeType;
  is_verified?: boolean;
  is_blocked?: boolean;
  created_at?: string;
}

interface ReportItem {
  id: string;
  reason: string;
  details?: string;
  reported_item_type: string;
  reported_item_id: string;
  reported_user_id?: string;
  reporter_id?: string;
  reporter_name?: string;
  status: string;
  created_at: string;
  targetPost?: PostItem;
  targetUser?: ProfileItem;
}

interface AuditLogItem {
  id: string;
  admin_name: string;
  admin_email: string;
  action_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

const PAGE_SIZE = 10;

export const CommunityManager: React.FC = () => {
  let currentAdminUser: any = null;
  try {
    // محاولة قراءة السياق بأمان
    const adminCtx = useAdmin();
    currentAdminUser = adminCtx?.currentAdminUser;
  } catch (_) {
    // في حال عدم وجود AdminProvider، نقرأ من التخزين المحلي مباشرة
    try {
      const stored = localStorage.getItem('yr_admin_user') || localStorage.getItem('admin_session');
      if (stored) currentAdminUser = JSON.parse(stored);
    } catch (_) {}
  }
  // إذا لم نجد مستخدماً مسجلاً، نعتمد صلاحية المدير الافتراضية للوحة التحكم
  if (!currentAdminUser) {
    currentAdminUser = { name: 'المشرف العام', email: 'admin@yemenrating.com', role: 'admin' };
  }
  const isAdmin = currentAdminUser?.role === 'admin';


  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'users' | 'reports' | 'logs'>('posts');
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  
  const [selectedPostForComments, setSelectedPostForComments] = useState<PostItem | null>(null);
  const [postComments, setPostComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const [previewPost, setPreviewPost] = useState<PostItem | null>(null);
  const [resolvingReport, setResolvingReport] = useState<ReportItem | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    open: boolean;
    type: 'post' | 'comment';
    id: string;
    targetTitle: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const logAdminAction = (actionType: string, targetId: string, details: string) => {
    const newLog: AuditLogItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      admin_name: currentAdminUser?.name || 'المشرف العام',
      admin_email: currentAdminUser?.email || 'admin@yemenrating.com',
      action_type: actionType,
      target_id: targetId,
      details,
      created_at: new Date().toISOString()
    };

    setAuditLogs(prev => [newLog, ...prev]);

    try {
      const existing = JSON.parse(localStorage.getItem('yr_moderation_logs') || '[]');
      localStorage.setItem('yr_moderation_logs', JSON.stringify([newLog, ...existing].slice(0, 200)));
    } catch (_) {}
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      let localDirectory: Record<string, any> = {};
      try {
        localDirectory = JSON.parse(localStorage.getItem('yr_users_directory') || '{}');
      } catch (_) {}

      try {
        const storedLogs = JSON.parse(localStorage.getItem('yr_moderation_logs') || '[]');
        setAuditLogs(storedLogs);
      } catch (_) {}

      // 1. جلب التغريدات الحقيقية
      const { data: postsData, error: postsErr } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (postsErr) throw postsErr;

      const userIds = [...new Set((postsData || []).map(p => p.user_id).filter(Boolean))];

      // 2. جلب جميع البروفايلات
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, verification_type, is_verified, is_blocked, created_at')
        .limit(300);

      const profileMap = new Map<string, ProfileItem>();
      (profilesData || []).forEach(p => profileMap.set(p.id, p));

      const missingIds = userIds.filter(id => !profileMap.has(id));
      if (missingIds.length > 0) {
        const { data: extraProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, verification_type, is_verified, is_blocked, created_at')
          .in('id', missingIds);
        (extraProfiles || []).forEach(p => profileMap.set(p.id, p));
      }

      setProfiles(Array.from(profileMap.values()));

      // 3. بناء كائنات التغريدات
      const formattedPosts: PostItem[] = (postsData || []).map(p => {
        const prof = profileMap.get(p.user_id);
        const fallback = localDirectory[p.user_id] || {};
        return {
          ...p,
          authorName: prof?.full_name || fallback.name || fallback.full_name || 'مستخدم يمن ريتنج',
          authorUsername: prof?.username || fallback.username || 'user',
          authorAvatar: prof?.avatar_url || fallback.avatarUrl || fallback.avatar_url || '',
          authorBadge: (prof?.verification_type as any) || (prof?.is_verified ? 'blue' : 'none'),
          is_hidden: p.is_hidden || p.status === 'hidden'
        };
      });
      setPosts(formattedPosts);

      const postsMap = new Map<string, PostItem>(formattedPosts.map(p => [p.id, p]));

      // 4. جلب البلاغات وربطها الحقيقي
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const linkedReports: ReportItem[] = (reportsData || []).map(r => {
        const itemType = (r.reported_item_type || r.target_type || '').toLowerCase();
        const itemId = r.reported_item_id || r.target_id || '';
        const isAccount = itemType === 'account' || itemType === 'user';
        return {
          ...r,
          reported_item_type: itemType,
          reported_item_id: itemId,
          targetPost: !isAccount ? postsMap.get(itemId) : undefined,
          targetUser: isAccount ? profileMap.get(itemId) : (r.reported_user_id ? profileMap.get(r.reported_user_id) : undefined)
        };
      });
      setReports(linkedReports);

    } catch (err: any) {
      console.error(err);
      showToast('تعذر تحميل بيانات المجتمع كاملة', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadPostComments = async (post: PostItem) => {
    setSelectedPostForComments(post);
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profMap = new Map(profiles.map(p => [p.id, p]));
      const formatted: CommentItem[] = (data || []).map(c => {
        const prof = profMap.get(c.user_id);
        return {
          ...c,
          authorName: prof?.full_name || 'مستخدم',
          authorUsername: prof?.username || 'user',
          authorAvatar: prof?.avatar_url || ''
        };
      });
      setPostComments(formatted);
      setActiveTab('comments');
    } catch (err: any) {
      showToast('تعذر تحميل التعليقات المرتبطة', 'error');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleHidePost = async (post: PostItem) => {
    if (!isAdmin) {
      showToast('هذا الإجراء يتطلب صلاحيات المشرف العام (Admin)', 'error');
      return;
    }

    const newHiddenState = !post.is_hidden;
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          is_hidden: newHiddenState,
          status: newHiddenState ? 'hidden' : 'active'
        })
        .eq('id', post.id);

      if (error) {
        await supabase.from('posts').update({ status: newHiddenState ? 'hidden' : 'active' }).eq('id', post.id);
      }

      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_hidden: newHiddenState, status: newHiddenState ? 'hidden' : 'active' } : p));
      
      const actionTitle = newHiddenState ? 'إخفاء تغريدة' : 'استعادة تغريدة';
      logAdminAction(actionTitle, post.id, `تم ${newHiddenState ? 'إخفاء' : 'استعادة'} التغريدة التابعة للمستخدم @${post.authorUsername}`);
      showToast(`تم ${newHiddenState ? 'إخفاء' : 'استعادة'} التغريدة بنجاح ✅`);
    } catch (err: any) {
      showToast('تعذر تحديث حالة التغريدة', 'error');
    }
  };

  const executeDelete = async () => {
    if (!confirmDeleteModal) return;
    if (!isAdmin) {
      showToast('حذف المحتوى محصور بصلاحيات المشرف العام فقط', 'error');
      setConfirmDeleteModal(null);
      return;
    }

    const { type, id } = confirmDeleteModal;
    try {
      if (type === 'post') {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
        setPosts(prev => prev.filter(p => p.id !== id));
        logAdminAction('حذف نهائي لتغريدة', id, 'تم حذف التغريدة نهائياً من قاعدة البيانات بعد التأكيد الإداري');
        showToast('تم حذف التغريدة نهائياً بنجاح 🗑️');
      } else if (type === 'comment') {
        const { error } = await supabase.from('post_comments').delete().eq('id', id);
        if (error) throw error;
        setPostComments(prev => prev.filter(c => c.id !== id));
        logAdminAction('حذف نهائي لتعليق', id, 'تم حذف التعليق نهائياً بعد المراجعة');
        showToast('تم حذف التعليق نهائياً بنجاح 🗑️');
      }
    } catch (err: any) {
      showToast(err.message || 'فشلت عملية الحذف', 'error');
    } finally {
      setConfirmDeleteModal(null);
    }
  };

  const handleUpdateBadge = async (userId: string, newBadge: BadgeType) => {
    if (!isAdmin) {
      showToast('تعديل شارات التوثيق محصور بالمشرف العام', 'error');
      return;
    }

    try {
      const isVer = newBadge !== 'none';
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_type: newBadge,
          is_verified: isVer
        })
        .eq('id', userId);

      if (error) throw error;

      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, verification_type: newBadge, is_verified: isVer } : p));
      setPosts(prev => prev.map(p => p.user_id === userId ? { ...p, authorBadge: newBadge } : p));

      const badgeName = newBadge === 'blue' ? 'الزرقاء (شخصي)' : newBadge === 'gold' ? 'الذهبية (جهة/شركة)' : newBadge === 'gray' ? 'الرمادية (رسمي)' : 'إزالة التوثيق';
      logAdminAction('تحديث شارة توثيق', userId, `تم منح المستخدم الشارة: ${badgeName}`);
      showToast(`تم تحديث شارة التوثيق إلى ${badgeName} بنجاح ✅`);
    } catch (err: any) {
      showToast(err.message || 'تعذر تحديث الشارة', 'error');
    }
  };

  const handleToggleBlockUser = async (user: ProfileItem) => {
    if (!isAdmin) {
      showToast('حظر المستخدمين يتطلب صلاحية المشرف العام', 'error');
      return;
    }

    const newBlocked = !user.is_blocked;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: newBlocked })
        .eq('id', user.id);

      if (error) throw error;

      setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, is_blocked: newBlocked } : p));
      logAdminAction(newBlocked ? 'حظر مستخدم' : 'إلغاء حظر مستخدم', user.id, `تم ${newBlocked ? 'حظر' : 'إلغاء حظر'} الحساب @${user.username}`);
      showToast(`تم ${newBlocked ? 'حظر' : 'إلغاء حظر'} المستخدم بنجاح ✅`);
    } catch (err: any) {
      showToast('تعذر تغيير حالة الحظر', 'error');
    }
  };

  const submitReportDecision = async (status: 'RESOLVED' | 'DISMISSED', alsoDeletePost: boolean = false) => {
    if (!resolvingReport) return;
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status,
          details: decisionNotes ? `${resolvingReport.details || ''} | [قرار الإشراف: ${decisionNotes}]` : resolvingReport.details
        })
        .eq('id', resolvingReport.id);

      if (error) throw error;

      if (alsoDeletePost && resolvingReport.targetPost) {
        await supabase.from('posts').delete().eq('id', resolvingReport.targetPost.id);
        setPosts(prev => prev.filter(p => p.id !== resolvingReport.targetPost!.id));
        logAdminAction('قبول بلاغ وحذف محتوى', resolvingReport.targetPost.id, `تم قبول البلاغ وحذف التغريدة المخالفة. الملاحظات: ${decisionNotes || 'لا توجد'}`);
      } else {
        logAdminAction(status === 'RESOLVED' ? 'قبول بلاغ' : 'رفض بلاغ', resolvingReport.id, `قرار الإشراف: ${status}. الملاحظات: ${decisionNotes || 'لا توجد'}`);
      }

      setReports(prev => prev.map(r => r.id === resolvingReport.id ? { ...r, status } : r));
      showToast(`تم توثيق قرار البلاغ بنجاح (${status === 'RESOLVED' ? 'مقبول' : 'مرفوض'}) ✅`);
    } catch (err: any) {
      showToast(err.message || 'تعذر حفظ القرار', 'error');
    } finally {
      setResolvingReport(null);
      setDecisionNotes('');
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchSearch = 
        p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorUsername?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'hidden' ? p.is_hidden :
        !p.is_hidden;

      const matchMedia = 
        mediaFilter === 'all' ? true :
        mediaFilter === 'images' ? !!p.image_url :
        !!p.video_url;

      return matchSearch && matchStatus && matchMedia;
    });
  }, [posts, searchQuery, statusFilter, mediaFilter]);

  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, currentPage]);

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReports = reports.filter(r => 
    r.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reported_item_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.targetPost?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.targetUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );


return (
    <div className="space-y-6 text-white pb-16 font-sans select-none" dir="rtl">
      {/* التنبيه العائم */}
      {toast && (
        <div className={`fixed top-20 left-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span>{toast.text}</span>
        </div>
      )}

      {/* ترويسة لوحة إدارة المجتمع */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2F3336] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <MessageSquare className="text-[#FFC500]" size={26} />
            <span>نظام إدارة مجتمع التغريدات (X-Moderation)</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            التحكم الشامل بالتغريدات، التعليقات، شارات التوثيق الثلاثية، سجل الرقابة، والبلاغات
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold flex items-center gap-1.5">
            <ShieldCheck size={14} className={isAdmin ? 'text-emerald-400' : 'text-amber-400'} />
            <span>الصلاحية: {isAdmin ? 'مشرف عام (Admin)' : 'مشرف محتوى'}</span>
          </span>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-95"
            title="تحديث البيانات"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#FFC500]' : ''} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#111111] border border-[#2F3336] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-bold">إجمالي التغريدات</p>
            <p className="text-2xl font-black text-white mt-1">{posts.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="bg-[#111111] border border-[#2F3336] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-bold">المحتوى المخفي</p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {posts.filter(p => p.is_hidden).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <EyeOff size={20} />
          </div>
        </div>

        <div className="bg-[#111111] border border-[#2F3336] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-bold">المغردون</p>
            <p className="text-2xl font-black text-white mt-1">{profiles.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-[#111111] border border-[#2F3336] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-bold">حسابات موثقة</p>
            <p className="text-2xl font-black text-[#FFC500] mt-1">
              {profiles.filter(p => p.verification_type && p.verification_type !== 'none').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FFC500]/10 border border-[#FFC500]/20 flex items-center justify-center text-[#FFC500]">
            <Shield size={20} />
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#111111] border border-[#2F3336] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-bold">بلاغات معلقة</p>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {reports.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      {/* شريط التبويبات والبحث */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111111] border border-[#2F3336] rounded-2xl p-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('posts'); setSelectedPostForComments(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'posts' ? 'bg-[#FFC500] text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare size={14} />
            <span>جميع التغريدات ({filteredPosts.length})</span>
          </button>

          {selectedPostForComments && (
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'comments' ? 'bg-[#FFC500] text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageCircle size={14} />
              <span>التعليقات ({postComments.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'users' ? 'bg-[#FFC500] text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            <span>المغردون والتوثيق ({filteredProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reports' ? 'bg-[#FFC500] text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert size={14} />
            <span>البلاغات ({filteredReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'logs' ? 'bg-[#FFC500] text-black shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText size={14} />
            <span>سجل الإجراءات ({auditLogs.length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="بحث بنص التغريدة أو المعرف..."
            className="w-full bg-black border border-[#2F3336] rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFC500]"
          />
          <Search size={14} className="absolute right-3 top-2.5 text-zinc-500" />
        </div>
      </div>

      {/* 1. تبويب التغريدات */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111111]/60 border border-[#2F3336]/60 rounded-xl px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-bold flex items-center gap-1">
                <Filter size={13} />
                <span>حالة التغريدة:</span>
              </span>
              <button
                onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${statusFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                الكل
              </button>
              <button
                onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${statusFilter === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                النشطة فقط
              </button>
              <button
                onClick={() => { setStatusFilter('hidden'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${statusFilter === 'hidden' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                المخفية فقط
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-bold">الوسائط:</span>
              <select
                value={mediaFilter}
                onChange={(e) => { setMediaFilter(e.target.value as any); setCurrentPage(1); }}
                className="bg-black border border-[#2F3336] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="all">كافة التغريدات</option>
                <option value="images">تحتوي صوراً</option>
                <option value="videos">تحتوي فيديو</option>
              </select>
            </div>
          </div>

          {paginatedPosts.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs bg-[#111111] border border-[#2F3336] rounded-2xl">
              لا توجد تغريدات مطابقة لمعايير البحث والفلترة
            </div>
          ) : (
            paginatedPosts.map(post => (
              <div 
                key={post.id} 
                className={`bg-[#111111] border rounded-2xl p-4.5 transition flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  post.is_hidden ? 'border-amber-500/30 bg-amber-950/[0.04]' : 'border-[#2F3336] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-lg">
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white">{post.authorName?.[0] || '؟'}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{post.authorName}</span>
                      {post.authorBadge && post.authorBadge !== 'none' && (
                        <VerifiedBadge type={post.authorBadge} size="sm" />
                      )}
                      <span className="text-xs text-zinc-500 font-mono" dir="ltr">@{post.authorUsername}</span>
                      <span className="text-xs text-zinc-600">· {new Date(post.created_at).toLocaleDateString('ar-YE')}</span>

                      {post.is_hidden && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          مخفية عن المجتمع
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-200 text-sm mt-2 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>

                    {post.quote_text && (
                      <div className="mt-3 p-3 rounded-xl border border-zinc-800 bg-black/40 text-xs text-zinc-300">
                        <span className="text-zinc-500 font-bold block mb-1">اقتباس:</span>
                        <p className="italic">{post.quote_text}</p>
                      </div>
                    )}

                    {post.image_url && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800/40 max-h-48 w-fit">
                        <img src={post.image_url} alt="" className="max-h-48 object-cover rounded-xl" />
                      </div>
                    )}
                    {post.video_url && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg w-fit">
                        <Video size={14} />
                        <span>يحتوي على فيديو</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-zinc-500 mt-3.5 pt-2 border-t border-zinc-900">
                      <span>❤️ {post.likes_count || 0} إعجاب</span>
                      <button 
                        onClick={() => loadPostComments(post)}
                        className="hover:text-blue-400 transition underline flex items-center gap-1"
                      >
                        💬 {post.comments_count || 0} تعليق (إدارة الردود)
                      </button>
                      <span>🔁 {post.reposts_count || 0} إعادة نشر</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-start flex-shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => setPreviewPost(post)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
                    title="معاينة التغريدة كاملة"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    onClick={() => handleToggleHidePost(post)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                      post.is_hidden 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                    }`}
                  >
                    {post.is_hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{post.is_hidden ? 'استعادة' : 'إخفاء'}</span>
                  </button>

                  <button
                    onClick={() => setConfirmDeleteModal({
                      open: true,
                      type: 'post',
                      id: post.id,
                      targetTitle: `تغريدة @${post.authorUsername}: "${post.content.slice(0, 30)}..."`
                    })}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="حذف نهائي"
                  >
                    <Trash2 size={14} />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#2F3336] pt-4 px-2 text-xs">
              <span className="text-zinc-500">
                صفحة {currentPage} من {totalPages} (إجمالي {filteredPosts.length} تغريدة)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-40 text-white"
                >
                  <ChevronRight size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl font-bold transition ${
                      currentPage === page ? 'bg-[#FFC500] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-40 text-white"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. تبويب إدارة التعليقات */}
      {activeTab === 'comments' && selectedPostForComments && (
        <div className="space-y-4">
          <div className="bg-[#111111] border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-400 font-bold block">التغريدة المختارة:</span>
              <p className="text-sm font-bold text-white mt-1">"{selectedPostForComments.content}"</p>
              <span className="text-xs text-zinc-500">بواسطة @{selectedPostForComments.authorUsername}</span>
            </div>

            <button
              onClick={() => setActiveTab('posts')}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:text-white"
            >
              العودة للتغريدات
            </button>
          </div>

          {loadingComments ? (
            <div className="text-center py-12 text-zinc-500 text-xs">جاري تحميل التعليقات...</div>
          ) : postComments.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs bg-[#111111] border border-[#2F3336] rounded-2xl">
              لا توجد تعليقات على هذه التغريدة حتى الآن
            </div>
          ) : (
            postComments.map(comment => (
              <div key={comment.id} className="bg-[#111111] border border-[#2F3336] rounded-2xl p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs">
                    {comment.authorAvatar ? (
                      <img src={comment.authorAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{comment.authorName?.[0] || '؟'}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{comment.authorName}</span>
                      <span className="text-[11px] text-zinc-500" dir="ltr">@{comment.authorUsername}</span>
                      <span className="text-[11px] text-zinc-600">· {new Date(comment.created_at).toLocaleDateString('ar-YE')}</span>
                    </div>
                    <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>
                  </div>
                </div>

                <button
                  onClick={() => setConfirmDeleteModal({
                    open: true,
                    type: 'comment',
                    id: comment.id,
                    targetTitle: `تعليق من @${comment.authorUsername}: "${comment.content.slice(0, 25)}..."`
                  })}
                  className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>حذف التعليق</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. تبويب المغردين وشارات التوثيق الثلاث الرسمية */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredProfiles.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-zinc-500 text-xs bg-[#111111] border border-[#2F3336] rounded-2xl">
              لا يوجد مغردون مطابقون للبحث
            </div>
          ) : (
            filteredProfiles.map(u => (
              <div key={u.id} className="bg-[#111111] border border-[#2F3336] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full border-[2px] border-zinc-800 bg-zinc-900 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-lg">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white">{u.full_name?.[0] || '؟'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-white text-sm truncate">{u.full_name || 'مستخدم يمن ريتنج'}</p>
                      {u.verification_type && u.verification_type !== 'none' && (
                        <VerifiedBadge type={u.verification_type} size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5" dir="ltr">@{u.username || 'user'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleBlockUser(u)}
                    className={`p-2 rounded-xl border text-xs font-bold transition ${
                      u.is_blocked 
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title={u.is_blocked ? 'فك حظر الحساب' : 'حظر الحساب'}
                  >
                    {u.is_blocked ? <UserX size={15} /> : <UserCheck size={15} />}
                  </button>

                  {/* قائمة شارات التوثيق الثلاث الرسمية */}
                  <select
                    value={u.verification_type || (u.is_verified ? 'blue' : 'none')}
                    onChange={(e) => handleUpdateBadge(u.id, e.target.value as any)}
                    className="bg-black border border-[#2F3336] rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#FFC500]"
                  >
                    <option value="none">⚪ بدون توثيق</option>
                    <option value="blue">🔷 شارة زرقاء (شخصي)</option>
                    <option value="gold">🟡 شارة ذهبية (جهة/شركة)</option>
                    <option value="gray">🔘 شارة رمادية (رسمي)</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. تبويب البلاغات المربوطة */}
      {activeTab === 'reports' && (
        <div className="space-y-3.5">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs bg-[#111111] border border-[#2F3336] rounded-2xl">
              لا توجد بلاغات على المجتمع حالياً 🎉
            </div>
          ) : (
            filteredReports.map(rep => (
              <div key={rep.id} className="bg-[#111111] border border-rose-500/20 rounded-2xl p-4.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      🚨 بلاغ عن {rep.reported_item_type === 'account' || rep.reported_item_type === 'user' ? 'حساب' : 'تغريدة'}
                    </span>
                    <span className="text-xs text-zinc-400">المُبلّغ: {rep.reporter_name || 'فاعل خير'}</span>
                    <span className="text-xs text-zinc-600">· {new Date(rep.created_at).toLocaleDateString('ar-YE')}</span>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${
                    rep.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    الحالة: {rep.status === 'PENDING' ? 'قيد المراجعة' : rep.status}
                  </span>
                </div>

                <div className="text-sm">
                  <p className="text-white font-bold"><span className="text-rose-400">السبب:</span> {rep.reason}</p>
                  {rep.details && <p className="text-zinc-400 text-xs mt-1">التفاصيل: {rep.details}</p>}
                </div>

                {/* ربط المحتوى المبلغ عنه */}
                {rep.targetPost && (
                  <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs">
                        {rep.targetPost.authorAvatar ? (
                          <img src={rep.targetPost.authorAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{rep.targetPost.authorName?.[0]}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white">{rep.targetPost.authorName}</span>
                        <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{rep.targetPost.content}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setConfirmDeleteModal({
                        open: true,
                        type: 'post',
                        id: rep.targetPost!.id,
                        targetTitle: `التغريدة المبلغ عنها: "${rep.targetPost!.content.slice(0, 25)}..."`
                      })}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition active:scale-95"
                    >
                      <Trash2 size={13} />
                      <span>حذف التغريدة</span>
                    </button>
                  </div>
                )}

                {rep.targetUser && (
                  <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold">
                        {rep.targetUser.avatar_url ? (
                          <img src={rep.targetUser.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{rep.targetUser.full_name?.[0]}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">{rep.targetUser.full_name}</p>
                        <p className="text-[11px] text-zinc-500 font-mono" dir="ltr">@{rep.targetUser.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBlockUser(rep.targetUser!)}
                        className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold"
                      >
                        {rep.targetUser.is_blocked ? 'إلغاء حظر' : 'حظر الحساب'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 justify-end">
                  {rep.status === 'PENDING' ? (
                    <button
                      onClick={() => setResolvingReport(rep)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <span>اتخاذ قرار على البلاغ ✍️</span>
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500 font-bold">تم البت في البلاغ ({rep.status})</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. تبويب سجل إجراءات الإشراف (Audit Logs) */}
      {activeTab === 'logs' && (
        <div className="bg-[#111111] border border-[#2F3336] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#2F3336] flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="text-[#FFC500]" size={16} />
              <span>سجل قرارات وإجراءات المشرفين</span>
            </h3>
            <span className="text-xs text-zinc-500">غير قابل للتعديل</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs">لا توجد إجراءات مسجلة في الجلسة حتى الآن</div>
          ) : (
            <div className="divide-y divide-[#2F3336]/40">
              {auditLogs.map(log => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-bold bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/20">
                        {log.action_type}
                      </span>
                      <span className="font-bold text-white">{log.admin_name}</span>
                      <span className="text-zinc-500">({log.admin_email})</span>
                    </div>
                    <p className="text-zinc-300">{log.details}</p>
                  </div>
                  <span className="text-zinc-500 text-[11px] shrink-0">
                    {new Date(log.created_at).toLocaleString('ar-YE')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* نافذة تأكيد الحذف النهائي */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold text-white">تأكيد الحذف النهائي الصارم</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              أنت على وشك حذف {confirmDeleteModal.targetTitle} بشكل نهائي من قاعدة البيانات. لن يتمكن أي مستخدم من استعادته.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDeleteModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition"
              >
                إلغاء
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition active:scale-95"
              >
                نعم، احذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة اتخاذ القرار وتوثيقه في البلاغ */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-blue-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">اتخاذ قرار وتوثيقه في البلاغ</h3>
              <button onClick={() => setResolvingReport(null)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="text-zinc-400">سبب البلاغ:</span> <span className="font-bold text-white">{resolvingReport.reason}</span></p>
              {resolvingReport.details && <p><span className="text-zinc-400">التفاصيل:</span> {resolvingReport.details}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">ملاحظات وقرار المشرف (تُحفظ في السجل):</label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="اكتب حيثيات القرار هنا..."
                className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FFC500] min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => submitReportDecision('DISMISSED')}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition"
              >
                رفض البلاغ (كيدي)
              </button>

              {resolvingReport.targetPost && (
                <button
                  onClick={() => submitReportDecision('RESOLVED', true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition active:scale-95"
                >
                  قبول وحذف التغريدة
                </button>
              )}

              <button
                onClick={() => submitReportDecision('RESOLVED', false)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition active:scale-95"
              >
                قبول البلاغ (تمت المعالجة)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة معاينة التغريدة */}
      {previewPost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{previewPost.authorName}</span>
                <span className="text-xs text-zinc-500" dir="ltr">@{previewPost.authorUsername}</span>
              </div>
              <button onClick={() => setPreviewPost(null)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{previewPost.content}</p>

            {previewPost.image_url && (
              <img src={previewPost.image_url} alt="" className="w-full rounded-xl max-h-64 object-cover" />
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewPost(null)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 text-xs font-bold text-white"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
