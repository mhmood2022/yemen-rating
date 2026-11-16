import { supabase } from '../lib/supabase';
import { uploadSocialImage } from './socialService';

export interface BusinessPageRecord {
  id: string;
  ownerId: string;
  name: string;
  username: string;
  businessType: string;
  city: string;
  phone: string;
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

export function mapBusinessToPage(row: any): BusinessPageRecord {
  const rawBadge = row?.badge_type || row?.verified_badge_type;
  const verificationType =
    rawBadge && rawBadge !== 'none'
      ? rawBadge
      : row?.is_verified
      ? 'gold'
      : 'none';

  return {
    id: row.id,
    ownerId: row.owner_id || row.claimed_by || '',
    name: row.name || 'صفحة منشأة',
    username: row.slug || row.username || 'business',
    businessType: row.business_type || 'SHOP',
    city: row.city || 'صنعاء',
    phone: row.phone || '',
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
  return mapBusinessToPage(data);
}

export async function getBusinessPageById(businessIdOrSlug: string): Promise<BusinessPageRecord | null> {
  if (!businessIdOrSlug) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessIdOrSlug);

  let query = supabase.from('businesses').select('*');
  query = isUuid ? query.eq('id', businessIdOrSlug) : query.eq('slug', businessIdOrSlug);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return mapBusinessToPage(data);
}

export async function createBusinessPage(
  ownerId: string,
  draft: {
    name: string;
    username: string;
    businessType: string;
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
      city: draft.city || 'صنعاء',
      phone: draft.phone?.trim() || null,
      description: draft.description?.trim() || null,
      logo_url: uploadedLogo || null,
      cover_url: uploadedCover || null,
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

    if (error) {
      if (error.code === '23505') {
        return { page: null, error: 'معرّف المنشأة مستخدم مسبقاً، اختر معرّفاً آخر' };
      }
      return { page: null, error: error.message };
    }

    return { page: mapBusinessToPage(data) };
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
  }
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, any> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.username !== undefined) payload.slug = updates.username.replace(/^@+/, '').trim();
  if (updates.city !== undefined) payload.city = updates.city;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.avatarUrl !== undefined) payload.logo_url = updates.avatarUrl;
  if (updates.coverUrl !== undefined) payload.cover_url = updates.coverUrl;

  const { error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', businessId)
    .eq('owner_id', ownerId);

  return { ok: !error, error: error?.message };
}

export async function getBusinessPosts(businessId: string, currentUserId?: string): Promise<any[]> {
  if (!businessId) return [];
  const biz = await getBusinessPageById(businessId);

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !posts) return [];

  let likedSet = new Set<string>();
  let repostedSet = new Set<string>();
  const postIds = posts.map((p: any) => p.id);

  if (currentUserId && postIds.length > 0) {
    const [{ data: likes }, { data: reposts }] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
      supabase.from('post_reposts').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
    ]);
    likedSet = new Set((likes || []).map((l: any) => l.post_id));
    repostedSet = new Set((reposts || []).map((r: any) => r.post_id));
  }

  return posts.map((p: any) => ({
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
}

export async function getBusinessReviews(businessId: string): Promise<BusinessReviewRecord[]> {
  if (!businessId) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('entity_id', businessId)
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
      .eq('entity_id', params.businessId);
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
