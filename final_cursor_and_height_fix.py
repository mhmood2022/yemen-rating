import shutil, time

# 1. إزالة !important من ملفات CSS العامة
css_files = ['src/index.css', 'src/styles/globals.css']
for file in css_files:
    shutil.copy(file, f"{file}.bak_css_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # إزالة !important من caret-color فقط
    content = content.replace("caret-color: #FFFFFF !important;", "caret-color: #FFFFFF;")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ تم إزالة !important من {file}")

# 2. تعديل RichTextarea ليكون الارتفاع ديناميكياً
comp_file = 'src/components/common/RichTextarea.tsx'
shutil.copy(comp_file, f"{comp_file}.bak_dyn_{int(time.time())}")
with open(comp_file, 'r', encoding='utf-8') as f:
    content = f.read()

# تغيير الارتفاع الأدنى إلى 26px (سطر واحد) لكي يبدأ المؤشر من الأعلى
content = content.replace("minHeight: '120px',", "minHeight: '26px',")
# ضبط الارتفاع التلقائي ليكون دقيقاً
content = content.replace("textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + 'px';", "textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';")

with open(comp_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم تعديل المكون ليدعم الارتفاع الديناميكي.")

# 3. إضافة ارتفاع 120px فقط لمربع صفحة الحساب (الكتابة)
file_acc = 'src/pages/AccountPage.tsx'
shutil.copy(file_acc, f"{file_acc}.bak_height_{int(time.time())}")
with open(file_acc, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<RichTextarea\n                    autoFocus\n                    value={newPostText}\n                    onChange={(e) => setNewPostText(e.target.value)}\n                    placeholder="ماذا يحدث؟"\n                  />',
    '<RichTextarea\n                    autoFocus\n                    value={newPostText}\n                    onChange={(e) => setNewPostText(e.target.value)}\n                    placeholder="ماذا يحدث؟"\n                    style={{ minHeight: "120px" }}\n                  />'
)

with open(file_acc, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم ضبط ارتفاع مربع الحساب.")
