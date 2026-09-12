import re

# تنظيف القالب الفردي bank.html
for path in ["bank.html", "public/bank.html", "dist/bank.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. حذف الهيدر بالكامل من صفحة البنك الفردية
    content = re.sub(r'<!-- الهيدر المثبت الدائم[\s\S]*?<\/header>', '', content)
    content = re.sub(r'<header[\s\S]*?<\/header>', '', content)

    # 2. تنظيف الـ main من أي مسافات زائدة ليعود الغلاف في القمة مباشرة
    content = content.replace("pt-16 sm:pt-20", "")
    content = content.replace("pt-16", "")
    content = content.replace("pt-20", "")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم تنظيف وحذف الهيدر من القالب الفردي بنجاح: {path}")

print("✨ عاد القالب الفردي نظيفاً 100% وغلافه في قمة الصفحة كما كان!")
