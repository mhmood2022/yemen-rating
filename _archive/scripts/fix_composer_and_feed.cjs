const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. تصليح مربع كتابة التغريدة بإزالة onClick الخاطئ الذي سبب الانهيار
const brokenComposerDiv = `<div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => { const tag = (e.target as HTMLElement).tagName; if (tag !== "BUTTON" && tag !== "A" && tag !== "SVG" && tag !== "PATH") setViewingDetailTweet(tweet); }}>`;
const fixedComposerDiv = `<div className="flex-1 min-w-0">`;

if (code.includes(brokenComposerDiv)) {
  code = code.replace(brokenComposerDiv, fixedComposerDiv);
  console.log('SUCCESS_FIXED_COMPOSER_CRASH');
} else {
  // بديل أمان للبحث
  code = code.replace(/<div className="flex-1 min-w-0 cursor-pointer"[^>]*?>\s*<textarea/g, '<div className="flex-1 min-w-0">\n              <textarea');
  console.log('APPLIED_COMPOSER_FALLBACK_FIX');
}

// 2. تحديث استعلام المنشورات في loadData ليعرض المنشورات دائماً بدون أخطاء العلاقات
const startFetchBlock = code.indexOf("// جلب التغريدات السحابية الدائمة من قاعدة بيانات Supabase");
const endFetchBlock = code.indexOf("loadData();", startFetchBlock);

if (startFetchBlock !== -1 && endFetchBlock !== -1) {
  const newFetchCode = `// جلب التغريدات السحابية الدائمة من قاعدة بيانات Supabase
      try {
        const { data: dbPosts, error: fetchErr } = await supabase
          .from('posts')
          .select('id, user_id, content, image_url, likes_count, comments_count, reposts_count, views_count, created_at')
          .order('created_at', { ascending: false });

        if (!fetchErr && dbPosts && dbPosts.length > 0) {
          // جلب بيانات البروفايلات للمغردين
          const userIds = [...new Set(dbPosts.map((p: any) => p.user_id))];
          const { data: dbProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', userIds);

          const profileMap = new Map();
          (dbProfiles || []).forEach((prof: any) => profileMap.set(prof.id, prof));

          const cloudTweets: Tweet[] = dbPosts.map((p: any) => {
            const author = profileMap.get(p.user_id);
            return {
              id: p.id,
              authorId: p.user_id,
              authorName: author?.full_name || 'مستخدم يمن ريتنج',
              authorUsername: author?.username || 'user',
              authorAvatar: author?.avatar_url || '',
              text: p.content,
              image: p.image_url || undefined,
              createdAt: new Date(p.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
              likes: p.likes_count || 0,
              likedBy: [],
              reposts: p.reposts_count || 0,
              repostedBy: [],
              views: p.views_count || 1,
              comments: []
            };
          });

          setTweets(cloudTweets);
          safeSetStorage(GLOBAL_FEED_KEY, cloudTweets);
        } else {
          // إذا كان جدول السيرفر فارغاً حالياً، نعرض التغريدات المحفوظة محلياً
          const localSaved = localStorage.getItem(GLOBAL_FEED_KEY);
          if (localSaved) setTweets(JSON.parse(localSaved));
        }
      } catch (err) {
        console.warn('Could not load cloud feed, fallback to local:', err);
        const localSaved = localStorage.getItem(GLOBAL_FEED_KEY);
        if (localSaved) setTweets(JSON.parse(localSaved));
      }
    };
    `;

  code = code.slice(0, startFetchBlock) + newFetchCode + code.slice(endFetchBlock);
  console.log('SUCCESS_FIXED_COMMUNITY_FEED_QUERY');
}

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
