const fs = require('fs');

let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const startPU = code.indexOf("// تغيير وحفظ الصور مباشرة في Supabase Storage");
const endPU = code.indexOf("const handleSaveProfile");

if (startPU !== -1 && endPU !== -1) {
  const newPhotoUpload = `// تغيير وحفظ الصور مباشرة في Supabase Storage مع معاينة فورية
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // تفريغ المدخل
    e.target.value = '';

    // 1. معاينة فورية في الواجهة في نفس اللحظة
    const previewUrl = URL.createObjectURL(file);
    if (target === 'avatar') {
      setAvatarUrl(previewUrl);
    } else {
      setCoverUrl(previewUrl);
    }

    try {
      setUploadingPhoto(true);
      showToast('جاري حفظ الصورة سحابياً... ⏳');

      const publicUrl = await uploadSocialImage(file, target === 'avatar' ? 'avatars' : 'covers');

      // تعيين الرابط السحابي الدائم
      if (target === 'avatar') {
        setAvatarUrl(publicUrl);
      } else {
        setCoverUrl(publicUrl);
      }

      // حفظ الرابط في قاعدة بيانات Supabase
      const activeId = sessionUser?.id || profileId;
      if (activeId) {
        const updateField = target === 'avatar' ? { avatar_url: publicUrl } : { cover_url: publicUrl };
        await supabase.from('profiles').upsert({ id: activeId, ...updateField });
      }

      showToast(target === 'avatar' ? 'تم حفظ صورتك الشخصية بنجاح! ✅' : 'تم حفظ صورة الغلاف بنجاح! ✅');
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      showToast('خطأ بالرفع: ' + (err.message || 'تحقق من صلاحيات التخزين'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  `;

  code = code.slice(0, startPU) + newPhotoUpload + code.slice(endPU);
  fs.writeFileSync('src/pages/AccountPage.tsx', code, 'utf8');
  console.log('UPLOAD_PREVIEW_AND_SAVE_APPLIED');
}
