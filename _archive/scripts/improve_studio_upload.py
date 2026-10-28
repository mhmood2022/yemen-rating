with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    studio = f.read()

# 1. إضافة حالة الرفع isUploading إذا لم تكن موجودة
if "const [isMediaUploading, setIsMediaUploading] = useState" not in studio:
    studio = studio.replace(
        "const [mediaFileUrl, setMediaFileUrl] = useState<string>('');",
        "const [mediaFileUrl, setMediaFileUrl] = useState<string>('');\n  const [isMediaUploading, setIsMediaUploading] = useState<boolean>(false);"
    )

# 2. تحديث handleFileUpload لتفعيل مؤشر الرفع
old_upload = '''  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

new_upload = '''  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      setMediaType(isVid ? 'video' : 'image');
      const tempUrl = URL.createObjectURL(file);
      setMediaFileUrl(tempUrl);
      setIsMediaUploading(true);

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
            console.log("Uploaded successfully to Supabase Storage:", publicUrl);
          }
        } else {
          console.error("Storage upload error:", uploadErr);
        }
      } catch (err) {
        console.error("Storage upload error:", err);
      } finally {
        setIsMediaUploading(false);
      }
    }
  };'''

if old_upload in studio:
    studio = studio.replace(old_upload, new_upload)
    print("✅ تم تحسين دالة الرفع بحالة الانتظار.")

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(studio)
print("✅ تم حفظ تحسينات الاستوديو بنجاح!")
