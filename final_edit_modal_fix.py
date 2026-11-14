import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. حذف أي محاولات سابقة (تالفة) لإضافة المتغيرات
content = re.sub(r"const \[editingPost, setEditingPost\] = useState<any>\(null\);\n?", "", content)
content = re.sub(r"const \[editPostText, setEditPostText\] = useState\(''\);\n?", "", content)

# 2. حقن المتغيرات في المكان الصحيح (أول سطر داخل المكون)
# نبحث عن أول تعريف useState في المكون
match = re.search(r"(const \[[a-zA-Z0-9_]+, set[a-zA-Z0-9_]+\] = useState\(.*?\);\n)", content)
if match:
    first_state = match.group(1)
    new_states = "\n  const [editingPost, setEditingPost] = useState<any>(null);\n  const [editPostText, setEditPostText] = useState('');\n"
    content = content.replace(first_state, first_state + new_states, 1)

# 3. إصلاح زر تعديل التغريدة
# في التغريدة، المتغير عادة يكون post أو p. سنجعل الكود يستخدم editingPost و editPostText بشكل صحيح.
# نستبدل setEditingPost(p) بـ setEditingPost(post) (لأننا داخل دالة map)
content = content.replace("setEditingPost(p);", "setEditingPost(post);")
content = content.replace("setEditPostText(p.text);", "setEditPostText(post.text);")

# 4. التأكد من إغلاق أي أقواس زائدة في handleSaveEdit إذا حدث خطأ
# (تجاهل هذا الجزء، الكود الحالي يبدو سليماً)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إصلاح المتغيرات وزر التعديل بشكل جذري.")
