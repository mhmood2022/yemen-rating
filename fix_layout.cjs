const fs = require('fs');
const filePath = 'src/pages/CommunityFeedPage.tsx';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // هذا هو الكود الحالي (كما أرسلته أنت) مع الخطأ في الإغلاق
    const oldCode = `                              <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                                <span onClick={() => openAuthorProfile(tweet.authorId, tweet)} className="font-bold text-white text-sm hover:underline cursor-pointer flex items-center gap-1">
                                  {tweet.authorName}
                                  {/* شارة التوثيق - تظهر إذا كان المستخدم موثقاً */}
                                  {tweet.isVerified && <CheckCircle2 size={14} className="text-[#1D9BF0]" />}
                                </span>
                                <span className="text-xs text-[#71767B] font-mono" dir="ltr">@{tweet.authorUsername}</span>
                                <span className="text-xs text-[#71767B]">·</span>
                                <span className="text-xs text-[#71767B]" title={tweet.createdAtDisplay || tweet.createdAt}>{formatTimeAgo(tweet.createdAt)}</span>
                              <div className="flex items-center gap-1 shrink-0">
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
                              </div>
                              </div>`;

    // الكود الجديد: إغلاق حاوية الاسم قبل الأزرار، ثم وضع الأزرار كشقيقة لها
    const newCode = `                              <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                                <span onClick={() => openAuthorProfile(tweet.authorId, tweet)} className="font-bold text-white text-sm hover:underline cursor-pointer flex items-center gap-1">
                                  {tweet.authorName}
                                  {/* شارة التوثيق - تظهر إذا كان المستخدم موثقاً */}
                                  {tweet.isVerified && <CheckCircle2 size={14} className="text-[#1D9BF0]" />}
                                </span>
                                <span className="text-xs text-[#71767B] font-mono" dir="ltr">@{tweet.authorUsername}</span>
                                <span className="text-xs text-[#71767B]">·</span>
                                <span className="text-xs text-[#71767B]" title={tweet.createdAtDisplay || tweet.createdAt}>{formatTimeAgo(tweet.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
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

    if (!content.includes(oldCode)) {
        console.error("❌ لم يتم العثور على الكود المستهدف. تأكد من أن الملف يحتوي على نفس الكود الذي أرسلته.");
        process.exit(1);
    }

    content = content.replace(oldCode, newCode);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("✅ تم إصلاح الترتيب بنجاح (الأزرار الآن في أقصى اليسار دائماً).");

} catch (error) {
    console.error("❌ حدث خطأ:", error.message);
    process.exit(1);
}
