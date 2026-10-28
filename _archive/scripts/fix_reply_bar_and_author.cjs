const fs = require('fs');

let code = fs.readFileSync('src/pages/CommunityFeedPage.tsx', 'utf8');

// 1. تحديث دالة handleAddComment لتدعم الرد المباشر وتأخذ الاسم الحقيقي للمستخدم
const oldAddCommentRegex = /\/\/ إضافة رد[\s\S]*?const handleAddComment = \(e: React\.FormEvent\) => \{[\s\S]*?showToast\('تم نشر ردك بنجاح! 💬'\);\s*\};/;

const newAddComment = `// إضافة رد بنظام منصة X الدقيق
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPost = viewingDetailTweet || activeCommentTweet;
    if (!newCommentText.trim() || !targetPost) return;

    if (newCommentText.length > 280) {
      showToast('التعليق يجب أن لا يتجاوز 280 حرفاً');
      return;
    }

    // استخراج الهوية الحقيقية للمستخدم المسجل
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
        
        // استرجاع الاسم الحقيقي من profiles إن وجد
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
        } else if (emailPrefix) {
          authorUsernameToUse = emailPrefix;
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

    // تحديث مصفوفة التغريدات العامة
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

    // تحديث شاشة العرض الحالية فوراً
    const freshTarget = updated.find(t => t.id === targetPost.id);
    if (freshTarget) {
      if (activeCommentTweet) setActiveCommentTweet(freshTarget);
      if (viewingDetailTweet) setViewingDetailTweet(freshTarget);
    }

    sendRealNotification(targetAuthorId, 'comment', \`علّق \${authorNameToUse} على منشورك: "\${commentContent.slice(0, 30)}..."\`, targetPostId);

    setNewCommentText('');
    showToast('تم نشر ردك بنجاح! 💬');
  };`;

code = code.replace(oldAddCommentRegex, newAddComment);

// 2. استبدال شريط الفوتر في شاشة تفاصيل المنشور ليكون نموذج كتابة فوري مطابق لمنصة X
const oldDetailFooterRegex = /\{/\* الشريط السفلي الثابت المماثل لـ X[\s\S]*?\{\/\* نافذة البلاغات \*\/\}/;

const newDetailFooter = `{/* الشريط السفلي الثابت المماثل لـ X تماماً: إدخال حقيقي مع الصورة على اليمين والزر على اليسار */}
          <div className="p-2.5 sm:p-3 border-t border-[#2F3336] bg-black shrink-0 transition-all duration-75" style={{ paddingBottom: Math.max(12, viewportBottomOffset) }}>
            <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
              
              {/* صورة المستخدم على اليمين بنظام RTL */}
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center font-bold">
                {myAvatar ? (
                  <img src={myAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{myName ? myName[0] : '؟'}</span>
                )}
              </div>

              {/* حقل الإدخال الحقيقي الفوري */}
              <div className="flex-1 bg-[#16181C] border border-[#2F3336] rounded-full px-4 py-1.5 flex items-center gap-2 focus-within:border-[#1D9BF0]">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="انشر ردّك..."
                  maxLength={280}
                  className="flex-1 bg-transparent text-white text-xs placeholder-[#71767B] focus:outline-none"
                />

                {/* عداد الحروف الخفيف */}
                {newCommentText.length > 0 && (
                  <span className={\`text-[10px] font-mono select-none \${newCommentText.length > 280 ? 'text-rose-500 font-bold' : newCommentText.length >= 260 ? 'text-amber-400' : 'text-[#71767B]'}\`}>
                    {280 - newCommentText.length}
                  </span>
                )}
              </div>

              {/* زر الإرسال الأزرق على اليسار */}
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

      {/* نافذة البلاغات */}`;

code = code.replace(oldDetailFooterRegex, newDetailFooter);

fs.writeFileSync('src/pages/CommunityFeedPage.tsx', code, 'utf8');
console.log('REPLY_BAR_AND_REAL_AUTHOR_SYNCED_PERFECTLY');
