const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. تحديث دالة loadData لتعتمد على سحابة Supabase العالمية بشكل قاطع
const startLoad = code.indexOf("const loadData = async () => {");
const endLoad = code.indexOf("loadData();", startLoad);

if (startLoad !== -1 && endLoad !== -1) {
  const newLoadCode = `const loadData = async () => {
      // مزامنة جلسة المستخدم الحالي
      let uid = '';
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          uid = session.user.id;
          setCurrentUserId(session.user.id);
          const meta = session.user.user_metadata || {};
          const usersDir = JSON.parse(localStorage.getItem(USERS_DIR_KEY) || '{}');
          const saved = usersDir[session.user.id] || {};

          setMyName(saved.name || meta.full_name || meta.name || session.user.email?.split('@')[0] || 'مستخدم');
          setMyUsername(saved.username || meta.username || session.user.email?.split('@')[0] || 'user');
          setMyAvatar(saved.avatarUrl || meta.avatar_url || '');

          supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle().then(({ data: p }) => {
            if (p) {
              if (p.full_name && p.full_name !== 'مستخدم جديد') setMyName(p.full_name);
              if (p.username && !p.username.startsWith('user_')) setMyUsername(p.username);
              if (p.avatar_url) setMyAvatar(p.avatar_url);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }

      // جلب جميع تغريدات المجتمع من سحابة Supabase المشتركة لجميع المتصفحات في العالم
      try {
        const { data: dbPosts, error: postErr } = await supabase
          .from('posts')
          .select('id, user_id, content, image_url, likes_count, comments_count, reposts_count, views_count, created_at')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!postErr && dbPosts) {
          const postIds = dbPosts.map((p: any) => p.id);
          const userIds = [...new Set(dbPosts.map((p: any) => p.user_id))];

          const { data: dbProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', userIds);

          const profileMap = new Map();
          (dbProfiles || []).forEach((prof: any) => profileMap.set(prof.id, prof));

          // جلب التعليقات الحقيقية
          const { data: dbComments } = await supabase
            .from('post_comments')
            .select('id, post_id, user_id, content, created_at')
            .in('post_id', postIds)
            .order('created_at', { ascending: true });

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

          const commentsByPost = new Map();
          (dbComments || []).forEach((c: any) => {
            const cAuthor = profileMap.get(c.user_id);
            const commentObj: Comment = {
              id: c.id,
              authorId: c.user_id,
              authorName: cAuthor?.full_name || 'مستخدم',
              authorUsername: cAuthor?.username || 'user',
              authorAvatar: cAuthor?.avatar_url || '',
              text: c.content,
              createdAt: new Date(c.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
            };
            if (!commentsByPost.has(c.post_id)) commentsByPost.set(c.post_id, []);
            commentsByPost.get(c.post_id).push(commentObj);
          });

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

          // عرض التغريدات السحابية العالمية فوراً في كل المتصفحات
          setTweets(cloudTweets);
          safeSetStorage(GLOBAL_FEED_KEY, cloudTweets);
        }
      } catch (err) {
        console.warn('Supabase global feed note:', err);
      }
    };
    `;

  code = code.slice(0, startLoad) + newLoadCode + code.slice(endLoad);
  console.log('SUCCESS_GLOBAL_FEED_LOAD_APPLIED');
}

// 2. تفعيل اشتراك Realtime اللحظي لتحديث الصفحة تلقائياً بين الحسابات
const realtimeSubscription = `
    // اشتراك Realtime لحظي بين جميع المتصفحات والحسابات
    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => {
        loadData();
      })
      .subscribe();
`;

if (!code.includes("supabase.channel('public:posts')")) {
  code = code.replace(
    "loadData();\n  }, []);",
    `loadData();\n${realtimeSubscription}\n    return () => { supabase.removeChannel(postsChannel); };\n  }, []);`
  );
  console.log('SUCCESS_REALTIME_SUBSCRIPTION_APPLIED');
}

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
