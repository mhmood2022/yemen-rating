import shutil, time

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 2. استبدال اللون الأزرق باللون الأصفر الذهبي داخل دالة الهاشتاج فقط
old_class = 'className="text-[#1D9BF0] hover:underline cursor-pointer"'
new_class = 'className="text-[#FFC500] hover:underline cursor-pointer"'

if old_class in content:
    content = content.replace(old_class, new_class)
    print("✅ تم تغيير لون الهاشتاج إلى الأصفر الذهبي.")
else:
    print("⚠️ تحذير: لم يتم العثور على كود لون الهاشتاج، قد يكون قد تم تعديله مسبقاً.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتمل التعديل.")
