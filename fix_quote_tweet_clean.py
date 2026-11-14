import re, shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. تنظيف حاوية الهيدر داخل الاقتباس (إزالة الخصائص المكررة)
content = content.replace(
    'className="flex items-center flex-nowrap min-w-0 w-full  flex-nowrap min-w-0 w-full  gap-1.5 text-xs mb-1.5 overflow-hidden" dir="rtl"',
    'className="flex items-center flex-nowrap min-w-0 w-full gap-1.5 text-xs mb-1.5 overflow-hidden" dir="rtl"'
)

# 2. إصلاح الاسم والشارة داخل التغريدة المقتبسة (استبدال الكود التالف)
bad_name_span = '''<span className="font-bold text-[#E7E9EA] truncate text-[13px]"><><>{tweet.original.authorName}{tweet.original.badgeType && <VerifiedBadge type={tweet.original.badgeType} size={14} />}</>{tweet.original.badgeType && <VerifiedBadge type={tweet.original.badgeType} size={14} />}</></span>'''

good_name_span = '''<div className="flex items-center gap-1 shrink min-w-0 max-w-[130px] sm:max-w-[180px]">
  <span className="font-bold text-[#E7E9EA] truncate text-[13px]">{tweet.original.authorName}</span>
  {tweet.original.badgeType && tweet.original.badgeType !== "none" && (
    <VerifiedBadge type={tweet.original.badgeType as any} size={14} className="shrink-0" />
  )}
</div>'''

if bad_name_span in content:
    content = content.replace(bad_name_span, good_name_span)
else:
    # إذا لم يجد النص التالف حرفياً، نستخدم Regex للبحث عنه
    pattern = r'<span className="font-bold text-\[#E7E9EA\] truncate text-\[13px\]">.*?</span>'
    content = re.sub(pattern, good_name_span, content)

# 3. إصلاح الوقت والنقطة داخل الاقتباس
content = content.replace(
    '<span className="text-[#71767B] text-[11px] shrink-0">·</span>',
    '<span className="text-[#71767B] text-[13px] shrink-0 mx-0.5">·</span>'
)
content = content.replace(
    '<span className="text-[#71767B] text-[14px] shrink-0 whitespace-nowrap">{formatTimeAgo(tweet.original.createdAt).relative}</span>',
    '<span className="text-[#71767B] text-[13px] shrink-0 whitespace-nowrap">{formatTimeAgo(tweet.original.createdAt).relative}</span>'
)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم تنظيف كود التغريدة المقتبسة وإضافة الشارة بشكل صحيح.")
