const fs = require('fs');

console.log("🔄 جاري استعادة النسخة السابقة مباشرة لـ CommunityFeedPage.tsx...");

const feedBackups = fs.readdirSync('src/pages')
  .filter(f => f.startsWith('CommunityFeedPage.tsx.bak_highlight_'))
  .sort()
  .reverse();

if (feedBackups.length > 0) {
  const targetBackup = 'src/pages/' + feedBackups[0];
  console.log("🎯 تم العثور على النسخة السليمة السابقة مباشرة:", targetBackup);

  fs.copyFileSync(targetBackup, 'src/pages/CommunityFeedPage.tsx');
  console.log("✅ تم التراجع خطوة واحدة لـ CommunityFeedPage.tsx بنجاح!");
} else {
  // إذا لم توجد نرجع لنسخة video_limit
  const altBackups = fs.readdirSync('src/pages')
    .filter(f => f.startsWith('CommunityFeedPage.tsx.bak_video_limit_'))
    .sort()
    .reverse();
  if (altBackups.length > 0) {
    fs.copyFileSync('src/pages/' + altBackups[0], 'src/pages/CommunityFeedPage.tsx');
    console.log("✅ تم استرجاع النسخة السليمة من:", altBackups[0]);
  }
}
