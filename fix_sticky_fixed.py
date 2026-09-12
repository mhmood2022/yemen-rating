import re

fixed_header_html = '''  <!-- الهيدر المثبت الدائم الثابت في القمة 100% -->
  <header class="fixed top-0 left-0 right-0 z-50 bg-[#070A10]/95 backdrop-blur-xl border-b border-[#1F2937] shadow-2xl">
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
      <!-- اليسار: جرس الإشعارات -->
      <div class="flex items-center">
        <a href="/" class="text-zinc-200 hover:text-[#EAB308] transition p-1 relative" title="الإشعارات">
          <i class="fa-regular fa-bell text-xl"></i>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626] animate-pulse"></span>
        </a>
      </div>
    </div>
  </header>'''

for path in ["banks.html", "bank.html", "public/banks.html", "public/bank.html", "dist/banks.html", "dist/bank.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. استبدال الهيدر ليصبح fixed ثابتاً لا يتحرك إطلاقاً
    content = re.sub(r'<header[\s\S]*?<\/header>', fixed_header_html, content)

    # 2. إضافة مسافة علوية pt-16 أو pt-20 لـ main حتى لا يختفي أول جزء تحت الهيدر الثابت
    content = re.sub(r'<main([^>]*class="[^"]*)"', r'<main\1 pt-16 sm:pt-20"', content)
    # تنظيف أي تكرار لـ pt
    content = content.replace("pt-16 sm:pt-20 pt-16 sm:pt-20", "pt-16 sm:pt-20")
    content = content.replace("pt-3 pb-16 pt-16 sm:pt-20", "pt-16 sm:pt-20 pb-16")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم التثبيت الدائم (Fixed) في: {path}")

print("✅ تم تثبيت الهيدر في قمة الشاشة بقفل Fixed كامل 100%!")
