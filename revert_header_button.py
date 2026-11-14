import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_revert_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# الكود الذي أضفناه بالخطأ في زر الهيدر
wrong_code = """onClick={(e) => {
          e.stopPropagation();
          setEditingPost(post);
          setEditPostText(post.text);
          setActiveMenuPost(null);
        }}"""

# الكود الأصلي الصحيح لزر الهيدر (فتح نافذة تعديل الحساب)
correct_code = """onClick={() => {
                          setEditName(name); setEditPhone(phone); setEditUsername(username); setEditBio(bio); setEditLocation(location); setEditBirthDate(birthDate);
                          setIsEditModalOpen(true); setIsMenuOpen(false);
                        }}"""

# نستبدل الكود الخاطئ بالصحيح
if wrong_code in content:
    content = content.replace(wrong_code, correct_code)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إرجاع زر تعديل الحساب في الهيدر لحالته الأصلية.")
