import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  is_verified?: boolean;
  followers_count?: number;
  following_count?: number;
  created_at?: string;
}

export interface PostItem {
  id: string;
  user_id: string;
  content: string;
  image_url?: string | null;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  views_count: number;
  is_pinned?: boolean;
  created_at: string;
  profile?: Profile;
  isLiked?: boolean;
  isReposted?: boolean;
}

export interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  profile?: Profile;
}

// دالة تصغير وضغط الصور
export async function compressImageToUltraLight(file: File, maxDim = 800, quality = 0.72): Promise<Blob> {
  return new Promise((resolve) => {
    if (file.size < 60 * 1024) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

// رفع الصور إلى Supabase Storage
export async function uploadSocialImage(file: File, folder = 'posts'): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('يرجى تسجيل الدخول أولاً لتتمكن من رفع الصور');

  const compressed = await compressImageToUltraLight(file);
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${folder}/${user.id}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('social-media')
    .upload(fileName, compressed, { upsert: true, contentType: 'image/jpeg' });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('social-media')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// التأكد من وجود سجل للمستخدم في profiles
export async function ensureUserProfile(user: any) {
  if (!user?.id) return null;
  try {
    const meta = user.user_metadata || {};
    const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'مستخدم جديد';
    const username = meta.username || user.email?.split('@')[0] || `user_${user.id.substring(0, 6)}`;
    const avatar = meta.avatar_url || '';

    const { data } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      username: username,
      avatar_url: avatar
    }, { onConflict: 'id' }).select().single();

    return data;
  } catch (err) {
    console.warn('ensureUserProfile warn:', err);
    return null;
  }
}

// 1. جلب التايم لاين والمجتمع العام (Global Feed)
export async function getGlobalFeed(currentUserId?: string): Promise<PostItem[]> {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching feed:', error);
    return [];
  }

  if (!currentUserId || !posts?.length) return (posts as PostItem[]) || [];

  // التحقق من الإعجابات للمستخدم الحالي
  const postIds = posts.map(p => p.id);
  const { data: userLikes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', currentUserId)
    .in('post_id', postIds);

  const likedSet = new Set(userLikes?.map(l => l.post_id) || []);

  return posts.map(p => ({
    ...p,
    isLiked: likedSet.has(p.id)
  })) as PostItem[];
}

// 2. جلب الملف الشخصي لأي مستخدم في العالم (User Profile)
export async function getUserProfile(targetUserId: string): Promise<Profile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (error || !profile) return null;

  // جلب إحصائيات المتابعين والمتابعة
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId)
  ]);

  return {
    ...profile,
    followers_count: followersCount || 0,
    following_count: followingCount || 0
  };
}

// 3. تحديث بيانات الملف الشخصي (الغلاف، الصورة، الاسم، النبذة)
export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  return !error;
}

// 4. جلب تغريدات مستخدم معين فقط
export async function getUserPosts(targetUserId: string, currentUserId?: string): Promise<PostItem[]> {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) return [];

  if (!currentUserId || !posts?.length) return (posts as PostItem[]) || [];

  const postIds = posts.map(p => p.id);
  const { data: userLikes } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', currentUserId)
    .in('post_id', postIds);

  const likedSet = new Set(userLikes?.map(l => l.post_id) || []);

  return posts.map(p => ({
    ...p,
    isLiked: likedSet.has(p.id)
  })) as PostItem[];
}

// 5. إنشاء تغريدة جديدة
export async function createPost(userId: string, content: string, imageUrl?: string): Promise<PostItem | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content,
      image_url: imageUrl || null
    })
    .select(`*, profile:profiles(*)`)
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }
  return data as PostItem;
}

// 6. حذف تغريدة
export async function deletePost(postId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId);

  return !error;
}

// 7. التفاعل بالإعجاب (Like / Unlike)
export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id);
    return false; // unliked
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    return true; // liked
  }
}

// 8. المتابعة وإلغاء المتابعة (Follow / Unfollow)
export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  if (followerId === followingId) return false;

  const { data: existing } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
    return false; // unfollowed
  } else {
    await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
    return true; // followed
  }
}

// 9. التحقق من حالة المتابعة
export async function checkIsFollowing(followerId: string, followingId: string): Promise<boolean> {
  if (!followerId || !followingId || followerId === followingId) return false;
  const { data } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return !!data;
}

// 10. التعليقات على التغريدة
export async function getPostComments(postId: string): Promise<CommentItem[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`*, profile:profiles(*)`)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  return error ? [] : (data as CommentItem[]);
}

export async function addPostComment(postId: string, userId: string, content: string): Promise<CommentItem | null> {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content
    })
    .select(`*, profile:profiles(*)`)
    .single();

  return error ? null : (data as CommentItem);
}

// 11. نظام الحظر (Block / اضرب حسابه)
export async function toggleBlockUser(blockerId: string, blockedId: string): Promise<boolean> {
  if (!blockerId || !blockedId || blockerId === blockedId) return false;
  try {
    const { data: existing } = await supabase
      .from('user_blocks')
      .select('*')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .maybeSingle();

    if (existing) {
      await supabase.from('user_blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
      return false; // unblocked
    } else {
      // عند الحظر: نقوم بإلغاء المتابعة المتبادلة بين الطرفين فوراً
      try {
        await supabase.from('follows').delete().eq('follower_id', blockerId).eq('following_id', blockedId);
        await supabase.from('follows').delete().eq('follower_id', blockedId).eq('following_id', blockerId);
      } catch (_) {}
      await supabase.from('user_blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
      return true; // blocked
    }
  } catch (err) {
    console.error('toggleBlockUser error:', err);
    return false;
  }
}

export async function checkIsBlocked(userA: string, userB: string): Promise<boolean> {
  if (!userA || !userB || userA === userB) return false;
  try {
    const { data } = await supabase
      .from('user_blocks')
      .select('blocker_id')
      .or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`)
      .maybeSingle();
    return !!data;
  } catch (_) {
    return false;
  }
}
