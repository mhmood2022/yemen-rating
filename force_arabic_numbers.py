import shutil, time, re

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 2. البحث عن المتغيرات واستبدالها بدالة التحويل للعربية
# نستخدم Regex لضمان العثور عليها حتى لو تغيرت المسافات أو الـ class
content = re.sub(r'\{followingCount\}', "{Number(followingCount || 0).toLocaleString('ar-EG')}", content)
content = re.sub(r'\{followersCount\}', "{Number(followersCount || 0).toLocaleString('ar-EG')}", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم تطبيق تحويل الأرقام إلى العربية بنجاح.")
