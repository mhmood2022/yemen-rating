const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// دالة مساعدة لتوفير صورة مضمونة
const helperAvatarFunc = `// دالة استخراج صورة موثوقة للمغرد
const getSafeAvatar = (avatarUrl?: string, id?: string, name?: string) => {
  if (avatarUrl && avatarUrl.trim() !== '') return avatarUrl;
  const seed = id || name || 'user';
  return \`https://api.dicebear.com/7.x/bottts/svg?seed=\${encodeURIComponent(seed)}\`;
};
`;

if (!code.includes('getSafeAvatar')) {
  code = code.replace(
    "const REPORTS_KEY = 'yr_community_reports';",
    "const REPORTS_KEY = 'yr_community_reports';\n\n" + helperAvatarFunc
  );
}

// تحديث عرض صورة التغريدة
const oldTweetImg = `{tweet.authorAvatar ? <img src={tweet.authorAvatar} alt={tweet.authorName} className="w-full h-full object-cover" /> : <span>{tweet.authorName ? tweet.authorName[0] : '؟'}</span>}`;
const newTweetImg = `<img src={getSafeAvatar(tweet.authorAvatar, tweet.authorId, tweet.authorName)} alt={tweet.authorName} className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = getSafeAvatar('', tweet.authorId, tweet.authorName); }} />`;

if (code.includes(oldTweetImg)) {
  code = code.replace(oldTweetImg, newTweetImg);
}

// تحديث عرض صورة التعليق
const oldCommentImg = `{c.authorAvatar ? <img src={c.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" /> : c.authorName[0]}`;
const newCommentImg = `<img src={getSafeAvatar(c.authorAvatar, c.authorId, c.authorName)} alt={c.authorName} className="w-full h-full rounded-full object-cover" onError={(e) => { (e.target as any).src = getSafeAvatar('', c.authorId, c.authorName); }} />`;

if (code.includes(oldCommentImg)) {
  code = code.replace(oldCommentImg, newCommentImg);
}

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
console.log('AVATARS_FIXED_SUCCESSFULLY');
