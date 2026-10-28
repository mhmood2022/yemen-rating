const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. إضافة حالة viewingDetailTweet إذا لم تكن موجودة
if (!code.includes('viewingDetailTweet')) {
  code = code.replace(
    "const [activeCommentTweet, setActiveCommentTweet] = useState<Tweet | null>(null);",
    "const [activeCommentTweet, setActiveCommentTweet] = useState<Tweet | null>(null);\n  const [viewingDetailTweet, setViewingDetailTweet] = useState<Tweet | null>(null);"
  );
}

// 2. تحديث كود مودال الرد ليرتفع فوق لوحة المفاتيح ديناميكياً (100dvh + sticky footer)
const oldModalRegex = /\{\/\* نافذة الرد بنظام منصة X[\s\S]*?\{\/\* قائمة الردود السابقة إن وجدت \*\/\}/;

const newModalTop = `{/* نافذة الرد بنظام منصة X المطابق 100% */}
      {activeCommentTweet && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between h-[100dvh] w-full max-w-lg mx-auto sm:h-auto sm:my-auto sm:rounded-3xl border border-[#2F3336] p-4 text-white overflow-hidden shadow-2xl" dir="rtl">
          
          {/* القسم العلوي: زر الإغلاق والرد والتوجيه */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2F3336] mb-3">
              <button 
                type="button"
                onClick={() => setActiveCommentTweet(null)} 
                className="text-[#71767B] hover:text-white p-1.5 rounded-full hover:bg-zinc-900 transition"
              >
                <X size={20} />
              </button>

              <button
                type="button"
                onClick={handleAddComment}
                disabled={!newCommentText.trim() || newCommentText.length > 280}
                className="px-5 py-1.5 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-xs font-black transition active:scale-95 shadow-sm"
              >
                الردّ
              </button>
            </div>

            <div className="text-xs text-[#71767B] mb-3 flex items-center gap-1">
              <span>رداً على</span>
              <span className="text-[#1D9BF0] font-mono font-bold" dir="ltr">@{activeCommentTweet.authorUsername}</span>
            </div>

            {/* قالب كتابة الرد */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center font-bold">
                {myAvatar ? (
                  <img src={myAvatar} alt={myName} className="w-full h-full object-cover" />
                ) : (
                  <span>{myName ? myName[0] : '؟'}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <textarea
                  rows={4}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="انشر ردّك"
                  maxLength={280}
                  className="w-full bg-transparent text-white placeholder-[#71767B] text-sm focus:outline-none resize-none leading-relaxed break-words [overflow-wrap:anywhere]"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* الفوتر الثابت: يرتفع تلقائياً فوق لوحة المفاتيح ومعه العداد */}
          <div className="mt-auto pt-3 border-t border-[#2F3336] bg-black">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 text-[#1D9BF0]">
                <button type="button" className="p-2 hover:bg-[#1D9BF0]/10 rounded-full transition" title="إرفاق صورة">
                  <ImageIcon size={20} />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono select-none" dir="ltr">
                <span className={newCommentText.length > 280 ? 'text-rose-500 font-bold' : newCommentText.length >= 260 ? 'text-amber-400 font-bold' : 'text-[#71767B]'}>
                  {newCommentText.length}
                </span>
                <span className="text-zinc-600">/ 280</span>
                {newCommentText.length >= 260 && (
                  <span className="text-[10px] text-amber-400 mr-1 font-sans">
                    (متبقي {280 - newCommentText.length})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة عرض تفاصيل التغريدة الكاملة مع كل الردود (عند النقر على جسم التغريدة) */}
      {viewingDetailTweet && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col h-[100dvh] text-white overflow-hidden" dir="rtl">
          {/* شريط علوي */}
          <div className="h-14 border-b border-[#2F3336] px-4 flex items-center justify-between shrink-0 bg-black/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button onClick={() => setViewingDetailTweet(null)} className="p-2 hover:bg-zinc-900 rounded-full text-[#71767B] hover:text-white transition">
                <ArrowRight size={20} />
              </button>
              <h2 className="font-bold text-base">منشور</h2>
            </div>
          </div>

          {/* محتوى التغريدة والردود */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={viewingDetailTweet.authorAvatar || \`https://api.dicebear.com/7.x/bottts/svg?seed=\${viewingDetailTweet.authorId}\`} 
                alt="" 
                className="w-12 h-12 rounded-full object-cover border border-[#2F3336]" 
              />
              <div>
                <p className="font-bold text-sm text-white">{viewingDetailTweet.authorName}</p>
                <p className="text-xs text-[#71767B] font-mono" dir="ltr">@{viewingDetailTweet.authorUsername}</p>
              </div>
            </div>

            <p className="text-base text-[#E7E9EA] leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
              {viewingDetailTweet.text}
            </p>

            {viewingDetailTweet.image && (
              <div className="rounded-2xl overflow-hidden border border-[#2F3336] max-h-[450px]">
                <img src={viewingDetailTweet.image} alt="" className="w-full h-auto object-cover" />
              </div>
            )}

            <div className="text-xs text-[#71767B] py-2 border-y border-[#2F3336] flex items-center gap-2">
              <span>{viewingDetailTweet.createdAt}</span>
              <span>·</span>
              <span>{viewingDetailTweet.views || 1} مشاهدة</span>
            </div>

            {/* أزرار التفاعل في العرض الكامل */}
            <div className="flex items-center justify-around py-1 border-b border-[#2F3336] text-[#71767B]">
              <button onClick={() => { setActiveCommentTweet(viewingDetailTweet); setViewingDetailTweet(null); }} className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition">
                <MessageCircle size={18} />
                <span className="text-xs">{viewingDetailTweet.comments?.length || 0}</span>
              </button>
              <button onClick={() => handleRepost(viewingDetailTweet.id)} className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                <Repeat2 size={18} />
                <span className="text-xs">{viewingDetailTweet.reposts || 0}</span>
              </button>
              <button onClick={() => handleLike(viewingDetailTweet.id)} className="flex items-center gap-1.5 hover:text-rose-500 transition">
                <Heart size={18} />
                <span className="text-xs">{viewingDetailTweet.likes || 0}</span>
              </button>
              <button onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(window.location.href); showToast('تم نسخ الرابط! 🔗'); } }} className="hover:text-white transition">
                <Share size={18} />
              </button>
            </div>

            {/* قائمة التعليقات السابقة كلها */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-[#71767B]">الردود ({viewingDetailTweet.comments?.length || 0})</h3>
              {(!viewingDetailTweet.comments || viewingDetailTweet.comments.length === 0) ? (
                <div className="text-center py-8 text-zinc-500 text-xs">لا توجد ردود بعد. كن أول من يرد!</div>
              ) : (
                viewingDetailTweet.comments.map(c => (
                  <div key={c.id} className="p-3 bg-[#16181C] rounded-2xl border border-[#2F3336]/60 flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {c.authorAvatar ? <img src={c.authorAvatar} alt="" className="w-full h-full object-cover" /> : c.authorName[0]}
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

          {/* شريط انشر ردك السفلي بنظام X كما في الصورة */}
          <div className="p-3 border-t border-[#2F3336] bg-black shrink-0 flex items-center gap-3 pb-[max(env(safe-area-inset-bottom),12px)]">
            <button
              onClick={() => { setActiveCommentTweet(viewingDetailTweet); setViewingDetailTweet(null); }}
              className="flex-1 bg-[#16181C] hover:bg-[#202327] border border-[#2F3336] text-[#71767B] rounded-full px-4 py-2.5 text-xs text-right transition"
            >
              انشر ردّك...
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center font-bold">
              {myAvatar ? <img src={myAvatar} alt="" className="w-full h-full object-cover" /> : <span>{myName ? myName[0] : '؟'}</span>}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(oldModalRegex, newModalTop);

// 3. جعل النقر على جسم التغريدة والمساحة الفارغة يفتح العرض التفصيلي
code = code.replace(
  '<div className="flex-1 min-w-0">',
  '<div className="flex-1 min-w-0 cursor-pointer" onClick={(e) => { const tag = (e.target as HTMLElement).tagName; if (tag !== "BUTTON" && tag !== "A" && tag !== "SVG" && tag !== "PATH") setViewingDetailTweet(tweet); }}>'
);

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
console.log('KEYBOARD_AND_THREAD_VIEW_APPLIED_SUCCESSFULLY');
