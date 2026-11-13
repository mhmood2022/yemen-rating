import shutil, time

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 2. استبدال حجم خط النبذة من 11px إلى 12px
old_style = "style={{ fontSize: '11px', fontWeight: 400, lineHeight: '1.4' }}"
new_style = "style={{ fontSize: '12px', fontWeight: 400, lineHeight: '1.4' }}"

if old_style in content:
    content = content.replace(old_style, new_style)
    print("✅ تم تكبير النبذة إلى 12px.")
else:
    print("⚠️ تحذير: لم يتم العثور على كود حجم النبذة، قد يكون قد تم تعديله مسبقاً.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتمل التعديل.")
