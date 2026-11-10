const fs = require('fs');

console.log("🚀 جاري مطابقة منصة X تماماً (تمدد تلقائي للأسفل + تظليل كستنائي خلف الكلمات الزائدة)...");

// 1. تحديث CommunityFeedPage.tsx
const feedFile = 'src/pages/CommunityFeedPage.tsx';
if (fs.existsSync(feedFile)) {
  let content = fs.readFileSync(feedFile, 'utf8');

  const oldBlockRegex = /<div className="relative w-full min-h-\[120px\]">[\s\S]*?<\/div>\s*<\/div>/;

  const exactXFeed = `<div className="relative w-full">
                  {/* طبقة التظليل الخلفية المطابقة لتطبيق X */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden text-transparent text-[17px] leading-[26px] p-0 font-normal select-none"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    <span>{tweetText.slice(0, 250)}</span>
                    {tweetText.length > 250 && (
                      <mark className="bg-[#782229] text-transparent rounded-sm py-0.5">
                        {tweetText.slice(250)}
                      </mark>
                    )}
                  </div>

                  {/* حقل الكتابة المتمدد تلقائياً بدون أي قيود */}
                  <textarea
                    autoFocus
                    value={tweetText}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = t.scrollHeight + 'px';
                    }}
                    onChange={(e) => {
                      setTweetText(e.target.value);
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = t.scrollHeight + 'px';
                    }}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea relative z-10 w-full bg-transparent text-white text-[17px] leading-[26px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none overflow-hidden caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', wordBreak: 'break-word', overflowWrap: 'break-word', minHeight: '130px' }}
                  />
                </div>`;

  if (oldBlockRegex.test(content)) {
    content = content.replace(oldBlockRegex, exactXFeed);
    fs.writeFileSync(feedFile, content, 'utf8');
    console.log("✔️ تم ضبط التمدد والتظليل في CommunityFeedPage بنجاح.");
  } else {
    console.log("⚠️ لم يتم العثور على البلوك في CommunityFeedPage.");
  }
}

// 2. تحديث AccountPage.tsx
const accountFile = 'src/pages/AccountPage.tsx';
if (fs.existsSync(accountFile)) {
  let content = fs.readFileSync(accountFile, 'utf8');

  const oldBlockRegex = /<div className="relative w-full min-h-\[120px\]">[\s\S]*?<\/div>\s*<\/div>/;

  const exactXAccount = `<div className="relative w-full">
                  {/* طبقة التظليل الخلفية المطابقة لتطبيق X */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden text-transparent text-[17px] leading-[26px] p-0 font-normal select-none"
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    <span>{newPostText.slice(0, 250)}</span>
                    {newPostText.length > 250 && (
                      <mark className="bg-[#782229] text-transparent rounded-sm py-0.5">
                        {newPostText.slice(250)}
                      </mark>
                    )}
                  </div>

                  {/* حقل الكتابة المتمدد تلقائياً بدون أي قيود */}
                  <textarea
                    autoFocus
                    value={newPostText}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = t.scrollHeight + 'px';
                    }}
                    onChange={(e) => {
                      setNewPostText(e.target.value);
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = t.scrollHeight + 'px';
                    }}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea relative z-10 w-full bg-transparent text-white text-[17px] leading-[26px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none overflow-hidden caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', wordBreak: 'break-word', overflowWrap: 'break-word', minHeight: '130px' }}
                  />
                </div>`;

  if (oldBlockRegex.test(content)) {
    content = content.replace(oldBlockRegex, exactXAccount);
    fs.writeFileSync(accountFile, content, 'utf8');
    console.log("✔️ تم ضبط التمدد والتظليل في AccountPage بنجاح.");
  } else {
    console.log("⚠️ لم يتم العثور على البلوك في AccountPage.");
  }
}

console.log("==========================================");
console.log("✅ اكتمل الضبط! أعد تحميل الصفحة وجرب نفس النص الطويل الآن.");
console.log("==========================================");
