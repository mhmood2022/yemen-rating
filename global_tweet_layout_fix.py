import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. إجبار أي هيدر تغريدة على استخدام flex-nowrap وعدم النزول لسطر جديد
    # نبحث عن أي حاوية تحتوي على flex items-center وتحتوي على dir="rtl"
    content = re.sub(
        r'className="([^"]*)flex items-center([^"]*)"([^>]*)dir="rtl"',
        lambda m: f'className="{m.group(1)}flex items-center flex-nowrap min-w-0 w-full {m.group(2)}" dir="rtl"',
        content
    )

    # 2. إجبار الاسم على الاقتطاع (Truncate) وعدم دفع الوقت
    # نبحث عن كلاسات الاسم (التي تحتوي على font-bold) ونضيف لها truncate shrink
    content = re.sub(
        r'className="([^"]*font-bold[^"]*text-white[^"]*)"',
        lambda m: f'className="{m.group(1)} truncate shrink max-w-[130px] sm:max-w-[150px]"',
        content
    )

    # 3. إجبار المعرف على الاقتطاع (Truncate)
    # نبحث عن كلاسات المعرف (التي تحتوي على text-[#71767B] و dir="ltr")
    content = re.sub(
        r'className="([^"]*text-\[#71767B\][^"]*)"([^>]*)dir="ltr"',
        lambda m: f'className="{m.group(1)} truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr"',
        content
    )

    # 4. إجبار الوقت على الثبات (whitespace-nowrap)
    # أي عنصر يحتوي على الوقت (يستدعي formatTimeAgo) يجب ألا ينكسر
    content = re.sub(
        r'className="([^"]*text-\[#71767B\][^"]*)"([^>]*)>\s*\{formatTimeAgo',
        lambda m: f'className="{m.group(1)} shrink-0 whitespace-nowrap" {m.group(2)}>\n{{formatTimeAgo',
        content
    )

    # 5. إضافة الشارة الناقصة في التغريدة المقتبسة (للمجتمع)
    if 'CommunityFeedPage' in file:
        # نبحث عن اسم المؤلف الأصلي في التغريدة المقتبسة ونضيف الشارة بجانبه
        content = re.sub(
            r'\{tweet\.original\?\.authorName\}(?!\s*\{tweet\.original\?\.badgeType)',
            '{tweet.original?.authorName}{tweet.original?.badgeType && <VerifiedBadge type={tweet.original.badgeType} size={14} />}',
            content
        )
        content = re.sub(
            r'\{tweet\.original\.authorName\}(?!\s*\{tweet\.original\.badgeType)',
            '{tweet.original.authorName}{tweet.original.badgeType && <VerifiedBadge type={tweet.original.badgeType} size={14} />}',
            content
        )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم تطبيق التخطيط على كل التغريدات (القديمة والجديدة والمقتبسة).")
