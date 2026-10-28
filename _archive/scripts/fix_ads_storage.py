import re

# 1. تحديث AdGeneratorStudio.tsx للرفع الفعلي إلى Supabase Storage
with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    studio = f.read()

# التأكد من استيراد supabase
if "import { supabase }" not in studio:
    studio = "import { supabase } from '../../../lib/supabase';\n" + studio

# استبدال دالة handleFileUpload بالرفع الحقيقي
old_handle_file = '''  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);
      setMediaFileUrl(url);
      setMediaType(isVid ? 'video' : 'image');
    }
  };'''

new_handle_file = '''  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      setMediaType(isVid ? 'video' : 'image');
      const tempUrl = URL.createObjectURL(file);
      setMediaFileUrl(tempUrl);

      try {
        const ext = file.name.split('.').pop() || (isVid ? 'mp4' : 'jpg');
        const fileName = `ads/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('businesses')
          .upload(fileName, file, { upsert: true });

        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('businesses')
            .getPublicUrl(fileName);
          if (publicUrl) {
            setMediaFileUrl(publicUrl);
          }
        }
      } catch (err) {
        console.error("Storage upload error:", err);
      }
    }
  };'''

old_handle_logo = '''  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUrl(URL.createObjectURL(file));
      setShowLogo(true);
    }
  };'''

new_handle_logo = '''  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowLogo(true);
      const tempUrl = URL.createObjectURL(file);
      setLogoUrl(tempUrl);

      try {
        const ext = file.name.split('.').pop() || 'png';
        const fileName = `ads_logos/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('businesses')
          .upload(fileName, file, { upsert: true });

        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage
            .from('businesses')
            .getPublicUrl(fileName);
          if (publicUrl) {
            setLogoUrl(publicUrl);
          }
        }
      } catch (err) {
        console.error("Logo upload error:", err);
      }
    }
  };'''

if old_handle_file in studio:
    studio = studio.replace(old_handle_file, new_handle_file)
    print("✅ تم تحديث دالة رفع الوسائط بالسحابة.")

if old_handle_logo in studio:
    studio = studio.replace(old_handle_logo, new_handle_logo)
    print("✅ تم تحديث دالة رفع الشعار بالسحابة.")

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(studio)

print("✅ تم حفظ تعديلات AdGeneratorStudio.tsx بنجاح.")
