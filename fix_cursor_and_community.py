import shutil, time

# 1. إصلاح مكون RichTextarea (لجعل المؤشر أصفر)
comp_file = 'src/components/common/RichTextarea.tsx'
shutil.copy(comp_file, f"{comp_file}.bak_cursor_{int(time.time())}")
with open(comp_file, 'r', encoding='utf-8') as f:
    content = f.read()

# إزالة الخاصية التي تمنع المتصفح من تلوين المؤشر
content = content.replace("WebkitTextFillColor: 'transparent',", "")
with open(comp_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم إصلاح لون المؤشر في المكون.")

# 2. إصلاح مربع الكتابة في صفحة المجتمع (إزالة rows={3} التي تسبب النزول للأسفل)
file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_comm_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """          <RichTextarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="أضف تعليقك..."
            className="w-full bg-transparent text-white text-lg placeholder-[#71767B] resize-none focus:outline-none mb-4"
            rows={3}
          />"""

new_block = """          <RichTextarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="أضف تعليقك..."
            className="w-full bg-transparent placeholder-[#71767B] mb-4"
          />"""

if old_block in content:
    content = content.replace(old_block, new_block)
    print("✅ تم تنظيف مربع الكتابة في المجتمع (إزالة rows={3}).")
else:
    print("⚠️ لم يتم العثور على البلوك في المجتمع، سنستخدم مسحاً احتياطياً.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
