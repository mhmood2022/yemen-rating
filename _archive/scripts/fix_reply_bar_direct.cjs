const fs = require('fs');

let content = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. تحديث دالة handleAddComment لتأخذ الاسم الحقيقي والصورة الحقيقية للمستخدم
const startAddComment = content.indexOf('const handleAddComment = (e: React.FormEvent) => {');
const endAddComment = content.indexOf("showToast('تم نشر ردك بنجاح! 💬');");

if (startAddComment !== -1 && endAddComment !== -1) {
  const afterToast = content.indexOf('};', endAddComment);
  const newAddCommentCode = `const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPost = viewingDetailTweet || activeCommentTweet;
    if (!newCommentText.trim() || !targetPost) return;

    if (newCommentText.length > 280) {
      showToast('التعليق يجب أن لا يتجاوز 280 حرفاً');
      return;
    }

    // استخراج اسم المستخدم الحقيقي وصورته من الجلسة
    let authorIdToUse = currentUserId || 'guest';
    let authorNameToUse = myName;
    let authorUsernameToUse = myUsername;
    let authorAvatarToUse = myAvatar;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        authorIdToUse = session.user.id;
        const meta = session.user.user_metadata || {};
        const metaName = meta.full_name || meta.name;
        const emailPrefix = session.user.email ? session.user.email.split('@')[0] : '';

        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        if (prof?.full_name && prof.full_name !== 'مستخدم جديد' && prof.full_name !== 'مستخدم يمن ريتنج') {
          authorNameToUse = prof.full_name;
        } else if (metaName) {
          authorNameToUse = metaName;
        } else if (emailPrefix) {
          authorNameToUse = emailPrefix;
        }

        if (prof?.username && !prof.username.startsWith('user_')) {
          authorUsernameToUse = prof.username;
        } else if (meta.username) {
          authorUsernameToUse = meta.username;
        }

        if (prof?.avatar_url) authorAvatarToUse = prof.avatar_url;
        else if (meta.avatar_url) authorAvatarToUse = meta.avatar_url;
      }
    } catch (_) {}

    const newComment: Comment = {
      id: Date.now().toString(),
      authorId: authorIdToUse,
      authorName: authorNameToUse,
      authorUsername: authorUsernameToUse,
      authorAvatar: authorAvatarToUse,
      text: newCommentText.trim(),
      createdAt: 'الآن'
    };

    const targetAuthorId = targetPost.authorId;
    const targetPostId = targetPost.id;
    const commentContent = newCommentText.trim();

    const updated = tweets.map(t => {
      if (t.id === targetPost.id) {
        const existingComments = t.comments || [];
        const nextComments = [...existingComments, newComment];
        return {
          ...t,
          comments: nextComments,
          replies: nextComments.length
        };
      }
      return t;
    });

    setTweets(updated);
    safeSetStorage(GLOBAL_FEED_KEY, updated);

    const freshTarget = updated.find(t => t.id === targetPost.id);
    if (freshTarget) {
      if (activeCommentTweet) setActiveCommentTweet(freshTarget);
      if (viewingDetailTweet) setViewingDetailTweet(freshTarget);
    }

    sendRealNotification(targetAuthorId, 'comment', \`علّق \${authorNameToUse} على منشورك: "\${commentContent.slice(0, 30)}..."\`, targetPostId);

    setNewCommentText('');
    showToast('تم نشر ردك بنجاح! 💬');
  };`;

  content = content.slice(0, startAddComment) + newAddCommentCode + content.slice(afterToast + 2);
  console.log('SUCCESS_ADD_COMMENT_FUNCTION_UPDATED');
} else {
  console.log('ADD_COMMENT_NOT_FOUND', { startAddComment, endAddComment });
}

// 2. استبدال شريط الفوتر بالكامل بنموذج إدخال حقيقي بنظام X (الصورة يمين، الحقل وسط، الزر يسار)
const startFooter = content.indexOf('{/* شريط انشر ردك السفلي بنظام X كما في الصورة */}');
const endFooter = content.indexOf('{/* نافذة البلاغات */}');

if (startFooter !== -1 && endFooter !== -1) {
  const newFooterMarkup = `{/* شريط انشر ردك السفلي بنظام X كما في الصورة */}
          <div className="p-2.5 sm:p-3 border-t border-[#2F3336] bg-black shrink-0 transition-all duration-75" style={{ paddingBottom: Math.max(12, viewportBottomOffset) }}>
            <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
              
              {/* صورة المستخدم على اليمين أولاً */}
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center font-bold">
                {myAvatar ? (
                  <img src={myAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{myName ? myName[0] : '؟'}</span>
                )}
              </div>

              {/* حقل الإدخال الحقيقي الفوري */}
              <div className="flex-1 bg-[#16181C] border border-[#2F3336] rounded-full px-4 py-2 flex items-center gap-2 focus-within:border-[#1D9BF0]">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="انشر ردّك..."
                  maxLength={280}
                  className="flex-1 bg-transparent text-white text-xs placeholder-[#71767B] focus:outline-none"
                />

                {newCommentText.length > 0 && (
                  <span className={\`text-[10px] font-mono select-none \${newCommentText.length > 280 ? 'text-rose-500 font-bold' : newCommentText.length >= 260 ? 'text-amber-400' : 'text-[#71767B]'}\`}>
                    {280 - newCommentText.length}
                  </span>
                )}
              </div>

              {/* زر الرد الأزرق على اليسار */}
              <button
                type="submit"
                disabled={!newCommentText.trim() || newCommentText.length > 280}
                className="px-4 py-2 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-xs font-black transition active:scale-95 shrink-0"
              >
                الردّ
              </button>

            </form>
          </div>

        </div>
      )}

      `;

  content = content.slice(0, startFooter) + newFooterMarkup + content.slice(endFooter);
  console.log('SUCCESS_FOOTER_REPLACED_WITH_REAL_INPUT');
} else {
  console.log('FOOTER_BOUNDS_NOT_FOUND', { startFooter, endFooter });
}

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', content, 'utf8');
