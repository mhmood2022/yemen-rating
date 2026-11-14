import re, shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إصلاح دالة جلب البيانات (Data Mapping) للتغريدة الأساسية
# نبحث عن مكان تعريف authorName في دالة الجلب ونضيف badgeType تحته
if "badgeType: p?.verification_type" not in content and "badgeType: p.verification_type" not in content:
    content = re.sub(
        r'(authorName:\s*(?:p\.|profile\?\.|item\.)?full_name[^,]*,)',
        r"\1\n            badgeType: p?.verification_type || p?.badge_type || (p?.is_verified ? 'blue' : 'none'),",
        content
    )
    content = re.sub(
        r'(authorName:\s*profile\?\.full_name[^,]*,)',
        r"\1\n            badgeType: profile?.verification_type || profile?.badge_type || (profile?.is_verified ? 'blue' : 'none'),",
        content
    )

# 2. إصلاح هيدر التغريدة الرئيسية (تصغير الخط إلى 14px وإظهار الشارة)
# نستهدف الحاوية التي كبرناها سابقاً ونعيد ضبط أحجام العناصر بداخلها
main_header_regex = r'<div className="flex items-center flex-nowrap min-w-0 gap-1 text-\[15px\]">\s*<span className="font-bold text-white.*?>\{tweet\.authorName\}</span>\s*\{.*?\}\s*<span className="text-\[#71767B\].*?>@\{tweet\.authorUsername.*?\}</span>'

main_header_replacement = '''<div className="flex items-center flex-nowrap min-w-0 gap-1">
                        <span className="font-bold text-white text-[14px] hover:underline cursor-pointer truncate shrink max-w-[130px] sm:max-w-[150px]">{tweet.authorName}</span>
                        {(tweet.badgeType || (tweet as any).authorBadge || (tweet as any).verification_type) && (tweet.badgeType || (tweet as any).authorBadge || (tweet as any).verification_type) !== "none" && (
                          <VerifiedBadge type={((tweet.badgeType || (tweet as any).authorBadge || (tweet as any).verification_type) as any)} size={14} className="shrink-0" />
                        )}
                        <span className="text-[#71767B] text-[14px] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{tweet.authorUsername?.replace(/@.*$/, "")}</span>'''

content = re.sub(main_header_regex, main_header_replacement, content, flags=re.DOTALL)

# تصغير النقطة والوقت في التغريدة الرئيسية
content = content.replace('<span className="text-[#71767B] text-[15px] mx-0.5 shrink-0">·</span>', '<span className="text-[#71767B] text-[14px] mx-0.5 shrink-0">·</span>')
content = content.replace('<span className="text-[#71767B] text-[15px] hover:underline cursor-pointer whitespace-nowrap shrink-0"', '<span className="text-[#71767B] text-[14px] hover:underline cursor-pointer whitespace-nowrap shrink-0"')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إصلاح جلب الشارة لاسم الناشر، وإعادة ضبط حجم الخط (14px) لجميع التغريدات.")
