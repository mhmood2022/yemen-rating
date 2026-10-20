FILE = "src/pages/CommunityFeedPage.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1) جلب dbReposts
OLD1 = "let localUsers = {};"
NEW1 = """// جلب إعادة النشر
        const { data: dbReposts } = await supabase
          .from('post_reposts')
          .select('id, post_id, user_id, quote_text, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        let localUsers = {};"""

if OLD1 in content:
    content = content.replace(OLD1, NEW1, 1)
    print("✅ [1] dbReposts")
else:
    print("⚠️ [1] لم أجد")

# 2) بناء repostTweets
OLD2 = """        setTweets(cloudTweets);
        safeSetStorage(GLOBAL_FEED_KEY, cloudTweets);"""

NEW2 = """        // بناء التغريدات المُعاد نشرها
        const repostTweets: any[] = (dbReposts || []).map((r: any) => {
          const original = dbPosts.find((p: any) => p.id === r.post_id);
          const reposter = profileMap.get(r.user_id);
          if (!original || !reposter) return null;
          
          const originalAuthor = profileMap.get(original.user_id);
          
          return {
            id: `repost-${r.id}`,
            repostId: r.id,
            reposterId: r.user_id,
            reposterName: reposter.full_name || 'مستخدم',
            reposterUsername: reposter.username || 'user',
            reposterAvatar: reposter.avatar_url || '',
            quote_text: r.quote_text,
            isRepost: true,
            originalId: original.id,
            authorId: original.user_id,
            authorName: originalAuthor?.full_name || 'مستخدم',
            authorUsername: originalAuthor?.username || 'user',
            authorAvatar: originalAuthor?.avatar_url || '',
            text: original.content,
            image: original.image_url || undefined,
            createdAt: r.created_at,
            createdAtDisplay: new Date(r.created_at).toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
            likes: original.likes_count || 0,
            reposts: 0,
            replies: original.comments_count || 0,
            views: 1,
            comments: [],
          };
        }).filter(Boolean);

        setTweets([...cloudTweets, ...repostTweets]);
        safeSetStorage(GLOBAL_FEED_KEY, [...cloudTweets, ...repostTweets]);"""

if OLD2 in content:
    content = content.replace(OLD2, NEW2, 1)
    print("✅ [2] repostTweets")
else:
    print("⚠️ [2] لم أجد — أرسل grep")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ تم الحفظ")
