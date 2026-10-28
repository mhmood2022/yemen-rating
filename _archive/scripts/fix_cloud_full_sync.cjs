const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. تحديث استعلام المنشورات في loadData لجلب التعليقات والإعجابات السحابية الحقيقية
const startSync = code.indexOf("// 3. جلب أحدث المنشورات من Supabase في الخلفية وتحديث الصفحة بسلاسة");
const endSync = code.indexOf("setTweets(cloudTweets);", startSync);

if (startSync !== -1 && endSync !== -1) {
  const afterSet = code.indexOf(";", endSync);
  
  const fullSyncBlock = `// 3. جلب أحدث المنشورات والتعليقات الحقيقية من Supabase
      try {
        const { data: dbPosts, error: postErr } = await supabase
          .from('posts')
          .select('id, user_id, content, image_url, likes_count, comments_count, reposts_count, views_count, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!postErr && dbPosts && dbPosts.length > 0) {
          const postIds = dbPosts.map((p: any) => p.id);
          const userIds = [...new Set(dbPosts.map((p: any) => p.user_id))];

          // جلب بيانات الحسابات من جدول profiles
          const { data: dbProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', userIds);

          const profileMap = new Map();
          (dbProfiles || []).forEach((prof: any) => profileMap.set(prof.id, prof));

          // جلب التعليقات السحابية الحقيقية المرتبطة بهذه المنشورات
          const { data: dbComments } = await supabase
            .from('post_comments')
            .select('id, post_id, user_id, content, created_at')
            .in('post_id', postIds)
            .order('created_at', { ascending: true });

          // جلب بروفايلات أصحاب التعليقات
          const commentUserIds = [...new Set((dbComments || []).map((c: any) => c.user_id))];
          if (commentUserIds.length > 0) {
            const { data: commentProfiles } = await supabase
              .from('profiles')
              .select('id, full_name, username, avatar_url')
              .in('id', commentUserIds);

            (commentProfiles || []).forEach((cp: any) => {
              if (!profileMap.has(cp.id)) profileMap.set(cp.id, cp);
            });
          }

          // تجميع التعليقات لكل منشور
          const commentsByPost = new Map();
          (dbComments || []).forEach((c: any) => {
            const cAuthor = profileMap.get(c.user_id);
            const commentObj: Comment = {
              id: c.id,
              authorId: c.user_id,
              authorName: c.authorName || cAuthor?.full_name || 'مستخدم',
              authorUsername: c.authorUsername || cAuthor?.username || 'user',
              authorAvatar: c.authorAvatar || cAuthor?.avatar_url || '',
              text: c.content,
              createdAt: new Date(c.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
            };
            if (!commentsByPost.has(c.post_id)) commentsByPost.set(c.post_id, []);
            commentsByPost.get(c.post_id).push(commentObj);
          });

          // جلب إعجابات المستخدم الحالي لمعرفة المنشورات التي أعجب بها
          let userLikedPostIds = new Set();
          if (uid) {
            const { data: myLikes } = await supabase
              .from('post_likes')
              .select('post_id')
              .eq('user_id', uid);
            (myLikes || []).forEach((l: any) => userLikedPostIds.add(l.post_id));
          }

          const cloudTweets: Tweet[] = dbPosts.map((p: any) => {
            const author = profileMap.get(p.user_id);
            const postComments = commentsByPost.get(p.id) || [];
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
              likedBy: userLikedPostIds.has(p.id) ? [uid] : [],
              reposts: p.reposts_count || 0,
              repostedBy: [],
              views: p.views_count || 1,
              comments: postComments
            };
          });

          setTweets(cloudTweets);
          safeSetStorage(GLOBAL_FEED_KEY, cloudTweets);`;

  code = code.slice(0, startSync) + fullSyncBlock + code.slice(afterSet + 1);
  fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
  console.log('SUCCESS_FULL_CLOUD_POSTS_AND_COMMENTS_SYNCED');
} else {
  console.log('SYNC_BLOCK_NOT_FOUND', { startSync, endSync });
}
