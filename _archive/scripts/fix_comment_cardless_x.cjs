const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// استبدال شكل عنصر التعليق بالكامل ليكون مطابقاً لمنصة X بدون بطاقات
const oldCommentBoxStart = `viewingDetailTweet?.comments.map(c => (`;
const oldCommentBoxEnd = `))
              )}`;

const startIdx = code.indexOf(oldCommentBoxStart);

if (startIdx !== -1) {
  const mapEndIdx = code.indexOf('))', startIdx);
  
  const newCardlessComment = `viewingDetailTweet?.comments.map(c => (
                  <div key={c.id} className="py-3 px-1 border-b border-[#2F3336]/60 flex gap-3 hover:bg-white/[0.01] transition">
                    
                    {/* صورة المستخدم على اليمين */}
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {c.authorAvatar ? (
                        <img src={c.authorAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{c.authorName ? c.authorName[0] : '؟'}</span>
                      )}
                    </div>

                    {/* تفاصيل التعليق بنظام X المفتوح */}
                    <div className="flex-1 min-w-0">
                      
                      {/* السطر العلوي: الاسم + اليوزر + الوقت */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white hover:underline cursor-pointer">
                          {c.authorName}
                        </span>
                        <span className="text-[11px] text-[#71767B] font-mono" dir="ltr">
                          @{c.authorUsername || 'user'}
                        </span>
                        <span className="text-xs text-[#71767B]">·</span>
                        <span className="text-[11px] text-[#71767B]">{c.createdAt}</span>
                      </div>

                      {/* نص التعليق */}
                      <p className="text-xs text-[#E7E9EA] mt-1.5 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap select-text">
                        {c.text}
                      </p>

                      {/* صورة التعليق إن وجدت */}
                      {c.image && (
                        <div className="mt-2.5 rounded-2xl overflow-hidden border border-[#2F3336] max-h-72 bg-black">
                          <img src={c.image} alt="مرفق الرد" className="w-full h-auto object-cover max-h-72" loading="lazy" />
                        </div>
                      )}

                      {/* أزرار التفاعل المصغرة بنظام X تحت كل تعليق */}
                      <div className="flex items-center justify-between text-[#71767B] text-[11px] mt-2.5 max-w-xs">
                        <button type="button" className="flex items-center gap-1 hover:text-[#1D9BF0] transition group">
                          <div className="p-1 rounded-full group-hover:bg-[#1D9BF0]/10">
                            <MessageCircle size={14} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-emerald-400 transition group">
                          <div className="p-1 rounded-full group-hover:bg-emerald-500/10">
                            <Repeat2 size={14} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-rose-500 transition group">
                          <div className="p-1 rounded-full group-hover:bg-rose-500/10">
                            <Heart size={14} />
                          </div>
                        </button>
                        <button type="button" className="flex items-center gap-1 hover:text-white transition group">
                          <div className="p-1 rounded-full group-hover:bg-white/10">
                            <Share size={13} />
                          </div>
                        </button>
                      </div>

                    </div>
                  </div>
                `;

  // استبدال كود الـ map
  const before = code.slice(0, startIdx);
  const after = code.slice(mapEndIdx);
  code = before + newCardlessComment + after;

  fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
  console.log('SUCCESS_CARDLESS_COMMENTS_APPLIED_PERFECTLY');
} else {
  console.log('START_INDEX_NOT_FOUND');
}
