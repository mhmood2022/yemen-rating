import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. إصلاح أيقونة النقاط الثلاث (حجم 16، رمادي، ويصبح ذهبي عند التمرير)
    content = content.replace(
        '<MoreHorizontal size={20} className="rotate-90 text-white" />',
        '<MoreHorizontal size={16} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />'
    )

    # 2. إصلاح الوقت المكسور (إضافة .relative إذا كان مفقوداً)
    # نبحث عن {formatTimeAgo(...)} ونستبدلها بـ {formatTimeAgo(...).relative} بشرط ألا تكون موجودة مسبقاً
    content = re.sub(r'\{formatTimeAgo\(([^)]+)\)\}', r'{formatTimeAgo(\1).relative}', content)

    # 3. إصلاح تخطيط الهيدر (الاسم، المعرف، الوقت) لمنع النزول لسطر جديد
    # نجبر الحاوية على flex-nowrap وإضافة truncate
    content = content.replace(
        'className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" dir="rtl"',
        'className="flex items-center gap-1.5 min-w-0 flex-1 flex-nowrap overflow-hidden" dir="rtl"'
    )
    # تصغير خط الوقت ليتناسب مع X
    content = content.replace(
        'className="text-[10.5px] text-[#71767B] font-normal shrink-0 whitespace-nowrap"',
        'className="text-[14px] text-[#71767B] font-normal shrink-0 whitespace-nowrap"'
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم إصلاح الهيدر وأيقونة النقاط والوقت بنجاح في الملفين.")
