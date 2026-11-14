import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_lasthashtag_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# استبدال أي استخدام متبقٍ للدالة القديمة بالمكون الجديد
content = content.replace("{renderHashtags(quoteOriginal.text)}", "<HashtagText text={quoteOriginal.text} />")
content = re.sub(r"\{renderHashtags\((.*?)\)\}", r"<HashtagText text={\1} />", content)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إصلاح الخطأ الأخير (تحويل الدالة القديمة إلى المكون الجديد).")
