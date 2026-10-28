const fs = require('fs');
const filePath = 'src/pages/CommunityFeedPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// البحث عن شريط الكتابة السفلي القديم (الذي يحتوي على "انشر ردّك...")
const startMarker = '<div className="p-3 border-t border-[#2F3336] bg-black shrink-0">';
const startIndex = content.lastIndexOf(startMarker);

if (startIndex === -1) {
    console.error('❌ لم يتم العثور على شريط الكتابة السفلي.');
    process.exit(1);
}

// البحث عن نهاية الشريط (أول </div> بعد startIndex)
// نبحث عن النمط: </form>\n          </div>
const endMarker = '</form>';
const endIndex = content.indexOf(endMarker, startIndex);
if (endIndex === -1) {
    console.error('❌ لم يتم العثور على نهاية شريط الكتابة.');
    process.exit(1);
}

// نحتاج إلى إغلاق الحاوية أيضاً
const endDivIndex = content.indexOf('</div>', endIndex);
if (endDivIndex === -1) {
    console.error('❌ لم يتم العثور على إغلاق الحاوية.');
    process.exit(1);
}

const oldBar = content.substring(startIndex, endDivIndex + 6);

// شريط الكتابة الجديد (تصميم X، مع هويتنا)
const newBar = `<div className="p-3 border-t border-[#2F3336] bg-black shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleAddComment(); }} className="flex items-start gap-2">
              {/* الصورة الشخصية (تظهر فقط عندما يكون الحقل فارغاً) */}
              {!newCommentText && (
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 mt-1.5">
                  {myAvatar ? (
                    <img src={myAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold flex items-center justify-center h-full">{myName ? myName[0] : '؟'}</span>
                  )}
                </div>
              )}

              {/* حقل الإدخال (قابل للتوسع) */}
              <div className="flex-1 bg-[#111111] border border-[#2F3336] rounded-2xl p-2.5 focus-within:border-[#FFC500] transition-all">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="انشر ردّك..."
                  maxLength={280}
                  rows={newCommentText ? 3 : 1}
                  className="w-full bg-transparent text-white text-sm placeholder-[#71767B] focus:outline-none resize-none"
                  style={{ minHeight: newCommentText ? '60px' : '24px' }}
                />
                
                {/* الأيقونات السفلية (تظهر فقط أثناء الكتابة) */}
                {newCommentText && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2F3336]/50">
                    <div className="flex items-center gap-3 text-[#FFC500]">
                      <button type="button" className="hover:bg-[#FFC500]/10 p-1.5 rounded-full transition" title="إضافة صورة">
                        <ImageIcon size={18} />
                      </button>
                      <button type="button" className="hover:bg-[#FFC500]/10 p-1.5 rounded-full transition" title="GIF">
                        <span className="text-[10px] font-bold border border-[#FFC500] rounded px-1">GIF</span>
                      </button>
                      <button type="button" className="hover:bg-[#FFC500]/10 p-1.5 rounded-full transition" title="إيموجي">
                        <span className="text-sm">😊</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={\`text-[10px] font-mono \${newCommentText.length > 280 ? 'text-rose-500' : newCommentText.length > 260 ? 'text-amber-400' : 'text-[#71767B]'}\`}>
                        {280 - newCommentText.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* زر الرد */}
              <button
                type="submit"
                disabled={!newCommentText.trim() || newCommentText.length > 280}
                className="px-4 py-2 bg-[#FFC500] text-black font-bold text-xs rounded-full hover:bg-[#E5B200] transition disabled:opacity-40 shrink-0 mt-1"
              >
                ردّ
              </button>
            </form>
          </div>`;

// استبدال الشريط القديم بالجديد
content = content.replace(oldBar, newBar);
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ تم استبدال شريط الكتابة بتصميم X (مع هويتنا).');
