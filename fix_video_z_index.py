import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_videofix_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# إزالة z-0 من حاوية المنشورات لكي تستطيع نافذة الفيديو الخروج للطبقة العالية
old_class = '<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="divide-y divide-[#2F3336]/40 relative z-0">'
new_class = '<div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} className="divide-y divide-[#2F3336]/40">'

if old_class in content:
    content = content.replace(old_class, new_class)
    print("✅ 1. تم إزالة z-0 من حاوية المنشورات (سيعمل الفيديو بملء الشاشة فوق الهيدر).")
else:
    # محاولة بديلة: إزالة z-0 فقط
    content = content.replace('divide-y divide-[#2F3336]/40 relative z-0', 'divide-y divide-[#2F3336]/40')
    print("✅ 1. تم إزالة z-0 (بالطريقة البديلة).")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
