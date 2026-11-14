import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إضافة المتغيرات (States) في بداية المكون (فوق أول return)
if "const [editingPost, setEditingPost]" not in content:
    anchor = "const [bio, setBio] = useState('');"
    if anchor not in content:
        anchor = "const [newPostText, setNewPostText] = useState('');"
    
    content = content.replace(
        anchor,
        anchor + "\n  const [editingPost, setEditingPost] = useState<any>(null);\n  const [editPostText, setEditPostText] = useState('');"
    )

# 2. إصلاح زر التعديل (استبدال كلمة post بالمتغير الصحيح p أو userPost)
# نبحث عن الزر الذي أضفناه سابقاً ونغير post إلى p (لأننا نستخدم p في دالة map)
wrong_onclick = """onClick={(e) => {
          e.stopPropagation();
          setEditingPost(post);
          setEditPostText(post.text);
          setActiveMenuPost(null);
        }}"""
        
right_onclick = """onClick={(e) => {
          e.stopPropagation();
          setEditingPost(p);
          setEditPostText(p.text);
          setActiveMenuPost(null);
        }}"""

if wrong_onclick in content:
    content = content.replace(wrong_onclick, right_onclick)
else:
    # إذا لم يجد الكود، نستخدم Regex لاستبدال post بـ p داخل حدث النقر
    content = re.sub(
        r"setEditingPost\(post\);\s*setEditPostText\(post\.text\);",
        "setEditingPost(p);\n          setEditPostText(p.text);",
        content
    )

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إضافة المتغيرات الناقصة وإصلاح زر التعديل.")
