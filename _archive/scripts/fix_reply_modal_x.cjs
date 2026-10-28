const fs = require('fs');

let lines = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8').split('\n');

let modalStart = -1;
let modalEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{activeCommentTweet && (') && modalStart === -1) {
    modalStart = i;
  }
  if (modalStart !== -1 && lines[i].includes('{/* نافذة البلاغات */}')) {
    modalEnd = i;
    break;
  }
}

if (modalStart !== -1 && modalEnd !== -1) {
  const newModalCode = `      {/* نافذة الرد بنظام منصة X المطابق 100% */}
      {activeCommentTweet && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start justify-center p-0 sm:p-4 overflow-y-auto" dir="rtl">
          <div className="bg-black border border-[#2F3336] w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl p-4 sm:p-5 text-white flex flex-col shadow-2xl">
            
            {/* الشريط العلوي: زر الإغلاق وزر الرّد بنظام X */}
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

            {/* سطر الرد على صاحب التغريدة بنظام X */}
            <div className="text-xs text-[#71767B] mb-3 flex items-center gap-1">
              <span>رداً على</span>
              <span className="text-[#1D9BF0] font-mono font-bold" dir="ltr">@{activeCommentTweet.authorUsername}</span>
            </div>

            {/* قالب كتابة الرد مع صورة المستخدم */}
            <div className="flex gap-3 mb-4 flex-1">
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

            {/* شريط الأدوات والعداد السفلي بنظام X */}
            <div className="flex items-center justify-between pt-3 border-t border-[#2F3336] mb-4">
              <div className="flex items-center gap-2 text-[#1D9BF0]">
                <button type="button" className="p-2 hover:bg-[#1D9BF0]/10 rounded-full transition" title="إرفاق صورة">
                  <ImageIcon size={19} />
                </button>
              </div>

              {/* عداد الـ 280 حرف المباشر */}
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

            {/* قائمة الردود السابقة إن وجدت */}
            {activeCommentTweet.comments && activeCommentTweet.comments.length > 0 && (
              <div className="border-t border-[#2F3336] pt-3 max-h-56 overflow-y-auto space-y-2.5">
                <p className="text-[11px] font-bold text-[#71767B] mb-2">الردود السابقة ({activeCommentTweet.comments.length})</p>
                {activeCommentTweet.comments.map(c => (
                  <div key={c.id} className="p-2.5 bg-[#16181C] rounded-2xl border border-[#2F3336]/60 flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {c.authorAvatar ? <img src={c.authorAvatar} alt="" className="w-full h-full object-cover" /> : c.authorName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{c.authorName}</span>
                        <span className="text-[10px] text-zinc-500">{c.createdAt}</span>
                      </div>
                      <p className="text-xs text-zinc-200 mt-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
`;

  lines.splice(modalStart, (modalEnd - modalStart), newModalCode);
  fs.writeFileSync('src/pages/CommunityFeedPage.tsx', lines.join('\n'), 'utf8');
  console.log('REPLY_MODAL_MATCHED_X_PERFECTLY');
} else {
  console.log('MODAL_BOUNDS_NOT_FOUND', { modalStart, modalEnd });
}
