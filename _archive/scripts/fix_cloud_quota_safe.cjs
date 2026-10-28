const fs = require('fs');

// 1. تحديث دالة uploadSocialImage في socialService لتشمل الضغط فائق الخفة
const newSocialServiceCode = `import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  is_verified?: boolean;
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

// دالة ضغط الصور الذكية والاقتصادية لحماية مساحة Supabase Quota
export async function compressImageToUltraLight(file: File, maxDim = 800, quality = 0.72): Promise<Blob> {
  return new Promise((resolve) => {
    // إذا كان الملف أصلاً خفيفاً جداً (أقل من 60KB) نتجاوز الضغط
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
          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            'image/jpeg',
            quality
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

// 1. رفع الصور بشكل فوري واقتصادي ومحمي من استهلاك الباقة
export async function uploadSocialImage(file: File, folder = 'posts'): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('يرجى تسجيل الدخول أولاً لتتمكن من رفع الصور');

  // التأكد من تسجيل ملف المستخدم في profiles قبل الرفع
  await ensureUserProfile(user);

  // ضغط الصورة إلى أقل من 90KB للحفاظ الكامل على مساحة قاعدة البيانات
  const compressedBlob = await compressImageToUltraLight(file, folder === 'avatars' ? 400 : 800, 0.72);

  const fileName = \`\${user.id}/\${folder}_\${Date.now()}.jpg\`;

  const { error: uploadError } = await supabase.storage
    .from('social-media')
    .upload(fileName, compressedBlob, {
      upsert: true,
      contentType: 'image/jpeg'
    });

  if (uploadError) {
    throw new Error('فشل رفع الصورة سحابياً: ' + uploadError.message);
  }

  const { data } = supabase.storage
    .from('social-media')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// التأكد من وجود سجل للمستخدم في جدول profiles لمنع أخطاء القيود Foreign Key
export async function ensureUserProfile(user: any) {
  if (!user?.id) return;
  try {
    const meta = user.user_metadata || {};
    const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'مستخدم يمن ريتنج';
    const username = meta.username || user.email?.split('@')[0] || \`user_\${user.id.substring(0, 6)}\`;
    const avatar = meta.avatar_url || '';

    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      username: username,
      avatar_url: avatar
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Could not auto-upsert profile:', err);
  }
}
`;

fs.writeFileSync('src/services/socialService.ts', newSocialServiceCode, 'utf8');
console.log('SUCCESS_UPDATED_SOCIAL_SERVICE_WITH_COMPRESSION');

// 2. تحديث دالة handlePostTweet في CommunityFeedPage.tsx لضمان الحفظ الصريح في Supabase
let feedCode = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

const oldPostLogicStart = feedCode.indexOf("const handlePostTweet = async (e: React.FormEvent) => {");
const oldPostLogicEnd = feedCode.indexOf("showToast('تم نشر تغريدتك وحفظها سحابياً بنجاح! 🚀');");

if (oldPostLogicStart !== -1 && oldPostLogicEnd !== -1) {
  const afterToast = feedCode.indexOf("};", oldPostLogicEnd);
  const newPostLogic = `const handlePostTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = tweetText.trim();
    if (!textToSend && !selectedFile && !tweetImage) {
      showToast('يرجى كتابة نص أو إرفاق صورة أولاً');
      return;
    }

    if (tweetText.length > 280) {
      showToast('تجاوزت الحد الأقصى (280 حرفاً)');
      return;
    }

    // فحص جلسة المستخدم الحقيقية
    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user;

    if (!activeUser) {
      showToast('يجب تسجيل الدخول أولاً لتتمكن من النشر الدائم سحابياً ⚠️');
      return;
    }

    let finalImageUrl: string | null = null;

    // رفع الصورة مضغوطة اقتصادياً إن وجدت
    if (selectedFile) {
      try {
        showToast('جاري ضغط ورفع الصورة سحابياً... ⏳');
        finalImageUrl = await uploadSocialImage(selectedFile, 'tweets');
      } catch (err: any) {
        showToast('تنبيه بالرفع: ' + (err.message || 'تعذر رفع الصورة'));
      }
    }

    // 1. الحفظ السحابي الدائم في جدول posts في Supabase
    showToast('جاري حفظ التغريدة سحابياً... ⏳');
    const { data: insertedPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: activeUser.id,
        content: textToSend,
        image_url: finalImageUrl
      })
      .select('id, user_id, content, image_url, likes_count, comments_count, reposts_count, views_count, created_at')
      .single();

    if (insertError) {
      console.error('Supabase post insert error:', insertError);
      showToast('فشل الحفظ في قاعدة البيانات: ' + insertError.message);
      return;
    }

    // بناء كائن التغريدة بنجاح من قاعدة البيانات
    const newTweet: Tweet = {
      id: insertedPost.id,
      authorId: activeUser.id,
      authorName: myName,
      authorUsername: myUsername,
      authorAvatar: myAvatar,
      text: insertedPost.content,
      image: insertedPost.image_url || undefined,
      createdAt: 'الآن',
      likes: 0,
      likedBy: [],
      reposts: 0,
      repostedBy: [],
      views: 1,
      comments: []
    };

    // إضافة التغريدة للخلاصة المحلية وتحديث الصفحة فوراً
    const updated = [newTweet, ...tweets];
    setTweets(updated);
    safeSetStorage(GLOBAL_FEED_KEY, updated);

    setTweetText('');
    setTweetImage('');
    setSelectedFile(null);
    showToast('تم نشر تغريدتك وحفظها في قاعدة البيانات سحابياً بنجاح! 🚀✅');
  };`;

  feedCode = feedCode.slice(0, oldPostLogicStart) + newPostLogic + feedCode.slice(afterToast + 2);
  fs.writeFileSync('src/pages/CommunityFeedPage.tsx', feedCode, 'utf8');
  console.log('SUCCESS_UPDATED_COMMUNITY_FEED_WITH_EXPLICIT_CLOUD_INSERT');
} else {
  console.log('POST_LOGIC_INDEX_NOT_FOUND', { oldPostLogicStart, oldPostLogicEnd });
}
