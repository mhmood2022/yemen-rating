import { supabase } from '../lib/supabase';
import {
  AccountDetailBundle,
  AccountModerationStatus,
  AccountsDashboardStats,
  AccountSummaryRow,
  AdsCoverageKind,
  BadgeKind,
  PageSummaryRow,
  PeriodPreset,
  ProfileKind,
  SubscriptionCycle,
  SubscriptionStatusKind,
} from '../types/adminAccountsPages';

export function maskEmail(email: string | null | undefined, canViewPrivate: boolean): string {
  if (!email) return '—';
  if (canViewPrivate) return email;
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const head = user.slice(0, 2);
  return `${head}***@${domain}`;
}

export function maskPhone(phone: string | null | undefined, canViewPrivate: boolean): string {
  if (!phone) return '—';
  if (canViewPrivate) return phone;
  if (phone.length <= 4) return '****';
  return `${phone.slice(0, 2)}****${phone.slice(-2)}`;
}

export function normalizeBadge(raw: string | null | undefined, isVerified?: boolean): BadgeKind {
  if (!raw || raw === 'none') return isVerified ? 'blue' : 'none';
  if (raw === 'gray') return 'silver';
  if (raw === 'blue' || raw === 'silver' || raw === 'gold') return raw;
  return isVerified ? 'blue' : 'none';
}

export function normalizeAccountStatus(p: any): AccountModerationStatus {
  const m = String(p?.moderation_status || '').toLowerCase();
  if (m === 'banned' || m === 'suspended' || m === 'restricted' || m === 'active') {
    return m as AccountModerationStatus;
  }
  if (p?.is_blocked) return 'banned';
  const s = String(p?.status || '').toLowerCase();
  if (s === 'disabled') return 'banned';
  if (s === 'suspended') return 'suspended';
  if (p?.can_post === false || p?.can_interact === false) return 'restricted';
  return 'active';
}

export function resolveSubscriptionCycle(sub: any, plan: any): SubscriptionCycle {
  if (!sub) return 'free';
  if (sub.billing_cycle === 'yearly') return 'yearly';
  if (sub.billing_cycle === 'monthly') return 'monthly';
  const days = Number(plan?.duration_days || 0);
  if (days >= 300) return 'yearly';
  if (days > 0) return 'monthly';
  return 'monthly';
}

export function resolveSubscriptionStatus(sub: any): SubscriptionStatusKind {
  if (!sub) return 'none';
  const raw = String(sub.status || '').toUpperCase();
  if (raw === 'CANCELLED' || raw === 'CANCELED') return 'cancelled';
  if (raw === 'PENDING') return 'pending';
  if (raw === 'EXPIRED') return 'expired';
  if (raw === 'ACTIVE') {
    if (sub.end_date && new Date(sub.end_date).getTime() < Date.now()) {
      return 'expired';
    }
    return 'active';
  }
  return 'none';
}

export function computeDateRange(preset: PeriodPreset, customFrom?: string, customTo?: string) {
  const now = new Date();
  let start: Date | null = null;
  let end: Date = now;
  let prevStart: Date | null = null;
  let prevEnd: Date | null = null;

  if (preset === '7d' || preset === '30d' || preset === '90d') {
    const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
    start = new Date(now.getTime() - days * 86400000);
    prevEnd = start;
    prevStart = new Date(start.getTime() - days * 86400000);
  } else if (preset === 'custom' && customFrom) {
    start = new Date(customFrom);
    end = customTo ? new Date(customTo + 'T23:59:59') : now;
    const span = Math.max(86400000, end.getTime() - start.getTime());
    prevEnd = start;
    prevStart = new Date(start.getTime() - span);
  }
  return { start, end, prevStart, prevEnd };
}

function classifyAdKind(ad: any, source: 'ads' | 'published_ads'): 'banner' | 'text' {
  if (source === 'published_ads') {
    const d = ad?.data || {};
    if (ad?.ad_kind === 'sponsor' || ad?.is_sponsor === true || d?.adKind === 'sponsor' || d?.isSponsor) {
      return 'text';
    }
    return 'banner';
  }
  if (ad?.ad_type === 'in_feed') return 'text';
  return 'banner';
}

export async function fetchAccountsDashboardData(
  period: PeriodPreset = '30d',
  customFrom?: string,
  customTo?: string
): Promise<{ rows: AccountSummaryRow[]; stats: AccountsDashboardStats }> {
  const [
    profilesRes,
    followsRes,
    postsRes,
    commentsRes,
    subsRes,
    plansRes,
    adsRes,
    pubAdsRes,
    reportsRes,
    userSupportRes,
    adminReqsRes,
    businessesRes,
    pageAdminsRes,
  ] = await Promise.allSettled([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('follows').select('follower_id, following_id'),
    supabase.from('posts').select('id, user_id, business_id, likes_count, created_at'),
    supabase.from('post_comments').select('id, user_id, created_at'),
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
    supabase.from('subscription_plans').select('*'),
    supabase.from('ads').select('id, advertiser_id, owner_user_id, business_id, ad_type, status'),
    supabase.from('published_ads').select('id, ad_kind, is_sponsor, status, owner_user_id, business_id, data'),
    supabase.from('reports').select('id, reporter_id, reported_user_id, reported_item_type, reported_item_id, status'),
    supabase.from('user_support_messages').select('id, user_id, status, created_at'),
    supabase.from('admin_requests').select('id, type, user_id, status, created_at').in('type', ['support', 'report']),
    supabase.from('businesses').select('id, owner_id, is_x_page'),
    supabase.from('page_admins').select('business_id, user_id, is_active'),
  ]);

  const val = <T,>(res: PromiseSettledResult<{ data: T | null }>, fallback: T): T =>
    res.status === 'fulfilled' && res.value?.data ? res.value.data : fallback;

  const profiles = val<any[]>(profilesRes as any, []);
  const follows = val<any[]>(followsRes as any, []);
  const posts = val<any[]>(postsRes as any, []);
  const comments = val<any[]>(commentsRes as any, []);
  const subs = val<any[]>(subsRes as any, []);
  const plans = val<any[]>(plansRes as any, []);
  const ads = val<any[]>(adsRes as any, []);
  const pubAds = val<any[]>(pubAdsRes as any, []);
  const reports = val<any[]>(reportsRes as any, []);
  const userSupport = val<any[]>(userSupportRes as any, []);
  const adminReqs = val<any[]>(adminReqsRes as any, []);
  const businesses = val<any[]>(businessesRes as any, []);
  const pageAdmins = val<any[]>(pageAdminsRes as any, []);

  const planMap = new Map(plans.map((p) => [p.id, p]));

  // خريطة الصفحات المملوكة لكل مستخدم
  const ownedPageIdsByUser = new Map<string, Set<string>>();
  const businessOwnerMap = new Map<string, string>();
  businesses.forEach((b) => {
    if (b.owner_id) {
      businessOwnerMap.set(b.id, b.owner_id);
      if (!ownedPageIdsByUser.has(b.owner_id)) ownedPageIdsByUser.set(b.owner_id, new Set());
      ownedPageIdsByUser.get(b.owner_id)!.add(b.id);
    }
  });

  const managedPagesByUser = new Map<string, number>();
  pageAdmins.forEach((pa) => {
    if (pa.is_active !== false && pa.user_id) {
      managedPagesByUser.set(pa.user_id, (managedPagesByUser.get(pa.user_id) || 0) + 1);
    }
  });

  // المتابعون والمتابَعون
  const followersCount = new Map<string, number>();
  const followingCount = new Map<string, number>();
  follows.forEach((f) => {
    if (f.following_id) followersCount.set(f.following_id, (followersCount.get(f.following_id) || 0) + 1);
    if (f.follower_id) followingCount.set(f.follower_id, (followingCount.get(f.follower_id) || 0) + 1);
  });

  // المنشورات والإعجابات والمنشورات حسب المؤلف (الشخصية + الإجمالي)
  const postsCount = new Map<string, number>();
  const likesReceived = new Map<string, number>();
  const postOwnerMap = new Map<string, string>();
  const latestActivity = new Map<string, string>();

  const bumpActivity = (uid: string | null | undefined, dt: string | null | undefined) => {
    if (!uid || !dt) return;
    const prev = latestActivity.get(uid);
    if (!prev || new Date(dt).getTime() > new Date(prev).getTime()) {
      latestActivity.set(uid, dt);
    }
  };

  posts.forEach((p) => {
    if (p.id && p.user_id) postOwnerMap.set(p.id, p.user_id);
    if (!p.business_id && p.user_id) {
      postsCount.set(p.user_id, (postsCount.get(p.user_id) || 0) + 1);
      likesReceived.set(p.user_id, (likesReceived.get(p.user_id) || 0) + Number(p.likes_count || 0));
    }
    bumpActivity(p.user_id, p.created_at);
  });

  const commentsCount = new Map<string, number>();
  comments.forEach((c) => {
    if (c.user_id) {
      commentsCount.set(c.user_id, (commentsCount.get(c.user_id) || 0) + 1);
      bumpActivity(c.user_id, c.created_at);
    }
  });

  // الاشتراكات (أحدث اشتراك شخصي أو عام للحساب)
  const latestSubByUser = new Map<string, any>();
  subs.forEach((s) => {
    if (s.user_id && !latestSubByUser.has(s.user_id)) {
      latestSubByUser.set(s.user_id, s);
    }
  });

  // الإعلانات لكل حساب (مباشر أو عبر صفحته)
  const adTypesByUser = new Map<string, { banner: boolean; text: boolean; count: number }>();
  const recordUserAd = (uid: string | null | undefined, kind: 'banner' | 'text') => {
    if (!uid) return;
    const cur = adTypesByUser.get(uid) || { banner: false, text: false, count: 0 };
    if (kind === 'banner') cur.banner = true;
    else cur.text = true;
    cur.count += 1;
    adTypesByUser.set(uid, cur);
  };

  ads.forEach((a) => {
    const kind = classifyAdKind(a, 'ads');
    const uid = a.owner_user_id || businessOwnerMap.get(a.business_id || a.advertiser_id);
    recordUserAd(uid, kind);
  });

  pubAds.forEach((pa) => {
    const kind = classifyAdKind(pa, 'published_ads');
    const d = pa?.data || {};
    const uid = pa.owner_user_id || d.userId || businessOwnerMap.get(pa.business_id || d.businessId);
    recordUserAd(uid, kind);
  });

  // البلاغات
  const reportsSubmitted = new Map<string, number>();
  const reportsReceived = new Map<string, number>();
  reports.forEach((r) => {
    if (r.reporter_id) reportsSubmitted.set(r.reporter_id, (reportsSubmitted.get(r.reporter_id) || 0) + 1);
    const targetUid =
      r.reported_user_id ||
      (r.reported_item_type === 'user' ? r.reported_item_id : null) ||
      (r.reported_item_type === 'post' ? postOwnerMap.get(r.reported_item_id) : null);
    if (targetUid) reportsReceived.set(targetUid, (reportsReceived.get(targetUid) || 0) + 1);
  });

  // الدعم
  const supportMap = new Map<string, { total: number; open: number; latestStatus: string | null; latestAt: string }>();
  const addSupport = (uid: string | null | undefined, status: string | null | undefined, createdAt: string) => {
    if (!uid) return;
    const st = String(status || 'pending').toLowerCase();
    const isOpen = !['replied', 'closed', 'resolved', 'rejected'].includes(st);
    const cur = supportMap.get(uid) || { total: 0, open: 0, latestStatus: null, latestAt: '' };
    cur.total += 1;
    if (isOpen) cur.open += 1;
    if (!cur.latestAt || new Date(createdAt).getTime() > new Date(cur.latestAt).getTime()) {
      cur.latestAt = createdAt;
      cur.latestStatus = st;
    }
    supportMap.set(uid, cur);
  };
  userSupport.forEach((s) => addSupport(s.user_id, s.status, s.created_at));
  adminReqs.filter((r) => r.type === 'support').forEach((r) => addSupport(r.user_id, r.status, r.created_at));

  const rows: AccountSummaryRow[] = profiles.map((p) => {
    const ownedPagesCount = ownedPageIdsByUser.get(p.id)?.size || 0;
    const sub = latestSubByUser.get(p.id);
    const plan = sub ? planMap.get(sub.plan_id) : null;
    const subStatus = sub
      ? resolveSubscriptionStatus(sub)
      : p.subscription_tier && p.subscription_tier !== 'free'
      ? (p.subscription_expires_at && new Date(p.subscription_expires_at).getTime() < Date.now() ? 'expired' : 'active')
      : 'none';
    const subCycle: SubscriptionCycle = sub
      ? resolveSubscriptionCycle(sub, plan)
      : p.subscription_tier === 'yearly'
      ? 'yearly'
      : p.subscription_tier && p.subscription_tier !== 'free'
      ? 'monthly'
      : 'free';

    const adInfo = adTypesByUser.get(p.id);
    const adsCoverage: AdsCoverageKind = !adInfo
      ? 'none'
      : adInfo.banner && adInfo.text
      ? 'both'
      : adInfo.banner
      ? 'banner'
      : 'text';

    const supInfo = supportMap.get(p.id);
    const rawKind = p.profile_kind as ProfileKind | undefined;
    const derivedKind: ProfileKind =
      rawKind && ['personal', 'business_owner', 'businessman'].includes(rawKind)
        ? rawKind
        : ownedPagesCount > 0 || p.account_type === 'owner'
        ? 'business_owner'
        : 'personal';

    const lastAct = p.last_seen || latestActivity.get(p.id) || p.updated_at || p.created_at;

    return {
      id: p.id,
      full_name: p.full_name || p.username || 'مستخدم',
      username: p.username || `user_${String(p.id).slice(0, 6)}`,
      email: p.email || '',
      phone: p.phone || '',
      avatar_url: p.avatar_url || null,
      cover_url: p.cover_url || null,
      bio: p.bio || null,
      city: p.city || p.location || null,
      role: p.role || 'visitor',
      account_type: p.account_type || 'visitor',
      profile_kind: derivedKind,
      followers_count: followersCount.get(p.id) || 0,
      following_count: followingCount.get(p.id) || 0,
      posts_count: postsCount.get(p.id) || 0,
      comments_count: commentsCount.get(p.id) || 0,
      likes_received_count: likesReceived.get(p.id) || 0,
      is_verified: Boolean(p.is_verified),
      badge_type: normalizeBadge(p.verification_type, p.is_verified),
      verified_at: p.verified_at || null,
      verification_expires_at: p.verification_expires_at || null,
      verification_reason: p.verification_reason || null,
      verified_by: p.verified_by || null,
      subscription_cycle: subCycle,
      subscription_status: subStatus,
      subscription_plan_name: plan?.name || (subCycle !== 'free' ? 'باقة اشتراك' : null),
      subscription_expires_at: sub?.end_date || p.subscription_expires_at || null,
      ads_coverage: adsCoverage,
      ads_count: adInfo?.count || 0,
      reports_submitted_count: reportsSubmitted.get(p.id) || 0,
      reports_received_count: reportsReceived.get(p.id) || 0,
      support_tickets_count: supInfo?.total || 0,
      support_open_count: supInfo?.open || 0,
      support_latest_status: supInfo?.latestStatus || null,
      owned_pages_count: ownedPagesCount,
      managed_pages_count: managedPagesByUser.get(p.id) || 0,
      created_at: p.created_at,
      last_activity_at: lastAct || null,
      moderation_status: normalizeAccountStatus(p),
      can_post: p.can_post !== false,
      can_interact: p.can_interact !== false,
      suspended_until: p.suspended_until || null,
      restriction_reason: p.restriction_reason || null,
    };
  });

  // حساب الإحصائيات وفق الفترة الزمنية
  const { start, end, prevStart, prevEnd } = computeDateRange(period, customFrom, customTo);
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  const newInPeriod = rows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    if (start && t < start.getTime()) return false;
    if (t > end.getTime()) return false;
    return true;
  }).length;

  const prevPeriodNew =
    prevStart && prevEnd
      ? rows.filter((r) => {
          const t = new Date(r.created_at).getTime();
          return t >= prevStart.getTime() && t < prevEnd.getTime();
        }).length
      : 0;

  const growthPct =
    prevPeriodNew > 0 ? Math.round(((newInPeriod - prevPeriodNew) / prevPeriodNew) * 100) : newInPeriod > 0 ? 100 : 0;

  const activeCount = rows.filter((r) => {
    if (r.moderation_status !== 'active') return false;
    const act = r.last_activity_at ? new Date(r.last_activity_at).getTime() : 0;
    return act >= thirtyDaysAgo;
  }).length;

  const stats: AccountsDashboardStats = {
    total: rows.length,
    newInPeriod,
    prevPeriodNew,
    growthPct,
    active: activeCount,
    inactive: Math.max(0, rows.filter((r) => r.moderation_status === 'active').length - activeCount),
    verified: rows.filter((r) => r.is_verified && r.badge_type !== 'none').length,
    subscribed: rows.filter((r) => r.subscription_status === 'active').length,
    expiredSubscriptions: rows.filter((r) => r.subscription_status === 'expired').length,
    suspendedOrBanned: rows.filter((r) => r.moderation_status === 'suspended' || r.moderation_status === 'banned').length,
    withReports: rows.filter((r) => r.reports_received_count > 0).length,
  };

  return { rows, stats };
}

export async function fetchAccountDetailBundle(account: AccountSummaryRow): Promise<AccountDetailBundle> {
  const uid = account.id;

  const [
    verifierRes,
    ownedPagesRes,
    managedAdminsRes,
    postsRes,
    commentsRes,
    likesGivenRes,
    repostsRes,
    followersRes,
    followingRes,
    subsRes,
    plansRes,
    paymentsRes,
    proofsRes,
    adsRes,
    pubAdsRes,
    reportsRes,
    supportMsgsRes,
    adminReqSupportRes,
    logsRes,
  ] = await Promise.allSettled([
    account.verified_by
      ? supabase.from('profiles').select('id, full_name, email').eq('id', account.verified_by).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('businesses').select('*').eq('owner_id', uid).order('created_at', { ascending: false }),
    supabase.from('page_admins').select('business_id, role, businesses(name, slug)').eq('user_id', uid).eq('is_active', true),
    supabase.from('posts').select('*').eq('user_id', uid).is('business_id', null).order('created_at', { ascending: false }).limit(100),
    supabase.from('post_comments').select('*, posts(content)').eq('user_id', uid).order('created_at', { ascending: false }).limit(100),
    supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('user_id', uid),
    supabase.from('post_reposts').select('*, posts(content)').eq('user_id', uid).order('created_at', { ascending: false }).limit(50),
    supabase.from('follows').select('follower_id, created_at').eq('following_id', uid).limit(100),
    supabase.from('follows').select('following_id, created_at').eq('follower_id', uid).limit(100),
    supabase.from('subscriptions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    supabase.from('subscription_plans').select('*').order('price', { ascending: true }),
    supabase.from('payments').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    supabase.from('payment_proofs').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    supabase.from('ads').select('*').order('created_at', { ascending: false }),
    supabase.from('published_ads').select('*').order('created_at', { ascending: false }),
    supabase.from('reports').select('*').order('created_at', { ascending: false }),
    supabase.from('user_support_messages').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    supabase.from('admin_requests').select('*').eq('user_id', uid).eq('type', 'support').order('created_at', { ascending: false }),
    supabase.from('admin_moderation_logs').select('*').eq('target_type', 'account').eq('target_id', uid).order('created_at', { ascending: false }).limit(100),
  ]);

  const val = <T,>(r: PromiseSettledResult<any>, fallback: T): T =>
    r.status === 'fulfilled' && r.value?.data !== undefined && r.value?.data !== null ? r.value.data : fallback;

  const verifierProfile = val<any>(verifierRes, null);
  const ownedRaw = val<any[]>(ownedPagesRes, []);
  const managedRaw = val<any[]>(managedAdminsRes, []);
  const posts = val<any[]>(postsRes, []);
  const comments = val<any[]>(commentsRes, []);
  const likesCountGiven =
    likesGivenRes.status === 'fulfilled' && typeof (likesGivenRes.value as any)?.count === 'number'
      ? (likesGivenRes.value as any).count
      : 0;
  const reposts = val<any[]>(repostsRes, []);
  const followerEdges = val<any[]>(followersRes, []);
  const followingEdges = val<any[]>(followingRes, []);
  const subs = val<any[]>(subsRes, []);
  const plans = val<any[]>(plansRes, []);
  const payments = val<any[]>(paymentsRes, []);
  const paymentProofs = val<any[]>(proofsRes, []);
  const [payOrdersRes, payTxRes] = await Promise.allSettled([
    supabase.from('payment_orders').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    supabase.from('payment_transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
  ]);
  const extraOrders = val<any[]>(payOrdersRes, []).map((o: any) => ({
    ...o,
    service_type: o.service_type || o.order_type || 'طلب دفع',
    reference_number: o.reference_number || o.order_number || String(o.id || '').slice(0, 8),
  }));
  const extraTx = val<any[]>(payTxRes, []).map((tx: any) => ({
    ...tx,
    service_type: tx.service_type || tx.transaction_type || 'حركة مالية',
    reference_number: tx.reference_number || tx.tx_ref || String(tx.id || '').slice(0, 8),
  }));
  const mergedPayments = [...payments, ...extraOrders, ...extraTx].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
  const allAds = val<any[]>(adsRes, []);
  const allPubAds = val<any[]>(pubAdsRes, []);
  const allReports = val<any[]>(reportsRes, []);
  const supportMsgs = val<any[]>(supportMsgsRes, []);
  const adminReqSupport = val<any[]>(adminReqSupportRes, []);
  const moderationLogs = val<any[]>(logsRes, []);

  // جلب ملفات المتابعين والمتابَعين
  const followUserIds = Array.from(
    new Set([
      ...followerEdges.map((f) => f.follower_id),
      ...followingEdges.map((f) => f.following_id),
    ].filter(Boolean))
  );
  let followProfileMap = new Map<string, any>();
  if (followUserIds.length > 0) {
    const { data: fProfs } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', followUserIds);
    followProfileMap = new Map((fProfs || []).map((p: any) => [p.id, p]));
  }

  const followers = followerEdges.map((f) => {
    const prof = followProfileMap.get(f.follower_id);
    return {
      id: f.follower_id,
      full_name: prof?.full_name || 'مستخدم',
      username: prof?.username || 'user',
      avatar_url: prof?.avatar_url,
      created_at: f.created_at,
    };
  });

  const following = followingEdges.map((f) => {
    const prof = followProfileMap.get(f.following_id);
    return {
      id: f.following_id,
      full_name: prof?.full_name || 'مستخدم',
      username: prof?.username || 'user',
      avatar_url: prof?.avatar_url,
      created_at: f.created_at,
    };
  });

  const ownedIds = new Set(ownedRaw.map((b) => b.id));
  const accountAds = [
    ...allAds
      .filter((a) => a.owner_user_id === uid || ownedIds.has(a.business_id || a.advertiser_id))
      .map((a) => ({
        id: a.id,
        sourceTable: 'ads',
        title: a.title,
        kind: a.ad_type === 'in_feed' ? 'نصي' : 'بانر',
        placements: Array.isArray(a.placements) ? a.placements : [],
        start_date: a.start_date,
        end_date: a.end_date,
        status: a.status,
        budget: a.budget || '—',
        impressions: a.impressions || 0,
        clicks: a.clicks || 0,
      })),
    ...allPubAds
      .filter((pa) => {
        const d = pa?.data || {};
        return pa.owner_user_id === uid || d.userId === uid || ownedIds.has(pa.business_id || d.businessId);
      })
      .map((pa) => {
        const d = pa?.data || {};
        const isText = pa.ad_kind === 'sponsor' || pa.is_sponsor;
        return {
          id: pa.id,
          sourceTable: 'published_ads',
          title: d.title || pa.sponsor_name || d.advertiserName || `إعلان #${pa.id}`,
          kind: isText ? 'نصي / راعي' : 'بانر',
          placements: pa.target_sections || [pa.placement_id].filter(Boolean),
          start_date: pa.start_date || d.startDate || '—',
          end_date: pa.end_date || d.endDate || '—',
          status: pa.status,
          budget: d.budget || '—',
          impressions: pa.views || 0,
          clicks: pa.clicks || 0,
        };
      }),
  ];

  const myPostIds = new Set(posts.map((p) => p.id));
  const reportsSubmitted = allReports.filter((r) => r.reporter_id === uid);
  const reportsReceived = allReports.filter(
    (r) =>
      r.reported_user_id === uid ||
      (r.reported_item_type === 'user' && r.reported_item_id === uid) ||
      (r.reported_item_type === 'post' && myPostIds.has(r.reported_item_id))
  );

  const planMap = new Map(plans.map((p) => [p.id, p]));
  const enrichedSubs = subs.map((s) => ({
    ...s,
    plan: planMap.get(s.plan_id) || null,
  }));

  const ownedPages: PageSummaryRow[] = ownedRaw.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug || '',
    logo_url: b.logo_url || null,
    cover_url: b.cover_url || null,
    description: b.description || null,
    business_type: b.business_type || 'SHOP',
    page_kind: (b.page_kind || 'business') as any,
    category_name: null,
    city: b.city || null,
    address: b.address || null,
    phone: b.phone || null,
    whatsapp: b.whatsapp || null,
    email: b.email || null,
    website: b.website || b.website_url || null,
    working_hours: b.working_hours || null,
    branches: Array.isArray(b.branches) ? b.branches : [],
    map_url: b.map_url || null,
    latitude: b.latitude ?? null,
    longitude: b.longitude ?? null,
    owner_id: b.owner_id,
    owner_name: account.full_name,
    owner_username: account.username,
    owner_avatar: account.avatar_url,
    owner_status: account.moderation_status,
    admins_count: 0,
    admins_preview: [],
    followers_count: Number(b.followers_count || 0),
    posts_count: 0,
    reviews_count: Number(b.review_count || 0),
    avg_rating: Number(b.rating || 0),
    comments_count: 0,
    interactions_count: 0,
    is_verified: Boolean(b.is_verified),
    badge_type: normalizeBadge(b.badge_type, b.is_verified),
    verified_at: b.verified_at || null,
    verification_expires_at: b.verification_expires_at || null,
    verification_reason: b.verification_reason || null,
    verified_by_user_id: b.verified_by_user_id || null,
    subscription_cycle: 'free',
    subscription_status: 'none',
    subscription_plan_name: null,
    subscription_expires_at: null,
    ads_coverage: 'none',
    active_ads_count: 0,
    reports_submitted_count: 0,
    reports_received_count: 0,
    support_tickets_count: 0,
    support_open_count: 0,
    is_x_page: Boolean(b.is_x_page),
    is_hidden: Boolean(b.is_hidden),
    is_active: b.is_active !== false,
    status: (b.status || 'active') as any,
    suspension_reason: b.suspension_reason || null,
    created_at: b.created_at,
    updated_at: b.updated_at,
  }));

  const managedPages = managedRaw.map((m) => ({
    business_id: m.business_id,
    role: m.role,
    page_name: m.businesses?.name || 'صفحة',
    page_slug: m.businesses?.slug || '',
  }));

  const supportTickets = [
    ...supportMsgs.map((s) => ({ ...s, source: 'user_support_messages' })),
    ...adminReqSupport.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      message: `${r.title || ''}\n${r.description || ''}`.trim(),
      status: r.status,
      reply: r.resolution || null,
      assigned_to: r.assigned_to,
      created_at: r.created_at,
      replied_at: r.closed_at,
      source: 'admin_requests',
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    account,
    verifierProfile,
    ownedPages,
    managedPages,
    posts,
    comments,
    likesCountGiven,
    reposts,
    followers,
    following,
    subscriptions: enrichedSubs,
    payments: mergedPayments,
    paymentProofs,
    ads: accountAds,
    reportsSubmitted,
    reportsReceived,
    supportTickets,
    moderationLogs,
    plans,
  };
}

// دوال تنفيذ الإجراءات الإدارية عبر الخادم (RPC)
export async function moderateAccountRpc(params: {
  userId: string;
  action: 'edit_info' | 'change_kind' | 'restrict_posting' | 'restrict_interactions' | 'suspend' | 'ban' | 'activate' | 'unban' | 'lift_suspension' | 'warn';
  reason: string;
  profileKind?: ProfileKind;
  fullName?: string;
  phone?: string;
  city?: string;
  bio?: string;
  suspendedUntil?: string | null;
}) {
  const { data, error } = await supabase.rpc('admin_moderate_account', {
    p_user_id: params.userId,
    p_action: params.action,
    p_reason: params.reason,
    p_profile_kind: params.profileKind ?? null,
    p_full_name: params.fullName ?? null,
    p_phone: params.phone ?? null,
    p_city: params.city ?? null,
    p_bio: params.bio ?? null,
    p_suspended_until: params.suspendedUntil ?? null,
  });
  if (error) throw error;
  return data;
}

export async function verifyAccountRpc(params: {
  userId: string;
  badgeType: 'blue' | 'silver' | 'gold' | 'none';
  reason: string;
  expiresAt?: string | null;
}) {
  const { data, error } = await supabase.rpc('admin_verify_account', {
    p_user_id: params.userId,
    p_badge_type: params.badgeType,
    p_reason: params.reason,
    p_expires_at: params.expiresAt ?? null,
  });
  if (error) throw error;
  return data;
}

export async function manageSubscriptionRpc(params: {
  action: 'activate' | 'cancel' | 'expire';
  reason: string;
  subscriptionId?: string | null;
  userId?: string | null;
  businessId?: string | null;
  planId?: string | null;
  durationDays?: number;
}) {
  const { data, error } = await supabase.rpc('admin_manage_subscription', {
    p_action: params.action,
    p_reason: params.reason,
    p_subscription_id: params.subscriptionId ?? null,
    p_user_id: params.userId ?? null,
    p_business_id: params.businessId ?? null,
    p_plan_id: params.planId ?? null,
    p_duration_days: params.durationDays ?? 30,
  });
  if (error) throw error;
  return data;
}

export async function moderatePostRpc(postId: string, hide: boolean, reason: string) {
  const { error } = await supabase.rpc('admin_moderate_post', {
    p_post_id: postId,
    p_hide: hide,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function replyUserSupportMessage(id: string, reply: string) {
  const { error } = await supabase
    .from('user_support_messages')
    .update({ reply: reply.trim(), status: 'replied', replied_at: new Date().toISOString(), is_read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function replyAdminRequestTicket(requestId: string, note: string, closeTicket = false) {
  const clean = note.trim();
  if (!clean) throw new Error('يرجى كتابة نص الرد');
  const { error } = await supabase.rpc('apply_request_action', {
    p_request_id: requestId,
    p_action: closeTicket ? 'close' : 'note',
    p_new_status: closeTicket ? 'closed' : null,
    p_reason: clean,
    p_assigned_to: null,
    p_note: clean,
  });
  if (error) throw error;
}

export async function resolveReportAction(reportId: string, status: 'resolved' | 'dismissed' | 'reviewing', note?: string) {
  const { data: userData } = await supabase.auth.getUser();
  const { data: existingRep } = await supabase
    .from('reports')
    .select('details')
    .eq('id', reportId)
    .maybeSingle();
  const nextDetails = note?.trim()
    ? (existingRep?.details ? `${existingRep.details}\n[قرار الإدارة]: ${note.trim()}` : `[قرار الإدارة]: ${note.trim()}`)
    : existingRep?.details;

  const { error } = await supabase
    .from('reports')
    .update({
      status,
      reviewed_by: userData?.user?.id || null,
      reviewed_at: new Date().toISOString(),
      ...(nextDetails !== undefined ? { details: nextDetails } : {}),
    })
    .eq('id', reportId);
  if (error) throw error;

  await supabase.from('admin_moderation_logs').insert({
    actor_id: userData?.user?.id || null,
    actor_name: userData?.user?.email || 'مشرف',
    actor_email: userData?.user?.email || null,
    target_type: 'report',
    target_id: reportId,
    target_name: 'بلاغ',
    action_type: status === 'resolved' ? 'resolve_report' : status === 'dismissed' ? 'dismiss_report' : 'review_report',
    reason: note?.trim() || status,
    new_value: { status },
  });
}
