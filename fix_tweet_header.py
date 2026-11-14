import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. تصغير أيقونة النقاط الثلاث (تكة واحدة)
    content = content.replace('<MoreHorizontal size={20} className="rotate-90 text-white" />', '<MoreHorizontal size={14} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />')
    content = content.replace('<MoreHorizontal size={16} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />', '<MoreHorizontal size={14} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />')

    # 2. تقريب المسافة بين النقطة والوقت (مثل . ١٠ د)
    content = content.replace('className="text-[15px] text-[#71767B] shrink-0 mx-1">·</span>', 'className="text-[15px] text-[#71767B] shrink-0 mx-0.5">·</span>')
    content = content.replace('className="text-[10.5px] text-[#71767B] shrink-0 mx-0.5">·</span>', 'className="text-[15px] text-[#71767B] shrink-0 mx-0.5">·</span>')
    content = content.replace('className="text-[10.5px] text-[#71767B] shrink-0 mx-1">·</span>', 'className="text-[15px] text-[#71767B] shrink-0 mx-0.5">·</span>')

    # 3. إجبار الهيدر على عدم النزول لسطر جديد (flex-nowrap) وتطبيق truncate
    content = content.replace('className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" dir="rtl"', 'className="flex items-center gap-1 min-w-0 w-full flex-nowrap overflow-hidden" dir="rtl"')
    content = content.replace('className="flex items-center gap-1 min-w-0 flex-1 flex-nowrap overflow-hidden" dir="rtl"', 'className="flex items-center gap-1 min-w-0 w-full flex-nowrap overflow-hidden" dir="rtl"')

    # 4. تطبيق استراتيجية الاقتطاع (Truncate) للاسم
    content = content.replace('className="font-bold text-white text-[15px] hover:underline cursor-pointer flex items-center gap-0.5 truncate shrink-0 max-w-[130px] sm:max-w-[180px]"', 'className="font-bold text-white text-[15px] hover:underline cursor-pointer truncate shrink"')
    content = content.replace('className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer flex items-center gap-0.5 truncate shrink-0 max-w-[130px] sm:max-w-[180px]"', 'className="font-bold text-white text-[15px] hover:underline cursor-pointer truncate shrink"')
    content = content.replace('className="font-bold text-[#E7E9EA] text-[15px] hover:underline cursor-pointer truncate shrink"', 'className="font-bold text-white text-[15px] hover:underline cursor-pointer truncate shrink"')

    # 5. تطبيق الاقتطاع للمعرف
    content = content.replace('className="text-[#71767B] text-[15px] font-normal truncate min-w-0 shrink" dir="ltr"', 'className="text-[#71767B] text-[15px] font-normal truncate shrink dir-ltr" dir="ltr"')
    content = content.replace('className="text-[11.5px] text-[#71767B] font-normal truncate min-w-0 shrink" dir="ltr"', 'className="text-[#71767B] text-[15px] font-normal truncate shrink dir-ltr" dir="ltr"')
    content = content.replace('className="text-[#71767B] text-[15px] font-normal truncate shrink" dir="ltr"', 'className="text-[#71767B] text-[15px] font-normal truncate shrink dir-ltr" dir="ltr"')

    # 6. إصلاح حجم خط الوقت (ليكون 15px مثل X)
    content = content.replace('className="text-[10.5px] text-[#71767B] font-normal shrink-0 whitespace-nowrap"', 'className="text-[15px] text-[#71767B] font-normal shrink-0 whitespace-nowrap"')

    # 7. إضافة الشارة الناقصة للتغريدة المقتبسة في صفحة المجتمع
    if 'CommunityFeedPage' in file:
        content = content.replace('{tweet.original?.authorName}', '<>{tweet.original?.authorName}{tweet.original?.badgeType && <VerifiedBadge type={tweet.original.badgeType} size={14} />}</>')
        content = content.replace('{tweet.original.authorName}', '<>{tweet.original.authorName}{tweet.original.badgeType && <VerifiedBadge type={tweet.original.badgeType} size={14} />}</>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم إصلاح الهيدر، النقاط، الوقت، وإضافة شارة التغريدة المقتبسة بنجاح.")
