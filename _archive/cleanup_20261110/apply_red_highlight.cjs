const fs = require('fs');

console.log("🛡️ جاري تطبيق التظليل الأحمر عند تجاوز 250 حرفاً مع بقاء العداد 280...");

// 1. تطبيق التظليل في صفحة المجتمع (CommunityFeedPage.tsx)
const feedFile = 'src/pages/CommunityFeedPage.tsx';
if (fs.existsSync(feedFile)) {
  fs.copyFileSync(feedFile, feedFile + '.bak_highlight_' + Date.now());
  let content = fs.readFileSync(feedFile, 'utf8');

  // البحث عن الـ textarea واستبداله بنسخة تدعم التظليل الأحمر عند > 250
  const oldTextareaRegex = /<textarea[^>]*value=\{tweetText\}[\s\S]*?\/>/;
  
  const newTextareaCode = `<div className={\`transition-all duration-200 rounded-xl \${tweetText.length > 250 ? 'bg-red-950/30 border border-red-500/50 p-2.5 shadow-[0_0_12px_rgba(239,68,68,0.25)]' : ''}\`}>
                  <textarea
                    autoFocus
                    value={tweetText}
                    onChange={(e) => setTweetText(e.target.value)}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea w-full bg-transparent text-white text-[17px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none leading-relaxed min-h-[120px] caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
                  />
                  {tweetText.length > 250 && (
                    <div className="mt-2 text-xs text-zinc-300 bg-red-950/40 border border-red-500/30 rounded-lg p-2 leading-relaxed">
                      <span className="text-red-400 font-bold ml-1">تجاوزت 250 حرفاً: </span>
                      <span className="opacity-70">{tweetText.slice(0, 250)}</span>
                      <mark className="bg-red-600 text-white rounded px-1 py-0.5 font-bold mx-0.5">{tweetText.slice(250)}</mark>
                    </div>
                  )}
                </div>`;

  if (oldTextareaRegex.test(content)) {
    content = content.replace(oldTextareaRegex, newTextareaCode);
    fs.writeFileSync(feedFile, content, 'utf8');
    console.log("✔️ تم تطبيق التظليل الأحمر في صفحة المجتمع (CommunityFeedPage).");
  } else {
    console.log("⚠️ تعذر مطابقة textarea في CommunityFeedPage تلقائياً.");
  }
}

// 2. تطبيق التظليل في صفحة الحساب (AccountPage.tsx)
const accountFile = 'src/pages/AccountPage.tsx';
if (fs.existsSync(accountFile)) {
  fs.copyFileSync(accountFile, accountFile + '.bak_highlight_' + Date.now());
  let content = fs.readFileSync(accountFile, 'utf8');

  const oldTextareaRegex = /<textarea[^>]*value=\{newPostText\}[\s\S]*?\/>/;

  const newTextareaCode = `<div className={\`transition-all duration-200 rounded-xl \${newPostText.length > 250 ? 'bg-red-950/30 border border-red-500/50 p-2.5 shadow-[0_0_12px_rgba(239,68,68,0.25)]' : ''}\`}>
                  <textarea
                    autoFocus
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea w-full bg-transparent text-white text-[17px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none leading-relaxed min-h-[120px] caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
                  />
                  {newPostText.length > 250 && (
                    <div className="mt-2 text-xs text-zinc-300 bg-red-950/40 border border-red-500/30 rounded-lg p-2 leading-relaxed">
                      <span className="text-red-400 font-bold ml-1">تجاوزت 250 حرفاً: </span>
                      <span className="opacity-70">{newPostText.slice(0, 250)}</span>
                      <mark className="bg-red-600 text-white rounded px-1 py-0.5 font-bold mx-0.5">{newPostText.slice(250)}</mark>
                    </div>
                  )}
                </div>`;

  if (oldTextareaRegex.test(content)) {
    content = content.replace(oldTextareaRegex, newTextareaCode);
    fs.writeFileSync(accountFile, content, 'utf8');
    console.log("✔️ تم تطبيق التظليل الأحمر في صفحة الحساب (AccountPage).");
  } else {
    console.log("⚠️ تعذر مطابقة textarea في AccountPage تلقائياً.");
  }
}

console.log("==========================================");
console.log("✅ اكتمل الإعداد: العداد بقي 280 كما هو، والتظليل الأحمر يعمل فوق 250!");
console.log("==========================================");
