import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_menupos_{int(time.time())}")

with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# تغيير موضع القائمة من اليمين إلى اليسار (تحت النقاط الثلاث)
old_class = 'className="fixed top-[70px] right-4 w-44 bg-black/95'
new_class = 'className="fixed top-[60px] left-3 w-44 bg-black/95'

if old_class in content:
    content = content.replace(old_class, new_class)
    print("✅ تم نقل القائمة تحت النقاط الثلاث (في الطرف الأيسر).")
else:
    print("⚠️ لم يتم العثور على الكلاس الدقيق.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
