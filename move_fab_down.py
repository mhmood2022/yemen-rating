import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_fab_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# استبدال bottom-24 بـ bottom-6
old_class = 'className="yr-fab fixed bottom-24 left-4 z-40'
new_class = 'className="yr-fab fixed bottom-6 left-4 z-40'

if old_class in content:
    content = content.replace(old_class, new_class)
    print("✅ تم إنزال الزر العائم إلى الأسفل (bottom-6).")
else:
    print("⚠️ لم يتم العثور على الكلاس الدقيق.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
