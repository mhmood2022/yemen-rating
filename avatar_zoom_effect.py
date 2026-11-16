import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_zoom_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# الكلاس القديم (الذي يحتوي على z-10/z-50 فقط)
old_class = "className={`px-4 relative transition-all duration-300 ease-in-out ${isScrolled ? 'z-10' : 'z-50'}`}"

# الكلاس الجديد (يضيف scale و opacity لتأثير Zoom)
new_class = "className={`px-4 relative transition-all duration-300 ease-in-out origin-top ${isScrolled ? 'z-10 scale-75 opacity-0 pointer-events-none' : 'z-50 scale-100 opacity-100'}`}"

if old_class in content:
    content = content.replace(old_class, new_class)
    print("✅ 1. تم إضافة تأثير Zoom-Out/Zoom-In للشعار.")
else:
    print("⚠️ لم يتم العثور على الكلاس الدقيق. جاري المحاولة البديلة...")
    # محاولة البحث بـ regex
    import re
    pattern = r"className=\{`px-4 relative transition-all duration-300 ease-in-out \$\{isScrolled \? 'z-10' : 'z-50'\}`\}"
    if re.search(pattern, content):
        content = re.sub(pattern, new_class, content)
        print("✅ 1. تم إضافة التأثير (بالطريقة البديلة).")

# إضافة تأثير Zoom لزر الترقية أيضاً (ليختفي مع الشعار)
old_btn_container = "<div>\n            {isOwner ? (\n              <button\n                onClick={() => navigate('/premium')}"
new_btn_container = "<div className={`transition-all duration-300 ${isScrolled ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}>\n            {isOwner ? (\n              <button\n                onClick={() => navigate('/premium')}"

if old_btn_container in content:
    content = content.replace(old_btn_container, new_btn_container)
    print("✅ 2. تم إضافة تأثير Zoom لزر الترقية.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
