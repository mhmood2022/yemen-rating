import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. حذف جميع النسخ المكررة من دالة handleSaveEdit
pattern = r"  const handleSaveEdit = async \(\) => \{[\s\S]*?\n  \};\n"
content = re.sub(pattern, "", content)

# 2. إضافة حالة (State) التعديل مرة واحدة فقط في بداية المكون (بعد أول useState)
if "const [editingPost, setEditingPost]" not in content:
    content = content.replace(
        "const [bio, setBio] = useState('');",
        "const [bio, setBio] = useState('');\n  const [editingPost, setEditingPost] = useState<any>(null);\n  const [editPostText, setEditPostText] = useState('');"
    )

# 3. إضافة دالة handleSaveEdit في المكان الصحيح (مرة واحدة فقط قبل الـ return الرئيسي)
# نبحث عن الـ return الرئيسي للمكون (الذي يسبقه مسافة بادئة 2 فقط)
main_return_pattern = r"\n  return \(\n    <div className=\"min-h-screen bg-black"
save_func = """
  const handleSaveEdit = async () => {
    if (!editingPost || !editPostText.trim()) return;
    try {
      await supabase.from('posts').update({ content: editPostText }).eq('id', editingPost.id);
      // تحديث الواجهة
      if (typeof setUserPosts !== 'undefined') {
        setUserPosts((prev: any[]) => prev.map(p => p.id === editingPost.id ? { ...p, text: editPostText } : p));
      }
      setEditingPost(null);
      if (typeof showToast !== 'undefined') showToast('تم تعديل التغريدة بنجاح');
    } catch (e) {
      if (typeof showToast !== 'undefined') showToast('حدث خطأ أثناء التعديل');
    }
  };
"""
content = re.sub(main_return_pattern, save_func + r"\n  return (\n    <div className=\"min-h-screen bg-black", content, count=1)

# 4. إصلاح خطأ مكون VerifiedBadge (حذف className غير المدعوم)
content = content.replace(' size={14} className="shrink-0" />', ' size={14} />')
content = content.replace(' size={14.5} className="shrink-0" />', ' size={14.5} />')

# 5. إصلاح مكان زر التعديل (الذي كان يسبب خطأ post)
# نبحث عن الزر ونعيد كتابته بشكل صحيح
wrong_btn_pattern = r"onClick=\{\(e\) => \{[\s\S]*?setEditingPost\(post\);[\s\S]*?\}\}"
right_btn = """onClick={(e) => {
          e.stopPropagation();
          setEditingPost(post);
          setEditPostText(post.text);
          setActiveMenuPost(null);
        }}"""
# نطبق هذا التعديل فقط على الأزرار التي تحتوي على Edit3
content = re.sub(r"(<button[^>]*onClick=\{\(e\) => \{[\s\S]*?setEditingPost\(post\);[\s\S]*?\}\}[^>]*>\s*<Edit3)", lambda m: re.sub(wrong_btn_pattern, right_btn, m.group(1)), content)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم تنظيف الملف، حذف الأكواد المكررة، وإصلاح مكون الشارة.")
