import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_removenav_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. حذف سطر الاستيراد
old_import = "import { MobileBottomNav } from '../components/navigation/MobileBottomNav';\n"
if old_import in content:
    content = content.replace(old_import, "")
    print("✅ 1. تم حذف سطر الاستيراد.")

# 2. حذف المكون من الواجهة
old_component = '      <MobileBottomNav onNavigate={(path) => navigate(path)} />\n'
if old_component in content:
    content = content.replace(old_component, "")
    print("✅ 2. تم حذف المكون من صفحة الحساب.")
else:
    # محاولة بديلة (إذا كانت المسافات مختلفة)
    import re
    content = re.sub(r'\s*<MobileBottomNav[^>]*/>\s*', '\n', content)
    print("✅ 2. تم حذف المكون (بالطريقة البديلة).")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
