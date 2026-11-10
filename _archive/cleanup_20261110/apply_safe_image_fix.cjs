const fs = require('fs');
const path = require('path');

const targetFile = 'src/pages/AccountPage.tsx';

if (!fs.existsSync(targetFile)) {
  console.error("❌ لم يتم العثور على الملف:", targetFile);
  process.exit(1);
}

// 1. أخذ نسخة احتياطية محلية للملف
const backupPath = targetFile + '.bak_image_fix_' + Date.now();
fs.copyFileSync(targetFile, backupPath);
console.log("🛡️ تم حفظ نسخة احتياطية في:", backupPath);

let content = fs.readFileSync(targetFile, 'utf8');

// 2. تحديث مدخل اختيار الصور والفيديو postImageInputRef
const oldInputRegex = /<input[^>]*ref=\{postImageInputRef\}[^>]*onChange=\{async\s*\(e\)\s*=>\s*\{[\s\S]*?\}\}\s*\/>/;

const newInputCode = `<input type="file" ref={postImageInputRef} className="hidden" accept="image/*,video/*" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.type.startsWith('video/')) {
                setNewPostFile(f);
                setNewPostImage(URL.createObjectURL(f));
              } else {
                try {
                  const compressed = await compressImage(f, 1200, 1200, 0.85);
                  setNewPostImage(compressed);
                  const res = await fetch(compressed);
                  const blob = await res.blob();
                  const compressedFile = new File([blob], f.name.replace(/\\.[^.]+$/, '.jpg') || 'image.jpg', { type: 'image/jpeg' });
                  setNewPostFile(compressedFile);
                } catch (_) {
                  setNewPostFile(f);
                  setNewPostImage(URL.createObjectURL(f));
                }
              }
            }
          }} />`;

if (oldInputRegex.test(content)) {
  content = content.replace(oldInputRegex, newInputCode);
  console.log("✔️ تم تحديث مدخل الصور والفيديو بنجاح.");
} else {
  console.log("⚠️ لم يتم العثور على الصيغة القديمة للمدخل بدقة، جاري البحث بالتطابق المرن...");
  const fallbackSearch = 'const compressed = await compressImage(f, 1000, 1000, 0.85);';
  if (content.includes(fallbackSearch)) {
    content = content.replace(
      'setNewPostImage(compressed);',
      `setNewPostImage(compressed);
                  try {
                    const res = await fetch(compressed);
                    const blob = await res.blob();
                    const compressedFile = new File([blob], f.name.replace(/\\.[^.]+$/, '.jpg') || 'image.jpg', { type: 'image/jpeg' });
                    setNewPostFile(compressedFile);
                  } catch (_) { setNewPostFile(f); }`
    );
    console.log("✔️ تم حقن تعيين setNewPostFile بنجاح.");
  }
}

// 3. تأمين دالة النشر handleCreatePost لرفع الصورة حتى لو كانت DataURL
const oldUploadCondition = 'if (newPostFile) {';
const newUploadCondition = `let fileToUpload = newPostFile;
    if (!fileToUpload && newPostImage && newPostImage.startsWith('data:')) {
      try {
        const res = await fetch(newPostImage);
        const blob = await res.blob();
        fileToUpload = new File([blob], \`image_\${profileId}_\${Date.now()}.jpg\`, { type: 'image/jpeg' });
      } catch (_) {}
    }
    if (fileToUpload) {`;

if (content.includes(oldUploadCondition)) {
  // استبدال الشرط واستبدال استخدام newPostFile بـ fileToUpload داخل دالة الرفع
  content = content.replace(oldUploadCondition, newUploadCondition);
  // استبدال المتغير داخل البلوك
  content = content.replace(/newPostFile\.type/g, 'fileToUpload.type');
  content = content.replace(/newPostFile\.name/g, 'fileToUpload.name');
  content = content.replace(/upload\(filePath,\s*newPostFile,/g, 'upload(filePath, fileToUpload,');
  console.log("✔️ تم تأمين دالة النشر handleCreatePost وربطها التلقائي بالرفع السحابي.");
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log("✅ تم تطبيق التعديل بنجاح وبأمان تام!");
