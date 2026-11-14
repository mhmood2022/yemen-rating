import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_clean_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. حذف جميع التعريفات المكررة للمتغيرات
content = re.sub(r"const \[editingPost, setEditingPost\] = useState.*?;\n", "", content)
content = re.sub(r"const \[editPostText, setEditPostText\] = useState.*?;\n", "", content)

# 2. إضافة المتغيرات مرة واحدة فقط في المكان الصحيح
anchor = "const [activeMenuPost, setActiveMenuPost] = useState<Post | null>(null);"
if anchor in content:
    content = content.replace(anchor, anchor + "\n  const [editingPost, setEditingPost] = useState<Post | null>(null);\n  const [editPostText, setEditPostText] = useState('');")
else:
    content = content.replace("const [bio, setBio] = useState('');", "const [bio, setBio] = useState('');\n  const [editingPost, setEditingPost] = useState<Post | null>(null);\n  const [editPostText, setEditPostText] = useState('');")

# 3. إصلاح زر التعديل (البحث عن أي زر يحتوي على Edit3 ويستدعي setIsEditModalOpen)
# نستبدله ليستدعي setEditingPost(post) بدلاً من ذلك
pattern = r"onClick=\{\(\) => \{[\s\S]*?setIsEditModalOpen\(true\);[\s\S]*?\}\}"
replacement = """onClick={(e) => {
                          e.stopPropagation();
                          setEditingPost(post);
                          setEditPostText(post.text);
                          setActiveMenuPost(null);
                        }}"""

# نطبق هذا فقط على الزر الذي يحتوي على <Edit3
content = re.sub(
    r"(<button[^>]*)(onClick=\{\(\) => \{[\s\S]*?setIsEditModalOpen\(true\);[\s\S]*?\}\})([^>]*>\s*<Edit3)",
    lambda m: m.group(1) + replacement + m.group(3),
    content
)

# 4. التأكد من وجود نافذة التعديل في أسفل الملف
if "تعديل التغريدة" not in content:
    modal_ui = """
      {/* مودال تعديل التغريدة */}
      {editingPost && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-black border border-[#2F3336] rounded-2xl w-full max-w-lg p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">تعديل التغريدة</h2>
              <button onClick={() => setEditingPost(null)} className="text-[#71767B] hover:text-white"><X size={20} /></button>
            </div>
            <textarea
              className="w-full bg-transparent text-white text-[15px] leading-relaxed min-h-[120px] outline-none resize-none placeholder-[#71767B]"
              value={editPostText}
              onChange={(e) => setEditPostText(e.target.value)}
              placeholder="ماذا يجري؟"
            />
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#2F3336]">
              <button onClick={() => setEditingPost(null)} className="px-4 py-2 text-white font-bold rounded-full hover:bg-white/10 transition">إلغاء</button>
              <button onClick={handleSaveEdit} disabled={!editPostText.trim()} className="px-5 py-2 bg-[#FFC500] text-black font-bold rounded-full hover:bg-[#E5B200] transition disabled:opacity-50">حفظ</button>
            </div>
          </div>
        </div>
      )}
"""
    content = content.replace("    </div>\n  );\n}", modal_ui + "    </div>\n  );\n}")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إزالة التكرارات، إصلاح زر التعديل، وإضافة النافذة.")
