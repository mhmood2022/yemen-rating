const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. التأكد من دعم image في interface Comment
code = code.replace(
  "interface Comment {\n  id: string;",
  "interface Comment {\n  id: string;\n  image?: string;"
);

// 2. تمرير الصورة في دالة handleAddComment عند إنشاء newComment
const oldNewCommentObj = `    const newComment: Comment = {
      id: commentId,
      authorId: currentUserId || 'guest',
      authorName: myName || 'مستخدم',
      authorUsername: myUsername || 'user',
      authorAvatar: myAvatar || '',
      text: textToSend,
      createdAt: 'الآن'
    };`;

const newNewCommentObj = `    const newComment: Comment = {
      id: commentId,
      authorId: currentUserId || 'guest',
      authorName: myName || 'مستخدم',
      authorUsername: myUsername || 'user',
      authorAvatar: myAvatar || '',
      text: textToSend,
      image: commentImage || undefined,
      createdAt: 'الآن'
    };`;

if (code.includes(oldNewCommentObj)) {
  code = code.replace(oldNewCommentObj, newNewCommentObj);
}

// 3. إضافة عرض صورة التعليق تحت نص التعليق في كل أماكن عرض الردود
const oldCommentTextP = `<p className="text-xs text-zinc-200 mt-1 leading-relaxed break-words [overflow-wrap:anywhere]">{c.text}</p>`;

const newCommentTextWithImage = `<p className="text-xs text-zinc-200 mt-1 leading-relaxed break-words [overflow-wrap:anywhere]">{c.text}</p>
                      {c.image && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-[#2F3336] max-h-60 bg-black">
                          <img src={c.image} alt="مرفق الرد" className="w-full h-auto object-cover max-h-60" loading="lazy" />
                        </div>
                      )}`;

code = code.replaceAll(oldCommentTextP, newCommentTextWithImage);

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
console.log('SUCCESS_COMMENT_IMAGE_DISPLAY_APPLIED');
