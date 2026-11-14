import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_logic_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# الكود الخاطئ الذي يفتح النافذتين ولا ينسخ النص
wrong_code = """onClick={() => {
                setEditingPost(activeMenuPost);
                setIsEditModalOpen(true);
                setActiveMenuPost(null);
              }}"""

# الكود الصحيح: يفتح نافذة التغريدة فقط وينسخ النص
correct_code = """onClick={() => {
                setEditingPost(activeMenuPost);
                setEditPostText(activeMenuPost.text);
                setActiveMenuPost(null);
              }}"""

if wrong_code in content:
    content = content.replace(wrong_code, correct_code)
    print("✅ تم إصلاح زر التعديل بنجاح (فصل النوافذ ونسخ النص).")
else:
    print("⚠️ تحذير: لم يتم العثور على الكود الخاطئ بدقة.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
