const fs = require('fs');

let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// 1. إضافة متغير uploadingPhoto
if (!code.includes('uploadingPhoto')) {
  code = code.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [uploadingPhoto, setUploadingPhoto] = useState(false);'
  );
}

// 2. تحديث دالة loadProfile لاستخراج الاسم الحقيقي والإيميل ومنع الشاشة الدوارة
const startLP = code.indexOf('// 1. فحص الجلسة الحقيقية وتحميل الحساب الحقيقي');
const endLP = code.indexOf('// جلب منشورات هذا المستخدم من جدول posts في Supabase');

if (startLP !== -1 && endLP !== -1) {
  const newLoadProfile = `// 1. فحص الجلسة الحقيقية وتحميل الحساب الحقيقي
  const loadProfile = async (currentUserParam?: any, isSilent = false) => {
    if (!isSilent) setLoading(true);
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

      if (viewingOwner && user && user.email) {
        setEmail(user.email);
      }

      let currentFullName = '';
      let currentUsername = '';
      let currentAvatar = '';
      let currentCover = '';

      if (viewingOwner && user) {
        const meta = user.user_metadata || {};
        const metaName = meta.full_name || meta.name;
        const emailPrefix = user.email ? user.email.split('@')[0] : '';
        currentFullName = metaName || emailPrefix || 'مستخدم يمن ريتنج';
        currentUsername = meta.username || emailPrefix || 'user';
      }

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
          currentAvatar = dbProfile.avatar_url || '';
          currentCover = dbProfile.cover_url || '';

          setName(currentFullName);
          setUsername(currentUsername);
          setBio(dbProfile.bio || '');
          setLocation(dbProfile.location || 'اليمن');
          if (currentAvatar) setAvatarUrl(currentAvatar);
          if (currentCover) setCoverUrl(currentCover);
          if (viewingOwner && dbProfile.phone) setPhone(dbProfile.phone);

          if (viewingOwner && user && (dbProfile.full_name === 'مستخدم جديد' || dbProfile.full_name === 'مستخدم يمن ريتنج' || !dbProfile.full_name)) {
            supabase.from('profiles').update({
              full_name: currentFullName,
              username: currentUsername
            }).eq('id', user.id).then(() => {});
          }
        } else if (user && viewingOwner) {
          setName(currentFullName);
          setUsername(currentUsername);
          supabase.from('profiles').upsert({
            id: user.id,
            full_name: currentFullName,
            username: currentUsername
          }).then(() => {});
        }
      } catch (err) {
        console.warn('Could not load db profile:', err);
      }

      if (user?.created_at && viewingOwner) {
        const d = new Date(user.created_at);
        const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        setJoinDate(\`انضم في \${months[d.getMonth()]} \${d.getFullYear()}\`);
      }

      `;

  code = code.slice(0, startLP) + newLoadProfile + code.slice(endLP);
}

// 3. جعل تحديث الجلسة هادئ وبدون تشغيل الدائرة الدوارة
code = code.replace('loadProfile(session?.user || null);', 'loadProfile(session?.user || null, true);');

// 4. تحديث دالة رفع الصور لتفريغ input وتفادي التعليق
const startPU = code.indexOf('// تغيير وحفظ الصور مباشرة في Supabase Storage');
const endPU = code.indexOf('const handleSaveProfile');

if (startPU !== -1 && endPU !== -1) {
  const newPhotoUpload = `// تغيير وحفظ الصور مباشرة في Supabase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    try {
      setUploadingPhoto(true);
      showToast('جاري رفع الصورة إلى التخزين السحابي... ⏳');

      const publicUrl = await uploadSocialImage(file, target === 'avatar' ? 'avatars' : 'covers');

      if (target === 'avatar') {
        setAvatarUrl(publicUrl);
      } else {
        setCoverUrl(publicUrl);
      }

      const activeId = sessionUser?.id || profileId;
      if (activeId) {
        const updateField = target === 'avatar' ? { avatar_url: publicUrl } : { cover_url: publicUrl };
        await supabase.from('profiles').update(updateField).eq('id', activeId);
      }

      showToast(target === 'avatar' ? 'تم حفظ صورتك الشخصية بنجاح! ✅' : 'تم حفظ صورة الغلاف بنجاح! ✅');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'تعذر رفع الصورة، تحقق من الاتصال');
    } finally {
      setUploadingPhoto(false);
    }
  };

  `;

  code = code.slice(0, startPU) + newPhotoUpload + code.slice(endPU);
}

fs.writeFileSync('src/pages/AccountPage.tsx', code, 'utf8');
console.log('SUCCESSFULLY_APPLIED_ALL_UPDATES');
