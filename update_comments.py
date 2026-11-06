import re
import sys
from pathlib import Path

FILE_PATH = Path('src/pages/CommunityFeedPage.tsx')

if not FILE_PATH.exists():
    print(f"❌ الملف غير موجود: {FILE_PATH}")
    sys.exit(1)

# 1. عمل نسخة احتياطية
backup_path = FILE_PATH.with_suffix('.tsx.bak')
backup_path.write_text(FILE_PATH.read_text(encoding='utf-8'), encoding='utf-8')
print(f"✅ تم إنشاء نسخة احتياطية: {backup_path}")

code = FILE_PATH.read_text(encoding='utf-8')

# 2. الكود الجديد المطابق لتويتر
new_block = """viewingDetailTweet?.comments.map((c: any) => {
                  const cName = c.authorName || c.userName || c.user_name || 'مستخدم';
                  const cUsername = c.authorUsername || c.userUsername || c.username || 'user';
                  const cAvatar = c.authorAvatar || c.userAvatar || c.avatar_url || '';
                  const cUserId = c.authorId || c.userId || c.user_id;
                  const commentText = c.content || c.text || c.body || '';

                  return (
                    <article key={c.id} dir="rtl" className="py-3 px-3 border-b border-[#2F3336]/40 flex items-start gap-3 hover:bg-white/[0.02] transition select-none">
                      <div onClick={(e) => { e.stopPropagation(); if (cUserId && typeof openAuthorProfile === 'function') openAuthorProfile(cUserId, c); }} className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-90 transition aspect-square">
                        {cAvatar ? <img src={cAvatar} alt={cName} className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm">{cName ? [...cName][0] : '؟'}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span onClick={(e) => { e.stopPropagation(); if (cUserId && typeof openAuthorProfile === 'function') openAuthorProfile(cUserId, c); }} className="font-bold text-[14px] text-white hover:underline cursor-pointer">{cName}</span>
                            <span className="text-[13px] text-[#71767B]" dir="ltr">@{cUsername}</span>
                            <span className="text-[13px] text-[#71767B]">·</span>
                            <span className="text-[12px] text-[#71767B]">{formatTimeAgo && formatTimeAgo(c.createdAt)?.relative ? formatTimeAgo(c.createdAt).relative : (c.createdAtDisplay || 'الآن')}</span>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); if (typeof setActiveMenuPost === 'function') setActiveMenuPost({ id: c.id, text: commentText, authorName: cName, isComment: true }); }} className="text-[#71767B] hover:text-white p-1 rounded-full transition" title="خيارات"><MoreHorizontal size={15} className="rotate-90" /></button>
                        </div>
                        <p onClick={() => { if (typeof setNewCommentText === 'function') setNewCommentText(`@${cUsername} `); if (typeof setIsFullReplyOpen === 'function') setIsFullReplyOpen(true); }} className="text-[14px] text-[#E7E9EA] mt-1 leading-relaxed whitespace-pre-wrap break-words cursor-pointer select-text">{commentText}</p>
                        {(c.image || c.imageUrl) && <div className="mt-2 rounded-2xl overflow-hidden border border-[#2F3336]/40 max-h-64"><img src={c.image || c.imageUrl} alt="مرفق" className="w-full h-auto object-cover max-h-64" loading="lazy" /></div>}
                        <div className="flex items-center justify-between text-[#71767B] mt-3 max-w-[300px]">
                          <button type="button" onClick={(e) => { e.stopPropagation(); if (typeof setNewCommentText === 'function') setNewCommentText(`@${cUsername} `); if (typeof setIsFullReplyOpen === 'function') setIsFullReplyOpen(true); }} className="flex items-center gap-1 hover:text-[#1D9BF0] transition group"><div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><MessageCircle size={16} /></div><span className="text-[11px]">{c.repliesCount > 0 ? c.repliesCount : ''}</span></button>
                          <button type="button" className="flex items-center gap-1 hover:text-[#00BA7C] transition group"><div className="p-1.5 rounded-full group-hover:bg-[#00BA7C]/10"><Repeat2 size={16} /></div><span className="text-[11px]">{c.retweetsCount > 0 ? c.retweetsCount : ''}</span></button>
                          <button type="button" className="flex items-center gap-1 hover:text-[#F91880] transition group"><div className="p-1.5 rounded-full group-hover:bg-[#F91880]/10"><Heart size={16} /></div><span className="text-[11px]">{c.likesCount > 0 ? c.likesCount : ''}</span></button>
                          <button type="button" className="flex items-center gap-1 hover:text-[#1D9BF0] transition group"><div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><BarChart2 size={16} /></div><span className="text-[11px]">{c.viewsCount > 0 ? c.viewsCount : ''}</span></button>
                          <button type="button" className="hover:text-[#1D9BF0] transition group p-1.5"><Share2 size={16} /></button>
                        </div>
                      </div>
                    </article>
                  );
                })"""

# 3. البحث عن الكود القديم واستبداله
# نبحث عن viewingDetailTweet?.comments.map ونستبدل حتى إغلاق الـ map
pattern = r'viewingDetailTweet\?\.comments\.map\([^)]+\)\s*\{?[\s\S]*?\}\)'
match = re.search(pattern, code)

if match:
    code = code[:match.start()] + new_block + code[match.end():]
    print("✅ تم استبدال بلوك التعليقات بنجاح.")
else:
    print("⚠️ لم يتم العثور على النمط الدقيق لـ comments.map. قد يكون الكود القديم مختلفاً.")
    print("تأكد يدوياً من وجود 'viewingDetailTweet?.comments.map' في الملف.")

# 4. التأكد من استيراد الأيقونات من lucide-react
icons_needed = ['MessageCircle', 'Repeat2', 'Heart', 'BarChart2', 'Share2', 'MoreHorizontal']
missing_icons = [icon for icon in icons_needed if icon not in code.split('export default')[0]]

if missing_icons:
    print(f"⚠️ الأيقونات التالية مفقودة في الاستيراد: {', '.join(missing_icons)}")
    print("يرجى إضافتها يدوياً في أعلى الملف: import { ... } from 'lucide-react';")
else:
    print("✅ جميع الأيقونات المطلوبة مستوردة بنجاح.")

# 5. حفظ الملف
FILE_PATH.write_text(code, encoding='utf-8')
print(f"🎉 تم الانتهاء! الملف محدّث: {FILE_PATH}")
print("إذا حدث خطأ، يمكنك استعادة النسخة الاحتياطية بالأمر: mv src/pages/CommunityFeedPage.tsx.bak src/pages/CommunityFeedPage.tsx")
