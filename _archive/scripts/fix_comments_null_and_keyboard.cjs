const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. إضافة hook لمتابعة ارتفاع لوحة المفاتيح ديناميكياً (Visual Viewport API)
const keyboardHook = `
  // متابعة لوحة المفاتيح لرفع الفوتر بدقة فوقها
  const [viewportBottomOffset, setViewportBottomOffset] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
        setViewportBottomOffset(Math.max(0, offset));
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);
`;

if (!code.includes('viewportBottomOffset')) {
  code = code.replace(
    "const [submittingReport, setSubmittingReport] = useState(false);",
    "const [submittingReport, setSubmittingReport] = useState(false);\n" + keyboardHook
  );
}

// 2. تصحيح جميع استدعاءات activeCommentTweet.comments بوضع الحماية الاختيارية ?.
code = code.replace(/activeCommentTweet\.comments/g, "activeCommentTweet?.comments");

// 3. تصحيح جميع استدعاءات viewingDetailTweet.comments بوضع الحماية الاختيارية ?.
code = code.replace(/viewingDetailTweet\.comments/g, "viewingDetailTweet?.comments");

// 4. رفع الفوتر في نافذة الرد فوق لوحة المفاتيح عبر style dynamic
const oldFooterReply = `<div className="mt-auto pt-3 border-t border-[#2F3336] bg-black">`;
const newFooterReply = `<div className="mt-auto pt-3 border-t border-[#2F3336] bg-black transition-all duration-75" style={{ paddingBottom: Math.max(12, viewportBottomOffset) }}>`;

if (code.includes(oldFooterReply)) {
  code = code.replace(oldFooterReply, newFooterReply);
}

// 5. رفع الفوتر في شاشة تفاصيل التغريدة فوق لوحة المفاتيح
const oldFooterThread = `<div className="p-3 border-t border-[#2F3336] bg-black shrink-0 flex items-center gap-2 pb-[max(env(safe-area-inset-bottom),12px)]">`;
const newFooterThread = `<div className="p-3 border-t border-[#2F3336] bg-black shrink-0 flex items-center gap-2 transition-all duration-75" style={{ paddingBottom: Math.max(12, viewportBottomOffset) }}>`;

if (code.includes(oldFooterThread)) {
  code = code.replace(oldFooterThread, newFooterThread);
}

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
console.log('COMMENTS_NULL_AND_KEYBOARD_OFFSET_FIXED_PERFECTLY');
