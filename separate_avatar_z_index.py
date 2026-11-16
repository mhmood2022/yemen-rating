import shutil, time, re

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_zsep_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. تغيير حاوية الشعار والتفاصيل إلى z-50 للشعار
old_open = '<div className="px-4 relative z-10">\n        <div ref={avatarRowRef} className="flex justify-between items-end -mt-[46px] sm:-mt-[66px] mb-3"'
new_open = '<div className="px-4 relative z-50">\n        <div ref={avatarRowRef} className="flex justify-between items-end -mt-[46px] sm:-mt-[66px] mb-3"'

if old_open in content:
    content = content.replace(old_open, new_open)
    print("✅ 1. تم رفع z-index للشعار (z-50) ليظهر فوق الغلاف.")
else:
    print("⚠️ لم يتم العثور على الحاوية بالشكل الدقيق.")

# 2. إضافة z-10 لحاوية التفاصيل (الاسم، النبذة) لكي تدخل تحت الغلاف عند التمرير
# نبحث عن بداية قسم التفاصيل
old_details = '        {/* 3. الاسم والمعرف */}\n        <div className="mt-1">'
new_details = '        {/* 3. الاسم والمعرف */}\n        <div className="mt-1 relative z-10">'

if old_details in content:
    content = content.replace(old_details, new_details)
    print("✅ 2. تم إضافة z-10 لحاوية التفاصيل (لتدخل تحت الغلاف عند التمرير).")
else:
    print("⚠️ لم يتم العثور على قسم الاسم.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
