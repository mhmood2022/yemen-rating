import re, shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. حذف الأكواد التالفة التي سببت أخطاء TS (السطور المكررة)
content = re.sub(r"^\s*badgeType: p\?\.verification_type.*?$", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*badgeType: profile\?\.verification_type.*?$", "", content, flags=re.MULTILINE)

# 2. إرجاع حجم الخط في هيدر التغريدة الرئيسية لحجمه السابق (12.5px)
main_header_regex = r'<div className="flex items-center flex-nowrap min-w-0 gap-1">\s*<span className="font-bold text-white.*?>\{tweet\.authorName\}</span>\s*\{.*?\}\s*<span className="text-\[#71767B\].*?>@\{tweet\.authorUsername.*?\}</span>'

main_header_replacement = '''<div className="flex items-center flex-nowrap min-w-0 gap-1">
                        <span className="font-bold text-white text-[12.5px] hover:underline cursor-pointer truncate shrink max-w-[130px] sm:max-w-[150px]">{tweet.authorName}</span>
                        {(tweet.badgeType || (tweet as any).authorBadge || (tweet as any).verification_type) && (tweet.badgeType || (tweet as any).authorBadge || (tweet as any).verification_type) !== "none" && (
                          <VerifiedBadge type={((tweet.badgeType || (tweet as any).authorBadge || (tweet as any).verification_type) as any)} size={14.5} className="shrink-0" />
                        )}
                        <span className="text-[#71767B] text-[11.5px] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{tweet.authorUsername?.replace(/@.*$/, "")}</span>'''

content = re.sub(main_header_regex, main_header_replacement, content, flags=re.DOTALL)

# إرجاع حجم النقطة والوقت في التغريدة الرئيسية
content = content.replace('<span className="text-[#71767B] text-[14px] mx-0.5 shrink-0">·</span>', '<span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>')
content = content.replace('<span className="text-[#71767B] text-[14px] hover:underline cursor-pointer whitespace-nowrap shrink-0"', '<span className="text-[#71767B] text-[10.5px] hover:underline cursor-pointer whitespace-nowrap shrink-0"')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم حذف الأكواد التالفة وإرجاع الأحجام السابقة.")
