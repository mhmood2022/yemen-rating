import re

for path in ["bank.html", "public/bank.html", "dist/bank.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. إزالة أي linear-gradient من كود الجافاسكربت الخاص بالغلاف
    content = re.sub(
        r"coverEl\.style\.backgroundImage\s*=\s*['\"][^'\"]*rgba\([^)]+\)[^'\"]*url\(['\"]?\s*\+\s*currentBank\.cover_url\s*\+\s*['\"]?\)[^'\"]*['\"];?",
        "coverEl.style.backgroundImage = 'url(' + currentBank.cover_url + ')';",
        content
    )
    
    # تحسباً لأي صيغة أخرى للـ linear-gradient
    content = re.sub(
        r"linear-gradient\([^)]+\),\s*url\(",
        "url(",
        content
    )

    # 2. تنظيف خلفية الحاوية في HTML من أي تدرجات كحلية تلوث الصورة
    content = content.replace(
        "bg-gradient-to-r from-[#002244] via-[#003B73] to-[#0A4D80]",
        "bg-black"
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تمت التنقية بالكامل في: {path}")

print("✨ أصبحت صور الغلاف الآن نقية 100% وبدون أي طبقة تظليل!")
