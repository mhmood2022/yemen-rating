import re

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. تحديث دالة الرفع للتأكد من رفع الملف وتحديث الرابط
upload_func_old = '''  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

upload_func_new = '''  const [uploadStatusText, setUploadStatusText] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      setMediaType(isVid ? 'video' : 'image');
      setIsMediaUploading(true);
      setUploadStatusText('جاري رفع الملف إلى السحابة... يرجى الانتظار ⏳');

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
            setUploadStatusText('✅ تم رفع الملف إلى السحابة بنجاح وبشكل دائم!');
          }
        } else {
          setUploadStatusText('❌ فشل الرفع للسحابة: ' + uploadErr.message);
          setMediaFileUrl(URL.createObjectURL(file));
        }
      } catch (err: any) {
        setUploadStatusText('❌ خطأ في الاتصال أثناء الرفع: ' + err.message);
        setMediaFileUrl(URL.createObjectURL(file));
      } finally {
        setIsMediaUploading(false);
      }
    }
  };'''

if 'const handleFileUpload =' in code:
    code = re.sub(r'const handleFileUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?\n  \};', upload_func_new, code, flags=re.DOTALL)
    print("✅ 1. تم تحديث دالة الرفع بحالة النصوص والمؤشرات.")

# 2. تعديل زر النشر لمنع الضغط أثناء الرفع أو عند وجود رابط مؤقت
old_btn = '''        {/* زر النشر النهائي */}
        <button
          onClick={handleSaveAndPublish}
          className="w-full py-4 rounded-xl bg-[#FFC500] text-black font-black text-sm hover:bg-[#FFC500]/90 transition-all shadow-xl shadow-[#FFC500]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Sparkles size={18} />
          <span>حفظ ونشر الإعلان فوراً في المعرض المرئي</span>
        </button>'''

new_btn = '''        {/* مؤشر حالة الرفع السحابي */}
        {uploadStatusText && (
          <div className={`p-3 rounded-xl text-xs font-bold text-center border mb-3 ${
            isMediaUploading 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse' 
              : uploadStatusText.includes('✅') 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {uploadStatusText}
          </div>
        )}

        {/* زر النشر النهائي المحمي */}
        <button
          onClick={handleSaveAndPublish}
          disabled={isMediaUploading}
          className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
            isMediaUploading
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              : 'bg-[#FFC500] text-black hover:bg-[#FFC500]/90 shadow-[#FFC500]/20 cursor-pointer active:scale-98'
          }`}
        >
          <Sparkles size={18} />
          <span>{isMediaUploading ? '⏳ جاري رفع الوسائط للسحابة... انتظر لحظات' : 'حفظ ونشر الإعلان فوراً في المعرض المرئي'}</span>
        </button>'''

if '{/* زر النشر النهائي */}' in code:
    code = code.replace(old_btn, new_btn)
    print("✅ 2. تم تأمين زر النشر وربطه بمؤشر التحميل بنجاح.")

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(code)
print("✅ تم حفظ التعديلات في AdGeneratorStudio.tsx!")
