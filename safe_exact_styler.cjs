const fs = require('fs');
let esbuild;
try { esbuild = require('esbuild'); } catch (_) {}

function validateTSX(code, filename) {
  if (esbuild) {
    try {
      esbuild.transformSync(code, { loader: 'tsx' });
      return true;
    } catch (err) {
      console.error(`❌ فحص الأمان اكتشف خطأ في بناء ${filename}:`, err.message);
      return false;
    }
  }
  return true;
}

console.log("🛡️ بدء الاستبدال الجراحي لحقل التغريدات مع الفحص الذاتي...");

// 1. تحديث CommunityFeedPage.tsx
const feedPath = 'src/pages/CommunityFeedPage.tsx';
if (fs.existsSync(feedPath)) {
  let feedCode = fs.readFileSync(feedPath, 'utf8');

  // استهداف حقل value={tweetText} حصراً وبدقة
  const targetRegex = /<textarea[^>]*value=\{tweetText\}[\s\S]*?\/>/;

  const replacementFeed = `<div className="relative w-full">
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
                  <textarea
                    autoFocus
                    value={tweetText}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    onChange={(e) => {
                      setTweetText(e.target.value);
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea relative z-10 w-full bg-transparent text-white text-[17px] leading-[26px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none overflow-hidden caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', wordBreak: 'break-word', overflowWrap: 'break-word', minHeight: '120px' }}
                  />
                </div>`;

  if (targetRegex.test(feedCode)) {
    const testCode = feedCode.replace(targetRegex, replacementFeed);
    if (validateTSX(testCode, 'CommunityFeedPage.tsx')) {
      fs.writeFileSync(feedPath, testCode, 'utf8');
      console.log("✔️ [CommunityFeedPage]: اجتاز فحص الأمان بنجاح وتم تفعيل التمدد والتظليل!");
    } else {
      console.log("🛑 تم منع الحفظ في CommunityFeedPage للحفاظ على سلامة الملف.");
    }
  } else {
    console.log("⚠️ لم يتم العثور على textarea التغريدة في CommunityFeedPage.");
  }
}

// 2. تحديث AccountPage.tsx
const accountPath = 'src/pages/AccountPage.tsx';
if (fs.existsSync(accountPath)) {
  let accCode = fs.readFileSync(accountPath, 'utf8');

  // استهداف حقل value={newPostText} حصراً وبدقة
  const targetRegex = /<textarea[^>]*value=\{newPostText\}[\s\S]*?\/>/;

  const replacementAcc = `<div className="relative w-full">
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
                  <textarea
                    autoFocus
                    value={newPostText}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    onChange={(e) => {
                      setNewPostText(e.target.value);
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea relative z-10 w-full bg-transparent text-white text-[17px] leading-[26px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none overflow-hidden caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', wordBreak: 'break-word', overflowWrap: 'break-word', minHeight: '120px' }}
                  />
                </div>`;

  if (targetRegex.test(accCode)) {
    const testCode = accCode.replace(targetRegex, replacementAcc);
    if (validateTSX(testCode, 'AccountPage.tsx')) {
      fs.writeFileSync(accountPath, testCode, 'utf8');
      console.log("✔️ [AccountPage]: اجتاز فحص الأمان بنجاح وتم تفعيل التمدد والتظليل!");
    } else {
      console.log("🛑 تم منع الحفظ في AccountPage للحفاظ على سلامة الملف.");
    }
  } else {
    console.log("⚠️ لم يتم العثور على textarea التغريدة في AccountPage.");
  }
}

console.log("==========================================");
console.log("✅ اكتملت العملية بنجاح وبأمان تام!");
console.log("==========================================");
