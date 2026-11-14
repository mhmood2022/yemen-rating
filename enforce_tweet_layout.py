import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. إصلاح دالة الوقت (لتطابق طلبك بدقة: الآن، د، س، ي، ثم التاريخ)
    old_time_func_pattern = r"const formatTimeAgo = \(.*?\};\n"
    new_time_func = """const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      const toAr = (n: number) => n.toLocaleString('ar-EG');
      const m = date.toLocaleDateString('ar-YE', { month: 'long' });
      const d = date.getDate();
      const y = date.getFullYear();

      let relative = '';
      if (diffMin < 1) relative = 'الآن';
      else if (diffMin < 60) relative = `${toAr(diffMin)} د`;
      else if (diffHour < 24) relative = `${toAr(diffHour)} س`;
      else if (diffDay < 7) relative = `${toAr(diffDay)} ي`;
      else if (date.getFullYear() === now.getFullYear()) relative = `${toAr(d)} ${m}`;
      else relative = `${toAr(d)} ${m} ${toAr(y)}`;
      
      const absolute = date.toLocaleDateString('ar-YE', { day: 'numeric', month: 'short', year: 'numeric' });
      return { relative, absolute };
    } catch { return { relative: '', absolute: '' }; }
  };
"""
    content = re.sub(old_time_func_pattern, new_time_func, content, flags=re.DOTALL)

    # 2. تصغير أيقونة النقاط الثلاث
    content = content.replace('<MoreHorizontal size={20} className="rotate-90 text-white" />', '<MoreHorizontal size={14} className="rotate-90 text-[#71767B]" />')
    content = content.replace('<MoreHorizontal size={16} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />', '<MoreHorizontal size={14} className="rotate-90 text-[#71767B]" />')
    content = content.replace('<MoreHorizontal size={20} className="rotate-90 text-[#71767B]" />', '<MoreHorizontal size={14} className="rotate-90 text-[#71767B]" />')

    # 3. إصلاح هيدر التغريدة الإلزامي (منع النزول لسطر ثاني + اقتطاع الاسم)
    # في AccountPage
    content = content.replace(
        '<div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" dir="rtl">',
        '<div className="flex items-center gap-1 min-w-0 w-full flex-nowrap overflow-hidden" dir="rtl">'
    )
    content = content.replace(
        'className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer flex items-center gap-0.5 truncate shrink-0 max-w-[130px] sm:max-w-[180px]"',
        'className="font-bold text-white text-[15px] hover:underline cursor-pointer truncate shrink max-w-[130px]"'
    )
    content = content.replace(
        'className="text-[11.5px] text-[#71767B] font-normal truncate min-w-0 shrink" dir="ltr"',
        'className="text-[#71767B] text-[15px] font-normal truncate shrink max-w-[90px]" dir="ltr"'
    )
    content = content.replace(
        'className="text-[10.5px] text-[#71767B] font-normal shrink-0 whitespace-nowrap"',
        'className="text-[15px] text-[#71767B] font-normal shrink-0 whitespace-nowrap"'
    )
    content = content.replace(
        'className="text-[10.5px] text-[#71767B] shrink-0 mx-1">·</span>',
        'className="text-[15px] text-[#71767B] shrink-0 mx-0.5">·</span>'
    )

    # 4. إضافة الشارة المفقودة للتغريدة المقتبسة في CommunityFeedPage
    if 'CommunityFeedPage' in file:
        content = content.replace('{tweet.original?.authorName}', '<>{tweet.original?.authorName}{tweet.original?.badgeType && <VerifiedBadge type={tweet.original.badgeType} size={14} />}</>')
        content = content.replace('{tweet.original.authorName}', '<>{tweet.original.authorName}{tweet.original.badgeType && <VerifiedBadge type={tweet.original.badgeType} size={14} />}</>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم تنفيذ الاستراتيجية الإلزامية: تصغير النقاط، اقتطاع الاسم، تثبيت الوقت، وإضافة الشارة.")
