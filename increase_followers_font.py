import shutil, time

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 2. استبدال حجم خط المتابعين من 10px إلى 11px
old_class = 'className="flex items-center gap-4 mt-3 text-[10px]"'
new_class = 'className="flex items-center gap-4 mt-3 text-[11px]"'

if old_class in content:
    content = content.replace(old_class, new_class)
    print("✅ تم تكبير خط المتابعين تكة واحدة (إلى 11px).")
else:
    print("⚠️ تحذير: لم يتم العثور على حجم الخط الحالي (10px)، قد يكون قد تم تعديله مسبقاً.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتمل التعديل.")
