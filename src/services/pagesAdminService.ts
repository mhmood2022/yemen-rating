import { supabase } from '../lib/supabase';
import {
  AdsCoverageKind,
  BadgeKind,
  PageDetailBundle,
  PageKind,
  PagesDashboardStats,
  PageStatusKind,
  PageSummaryRow,
  PeriodPreset,
  SubscriptionCycle,
  SubscriptionStatusKind,
} from '../types/adminAccountsPages';
import {
  computeDateRange,
  normalizeAccountStatus,
  normalizeBadge,
  resolveSubscriptionCycle,
  resolveSubscriptionStatus,
} from './accountsAdminService';

export function normalizePageStatus(b: any): PageStatusKind {
  if (b?.is_hidden || String(b?.status || '').toLowerCase() === 'hidden') return 'hidden';
  if (b?.is_active === false || String(b?.status || '').toLowerCase() === 'suspended') return 'suspended';
  if (String(b?.status || '').toLowerCase() === 'pending') return 'pending';
  return 'active';
}

export function normalizePageKind(b: any): PageKind {
  const pk = String(b?.page_kind || '').toLowerCase();
  if (pk === 'company' || pk === 'businessman' || pk === 'business') return pk as PageKind;
  if (b?.business_type === 'COMPANY') return 'company';
  return 'business';
}

export async function fetchPagesDashboardData(
  period: PeriodPreset = '30d',
  includeLegacy = false,
  customFrom?: string,
  customTo?: string
): Promise<{ rows: PageSummaryRow[]; stats: PagesDashboardStats }> {
  let bizQuery = supabase.from('businesses').select('*').order('created_at', { ascending: false });
  if (!includeLegacy) {
    bizQuery = bizQuery.eq('is_x_page', true);
  }

  const [
    bizRes,
    profilesRes,
    catsRes,
    pageAdminsRes,
    bizFollowsRes,
    bizFollowersRes,
    postsRes,
    commentsRes,
    reviewsRes,
    subsRes,
    plansRes,
    adsRes,
    pubAdsRes,
    reportsRes,
    supportMsgsRes,
    adminReqsRes,
  ] = await Promise.allSettled([
    bizQuery,
    supabase.from('profiles').select('id, full_name, username, avatar_url, status, is_blocked, moderation_status, can_post, can_interact'),
    supabase.from('categories').select('id, name'),
    supabase.from('page_admins').select('*').eq('is_active', true),
    supabase.from('business_follows').select('business_id, follower_id'),
    supabase.from('business_followers').select('business_id, user_id'),
    supabase.from('posts').select('id, business_id, likes_count, comments_count, reposts_count').not('business_id', 'is', null),
    supabase.from('post_comments').select('id, post_id'),
    supabase.from('reviews').select('id, entity_id, stars, is_hidden'),
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
    supabase.from('subscription_plans').select('*'),
    supabase.from('ads').select('id, advertiser_id, business_id, ad_type, status'),
    supabase.from('published_ads').select('id, ad_kind, is_sponsor, status, business_id, data'),
    supabase.from('reports').select('id, reporter_id, reported_item_type, reported_item_id, reported_user_id, status'),
    supabase.from('support_messages').select('id, business_id, is_read_by_admin'),
    supabase.from('admin_requests').select('id, type, target_id, target_type, status').in('type', ['support', 'report']),
  ]);

  const val = <T,>(r: PromiseSettledResult<{ data: T | null }>, fallback: T): T =>
    r.status === 'fulfilled' && r.value?.data ? r.value.data : fallback;

  const businesses = val<any[]>(bizRes as any, []);
  const profiles = val<any[]>(profilesRes as any, []);
  const categories = val<any[]>(catsRes as any, []);
  const pageAdmins = val<any[]>(pageAdminsRes as any, []);
  const bizFollows = val<any[]>(bizFollowsRes as any, []);
  const bizFollowers = val<any[]>(bizFollowersRes as any, []);
  const posts = val<any[]>(postsRes as any, []);
  const comments = val<any[]>(commentsRes as any, []);
  const reviews = val<any[]>(reviewsRes as any, []);
  const subs = val<any[]>(subsRes as any, []);
  const plans = val<any[]>(plansRes as any, []);
  const ads = val<any[]>(adsRes as any, []);
  const pubAds = val<any[]>(pubAdsRes as any, []);
  const reports = val<any[]>(reportsRes as any, []);
  const supportMsgs = val<any[]>(supportMsgsRes as any, []);
  const adminReqs = val<any[]>(adminReqsRes as any, []);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const planMap = new Map(plans.map((p) => [p.id, p]));

  // المسؤولون المفوضون لكل صفحة
  const adminsByBiz = new Map<string, Array<{ user_id: string; full_name: string; username: string; role: string }>>();
  pageAdmins.forEach((pa) => {
    const prof = profileMap.get(pa.user_id);
    if (!adminsByBiz.has(pa.business_id)) adminsByBiz.set(pa.business_id, []);
    adminsByBiz.get(pa.business_id)!.push({
      user_id: pa.user_id,
      full_name: prof?.full_name || 'مسؤول',
      username: prof?.username || 'admin',
      role: pa.role || 'admin',
    });
  });

  // المتابعون الفعليون لكل صفحة (دمج business_follows + business_followers بدون تكرار)
  const followerSetsByBiz = new Map<string, Set<string>>();
  bizFollows.forEach((f) => {
    if (!f.business_id || !f.follower_id) return;
    if (!followerSetsByBiz.has(f.business_id)) followerSetsByBiz.set(f.business_id, new Set());
    followerSetsByBiz.get(f.business_id)!.add(f.follower_id);
  });
  bizFollowers.forEach((f) => {
    if (!f.business_id || !f.user_id) return;
    if (!followerSetsByBiz.has(f.business_id)) followerSetsByBiz.set(f.business_id, new Set());
    followerSetsByBiz.get(f.business_id)!.add(f.user_id);
  });

  // المنشورات والتفاعلات
  const postToBiz = new Map<string, string>();
  const postStatsByBiz = new Map<string, { posts: number; interactions: number; commentsInPosts: number }>();
  posts.forEach((p) => {
    if (!p.business_id) return;
    postToBiz.set(p.id, p.business_id);
    const cur = postStatsByBiz.get(p.business_id) || { posts: 0, interactions: 0, commentsInPosts: 0 };
    cur.posts += 1;
    cur.interactions += Number(p.likes_count || 0) + Number(p.reposts_count || 0);
    cur.commentsInPosts += Number(p.comments_count || 0);
    postStatsByBiz.set(p.business_id, cur);
  });

  const commentCountByBiz = new Map<string, number>();
  comments.forEach((c) => {
    const bid = postToBiz.get(c.post_id);
    if (bid) commentCountByBiz.set(bid, (commentCountByBiz.get(bid) || 0) + 1);
  });

  // التقييمات
  const reviewsByBiz = new Map<string, { count: number; sum: number }>();
  reviews.forEach((r) => {
    if (!r.entity_id || r.is_hidden) return;
    const cur = reviewsByBiz.get(r.entity_id) || { count: 0, sum: 0 };
    cur.count += 1;
    cur.sum += Number(r.stars || 0);
    reviewsByBiz.set(r.entity_id, cur);
  });

  // الاشتراكات المرتبطة بالصفحة (مباشرة عبر business_id أو عبر حساب المالك)
  const subByBiz = new Map<string, any>();
  const subByUser = new Map<string, any>();
  subs.forEach((s) => {
    if (s.business_id && !subByBiz.has(s.business_id)) subByBiz.set(s.business_id, s);
    if (s.user_id && !subByUser.has(s.user_id)) subByUser.set(s.user_id, s);
  });

  // الإعلانات
  const adInfoByBiz = new Map<string, { banner: boolean; text: boolean; active: number }>();
  const recordBizAd = (bid: string | null | undefined, kind: 'banner' | 'text', isActive: boolean) => {
    if (!bid) return;
    const cur = adInfoByBiz.get(bid) || { banner: false, text: false, active: 0 };
    if (kind === 'banner') cur.banner = true;
    else cur.text = true;
    if (isActive) cur.active += 1;
    adInfoByBiz.set(bid, cur);
  };
  ads.forEach((a) => {
    const bid = a.business_id || a.advertiser_id;
    const kind = a.ad_type === 'in_feed' ? 'text' : 'banner';
    recordBizAd(bid, kind, a.status === 'published');
  });
  pubAds.forEach((pa) => {
    const d = pa?.data || {};
    const bid = pa.business_id || d.businessId;
    const isText = pa.ad_kind === 'sponsor' || pa.is_sponsor || d.adKind === 'sponsor';
    recordBizAd(bid, isText ? 'text' : 'banner', pa.status === 'active');
  });

  // البلاغات على الصفحات أو منشوراتها
  const reportsReceivedByBiz = new Map<string, number>();
  const reportsSubmittedByBiz = new Map<string, number>();
  reports.forEach((r) => {
    const targetBid =
      (r.reported_item_type === 'business' || r.reported_item_type === 'page' ? r.reported_item_id : null) ||
      (r.reported_item_type === 'post' ? postToBiz.get(r.reported_item_id) : null);
    if (targetBid) {
      reportsReceivedByBiz.set(targetBid, (reportsReceivedByBiz.get(targetBid) || 0) + 1);
    }
  });
  adminReqs
    .filter((r) => r.type === 'report' && r.target_id)
    .forEach((r) => {
      reportsReceivedByBiz.set(r.target_id, (reportsReceivedByBiz.get(r.target_id) || 0) + 1);
    });

  // الدعم
  const supportByBiz = new Map<string, { total: number; open: number }>();
  supportMsgs.forEach((m) => {
    if (!m.business_id) return;
    const cur = supportByBiz.get(m.business_id) || { total: 0, open: 0 };
    cur.total += 1;
    if (!m.is_read_by_admin) cur.open += 1;
    supportByBiz.set(m.business_id, cur);
  });
  adminReqs
    .filter((r) => r.type === 'support' && r.target_id)
    .forEach((r) => {
      const cur = supportByBiz.get(r.target_id) || { total: 0, open: 0 };
      cur.total += 1;
      if (!['closed', 'resolved', 'rejected'].includes(String(r.status || '').toLowerCase())) cur.open += 1;
      supportByBiz.set(r.target_id, cur);
    });

  const rows: PageSummaryRow[] = businesses.map((b) => {
    const owner = b.owner_id ? profileMap.get(b.owner_id) : null;
    const adminsList = adminsByBiz.get(b.id) || [];
    const realFollowers = Math.max(followerSetsByBiz.get(b.id)?.size || 0, Number(b.followers_count || 0));
    const pStats = postStatsByBiz.get(b.id) || { posts: 0, interactions: 0, commentsInPosts: 0 };
    const totalComments = Math.max(commentCountByBiz.get(b.id) || 0, pStats.commentsInPosts);
    const rev = reviewsByBiz.get(b.id);
    const revCount = rev ? rev.count : Number(b.review_count || 0);
    const avgRating = rev && rev.count > 0 ? Number((rev.sum / rev.count).toFixed(1)) : Number(b.rating || 0);

    const sub = subByBiz.get(b.id) || (b.owner_id ? subByUser.get(b.owner_id) : null);
    const plan = sub ? planMap.get(sub.plan_id) : null;
    const subStatus: SubscriptionStatusKind = sub
      ? resolveSubscriptionStatus(sub)
      : b.subscription_status && b.subscription_status !== 'none'
      ? (b.subscription_status as SubscriptionStatusKind)
      : 'none';
    const subCycle: SubscriptionCycle = sub
      ? resolveSubscriptionCycle(sub, plan)
      : b.subscription_tier === 'yearly'
      ? 'yearly'
      : b.subscription_tier && b.subscription_tier !== 'free'
      ? 'monthly'
      : 'free';

    const adInfo = adInfoByBiz.get(b.id);
    const adsCoverage: AdsCoverageKind = !adInfo
      ? 'none'
      : adInfo.banner && adInfo.text
      ? 'both'
      : adInfo.banner
      ? 'banner'
      : 'text';

    const sup = supportByBiz.get(b.id);

    return {
      id: b.id,
      name: b.name || 'صفحة',
      slug: b.slug || '',
      logo_url: b.logo_url || null,
      cover_url: b.cover_url || null,
      description: b.description || null,
      business_type: b.business_type || 'SHOP',
      page_kind: normalizePageKind(b),
      category_name: b.category_id ? catMap.get(b.category_id) || null : null,
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
      owner_id: b.owner_id || null,
      owner_name: owner?.full_name || null,
      owner_username: owner?.username || null,
      owner_avatar: owner?.avatar_url || null,
      owner_status: owner ? normalizeAccountStatus(owner) : null,
      admins_count: adminsList.length,
      admins_preview: adminsList,
      followers_count: realFollowers,
      posts_count: pStats.posts,
      reviews_count: revCount,
      avg_rating: avgRating,
      comments_count: totalComments,
      interactions_count: pStats.interactions,
      is_verified: Boolean(b.is_verified),
      badge_type: normalizeBadge(b.badge_type, b.is_verified),
      verified_at: b.verified_at || null,
      verification_expires_at: b.verification_expires_at || null,
      verification_reason: b.verification_reason || null,
      verified_by_user_id: b.verified_by_user_id || null,
      subscription_cycle: subCycle,
      subscription_status: subStatus,
      subscription_plan_name: plan?.name || (subCycle !== 'free' ? 'باقة اشتراك' : null),
      subscription_expires_at: sub?.end_date || b.subscription_expires_at || null,
      ads_coverage: adsCoverage,
      active_ads_count: adInfo?.active || 0,
      reports_submitted_count: reportsSubmittedByBiz.get(b.id) || 0,
      reports_received_count: reportsReceivedByBiz.get(b.id) || 0,
      support_tickets_count: sup?.total || 0,
      support_open_count: sup?.open || 0,
      is_x_page: Boolean(b.is_x_page),
      is_hidden: Boolean(b.is_hidden),
      is_active: b.is_active !== false,
      status: normalizePageStatus(b),
      suspension_reason: b.suspension_reason || null,
      created_at: b.created_at,
      updated_at: b.updated_at || b.created_at,
    };
  });

  const { start, end, prevStart, prevEnd } = computeDateRange(period, customFrom, customTo);
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

  const topFollowed = [...rows].sort((a, b) => b.followers_count - a.followers_count).slice(0, 3);
  const topRated = [...rows]
    .filter((r) => r.reviews_count > 0 || r.avg_rating > 0)
    .sort((a, b) => b.avg_rating - a.avg_rating || b.reviews_count - a.reviews_count)
    .slice(0, 3);

  const stats: PagesDashboardStats = {
    total: rows.length,
    newInPeriod,
    prevPeriodNew,
    growthPct,
    active: rows.filter((r) => r.status === 'active').length,
    verified: rows.filter((r) => r.is_verified && r.badge_type !== 'none').length,
    subscribed: rows.filter((r) => r.subscription_status === 'active').length,
    expiredSubscriptions: rows.filter((r) => r.subscription_status === 'expired').length,
    withActiveAds: rows.filter((r) => r.active_ads_count > 0).length,
    suspendedOrHidden: rows.filter((r) => r.status === 'suspended' || r.status === 'hidden').length,
    withReports: rows.filter((r) => r.reports_received_count > 0).length,
    topFollowed,
    topRated,
  };

  return { rows, stats };
}

export async function fetchPageDetailBundle(page: PageSummaryRow): Promise<PageDetailBundle> {
  const bid = page.id;

  const [
    ownerRes,
    verifierRes,
    adminsRes,
    historyRes,
    transfersRes,
    postsRes,
    bizFollowsRes,
    bizFollowersRes,
    reviewsRes,
    subsRes,
    plansRes,
    adsRes,
    pubAdsRes,
    reportsRes,
    supportRes,
    logsRes,
    usersRes,
  ] = await Promise.allSettled([
    page.owner_id ? supabase.from('profiles').select('*').eq('id', page.owner_id).maybeSingle() : Promise.resolve({ data: null }),
    page.verified_by_user_id
      ? supabase.from('profiles').select('id, full_name').eq('id', page.verified_by_user_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('page_admins').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
    supabase.from('page_ownership_history').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
    supabase.from('page_transfer_requests').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
    supabase.from('posts').select('*').eq('business_id', bid).order('created_at', { ascending: false }).limit(100),
    supabase.from('business_follows').select('follower_id, created_at').eq('business_id', bid).limit(100),
    supabase.from('business_followers').select('user_id, created_at').eq('business_id', bid).limit(100),
    supabase.from('reviews').select('*').eq('entity_id', bid).order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
    supabase.from('subscription_plans').select('*').order('price', { ascending: true }),
    supabase.from('ads').select('*').order('created_at', { ascending: false }),
    supabase.from('published_ads').select('*').order('created_at', { ascending: false }),
    supabase.from('reports').select('*').order('created_at', { ascending: false }),
    supabase.from('support_messages').select('*').eq('business_id', bid).order('created_at', { ascending: false }),
    supabase
      .from('admin_moderation_logs')
      .select('*')
      .in('target_type', ['page', 'review', 'post', 'ad', 'subscription'])
      .order('created_at', { ascending: false })
      .limit(120),
    supabase.from('profiles').select('id, full_name, username, email, avatar_url').order('created_at', { ascending: false }).limit(200),
  ]);

  const val = <T,>(r: PromiseSettledResult<any>, fallback: T): T =>
    r.status === 'fulfilled' && r.value?.data !== undefined && r.value?.data !== null ? r.value.data : fallback;

  const ownerProfile = val<any>(ownerRes, null);
  const verifierProfile = val<any>(verifierRes, null);
  const rawAdmins = val<any[]>(adminsRes, []);
  const rawHistory = val<any[]>(historyRes, []);
  const transferRequests = val<any[]>(transfersRes, []);
  const posts = val<any[]>(postsRes, []);
  const rawFollows1 = val<any[]>(bizFollowsRes, []);
  const rawFollows2 = val<any[]>(bizFollowersRes, []);
  const reviews = val<any[]>(reviewsRes, []);
  const allSubs = val<any[]>(subsRes, []);
  const plans = val<any[]>(plansRes, []);
  const allAds = val<any[]>(adsRes, []);
  const allPubAds = val<any[]>(pubAdsRes, []);
  const allReports = val<any[]>(reportsRes, []);
  const supportTickets = val<any[]>(supportRes, []);
  const rawLogs = val<any[]>(logsRes, []);
  const candidateUsers = val<any[]>(usersRes, []);

  const userMap = new Map(candidateUsers.map((u) => [u.id, u]));

  const admins = rawAdmins.map((a) => {
    const prof = userMap.get(a.user_id);
    return {
      id: a.id,
      user_id: a.user_id,
      role: a.role,
      permissions: a.permissions || { can_post: true, can_reply_reviews: true, can_edit_info: false, can_manage_ads: false },
      is_active: a.is_active !== false,
      created_at: a.created_at,
      full_name: prof?.full_name || 'مستخدم',
      username: prof?.username || 'user',
      avatar_url: prof?.avatar_url,
      email: prof?.email,
    };
  });

  const ownershipHistory = rawHistory.map((h) => ({
    ...h,
    previous_owner_name: h.previous_owner_id ? userMap.get(h.previous_owner_id)?.full_name || h.previous_owner_id : '—',
    new_owner_name: h.new_owner_id ? userMap.get(h.new_owner_id)?.full_name || h.new_owner_id : '—',
  }));

  const followerSet = new Map<string, string>();
  rawFollows1.forEach((f) => {
    if (f.follower_id && !followerSet.has(f.follower_id)) followerSet.set(f.follower_id, f.created_at);
  });
  rawFollows2.forEach((f) => {
    if (f.user_id && !followerSet.has(f.user_id)) followerSet.set(f.user_id, f.created_at);
  });
  const followers = Array.from(followerSet.entries()).map(([uid, created_at]) => {
    const prof = userMap.get(uid);
    return {
      id: uid,
      full_name: prof?.full_name || 'متابع',
      username: prof?.username || 'user',
      avatar_url: prof?.avatar_url,
      created_at,
    };
  });

  const postIds = posts.map((p) => p.id);
  let comments: any[] = [];
  if (postIds.length > 0) {
    const { data: comms } = await supabase
      .from('post_comments')
      .select('*')
      .in('post_id', postIds)
      .order('created_at', { ascending: false })
      .limit(100);
    comments = comms || [];
  }

  const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const s = Math.max(1, Math.min(5, Math.round(Number(r.stars || 5))));
    ratingDistribution[s] = (ratingDistribution[s] || 0) + 1;
  });

  const planMap = new Map(plans.map((p) => [p.id, p]));
  const subscriptions = allSubs
    .filter((s) => s.business_id === bid || (page.owner_id && s.user_id === page.owner_id))
    .map((s) => ({ ...s, plan: planMap.get(s.plan_id) || null }));

  let payments: any[] = [];
  if (page.owner_id) {
    const { data: pays } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', page.owner_id)
      .order('created_at', { ascending: false });
    payments = pays || [];
  }

  const pageAds = [
    ...allAds
      .filter((a) => a.business_id === bid || a.advertiser_id === bid)
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
      .filter((pa) => pa.business_id === bid || pa?.data?.businessId === bid)
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

  const postIdSet = new Set(postIds);
  const reviewIdSet = new Set(reviews.map((r) => r.id));
  const reports = allReports.filter(
    (r) =>
      ((r.reported_item_type === 'business' || r.reported_item_type === 'page') && r.reported_item_id === bid) ||
      (r.reported_item_type === 'post' && postIdSet.has(r.reported_item_id)) ||
      (r.reported_item_type === 'review' && reviewIdSet.has(r.reported_item_id))
  );

  const moderationLogs = rawLogs.filter(
    (l) =>
      (l.target_type === 'page' && l.target_id === bid) ||
      (l.target_type === 'post' && postIdSet.has(l.target_id)) ||
      (l.target_type === 'review' && reviewIdSet.has(l.target_id))
  );

  return {
    page,
    ownerProfile,
    verifierProfile,
    admins,
    ownershipHistory,
    transferRequests,
    posts,
    comments,
    followers,
    reviews,
    ratingDistribution,
    subscriptions,
    payments,
    ads: pageAds,
    reports,
    supportTickets,
    moderationLogs,
    plans,
    candidateUsers,
  };
}

export async function moderatePageRpc(params: {
  businessId: string;
  action: 'edit_info' | 'hide' | 'unhide' | 'suspend' | 'pending' | 'activate';
  reason: string;
  name?: string;
  slug?: string;
  city?: string;
  phone?: string;
  description?: string;
  pageKind?: PageKind;
}) {
  const { data, error } = await supabase.rpc('admin_moderate_page', {
    p_business_id: params.businessId,
    p_action: params.action,
    p_reason: params.reason,
    p_name: params.name ?? null,
    p_slug: params.slug ?? null,
    p_city: params.city ?? null,
    p_phone: params.phone ?? null,
    p_description: params.description ?? null,
    p_page_kind: params.pageKind ?? null,
  });
  if (error) throw error;
  return data;
}

export async function verifyPageRpc(params: {
  businessId: string;
  badgeType: 'gold' | 'silver' | 'blue' | 'none';
  reason: string;
  expiresAt?: string | null;
}) {
  const { data, error } = await supabase.rpc('admin_verify_page', {
    p_business_id: params.businessId,
    p_badge_type: params.badgeType,
    p_reason: params.reason,
    p_expires_at: params.expiresAt ?? null,
  });
  if (error) throw error;
  return data;
}

export async function transferPageOwnershipRpc(params: {
  businessId: string;
  newOwnerId: string;
  actionType: 'transfer' | 'admin_assign' | 'owner_lost_recovery';
  reason: string;
}) {
  const { data, error } = await supabase.rpc('admin_transfer_page_ownership', {
    p_business_id: params.businessId,
    p_new_owner_id: params.newOwnerId,
    p_action_type: params.actionType,
    p_reason: params.reason,
  });
  if (error) throw error;
  return data;
}

export async function managePageAdminRpc(params: {
  businessId: string;
  userId: string;
  operation: 'upsert' | 'remove';
  role?: 'admin' | 'editor' | 'moderator';
  reason: string;
}) {
  const { error } = await supabase.rpc('admin_manage_page_admin', {
    p_business_id: params.businessId,
    p_user_id: params.userId,
    p_operation: params.operation,
    p_role: params.role ?? 'admin',
    p_reason: params.reason,
  });
  if (error) throw error;
}

export async function updatePageAdminPermissions(params: {
  adminRowId: string;
  businessId: string;
  userId: string;
  permissions: { can_post: boolean; can_reply_reviews: boolean; can_edit_info: boolean; can_manage_ads: boolean };
  reason: string;
}) {
  const { error } = await supabase
    .from('page_admins')
    .update({ permissions: params.permissions, updated_at: new Date().toISOString() })
    .eq('id', params.adminRowId);
  if (error) throw error;

  const { data: userData } = await supabase.auth.getUser();
  await supabase.from('admin_moderation_logs').insert({
    actor_id: userData?.user?.id || null,
    actor_name: userData?.user?.email || 'مشرف',
    actor_email: userData?.user?.email || null,
    target_type: 'page',
    target_id: params.businessId,
    target_name: 'صلاحيات مسؤول مفوض',
    action_type: 'update_page_admin_permissions',
    reason: params.reason.trim() || 'تعديل صلاحيات مفوض الصفحة',
    new_value: { user_id: params.userId, permissions: params.permissions },
  });
}

export async function resolvePageTransferRequest(params: {
  request: any;
  decision: 'approved' | 'rejected';
  reason: string;
}) {
  const req = params.request;
  if (params.decision === 'approved') {
    await transferPageOwnershipRpc({
      businessId: req.business_id,
      newOwnerId: req.to_user_id,
      actionType: req.request_kind === 'owner_recovery' ? 'owner_lost_recovery' : 'transfer',
      reason: params.reason,
    });
  }

  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('page_transfer_requests')
    .update({
      status: params.decision,
      reviewed_by: userData?.user?.id || null,
      review_note: params.reason.trim(),
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', req.id);
  if (error) throw error;

  if (params.decision === 'rejected') {
    await supabase.from('admin_moderation_logs').insert({
      actor_id: userData?.user?.id || null,
      actor_name: userData?.user?.email || 'مشرف',
      actor_email: userData?.user?.email || null,
      target_type: 'page',
      target_id: req.business_id,
      target_name: 'طلب نقل ملكية',
      action_type: 'reject_transfer_request',
      reason: params.reason.trim(),
      new_value: { request_id: req.id, to_user_id: req.to_user_id },
    });
  }
}

export async function replyBusinessSupportMessage(businessId: string, text: string) {
  const clean = text.trim();
  if (!clean) throw new Error('يرجى كتابة نص الرد');
  const { error } = await supabase.from('support_messages').insert({
    business_id: businessId,
    sender: 'admin',
    sender_name: 'إدارة يمن ريتنج',
    text: clean,
    is_read_by_admin: true,
  });
  if (error) throw error;
  await supabase
    .from('support_messages')
    .update({ is_read_by_admin: true })
    .eq('business_id', businessId)
    .eq('is_read_by_admin', false);
}

export async function moderateReviewRpc(reviewId: string, hide: boolean, reason: string) {
  const { error } = await supabase.rpc('admin_moderate_review', {
    p_review_id: reviewId,
    p_hide: hide,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function moderateAdRpc(sourceTable: 'ads' | 'published_ads', adId: string, action: 'pause' | 'activate', reason: string) {
  const { error } = await supabase.rpc('admin_moderate_ad', {
    p_source_table: sourceTable,
    p_ad_id: adId,
    p_action: action,
    p_reason: reason,
  });
  if (error) throw error;
}

export function exportPagesToCsv(rows: PageSummaryRow[]) {
  const headers = [
    'المعرف',
    'الاسم',
    'الرابط',
    'نوع الصفحة',
    'المالك',
    'المسؤولون',
    'المتابعون',
    'المنشورات',
    'التقييمات',
    'المتوسط',
    'التوثيق',
    'الاشتراك',
    'حالة الاشتراك',
    'الإعلانات',
    'البلاغات',
    'الدعم',
    'الحالة',
    'تاريخ الإنشاء',
  ];
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(','),
    ...rows.map((r) =>
      [
        r.id,
        r.name,
        r.slug,
        r.page_kind,
        r.owner_name || 'بدون مالك',
        r.admins_count,
        r.followers_count,
        r.posts_count,
        r.reviews_count,
        r.avg_rating,
        r.badge_type,
        r.subscription_cycle,
        r.subscription_status,
        r.ads_coverage,
        r.reports_received_count,
        r.support_tickets_count,
        r.status,
        r.created_at,
      ]
        .map(escape)
        .join(',')
    ),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yemen-rating-pages-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface PagePickerItem {
  id: string;
  name: string;
  slug: string;
  page_kind: PageKind;
  status: PageStatusKind;
  owner_id: string | null;
  logo_url: string | null;
}

export async function fetchPagesPickerList(): Promise<PagePickerItem[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, page_kind, business_type, status, is_active, is_hidden, owner_id, logo_url, is_x_page')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((b: any) => ({
    id: b.id,
    name: b.name || 'صفحة بدون اسم',
    slug: b.slug || '',
    page_kind: normalizePageKind(b),
    status: normalizePageStatus(b),
    owner_id: b.owner_id || null,
    logo_url: b.logo_url || null,
  }));
}

export async function createAdminBusinessPage(params: {
  name: string;
  slug?: string;
  pageKind: PageKind;
  city?: string;
  phone?: string;
  description?: string;
  ownerId?: string | null;
}): Promise<any> {
  const cleanName = params.name.trim();
  if (!cleanName) throw new Error('يرجى إدخال اسم الصفحة');

  const rawSlug = (params.slug || '').trim().replace(/^@+/, '').replace(/\s+/g, '_').toLowerCase();
  const cleanSlug = rawSlug || `page_${Date.now().toString(36)}`;

  const payload: Record<string, any> = {
    name: cleanName,
    slug: cleanSlug,
    page_kind: params.pageKind,
    business_type: params.pageKind === 'company' ? 'COMPANY' : 'SHOP',
    city: params.city?.trim() || 'صنعاء',
    phone: params.phone?.trim() || null,
    description: params.description?.trim() || null,
    owner_id: params.ownerId || null,
    is_x_page: true,
    is_active: true,
    is_hidden: false,
    is_verified: false,
    badge_type: 'none',
    rating: 0,
    review_count: 0,
    followers_count: 0,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('businesses')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;

  const { data: userData } = await supabase.auth.getUser();
  if (params.ownerId) {
    await supabase
      .from('profiles')
      .update({ account_type: 'owner', updated_at: new Date().toISOString() })
      .eq('id', params.ownerId);

    await supabase.from('page_ownership_history').insert({
      business_id: data.id,
      previous_owner_id: null,
      new_owner_id: params.ownerId,
      action_type: 'initial',
      reason: 'إنشاء الصفحة وربطها بالحساب من لوحة الإدارة',
      performed_by: userData?.user?.id || null,
      performed_by_email: userData?.user?.email || null,
    });
  }

  await supabase.from('admin_moderation_logs').insert({
    actor_id: userData?.user?.id || null,
    actor_name: userData?.user?.email || 'مشرف',
    actor_email: userData?.user?.email || null,
    target_type: 'page',
    target_id: data.id,
    target_name: cleanName,
    action_type: 'create_page',
    reason: 'إنشاء صفحة جديدة من لوحة الإدارة',
    new_value: { name: cleanName, slug: cleanSlug, page_kind: params.pageKind, owner_id: params.ownerId || null },
  });

  return data;
}

export async function unlinkPageOwner(params: { businessId: string; reason: string }) {
  const cleanReason = params.reason.trim() || 'إلغاء ربط المالك من لوحة الإدارة';
  const { data: current, error: readErr } = await supabase
    .from('businesses')
    .select('id, name, owner_id')
    .eq('id', params.businessId)
    .single();
  if (readErr) throw readErr;
  if (!current?.owner_id) {
    throw new Error('هذه الصفحة غير مرتبطة بحساب مالك حالياً.');
  }

  const prevOwnerId = current.owner_id;
  const { error: updErr } = await supabase
    .from('businesses')
    .update({ owner_id: null, updated_at: new Date().toISOString() })
    .eq('id', params.businessId);
  if (updErr) throw updErr;

  const { data: userData } = await supabase.auth.getUser();
  await supabase.from('page_ownership_history').insert({
    business_id: params.businessId,
    previous_owner_id: prevOwnerId,
    new_owner_id: null,
    action_type: 'unlink_owner',
    reason: cleanReason,
    performed_by: userData?.user?.id || null,
    performed_by_email: userData?.user?.email || null,
  });

  await supabase.from('admin_moderation_logs').insert({
    actor_id: userData?.user?.id || null,
    actor_name: userData?.user?.email || 'مشرف',
    actor_email: userData?.user?.email || null,
    target_type: 'page',
    target_id: params.businessId,
    target_name: current.name || 'صفحة',
    action_type: 'unlink_page_owner',
    reason: cleanReason,
    old_value: { owner_id: prevOwnerId },
    new_value: { owner_id: null },
  });
}
