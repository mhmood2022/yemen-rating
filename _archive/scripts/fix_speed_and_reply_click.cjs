const fs = require('fs');

let content = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. جعل تحميل التغريدات فورياً من الكاش أولاً (Instant Render) ثم مزامنة سحابية هادئة
const startLoadData = content.indexOf('const loadData = async () => {');
const endLoadData = content.indexOf('loadData();', startLoadData);

if (startLoadData !== -1 && endLoadData !== -1) {
  const instantLoadCode = `const loadData = async () => {
      // 1. عرض التغريدات فوراً من الكاش في 0 ثانية لتكون سرعة الفتح فائقة
      try {
        const localSaved = localStorage.getItem(GLOBAL_FEED_KEY);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed) && parsed.length > 0) setTweets(parsed);
        }
      } catch (_) {}

      // 2. مزامنة بيانات المستخدم المسجل
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

          // جلب أحدث صورة واسم من جدول profiles
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

      // 3. جلب أحدث المنشورات من Supabase في الخلفية وتحديث الصفحة بسلاسة
      try {
        const { data: dbPosts } = await supabase
          .from('posts')
          .select('id, user_id, content, image_url, likes_count, comments_count, reposts_count, views_count, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (dbPosts && dbPosts.length > 0) {
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
        }
      } catch (err) {
        console.warn('Background sync note:', err);
      }
    };
    `;

  content = content.slice(0, startLoadData) + instantLoadCode + content.slice(endLoadData);
  console.log('SUCCESS_INSTANT_SPEED_APPLIED');
}

// 2. تحديث دالة handleAddComment للإضافة الفورية المباشرة بدون أي تعليق
const startComment = content.indexOf('const handleAddComment = async (e: React.FormEvent) => {');
const endComment = content.indexOf("showToast('تم نشر ردك بنجاح! 💬');");

if (startComment !== -1 && endComment !== -1) {
  const afterToast = content.indexOf('};', endComment);
  const fastCommentCode = `const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetPost = viewingDetailTweet || activeCommentTweet;
    const textToSend = newCommentText.trim();
    if (!textToSend || !targetPost) return;

    if (textToSend.length > 280) {
      showToast('التعليق يجب أن لا يتجاوز 280 حرفاً');
      return;
    }

    const commentId = Date.now().toString();
    const newComment: Comment = {
      id: commentId,
      authorId: currentUserId || 'guest',
      authorName: myName || 'مستخدم',
      authorUsername: myUsername || 'user',
      authorAvatar: myAvatar || '',
      text: textToSend,
      createdAt: 'الآن'
    };

    // 1. تحديث فوري فائق السرعة في الواجهة (Optimistic UI)
    const updated = tweets.map(t => {
      if (t.id === targetPost.id) {
        const existingComments = t.comments || [];
        const nextComments = [...existingComments, newComment];
        return {
          ...t,
          comments: nextComments,
          replies: nextComments.length
        };
      }
      return t;
    });

    setTweets(updated);
    safeSetStorage(GLOBAL_FEED_KEY, updated);

    // تحديث شاشة التفاصيل المفتوحة فوراً
    if (viewingDetailTweet && viewingDetailTweet.id === targetPost.id) {
      setViewingDetailTweet({
        ...viewingDetailTweet,
        comments: [...(viewingDetailTweet.comments || []), newComment]
      });
    }

    setNewCommentText('');
    showToast('تم نشر ردك بنجاح! 💬');

    // 2. حفظ سحابي في الخلفية دون تعطيل الواجهة
    if (currentUserId && currentUserId !== 'guest') {
      supabase.from('post_comments').insert({
        post_id: targetPost.id,
        user_id: currentUserId,
        content: textToSend
      }).then(() => {});
    }

    sendRealNotification(targetPost.authorId, 'comment', \`علّق \${myName} على منشورك: "\${textToSend.slice(0, 30)}..."\`, targetPost.id);
  };`;

  content = content.slice(0, startComment) + fastCommentCode + content.slice(afterToast + 2);
  console.log('SUCCESS_FAST_REPLY_ACTION_APPLIED');
}

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', content, 'utf8');
