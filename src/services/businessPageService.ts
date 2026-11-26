import { WorkingSchedule } from '../utils/workingHours';
import { supabase } from '../lib/supabase';
import { checkUserActionAllowed, uploadSocialImage } from './socialService';

export interface BusinessBranchItem {
  name: string;
  map_url?: string;
  phone?: string;
}

export interface BusinessPageRecord {
  id: string;
  ownerId: string;
  name: string;
  username: string;
  businessType: string;
  categoryId?: string | null;
  categoryName?: string;
  categoryShortName?: string;
  city: string;
  address?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  mapUrl?: string;
  workingHours?: string;
  workingSchedule?: WorkingSchedule | null;
  branches?: BusinessBranchItem[];
  description: string;
  avatarUrl: string;
  coverUrl: string;
  isVerified: boolean;
  verificationType: string;
  rating: number;
  reviewCount: number;
  followersCount: number;
  createdAt?: string;
}

export interface BusinessReviewRecord {
  id: string;
  businessId: string;
  userId?: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export function mapBusinessToPage(row: any, catOrIdx?: string | number, arrOrShort?: string | any[]): BusinessPageRecord {
  const catName = typeof catOrIdx === "string" ? catOrIdx : "";
  const shortName = typeof arrOrShort === "string" ? arrOrShort : "";
  const rawBadge = row?.badge_type || row?.verified_badge_type;
  const verificationType =
    rawBadge && rawBadge !== 'none'
      ? rawBadge
      : row?.is_verified
      ? 'gold'
      : 'none';

  let sec = row?.sections_config || {};
  if (typeof sec === 'string') { try { sec = JSON.parse(sec); } catch { sec = {}; } }
  return {
    id: row.id,
    ownerId: row.owner_id || row.claimed_by_user_id || row.claimed_by || '',
    name: row.name || 'صفحة منشأة',
    username: row.slug || row.username || 'business',
    businessType: row.business_type || 'SHOP',
    categoryId: row.category_id || null,
    categoryName: catName || '',
    categoryShortName: shortName || row?.sub_category || catName || '',
    city: row.city || 'صنعاء',
    address: row.address || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    website: row.website_url || row.website || '',
    mapUrl: row.map_url || '',
    workingHours: row.working_hours || '',
    workingSchedule: sec?.working_schedule || null,
    branches: Array.isArray(row.branches) ? row.branches : [],
    description: row.description || '',
    avatarUrl: row.logo_url || '',
    coverUrl: row.cover_url || '',
    isVerified: Boolean(row.is_verified),
    verificationType,
    rating: Number(row.rating || 0),
    reviewCount: Number(row.review_count || 0),
    followersCount: Number(row.followers_count || 0),
    createdAt: row.created_at,
  };
}

async function hydrateBusiness(row: any): Promise<BusinessPageRecord> {
  if (!row?.category_id) return mapBusinessToPage(row);
  const { data: cat } = await supabase.from('categories').select('name, short_name').eq('id', row.category_id).maybeSingle();
  return mapBusinessToPage(row, cat?.name || '', (cat as any)?.short_name || '');
}

async function dataUrlToUploadUrl(dataUrl: string, folder: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl || '';
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `biz_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
    return await uploadSocialImage(file, folder);
  } catch (err) {
    console.warn('business image upload fallback:', err);
    return '';
  }
}

export async function getMyBusinessPage(userId: string): Promise<BusinessPageRecord | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return await hydrateBusiness(data);
}

export async function getBusinessPageById(businessIdOrSlug: string): Promise<BusinessPageRecord | null> {
  if (!businessIdOrSlug) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessIdOrSlug);

  let query = supabase.from('businesses').select('*');
  query = isUuid ? query.eq('id', businessIdOrSlug) : query.eq('slug', businessIdOrSlug);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return await hydrateBusiness(data);
}

export async function createBusinessPage(
  ownerId: string,
  draft: {
    name: string;
    username: string;
    businessType: string;
    categoryId?: string | null;
    subCategory?: string;
    city: string;
    phone: string;
    description: string;
    avatarUrl: string;
    coverUrl: string;
  }
): Promise<{ page: BusinessPageRecord | null; error?: string }> {
  try {
    const uploadedLogo = draft.avatarUrl ? await dataUrlToUploadUrl(draft.avatarUrl, 'businesses') : '';
    const uploadedCover = draft.coverUrl ? await dataUrlToUploadUrl(draft.coverUrl, 'businesses') : '';

    const cleanSlug =
      draft.username
        .trim()
        .replace(/^@+/, '')
        .replace(/\s+/g, '_')
        .toLowerCase() || `biz_${Date.now()}`;

    const payload: Record<string, any> = {
      owner_id: ownerId,
      name: draft.name.trim(),
      slug: cleanSlug,
      business_type: draft.businessType || 'SHOP',
      category_id: draft.categoryId || null,
      sub_category: draft.subCategory || null,
      city: draft.city || 'صنعاء',
      phone: draft.phone?.trim() || null,
      description: draft.description?.trim() || null,
      logo_url: uploadedLogo || null,
      cover_url: uploadedCover || null,
      is_verified: false,
      badge_type: 'none',
    is_x_page: true,
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

    if (error) {
      if (error.code === '23505') {
        return { page: null, error: 'معرّف المنشأة مستخدم مسبقاً، اختر معرّفاً آخر' };
      }
      return { page: null, error: error.message };
    }

    return { page: await hydrateBusiness(data) };
  } catch (err: any) {
    return { page: null, error: err?.message || 'حدث خطأ أثناء إنشاء الصفحة' };
  }
}

export async function updateBusinessPage(
  businessId: string,
  ownerId: string,
  updates: {
    name?: string;
    username?: string;
    city?: string;
    phone?: string;
    description?: string;
    avatarUrl?: string;
    coverUrl?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    mapUrl?: string;
    workingHours?: string;
    workingSchedule?: WorkingSchedule | null;
    branches?: BusinessBranchItem[];
  }
): Promise<{ ok: boolean; page?: BusinessPageRecord; error?: string }> {
  if (!businessId || !ownerId) {
    return { ok: false, error: 'معرّف المنشأة أو المالك غير متوفر' };
  }
  const payload: Record<string, any> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.username !== undefined) payload.slug = updates.username.replace(/^@+/, '').trim().toLowerCase();
  if (updates.city !== undefined) payload.city = updates.city;
  if (updates.phone !== undefined) payload.phone = updates.phone || null;
  if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp || null;
  if (updates.email !== undefined) payload.email = updates.email || null;
  if (updates.website !== undefined) { payload.website_url = updates.website || null; payload.website = updates.website || null; }
  if (updates.mapUrl !== undefined) payload.map_url = updates.mapUrl || null;
  if (updates.workingHours !== undefined) payload.working_hours = updates.workingHours || null;
  if (updates.workingSchedule !== undefined) {
    const { data: cur } = await supabase.from('businesses').select('sections_config').eq('id', businessId).maybeSingle();
    let curSec = cur?.sections_config || {};
    if (typeof curSec === 'string') { try { curSec = JSON.parse(curSec); } catch { curSec = {}; } }
    payload.sections_config = { ...curSec, working_hours: updates.workingHours || null, working_schedule: updates.workingSchedule };
  }
  if (updates.branches !== undefined) payload.branches = updates.branches;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.avatarUrl !== undefined) payload.logo_url = updates.avatarUrl;
  if (updates.coverUrl !== undefined) payload.cover_url = updates.coverUrl;

  const { data, error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', businessId)
    .eq('owner_id', ownerId)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'معرّف المنشأة مستخدم مسبقاً' };
    return { ok: false, error: error.message };
  }
  if (!data) return { ok: false, error: 'لم يتم تحديث أي صف في businesses' };
  return { ok: true, page: await hydrateBusiness(data) };
}

export async function getBusinessPosts(businessId: string, currentUserId?: string): Promise<any[]> {
  if (!businessId) return [];
  const biz = await getBusinessPageById(businessId);

  const [{ data: posts, error }, { data: reposts }] = await Promise.all([
    supabase
      .from('posts')
      .select('*')
      .eq('business_id', businessId)
      .or('is_hidden.is.null,is_hidden.eq.false')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('post_reposts')
      .select('id, post_id, user_id, business_id, quote_text, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (error) return [];

  let originalPosts: any[] = [];
  if (reposts && reposts.length > 0) {
    const origIds = [...new Set(reposts.map((r: any) => r.post_id).filter(Boolean))];
    if (origIds.length > 0) {
      const { data: originals } = await supabase
        .from('posts')
        .select('id, user_id, business_id, content, image_url, video_url, likes_count, comments_count, reposts_count, views_count, created_at')
        .in('id', origIds)
        .or('is_hidden.is.null,is_hidden.eq.false');
      originalPosts = originals || [];
    }
  }

  const origUserIds = [...new Set(originalPosts.map((p: any) => p.user_id).filter(Boolean))];
  const origBizIds = [...new Set(originalPosts.map((p: any) => p.business_id).filter(Boolean))];

  const [origProfilesRes, origBizRes] = await Promise.all([
    origUserIds.length > 0
      ? supabase.from('profiles').select('id, full_name, username, avatar_url, verification_type, is_verified').in('id', origUserIds)
      : Promise.resolve({ data: [] as any[] }),
    origBizIds.length > 0
      ? supabase.from('businesses').select('id, name, slug, logo_url, is_verified, badge_type').in('id', origBizIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const origProfileMap = new Map((origProfilesRes.data || []).map((p: any) => [p.id, p]));
  const origBizMap = new Map((origBizRes.data || []).map((b: any) => [b.id, b]));

  const allPostIds = Array.from(new Set([
    ...(posts || []).map((p: any) => p.id),
    ...originalPosts.map((p: any) => p.id),
  ]));

  let likedSet = new Set<string>();
  let repostedSet = new Set<string>();
  if (currentUserId && allPostIds.length > 0) {
    const [{ data: likes }, { data: myReposts }] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', allPostIds),
      supabase.from('post_reposts').select('post_id').eq('user_id', currentUserId).in('post_id', allPostIds),
    ]);
    likedSet = new Set((likes || []).map((l: any) => l.post_id));
    repostedSet = new Set((myReposts || []).map((r: any) => r.post_id));
  }

  const directPosts = (posts || []).map((p: any) => ({
    id: p.id,
    parent_id: p.parent_id,
    user_id: p.user_id,
    authorId: p.user_id,
    businessId: p.business_id,
    isBusinessPost: true,
    authorName: biz?.name || 'منشأة',
    authorUsername: biz?.username || 'business',
    authorAvatar: biz?.avatarUrl || '',
    authorBadge: biz?.verificationType || 'none',
    badgeType: biz?.verificationType || 'none',
    text: p.content,
    content: p.content,
    image: p.image_url || undefined,
    image_url: p.image_url,
    video: p.video_url || undefined,
    video_url: p.video_url || undefined,
    createdAt: p.created_at,
    created_at: p.created_at,
    createdAtDisplay: new Date(p.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    likes: p.likes_count || 0,
    likedBy: likedSet.has(p.id) && currentUserId ? [currentUserId] : [],
    isLiked: likedSet.has(p.id),
    reposts: p.reposts_count || 0,
    repostedBy: repostedSet.has(p.id) && currentUserId ? [currentUserId] : [],
    isReposted: repostedSet.has(p.id),
    replies: p.comments_count || 0,
    views: p.views_count || 1,
  }));

  const repostItems = (reposts || []).map((r: any) => {
    const orig = originalPosts.find((p: any) => p.id === r.post_id);
    const origBiz = orig?.business_id ? origBizMap.get(orig.business_id) : null;
    const origProf = orig ? origProfileMap.get(orig.user_id) : null;
    const origName = origBiz ? origBiz.name : (origProf?.full_name || 'مستخدم');
    const origUser = origBiz ? (origBiz.slug || 'business') : (origProf?.username || 'user');
    const origAvatar = origBiz ? (origBiz.logo_url || '') : (origProf?.avatar_url || '');
    const origBadge = origBiz
      ? (origBiz.badge_type && origBiz.badge_type !== 'none' ? origBiz.badge_type : (origBiz.is_verified ? 'gold' : 'none'))
      : (origProf?.verification_type || (origProf?.is_verified ? 'blue' : 'none'));

    if (!r.quote_text) {
      if (!orig) return null;
      return {
        id: `repost-${r.id}`,
        originalId: orig.id,
        user_id: orig.user_id,
        authorId: orig.user_id,
        businessId: orig.business_id || undefined,
        isBusinessPost: Boolean(orig.business_id && origBiz),
        authorName: origName,
        authorUsername: origUser,
        authorAvatar: origAvatar,
        authorBadge: origBadge,
        badgeType: origBadge,
        reposterId: r.user_id,
        reposterName: biz?.name || 'منشأة',
        reposterUsername: biz?.username || 'business',
        text: orig.content || '',
        content: orig.content || '',
        image: orig.image_url || undefined,
        video: orig.video_url || undefined,
        video_url: orig.video_url || undefined,
        createdAt: orig.created_at,
        repostedAt: r.created_at,
        createdAtDisplay: new Date(orig.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        likes: orig.likes_count || 0,
        isLiked: likedSet.has(orig.id),
        likedBy: likedSet.has(orig.id) && currentUserId ? [currentUserId] : [],
        reposts: orig.reposts_count || 0,
        isReposted: true,
        repostedBy: currentUserId ? [currentUserId] : [],
        replies: orig.comments_count || 0,
        views: orig.views_count || 1,
        isRepost: true,
        quote_text: undefined,
        original: null,
      };
    }

    return {
      id: `repost-${r.id}`,
      originalId: orig?.id || r.post_id,
      user_id: r.user_id,
      authorId: r.user_id,
      businessId: businessId,
      isBusinessPost: true,
      authorName: biz?.name || 'منشأة',
      authorUsername: biz?.username || 'business',
      authorAvatar: biz?.avatarUrl || '',
      authorBadge: biz?.verificationType || 'none',
      badgeType: biz?.verificationType || 'none',
      reposterName: biz?.name || 'منشأة',
      reposterUsername: biz?.username || 'business',
      text: r.quote_text,
      content: r.quote_text,
      createdAt: r.created_at,
      repostedAt: r.created_at,
      createdAtDisplay: new Date(r.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      reposts: 0,
      replies: 0,
      views: 1,
      isRepost: true,
      quote_text: r.quote_text,
      original: {
        id: orig?.id || 'deleted',
        authorName: origName,
        authorUsername: origUser,
        authorAvatar: origAvatar,
        authorBadge: origBadge,
        text: orig?.content || 'التغريدة الأصلية غير متاحة',
        image: orig?.image_url || null,
        createdAt: orig?.created_at ? new Date(orig.created_at).toLocaleDateString('ar-YE') : '',
      },
    };
  }).filter(Boolean);

  return [...directPosts, ...repostItems].sort((a: any, b: any) => {
    const da = new Date(a.repostedAt || a.createdAt || 0).getTime();
    const db = new Date(b.repostedAt || b.createdAt || 0).getTime();
    return db - da;
  });
}

export async function getBusinessReviews(businessId: string): Promise<BusinessReviewRecord[]> {
  if (!businessId) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('entity_id', businessId)
    .neq('is_hidden', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((r: any) => ({
    id: r.id,
    businessId: r.entity_id || businessId,
    userId: r.user_id,
    authorName: r.user_name || r.author_name || 'مستخدم',
    authorUsername: r.user_username || '',
    authorAvatar: r.user_avatar || '',
    stars: Number(r.stars ?? r.rating ?? 5),
    comment: r.comment || '',
    createdAt: r.created_at
      ? new Date(r.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
  }));
}

export async function submitBusinessReview(params: {
  businessId: string;
  stars: number;
  comment: string;
}): Promise<{ review?: BusinessReviewRecord; avgRating: number; count: number; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    return { avgRating: 0, count: 0, error: 'يرجى تسجيل الدخول أولاً لإضافة تقييم' };
  }

  const perm = await checkUserActionAllowed(user.id, 'interact');
  if (!perm.allowed) {
    return { avgRating: 0, count: 0, error: perm.reason || 'تم تقييد التفاعل لهذا الحساب' };
  }

  const { data: prof } = await supabase
    .from('profiles')
    .select('full_name, username, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const reviewerName =
    prof?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'مستخدم يمن ريتنج';
  const reviewerUsername =
    prof?.username ||
    user.user_metadata?.username ||
    user.email?.split('@')[0] ||
    '';
  const reviewerAvatar = prof?.avatar_url || user.user_metadata?.avatar_url || '';

  const safeStars = Math.max(1, Math.min(5, Math.round(params.stars)));

  const { data: inserted, error } = await supabase
    .from('reviews')
    .insert({
      entity_id: params.businessId,
      entity_type: 'business',
      user_id: user.id,
      user_name: reviewerName,
      user_username: reviewerUsername,
      user_avatar: reviewerAvatar,
      stars: safeStars,
      comment: params.comment.trim(),
    })
    .select()
    .single();

  if (error) {
    return { avgRating: 0, count: 0, error: error.message };
  }

  const { data: biz } = await supabase
    .from('businesses')
    .select('rating, review_count')
    .eq('id', params.businessId)
    .maybeSingle();

  let avgRating = Number(biz?.rating || 0);
  let count = Number(biz?.review_count || 0);

  if (!count) {
    const { data: allRevs } = await supabase
      .from('reviews')
      .select('stars')
      .eq('entity_id', params.businessId)
      .neq('is_hidden', true);
    const list = allRevs || [];
    count = list.length;
    avgRating = count > 0
      ? Number((list.reduce((a: number, r: any) => a + Number(r.stars || 0), 0) / count).toFixed(1))
      : safeStars;
  }

  return {
    review: {
      id: inserted.id,
      businessId: params.businessId,
      userId: user.id,
      authorName: reviewerName,
      authorUsername: reviewerUsername,
      authorAvatar: reviewerAvatar,
      stars: safeStars,
      comment: params.comment.trim(),
      createdAt: 'الآن',
    },
    avgRating,
    count,
  };
}

export async function checkIsFollowingBusiness(followerId: string, businessId: string): Promise<boolean> {
  if (!followerId || !businessId) return false;
  const { data } = await supabase
    .from('business_follows')
    .select('business_id')
    .eq('follower_id', followerId)
    .eq('business_id', businessId)
    .maybeSingle();
  return !!data;
}

export async function toggleBusinessFollow(followerId: string, businessId: string): Promise<boolean> {
  if (!followerId || !businessId) return false;
  const { data: existing } = await supabase
    .from('business_follows')
    .select('business_id')
    .eq('follower_id', followerId)
    .eq('business_id', businessId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('business_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('business_id', businessId);
    return false;
  } else {
    await supabase
      .from('business_follows')
      .insert({ follower_id: followerId, business_id: businessId });
    return true;
  }
}
