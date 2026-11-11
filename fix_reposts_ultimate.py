import os, re

# 1. إصلاح ملف الأزرار (XActionBar) لعزل رقم العداد عن الأيقونة
bar_file = 'src/components/feed/XActionBar.tsx'
if os.path.exists(bar_file):
    with open(bar_file, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # البحث عن كود الرقم وإضافة حدث الفتح عليه
    pattern = re.compile(r'<span className="text-\[10px\] font-normal leading-none transition-colors group-hover:text-\[#00BA7C\]">\s*\{formatCountArabic\(repostsCount\)\}\s*</span>')
    new_span = """<span onClick={(e) => { e.stopPropagation(); if(onViewEngagements) onViewEngagements(tweet); }} className={`text-[10px] font-normal leading-none cursor-pointer hover:underline transition-colors ${isReposted ? 'text-[#00BA7C]' : 'group-hover:text-[#00BA7C]'}`}>
          {formatCountArabic(repostsCount)}
        </span>"""
    
    if pattern.search(c):
        c = pattern.sub(new_span, c)
        print("✅ تم ربط زر الرقم بفتح صفحة المشاركات (XActionBar)")
    
    with open(bar_file, 'w', encoding='utf-8') as f:
        f.write(c)

# 2. إصلاح صفحات المجتمع والحساب (إزالة repost- وتحديث النصوص)
for f in ['src/pages/CommunityFeedPage.tsx', 'src/pages/AccountPage.tsx']:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as f:
            c = f.read()

        # إصلاح دالة إعادة النشر لتجاهل كلمة repost
        if 'const handleRepost = async (id: string) => {' in c:
            c = c.replace(
                'const handleRepost = async (id: string) => {',
                'const handleRepost = async (rawId: string) => {\n    const id = rawId.toString().replace("repost-", "");'
            )

        # إصلاح نص النافذة ليصبح أخضر ويظهر "التراجع"
        old_span = """<span className="text-white font-bold text-[15px]">إعادة النشر</span>"""
        new_span = """<span className={repostMenu.isReposted ? "text-[#00BA7C] font-bold text-[15px]" : "text-white font-bold text-[15px]"}>
                {repostMenu.isReposted ? "التراجع عن إعادة النشر" : "إعادة النشر"}
              </span>"""
        c = c.replace(old_span, new_span)

        old_icon = """<Repeat2 size={22} className="text-white" />"""
        new_icon = """<Repeat2 size={22} className={repostMenu.isReposted ? "text-[#00BA7C]" : "text-white"} />"""
        c = c.replace(old_icon, new_icon)

        with open(f, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"✅ تم إصلاح دوال ونصوص إعادة النشر في: {f}")

# 3. إصلاح نافذة المشاركات (PostEngagementsModal) لتجاهل repost-
modal_file = 'src/components/feed/PostEngagementsModal.tsx'
if os.path.exists(modal_file):
    with open(modal_file, 'r', encoding='utf-8') as f:
        c = f.read()
    if ".eq('post_id', post.id)" in c:
        c = c.replace(
            ".eq('post_id', post.id)",
            ".eq('post_id', post.id.toString().replace('repost-', ''))"
        )
    with open(modal_file, 'w', encoding='utf-8') as f:
        f.write(c)
    print("✅ تم إصلاح نافذة المشاركات لجلب الإعادات الصحيحة")

print("🎉 اكتمل الإصلاح! اذهب للخادم المحلي واختبر.")
