import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. إضافة متغيرات الحالة الخاصة بتعديل التغريدة (إذا لم تكن موجودة)
    if "const [editingPost, setEditingPost]" not in content:
        content = re.sub(
            r"(const \[isEditModalOpen, setIsEditModalOpen\] = useState\(false\);|const \[bio, setBio\] = useState\(''\);)",
            r"\1\n  const [editingPost, setEditingPost] = useState<any>(null);\n  const [editPostText, setEditPostText] = useState('');",
            content
        )

    # 2. إصلاح زر "تعديل" داخل قائمة التغريدة (الثلاث نقاط)
    # نبحث عن الزر الذي يحتوي على أيقونة Edit3 ونغير الحدث الخاص به
    edit_btn_pattern = r"onClick=\{\(\) => \{[\s\S]*?setIsEditModalOpen\(true\);[\s\S]*?\}\}"
    
    # دالة الاستبدال الذكية
    def replace_edit_click(match):
        return """onClick={(e) => {
          e.stopPropagation();
          setEditingPost(post);
          setEditPostText(post.text);
          setActiveMenuPost(null);
        }}"""
    
    # نطبق التعديل فقط على الزر الذي يحتوي على Edit3
    content = re.sub(
        r"(<button[^>]*onClick=\{\(\) => \{[\s\S]*?setIsEditModalOpen\(true\);[\s\S]*?\}\}[^>]*>\s*<Edit3)",
        lambda m: m.group(1).replace(
            re.search(r"onClick=\{\(\) => \{[\s\S]*?\}\}", m.group(1)).group(0),
            replace_edit_click(None)
        ),
        content
    )

    # 3. إضافة دالة حفظ التعديل (handleSaveEdit) قبل الـ return
    if "const handleSaveEdit = async" not in content:
        save_func = """
  const handleSaveEdit = async () => {
    if (!editingPost || !editPostText.trim()) return;
    try {
      await supabase.from('posts').update({ content: editPostText }).eq('id', editingPost.id);
      if (typeof setUserPosts !== 'undefined') {
        setUserPosts((prev: any[]) => prev.map(p => p.id === editingPost.id ? { ...p, text: editPostText } : p));
      }
      if (typeof setPosts !== 'undefined') {
        setPosts((prev: any[]) => prev.map(p => p.id === editingPost.id ? { ...p, text: editPostText } : p));
      }
      setEditingPost(null);
      showToast('تم تعديل التغريدة بنجاح');
    } catch (e) {
      showToast('حدث خطأ أثناء التعديل');
    }
  };
"""
        content = content.replace("  return (", save_func + "\n  return (")

    # 4. إضافة نافذة التعديل (Modal) في أسفل الصفحة (قبل إغلاق الـ div الرئيسي)
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
        # نضيفه قبل إغلاق الحاوية الرئيسية (آخر </div>)
        last_div_index = content.rfind("    </div>\n  );\n}")
        if last_div_index != -1:
            content = content[:last_div_index] + modal_ui + content[last_div_index:]
        else:
            content = content.replace("  );\n}", modal_ui + "  );\n}")

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم فصل نافذة تعديل التغريدة عن تعديل الحساب وإضافة نافذة احترافية.")
