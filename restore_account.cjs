const fs = require('fs');

console.log("🔄 جاري استعادة النسخة السليمة لـ AccountPage.tsx...");

// البحث عن أحدث نسخة احتياطية سليمة قبل الخطأ
const files = fs.readdirSync('src/pages')
  .filter(f => f.startsWith('AccountPage.tsx.bak_video_limit_'))
  .sort()
  .reverse();

if (files.length > 0) {
  const goodBackup = 'src/pages/' + files[0];
  fs.copyFileSync(goodBackup, 'src/pages/AccountPage.tsx');
  console.log("✅ تم استرجاع النسخة السليمة بنجاح من:", goodBackup);
} else {
  // إذا لم نجدها، نرجع لنسخة image_fix
  const altFiles = fs.readdirSync('src/pages')
    .filter(f => f.startsWith('AccountPage.tsx.bak_image_fix_'))
    .sort()
    .reverse();
  if (altFiles.length > 0) {
    fs.copyFileSync('src/pages/' + altFiles[0], 'src/pages/AccountPage.tsx');
    console.log("✅ تم استرجاع النسخة السليمة بنجاح من:", altFiles[0]);
  }
}
