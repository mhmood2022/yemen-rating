const fs = require('fs');

let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const startMarker = "const loadProfile = async (currentUserParam?: any, isSilent = true) => {";
const endMarker = "const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>";

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const newLoadProfile = `const loadProfile = async (currentUserParam?: any, isSilent = true) => {
    if (!isSilent && !sessionUser) setLoading(true);
    try {
      let user = currentUserParam;
      if (user === undefined) {
        const sessionRes = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('auth_timeout')), 1200))
        ]).catch(() => null);
        user = sessionRes?.data?.session?.user || null;
      }

      setSessionUser(user);
      const myId = user?.id || '';
      const targetId = targetIdParam || myId;

      if (!targetId) {
        setLoading(false);
        return;
      }

      const viewingOwner = (targetId === myId);
      setIsOwner(viewingOwner);
      setProfileId(targetId);

      let currentFullName = "مستخدم يمن ريتنج";
      let currentUsername = "user";
      let currentAvatar = "";
      let currentCover = "";
      let currentBio = "";
      let currentLocation = "اليمن";

      // 1. أولاً: فحص دليل المستخدمين المحلي والتغريدات السابقة (للمستخدمين القدامى وغير المسجلين بـ Supabase)
      try {
        const usersDir = JSON.parse(localStorage.getItem('yr_users_directory') || '{}');
        const localSaved = usersDir[targetId];
        if (localSaved) {
          if (localSaved.name) currentFullName = localSaved.name;
          if (localSaved.username) currentUsername = localSaved.username;
          if (localSaved.avatarUrl) currentAvatar = localSaved.avatarUrl;
          if (localSaved.coverUrl) currentCover = localSaved.coverUrl;
          if (localSaved.bio) currentBio = localSaved.bio;
          if (localSaved.location) currentLocation = localSaved.location;
        }

        // إذا لم يكن بالدليل، نبحث في مصفوفة التغريدات عن اسمه وصورته التي غرد بها
        const allFeed = JSON.parse(localStorage.getItem('yr_community_global_posts') || '[]');
        const authorTweet = allFeed.find((t: any) => t.authorId === targetId);
        if (authorTweet) {
          if (authorTweet.authorName) currentFullName = authorTweet.authorName;
          if (authorTweet.authorUsername) currentUsername = authorTweet.authorUsername;
          if (authorTweet.authorAvatar) currentAvatar = authorTweet.authorAvatar;
        }
      } catch (_) {}

      // 2. ثانياً: إذا كان المستخدم الحالي مسجلاً وهو صاحب الحساب، نأخذ بيانات الجلسة كأولوية
      if (viewingOwner && user) {
        const meta = user.user_metadata || {};
        const metaName = meta.full_name || meta.name;
        const emailPrefix = user.email ? user.email.split('@')[0] : '';
        currentFullName = metaName || (currentFullName !== "مستخدم يمن ريتنج" ? currentFullName : (emailPrefix || "مستخدم"));
        currentUsername = meta.username || (currentUsername !== "user" ? currentUsername : (emailPrefix || "user"));
        if (user.email) setEmail(user.email);
      }

      // 3. ثالثاً: الاستعلام من قاعدة بيانات Supabase (للحسابات المربوطة سحابياً)
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .maybeSingle();

        if (dbProfile) {
          if (dbProfile.full_name && dbProfile.full_name !== 'مستخدم جديد' && dbProfile.full_name !== 'مستخدم يمن ريتنج') {
            currentFullName = dbProfile.full_name;
          }
          if (dbProfile.username && !dbProfile.username.startsWith('user_')) {
            currentUsername = dbProfile.username;
          }
          if (dbProfile.avatar_url) currentAvatar = dbProfile.avatar_url;
          if (dbProfile.cover_url) currentCover = dbProfile.cover_url;
          if (dbProfile.bio) currentBio = dbProfile.bio;
          if (dbProfile.location) currentLocation = dbProfile.location;
          if (viewingOwner && dbProfile.phone) setPhone(dbProfile.phone);
        }
      } catch (err) {
        console.warn('Could not load db profile:', err);
      }

      // تعيين البيانات في واجهة الحساب فوراً
      setName(currentFullName);
      setUsername(currentUsername);
      setBio(currentBio);
      setLocation(currentLocation);
      if (currentAvatar) setAvatarUrl(currentAvatar);
      if (currentCover) setCoverUrl(currentCover);

      if (user?.created_at && viewingOwner) {
        const d = new Date(user.created_at);
        const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        setJoinDate(\`انضم في \${months[d.getMonth()]} \${d.getFullYear()}\`);
      }

      // 4. جلب منشورات هذا المستخدم بدقة (من Supabase ومن الخلاصة السابقة الموحدة)
      let matchedPosts: Post[] = [];

      try {
        const { data: dbPosts } = await supabase
          .from("posts")
          .select("id, user_id, content, image_url, likes_count, comments_count, reposts_count, views_count, created_at")
          .eq("user_id", targetId)
          .order("created_at", { ascending: false });

        if (dbPosts && dbPosts.length > 0) {
          matchedPosts = dbPosts.map(p => ({
            id: p.id,
            authorId: p.user_id,
            authorName: currentFullName,
            authorUsername: currentUsername,
            authorAvatar: currentAvatar,
            text: p.content,
            image: p.image_url || undefined,
            createdAt: new Date(p.created_at).toLocaleDateString("ar-YE"),
            likes: p.likes_count || 0,
            likedBy: [],
            reposts: p.reposts_count || 0,
            views: p.views_count || 1,
            comments: []
          }));
        }
      } catch (_) {}

      try {
        const allFeed: any[] = JSON.parse(localStorage.getItem('yr_community_global_posts') || '[]');
        const localMatches = allFeed.filter((t: any) => t.authorId === targetId).map((t: any) => ({
          ...t,
          authorName: currentFullName,
          authorUsername: currentUsername,
          authorAvatar: currentAvatar || t.authorAvatar
        }));

        const postMap = new Map();
        matchedPosts.forEach(p => postMap.set(p.id, p));
        localMatches.forEach(p => {
          if (!postMap.has(p.id)) postMap.set(p.id, p);
        });

        setUserPosts(Array.from(postMap.values()));
      } catch (_) {
        setUserPosts(matchedPosts);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  `;

  code = code.slice(0, startIdx) + newLoadProfile + code.slice(endIdx);
  fs.writeFileSync('src/pages/AccountPage.tsx', code, 'utf8');
  console.log('SUCCESS_APPLIED_DYNAMIC_PROFILE_AND_POSTS');
} else {
  console.log('MARKERS_NOT_MATCHED', { startIdx, endIdx });
}
