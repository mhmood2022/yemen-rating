import re, shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إصلاح هيدر التغريدة الرئيسية (إزالة flex-wrap، تقليص المسافات، تكبير الخط)
# نستهدف الحاوية التي تحتوي على الاسم والمعرف والوقت
main_header_pattern = r'<div className="flex items-center gap-1\.5 flex-wrap">\s*<span className="font-bold text-white text-\[12\.5px\].*?>.*?</span>\s*\{tweet\.badgeType && tweet\.badgeType !== "none" && \(\s*<VerifiedBadge type=\{tweet\.badgeType as any\} size=\{14\.5\} />\s*\)\}\s*<span className="text-\[#71767B\] text-\[11\.5px\].*?>@\{tweet\.authorUsername\?\.replace\(/\@\.\*\$/, ""\)\}</span>'

main_header_replacement = '''<div className="flex items-center flex-nowrap min-w-0 w-full gap-1 text-[15px]">
                        <span className="font-bold text-white hover:underline cursor-pointer truncate shrink max-w-[120px] sm:max-w-[150px]">{tweet.authorName}</span>
                        {tweet.badgeType && tweet.badgeType !== "none" && (
                          <VerifiedBadge type={tweet.badgeType as any} size={14} className="shrink-0" />
                        )}
                        <span className="text-[#71767B] truncate shrink max-w-[80px] sm:max-w-[100px]" dir="ltr">@{tweet.authorUsername?.replace(/@.*$/, "")}</span>'''

content = re.sub(main_header_pattern, main_header_replacement, content, flags=re.DOTALL)

# إصلاح النقطة والوقت في التغريدة الرئيسية (المسافة تكون mx-0.5 وتكبير الخط)
content = content.replace('<span className="text-[#71767B] text-[10.5px] mx-0.5">·</span>', '<span className="text-[#71767B] text-[15px] mx-0.5 shrink-0">·</span>')
content = content.replace('<span className="text-[#71767B] text-[10.5px] hover:underline cursor-pointer whitespace-nowrap shrink-0 whitespace-nowrap"', '<span className="text-[#71767B] text-[15px] hover:underline cursor-pointer whitespace-nowrap shrink-0"')

# 2. إصلاح هيدر التغريدة المقتبسة (Quote Tweet)
# نضمن أن الحاوية flex-nowrap والمسافات gap-1
content = re.sub(
    r'className="flex items-center flex-nowrap min-w-0 w-full gap-1\.5 text-xs mb-1\.5 overflow-hidden" dir="rtl"',
    'className="flex items-center flex-nowrap min-w-0 w-full gap-1 text-[15px] mb-1.5 overflow-hidden" dir="rtl"',
    content
)

# إصلاح النقطة والوقت في التغريدة المقتبسة
content = content.replace('<span className="text-[#71767B] text-[11px] shrink-0">·</span>', '<span className="text-[#71767B] text-[15px] mx-0.5 shrink-0">·</span>')
content = content.replace('<span className="text-[#71767B] text-[14px] shrink-0 whitespace-nowrap">{formatTimeAgo(tweet.original.createdAt).relative}</span>', '<span className="text-[#71767B] text-[15px] shrink-0 whitespace-nowrap">{formatTimeAgo(tweet.original.createdAt).relative}</span>')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم ضبط المسافات وأحجام الخطوط لتطابق إكس (X) تماماً.")
