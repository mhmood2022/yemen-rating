import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_modal_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# التأكد من عدم وجود النافذة مسبقاً لتجنب التكرار
if "editingPost && (" not in content:
    modal_ui = """
      {/* مودال تعديل التغريدة */}
      {editingPost && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-black border border-[#2F3336] rounded-2xl w-full max-w-lg p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">تعديل التغريدة</h2>
              <button onClick={() => setEditingPost(null)} className="text-[#71767B] hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                <X size={20} />
              </button>
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

    # حقن النافذة قبل إغلاق المكون الرئيسي (قبل السطر الذي يحتوي على </div>\n  );\n}
    # نبحث عن آخر ظهور لـ MobileBottomNav لإضافة النافذة قبلها أو قبل إغلاق الـ div
    pattern = r"(    </div>\n  \);\n\})"
    if re.search(pattern, content):
        content = re.sub(pattern, modal_ui + r"\1", content)
    else:
        # محاولة بديلة: البحث عن نهاية الملف
        content = content.replace("  );\n}", modal_ui + "  );\n}")

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ تم حقن نافذة تعديل التغريدة بنجاح.")
else:
    print("ℹ️ النافذة موجودة بالفعل.")
