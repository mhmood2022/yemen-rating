const fs = require('fs');
const filePath = 'src/pages/CommunityFeedPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// الكود القديم الذي يحتوي على الثلاث نقاط (داخل الشرط)
const oldCode = `{tweet.authorId === currentUserId && (
                                <button onClick={(e) => { e.stopPropagation(); setActiveMenuPost(tweet); }} className="text-[#71767B] hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition ml-auto" title="المزيد">
                                  <MoreHorizontal size={16} />
                                </button>
                              )}`;

// الكود الجديد: زر الإبلاغ يظهر دائماً، وزر الثلاث نقاط يظهر فقط لتغريداتك
const newCode = `<div className="flex items-center gap-1 ml-auto">
                                {/* زر الإبلاغ يظهر لكل التغريدات */}
                                <button onClick={(e) => { e.stopPropagation(); setReportingItem({ type: "post", targetId: tweet.id, targetName: tweet.authorName || "مستخدم", targetAuthorId: tweet.authorId || "" }); }} className="text-[#71767B] hover:text-rose-500 p-1.5 rounded-full hover:bg-rose-500/10 transition" title="إبلاغ عن التغريدة">
                                  <Flag size={16} />
                                </button>
                                
                                {/* زر الثلاث نقاط يظهر فقط لتغريداتك */}
                                {tweet.authorId === currentUserId && (
                                  <button onClick={(e) => { e.stopPropagation(); setActiveMenuPost(tweet); }} className="text-[#71767B] hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition" title="المزيد">
                                    <MoreHorizontal size={16} />
                                  </button>
                                )}
                              </div>`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("✅ تم استبدال الكود بنجاح! زر الإبلاغ سيظهر الآن للجميع.");
} else {
    console.log("❌ لم يتم العثور على الكود القديم. يرجى إرسال الأسطر 1085-1097 بدقة.");
}
