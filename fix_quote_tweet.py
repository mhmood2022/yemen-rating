import re, shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إصلاح اسم المؤلف وإضافة الشارة داخل التغريدة المقتبسة
# نبحث عن متغير اسم المؤلف داخل الاقتباس
name_pattern = r'\{tweet\.original\.authorName\}|\{quoteOriginal\.authorName\}|\{post\.original\.authorName\}'
new_name_jsx = '''<div className="flex items-center gap-1 shrink min-w-0 max-w-[130px]">
  <span className="font-bold text-white text-[14px] truncate hover:underline cursor-pointer">{tweet.original?.authorName || (tweet.original as any)?.author?.name}</span>
  {((tweet.original as any)?.badgeType || (tweet.original as any)?.authorBadge || (tweet.original as any)?.badge_type) && (
    <VerifiedBadge type={((tweet.original as any)?.badgeType || (tweet.original as any)?.authorBadge || (tweet.original as any)?.badge_type)} size={14} className="shrink-0" />
  )}
</div>'''
# نطبق الاستبدال فقط إذا لم تكن الشارة موجودة بالفعل
if 'tweet.original?.authorName' in content:
    content = re.sub(r'\{tweet\.original\?\.authorName\}', new_name_jsx, content)
elif 'tweet.original.authorName' in content:
    content = re.sub(r'\{tweet\.original\.authorName\}', new_name_jsx, content)

# 2. إصلاح معرف المؤلف داخل التغريدة المقتبسة
username_pattern = r'<span[^>]*>@\{tweet\.original\.authorUsername\}</span>'
new_username = '<span className="text-[#71767B] text-[14px] truncate shrink max-w-[90px]" dir="ltr">@{tweet.original?.authorUsername?.replace(/@.*$/, "") || tweet.original?.authorUsername}</span>'
content = re.sub(username_pattern, new_username, content)

# 3. التأكد من أن حاوية الهيدر داخل الاقتباس لا تنزل لسطر جديد
content = re.sub(
    r'className="([^"]*)flex items-center([^"]*)"([^>]*)dir="rtl"',
    lambda m: f'className="{m.group(1)}flex items-center flex-nowrap min-w-0 w-full {m.group(2)}" dir="rtl"',
    content
)

# 4. إصلاح الوقت داخل الاقتباس (إذا وجد)
content = content.replace(
    '<span className="text-[#71767B] text-[12px] shrink-0">{tweet.original.createdAt}</span>',
    '<span className="text-[#71767B] text-[14px] shrink-0 whitespace-nowrap">{formatTimeAgo(tweet.original.createdAt).relative}</span>'
)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم تطبيق استراتيجية الهيدر على التغريدة المقتبسة وإضافة الشارة.")
