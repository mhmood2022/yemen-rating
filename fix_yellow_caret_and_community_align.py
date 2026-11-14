import re, shutil, time

# 1. إصلاح مكون RichTextarea (لجعل المؤشر أصفر)
comp_file = 'src/components/common/RichTextarea.tsx'
shutil.copy(comp_file, f"{comp_file}.bak_yellow_{int(time.time())}")
with open(comp_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("caretColor: '#FFFFFF'", "caretColor: '#FFC500'")
# إزالة أي هوامش داخلية قد تسبب انحراف المؤشر
content = content.replace("padding: '0',", "padding: '0', margin: '0',")

with open(comp_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ 1. تم جعل المؤشر أصفر في المكون.")

# 2. إصلاح مربع المجتمع (إزالة rows والكلاسات التي تنزل المؤشر)
file_comm = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file_comm, f"{file_comm}.bak_yellow_{int(time.time())}")
with open(file_comm, 'r', encoding='utf-8') as f:
    content = f.read()

# نبحث عن أي RichTextarea يحتوي على quoteText
pattern_comm = r'<RichTextarea\s*value=\{quoteText\}[\s\S]*?\/>'

clean_comm_block = """<RichTextarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="أضف تعليقك..."
          />"""

if re.search(pattern_comm, content):
    content = re.sub(pattern_comm, clean_comm_block, content)
    print("✅ 2. تم تنظيف مربع المجتمع (إزالة rows و text-lg).")
else:
    print("⚠️ لم يتم العثور على بلوك quoteText في المجتمع، سنبحث عن مربع آخر.")

with open(file_comm, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. إصلاح مربع الحساب (للتأكد من عدم وجود كلاسات قديمة)
file_acc = 'src/pages/AccountPage.tsx'
shutil.copy(file_acc, f"{file_acc}.bak_yellow_{int(time.time())}")
with open(file_acc, 'r', encoding='utf-8') as f:
    content = f.read()

pattern_acc = r'<RichTextarea\s*autoFocus[\s\S]*?\/>'
clean_acc_block = """<RichTextarea
                    autoFocus
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="ماذا يحدث؟"
                  />"""

if re.search(pattern_acc, content):
    content = re.sub(pattern_acc, clean_acc_block, content)
    print("✅ 3. تم التأكد من نظافة مربع الحساب.")

with open(file_acc, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتملت جميع التعديلات.")
