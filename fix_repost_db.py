import re

FILE = "src/pages/CommunityFeedPage.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# البحث عن الدالة القديمة واستبدالها بدالة تتصل بـ Supabase
pattern = r"const handleRepost = \(id: string\) => \{[\s\S]*?showToast\(nextIsReposted \? 'تمت إعادة النشر! 🔁' : 'تم إلغاء إعادة النشر'\);\n  \};"

NEW_FUNC = '''const handleRepost = async (id: string) => {
    if (!currentUserId) {
      showToast('يرجى تسجيل الدخول');
      return;
    }

    try {
      // 1) التحقق هل المستخدم أعاد النشر مسبقاً
      const { data: existing } = await supabase
        .from('post_reposts')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      let nextIsReposted = false;

      if (existing) {
        // إلغاء إعادة النشر
        await supabase
          .from('post_reposts')
          .delete()
          .eq('id', existing.id);
        nextIsReposted = false;
      } else {
        // إعادة نشر جديدة
        await supabase
          .from('post_reposts')
          .insert({
            post_id: id,
            user_id: currentUserId,
            quote_text: null // إعادة نشر بسيطة بدون اقتباس
          });
        nextIsReposted = true;
        
        // إرسال إشعار لصاحب التغريدة
        const targetTweet = tweets.find(t => t.id === id);
        if (targetTweet) {
          sendRealNotification(targetTweet.authorId, 'repost', `أعاد ${myName} نشر تغريدتك`, targetTweet.id);
        }
      }

      // 2) تحديث الواجهة محلياً
      const updated = tweets.map(t => {
        if (t.id === id) {
          const repostedBy = t.repostedBy || [];
          const nextReposted = nextIsReposted 
            ? [...repostedBy, currentUserId] 
            : repostedBy.filter(uid => uid !== currentUserId);
          
          return {
            ...t,
            reposts: nextReposted.length,
            repostedBy: nextReposted,
          };
        }
        return t;
      });

      setTweets(updated);
      showToast(nextIsReposted ? 'تمت إعادة النشر! 🔁' : 'تم إلغاء إعادة النشر');

    } catch (error) {
      console.error('Repost error:', error);
      showToast('حدث خطأ أثناء إعادة النشر');
    }
  };'''

# استبدال الدالة
content, count = re.subn(pattern, NEW_FUNC, content, count=1)

if count > 0:
    with open(FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ [1] تم إصلاح handleRepost لتحفظ في قاعدة البيانات")
else:
    print("⚠️ لم أجد الدالة القديمة. قد تكون تغيرت.")
    print("أرسل: sed -n '/const handleRepost/,/^  };/p' src/pages/CommunityFeedPage.tsx")

