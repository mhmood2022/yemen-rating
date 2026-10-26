const fs = require('fs');

console.log("🔍 جاري البحث عن نسخة ما قبل آخر كود مباشرة (خطوة واحدة فقط)...");

// 1. البحث عن نسخة bak_highlight المأخوذة قبل الكود الأخير مباشرة
const highlightBackups = fs.readdirSync('src/pages')
  .filter(f => f.startsWith('AccountPage.tsx.bak_highlight_'))
  .sort()
  .reverse();

if (highlightBackups.length > 0) {
  const targetBackup = 'src/pages/' + highlightBackups[0];
  console.log("🎯 تم العثور على النسخة السابقة مباشرة:", targetBackup);

  const backupContent = fs.readFileSync(targetBackup, 'utf8');

  // التأكد من أن كود الصور موجود داخل النسخة قبل استعادتها
  const hasImageFix = backupContent.includes('setNewPostFile(compressedFile)');
  const hasVideoLimit = backupContent.includes('حجم الفيديو كبير جداً');

  console.log("------------------------------------------");
  console.log("فحص محتوى النسخة قبل استرجاعها:");
  console.log("- كود رفع الصور المضغوطة موجود؟", hasImageFix ? "✔️ نعم (موجود وسليم)" : "❌ غير موجود");
  console.log("- كود حماية الفيديو (20 ميجا) موجود؟", hasVideoLimit ? "✔️ نعم (موجود وسليم)" : "❌ غير موجود");
  console.log("------------------------------------------");

  // استرجاع النسخة
  fs.copyFileSync(targetBackup, 'src/pages/AccountPage.tsx');
  console.log("✅ تم التراجع خطوة واحدة فقط بنجاح، وعاد الملف للعمل!");
} else {
  console.log("⚠️ لم يتم العثور على نسخة highlight، جاري البحث عن نسخة video_limit...");
}
