const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. التأكد من وجود حالة viewingDetailTweet
if (!code.includes('viewingDetailTweet')) {
  code = code.replace(
    "const [activeCommentTweet, setActiveCommentTweet] = useState<Tweet | null>(null);",
    "const [activeCommentTweet, setActiveCommentTweet] = useState<Tweet | null>(null);\n  const [viewingDetailTweet, setViewingDetailTweet] = useState<Tweet | null>(null);"
  );
}

// 2. جعل النقر على جسم التغريدة والمنطقة الفارغة يفتح التفاصيل كاملة
const oldArticleTag = `<article key={tweet.id} className="p-4 hover:bg-white/[0.015] transition">`;
const newArticleTag = `<article 
                key={tweet.id} 
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  // فتح التفاصيل إذا لم يكن النقر على زر أو رابط أو صورة البروفايل
                  if (!target.closest('button') && !target.closest('a')) {
                    setViewingDetailTweet(tweet);
                  }
                }}
                className="p-4 hover:bg-white/[0.02] cursor-pointer transition select-none"
              >`;

if (code.includes(oldArticleTag)) {
  code = code.replace(oldArticleTag, newArticleTag);
}

// 3. إضافة نافذة تفاصيل التغريدة الكاملة مع كل التعليقات والشريط السفلي (نظام X المطابق)
const threadViewModal = `
      {/* شاشة تفاصيل التغريدة والردود بنظام منصة X الكامل */}
      {viewingDetailTweet && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col h-[100dvh] text-white overflow-hidden" dir="rtl">
          
          {/* الشريط العلوي مع زر الرجوع */}
          <div className="h-14 border-b border-[#2F3336] px-4 flex items-center justify-between shrink-0 bg-black/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setViewingDetailTweet(null)} 
                className="p-2 hover:bg-zinc-900 rounded-full text-zinc-300 hover:text-white transition"
                title="رجوع"
              >
                <ArrowRight size={20} />
              </button>
              <h2 className="font-black text-base">منشور</h2>
            </div>
          </div>

          {/* محتوى التغريدة وكل الردود السابقة */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* رأس التغريدة: صورة الكاتب واسمه */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => { setViewingDetailTweet(null); openAuthorProfile(viewingDetailTweet.authorId); }}
                className="w-11 h-11 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 cursor-pointer flex items-center justify-center font-bold"
              >
                {viewingDetailTweet.authorAvatar ? (
                  <img src={viewingDetailTweet.authorAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{viewingDetailTweet.authorName ? viewingDetailTweet.authorName[0] : '؟'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p 
                  onClick={() => { setViewingDetailTweet(null); openAuthorProfile(viewingDetailTweet.authorId); }}
                  className="font-bold text-sm text-white hover:underline cursor-pointer"
                >
                  {viewingDetailTweet.authorName}
                </p>
                <p className="text-xs text-[#71767B] font-mono" dir="ltr">@{viewingDetailTweet.authorUsername}</p>
              </div>
            </div>

            {/* نص التغريدة بالحجم الكامل */}
            <p className="text-base text-[#E7E9EA] leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap select-text">
              {viewingDetailTweet.text}
            </p>

            {/* صورة التغريدة إن وجدت */}
            {viewingDetailTweet.image && (
              <div className="rounded-2xl overflow-hidden border border-[#2F3336] max-h-[500px] bg-zinc-950">
                <img src={viewingDetailTweet.image} alt="" className="w-full h-auto object-cover max-h-[500px]" />
              </div>
            )}

            {/* التاريخ والمشاهدات */}
            <div className="text-xs text-[#71767B] py-2.5 border-y border-[#2F3336] flex items-center gap-2">
              <span>{viewingDetailTweet.createdAt}</span>
              <span>·</span>
              <span className="font-semibold text-zinc-300">{viewingDetailTweet.views || 1}</span>
              <span>مشاهدة</span>
            </div>

            {/* أزرار التفاعل في الصفحة الكاملة */}
            <div className="flex items-center justify-around py-1.5 border-b border-[#2F3336] text-[#71767B]">
              <button 
                type="button"
                onClick={() => {
                  const target = viewingDetailTweet;
                  setActiveCommentTweet(target);
                }} 
                className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition"
              >
                <MessageCircle size={18} />
                <span className="text-xs">{viewingDetailTweet.comments?.length || 0}</span>
              </button>

              <button 
                type="button"
                onClick={() => handleRepost(viewingDetailTweet.id)} 
                className="flex items-center gap-1.5 hover:text-emerald-400 transition"
              >
                <Repeat2 size={18} />
                <span className="text-xs">{viewingDetailTweet.reposts || 0}</span>
              </button>

              <button 
                type="button"
                onClick={() => handleLike(viewingDetailTweet.id)} 
                className="flex items-center gap-1.5 hover:text-rose-500 transition"
              >
                <Heart size={18} className={viewingDetailTweet.likedBy?.includes(currentUserId) ? 'fill-rose-500 text-rose-500' : ''} />
                <span className="text-xs">{viewingDetailTweet.likes || 0}</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('تم نسخ الرابط! 🔗');
                  }
                }} 
                className="hover:text-white transition"
              >
                <Share size={18} />
              </button>
            </div>

            {/* قائمة كل الردود السابقة */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-[#71767B]">الردود ({viewingDetailTweet.comments?.length || 0})</h3>
              {(!viewingDetailTweet.comments || viewingDetailTweet.comments.length === 0) ? (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  لا توجد ردود بعد. كن أول من يكتب رداً!
                </div>
              ) : (
                viewingDetailTweet.comments.map(c => (
                  <div key={c.id} className="p-3 bg-[#16181C] rounded-2xl border border-[#2F3336]/60 flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {c.authorAvatar ? (
                        <img src={c.authorAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{c.authorName ? c.authorName[0] : '؟'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{c.authorName}</span>
                        <span className="text-[10px] text-zinc-500">{c.createdAt}</span>
                      </div>
                      <p className="text-xs text-zinc-200 mt-1 leading-relaxed break-words [overflow-wrap:anywhere]">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* الشريط السفلي الثابت المماثل لـ X تماماً: "انشر ردّك" ومعه الصورة الشخصية */}
          <div className="p-3 border-t border-[#2F3336] bg-black shrink-0 flex items-center gap-2 pb-[max(env(safe-area-inset-bottom),12px)]">
            <button
              type="button"
              onClick={() => {
                setActiveCommentTweet(viewingDetailTweet);
              }}
              className="flex-1 bg-[#16181C] hover:bg-[#202327] border border-[#2F3336] text-[#71767B] rounded-full px-4 py-2.5 text-xs text-right transition flex items-center justify-between"
            >
              <span>انشر ردّك...</span>
              <span className="text-[10px] text-[#1D9BF0] font-bold">الرد 💬</span>
            </button>

            <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center font-bold">
              {myAvatar ? (
                <img src={myAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{myName ? myName[0] : '؟'}</span>
              )}
            </div>
          </div>

        </div>
      )}
`;

if (!code.includes('{/* شاشة تفاصيل التغريدة والردود بنظام منصة X الكامل */}')) {
  // وضع الشاشة قبل نهاية الصفحة مباشرة
  code = code.replace(
    '{/* نافذة البلاغات */}',
    threadViewModal + '\n\n      {/* نافذة البلاغات */}'
  );
}

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
console.log('SUCCESS_THREAD_DETAIL_VIEW_APPLIED');
