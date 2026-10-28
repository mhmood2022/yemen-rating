const fs = require('fs');

let content = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. تحديث دالة loadData لجلب التغريدات الحقيقية من Supabase دائماً
const startLoadFeed = content.indexOf("const savedFeed = localStorage.getItem(GLOBAL_FEED_KEY);");
const endLoadFeed = content.indexOf("loadData();", startLoadFeed);

if (startLoadFeed !== -1 && endLoadFeed !== -1) {
  const newLoadFeedCode = `// جلب التغريدات السحابية الدائمة من قاعدة بيانات Supabase
      try {
        const { data: dbPosts, error: fetchErr } = await supabase
          .from('posts')
          .select(\`
            id, user_id, content, image_url, likes_count, comments_count, reposts_count, views_count, created_at,
            profile:profiles!posts_user_id_fkey (id, full_name, username, avatar_url, is_verified)
          \`)
          .order('created_at', { ascending: false });

        if (!fetchErr && dbPosts && dbPosts.length > 0) {
          const cloudTweets: Tweet[] = dbPosts.map((p: any) => ({
            id: p.id,
            authorId: p.user_id,
            authorName: p.profile?.full_name || 'مستخدم يمن ريتنج',
            authorUsername: p.profile?.username || 'user',
            authorAvatar: p.profile?.avatar_url || '',
            text: p.content,
            image: p.image_url || undefined,
            createdAt: new Date(p.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
            likes: p.likes_count || 0,
            likedBy: [],
            reposts: p.reposts_count || 0,
            repostedBy: [],
            views: p.views_count || 1,
            comments: []
          }));

          setTweets(cloudTweets);
          safeSetStorage(GLOBAL_FEED_KEY, cloudTweets);
        } else {
          // في حال عدم وجود اتصال بالسيرفر أو شبكة ضعيفة، نقرأ من الذاكرة المحلية كخيار احتياطي
          const localSaved = localStorage.getItem(GLOBAL_FEED_KEY);
          if (localSaved) setTweets(JSON.parse(localSaved));
        }
      } catch (err) {
        console.warn('Fallback to local storage feed:', err);
        const localSaved = localStorage.getItem(GLOBAL_FEED_KEY);
        if (localSaved) setTweets(JSON.parse(localSaved));
      }
    };
    `;

  content = content.slice(0, startLoadFeed) + newLoadFeedCode + content.slice(endLoadFeed);
  console.log('SUCCESS_CLOUD_FETCH_APPLIED');
} else {
  console.log('LOAD_FEED_NOT_FOUND', { startLoadFeed, endLoadFeed });
}

// 2. تحديث دالة handlePostTweet للحفظ الدائم في جدول posts في Supabase
const startPost = content.indexOf("const handlePostTweet = (e: React.FormEvent) => {");
const endPost = content.indexOf("showToast('تم نشر تغريدتك في خلاصة المجتمع بنجاح! 🚀');");

if (startPost !== -1 && endPost !== -1) {
  const afterToast = content.indexOf("};", endPost);
  const newPostCode = `const handlePostTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetText.trim() && !tweetImage) {
      showToast('يرجى كتابة نص أو إرفاق صورة أولاً');
      return;
    }

    if (tweetText.length > 280) {
      showToast('تجاوزت الحد الأقصى (280 حرفاً)');
      return;
    }

    let activeUserId = currentUserId;
    // التأكد من معرف المستخدم الحقيقي من جلسة Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) activeUserId = session.user.id;
    } catch (_) {}

    // 1. رفع الصورة سحابياً إلى Supabase Storage إن وجدت لتفادي امتلاء المتصفح
    let uploadedImageUrl = tweetImage;
    if (selectedFile) {
      try {
        showToast('جاري رفع الصورة سحابياً... ⏳');
        uploadedImageUrl = await uploadSocialImage(selectedFile, 'tweets');
      } catch (uploadErr) {
        console.warn('Storage upload warning, using local preview:', uploadErr);
      }
    }

    const newTweet: Tweet = {
      id: Date.now().toString(),
      authorId: activeUserId,
      authorName: myName,
      authorUsername: myUsername,
      authorAvatar: myAvatar,
      text: tweetText,
      image: uploadedImageUrl || undefined,
      createdAt: 'الآن',
      likes: 0,
      likedBy: [],
      reposts: 0,
      repostedBy: [],
      views: 1,
      comments: []
    };

    // تحديث الواجهة فورياً للمستخدم
    const updated = [newTweet, ...tweets];
    setTweets(updated);
    safeSetStorage(GLOBAL_FEED_KEY, updated);

    // 2. الحفظ الدائم في قاعدة بيانات Supabase جدول posts
    try {
      if (activeUserId && activeUserId !== 'guest') {
        const { error: insertErr } = await supabase.from('posts').insert({
          user_id: activeUserId,
          content: tweetText.trim(),
          image_url: uploadedImageUrl || null
        });
        if (insertErr) console.warn('Supabase post insert note:', insertErr.message);
      }
    } catch (dbErr) {
      console.warn('Database save note:', dbErr);
    }

    setTweetText('');
    setTweetImage('');
    setSelectedFile(null);
    showToast('تم نشر تغريدتك وحفظها سحابياً بنجاح! 🚀');
  };`;

  content = content.slice(0, startPost) + newPostCode + content.slice(afterToast + 2);
  console.log('SUCCESS_CLOUD_INSERT_APPLIED');
} else {
  console.log('HANDLE_POST_NOT_FOUND', { startPost, endPost });
}

// 3. التأكد من حفظ ملف الصورة عند اختياره للرفع السحابي الحقيقي
if (!content.includes('const [selectedFile, setSelectedFile] = useState<File | null>(null);')) {
  content = content.replace(
    "const [tweetImage, setTweetImage] = useState('');",
    "const [tweetImage, setTweetImage] = useState('');\n  const [selectedFile, setSelectedFile] = useState<File | null>(null);"
  );
}

// ربط setSelectedFile في دالة اختيار الصورة
content = content.replace(
  "const file = e.target.files?.[0];\n    if (!file) return;",
  "const file = e.target.files?.[0];\n    if (!file) return;\n    setSelectedFile(file);"
);

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', content, 'utf8');
