import re

# مسار الشارة الرسمي المعتمد المطابق 100% للصورة الثالثة
official_badge_svg = '''function renderVerificationBadge(badgeType, isVerified, size = 20) {
  if (isVerified !== true && isVerified !== "true") return "";
  
  const type = (badgeType || "gold").toLowerCase();
  let color = "#EAB308"; // الذهبية
  let title = "موثق - الشارة الذهبية";

  if (type === "blue") {
    color = "#1D9BF0";   // الزرقاء
    title = "موثق - الشارة الزرقاء";
  } else if (type === "silver" || type === "gray") {
    color = "#9CA3AF";   // الفضية
    title = "موثق - الشارة الفضية";
  }

  return `<span class="inline-flex items-center justify-center shrink-0 select-none align-middle" title="${title}">
    <svg style="width:${size}px; height:${size}px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0 drop-shadow-sm">
      <path d="M10.29 2.308a2.38 2.38 0 0 1 3.42 0c.53.535 1.307.747 2.038.557a2.38 2.38 0 0 1 2.87 1.954c.148.742.668 1.353 1.365 1.604a2.38 2.38 0 0 1 1.572 3.097 2.38 2.38 0 0 0 .375 2.073 2.38 2.38 0 0 1-.375 3.447 2.38 2.38 0 0 0-.375 2.073 2.38 2.38 0 0 1-1.572 3.097c-.697.251-1.217.862-1.365 1.604a2.38 2.38 0 0 1-2.87 1.954 2.38 2.38 0 0 0-2.038.557 2.38 2.38 0 0 1-3.42 0 2.38 2.38 0 0 0-2.038-.557 2.38 2.38 0 0 1-2.87-1.954 2.38 2.38 0 0 0-1.365-1.604 2.38 2.38 0 0 1-1.572-3.097 2.38 2.38 0 0 0 .375-2.073 2.38 2.38 0 0 1-.375-3.447 2.38 2.38 0 0 0 .375-2.073 2.38 2.38 0 0 1 1.572-3.097c.697-.251 1.217-.862 1.365-1.604a2.38 2.38 0 0 1 2.87-1.954c.731.19 1.508-.022 2.038-.557Z" fill="${color}"/>
      <path d="M9 12.5l2 2 4.5-4.5" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>`;
}'''

# 1. إصلاح القالب الفردي (bank.html) - حذف المثلثات/الأشكال المشوهة للغلاف وتحديث الشارة
for path in ["bank.html", "public/bank.html", "dist/bank.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # حذف الأشكال والمثلثات البيضاء (fa-shapes والعناوين القديمة التي تغطي الغلاف)
    content = re.sub(
        r'<div class="flex items-center gap-2">\s*<div class="text-right">\s*<h1 id="bank-cover-title"[^>]*></h1>\s*<p id="bank-cover-subtitle"[^>]*></p>\s*</div>\s*<div class="w-10 h-10 flex items-center justify-center">\s*<i class="fa-solid fa-shapes text-white text-3xl"></i>\s*</div>\s*</div>',
        '',
        content
    )

    # تحديث دالة الشارة
    content = re.sub(
        r'function renderVerificationBadge\([^)]*\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}',
        official_badge_svg,
        content
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم تنظيف الغلاف والشارة في: {path}")

# 2. إصلاح بطاقات البنوك (banks.html) - تحديث الشارة
for path in ["banks.html", "public/banks.html", "dist/banks.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(
        r'function renderVerificationBadge\([^)]*\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}',
        official_badge_svg,
        content
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم تحديث الشارة في قائمة البطاقات: {path}")

print("✨ تم بنجاح إزالة المثلثات من الغلاف وتطبيق الشارات الثلاث الرسمية النقية!")
