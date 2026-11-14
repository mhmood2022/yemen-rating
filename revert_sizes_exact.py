import shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إزالة text-[15px] من الحاوية الأم
content = content.replace(
    '<div className="flex items-center flex-nowrap min-w-0 w-full gap-1 text-[15px]">',
    '<div className="flex items-center flex-nowrap min-w-0 w-full gap-1">'
)

# 2. إرجاع حجم الاسم إلى 12.5px وحجم الشارة إلى 14.5
content = content.replace(
    '<span className="font-bold text-white hover:underline cursor-pointer truncate shrink max-w-[120px] sm:max-w-[150px]">{tweet.authorName}</span>',
    '<span className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate shrink max-w-[130px] sm:max-w-[180px]">{tweet.authorName}</span>'
)
content = content.replace(
    '<VerifiedBadge type={tweet.badgeType as any} size={14} className="shrink-0" />',
    '<VerifiedBadge type={tweet.badgeType as any} size={14.5} className="shrink-0" />'
)

# 3. إرجاع حجم المعرف إلى 11.5px
content = content.replace(
    '<span className="text-[#71767B] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{tweet.authorUsername?.replace(/@.*$/, "")}</span>',
    '<span className="text-[11.5px] text-[#71767B] truncate shrink max-w-[90px] sm:max-w-[120px]" dir="ltr">@{tweet.authorUsername?.replace(/@.*$/, "")}</span>'
)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إرجاع أحجام الخطوط بدقة (الاسم 12.5، المعرف 11.5) مع إبقاء الشارة.")
