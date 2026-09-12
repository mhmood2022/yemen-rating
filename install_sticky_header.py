import re

official_header_html = '''  <!-- 1. الهيدر المثبت الدائم (مطابق لقالب المنصة الرسمي) -->
  <header class="sticky top-0 z-50 bg-[#070A10]/98 backdrop-blur-xl border-b border-[#1F2937] shadow-2xl">
    <div dir="rtl" class="w-full max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between font-['Cairo',sans-serif]">
      <!-- اليمين: زر القائمة الجانبية (☰) + الشعار الرسمي -->
      <div class="flex items-center gap-3">
        <button type="button" onclick="if (window.history.length > 1) { window.history.back(); } else { window.location.href = '/'; }" class="text-white hover:text-[#EAB308] transition p-1 bg-transparent border-0 cursor-pointer active:scale-95" title="القائمة">
          <i class="fa-solid fa-bars text-xl"></i>
        </button>
        <a href="/" class="flex items-center gap-2 select-none cursor-pointer">
          <svg viewBox="0 0 120 120" class="h-8 sm:h-9 w-auto shrink-0 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 10L98 26V58C98 82 60 106 60 106C60 106 22 82 22 58V26L60 10Z" fill="#070A10" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
            <path d="M60 18L92 31V57C92 76 60 96 60 96C60 96 28 76 28 57V31L60 18Z" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M60 32L65.5 46H81L68.5 55.5L73.5 70L60 61L46.5 70L51.5 55.5L39 46H54.5L60 32Z" fill="#FFC500" stroke="#FFC500" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M10 65C10 88 36 108 60 110C84 108 110 88 110 64C104 80 82 98 60 100C38 98 16 80 10 65Z" fill="#FFC500"/>
          </svg>
          <div class="flex flex-col items-start justify-center leading-none text-right">
            <span class="text-[#FFC500] font-black text-sm sm:text-base tracking-wide">يمن ريتنغ</span>
            <span class="text-white font-black text-[9px] sm:text-[10px] tracking-widest uppercase mt-0.5">YEMENRATING</span>
          </div>
        </a>
      </div>
      <!-- اليسار: جرس الإشعارات بنقطة التنبيه الحمراء -->
      <div class="flex items-center">
        <a href="/" class="text-zinc-200 hover:text-[#EAB308] transition p-1 relative" title="الإشعارات">
          <i class="fa-regular fa-bell text-xl"></i>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626] animate-pulse"></span>
        </a>
      </div>
    </div>
  </header>'''

# 1. تحديث banks.html
for path in ["banks.html", "public/banks.html", "dist/banks.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # استبدال الهيدر القديم بالهيدر المثبت الدائم
    content = re.sub(r'<header[\s\S]*?<\/header>', official_header_html, content)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم تثبيت الهيدر في قائمة البنوك: {path}")

# 2. تحديث bank.html (القالب الفردي) لتركيب الهيدر المثبت أيضاً
for path in ["bank.html", "public/bank.html", "dist/bank.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if "<header" in content:
        content = re.sub(r'<header[\s\S]*?<\/header>', official_header_html, content)
    else:
        # إضافته مباشرة بعد وسم <body> أو بعد شاشة التحميل
        content = content.replace("</div>\n\n  <main", "</div>\n\n" + official_header_html + "\n\n  <main")
        content = content.replace("</div>\r\n\r\n  <main", "</div>\r\n\r\n" + official_header_html + "\r\n\r\n  <main")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم تثبيت الهيدر في قالب البنك الفردي: {path}")

print("✨ تم تثبيت الهيدر الرسمي الموحد والدائم في جميع القوالب بنجاح 100%!")
