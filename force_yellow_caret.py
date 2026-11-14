import shutil, time

# 1. تعديل المكون لضمان لون المؤشر الأصفر
comp_file = 'src/components/common/RichTextarea.tsx'
shutil.copy(comp_file, f"{comp_file}.bak_yellowcaret_{int(time.time())}")
with open(comp_file, 'r', encoding='utf-8') as f:
    content = f.read()

# إجبار لون المؤشر على الأصفر وتغيير طريقة إخفاء النص (لأن WebkitTextFillColor أحياناً يلغي لون المؤشر)
content = content.replace("caretColor: '#FFC500',", "caretColor: '#FFC500', outline: 'none',")
content = content.replace("WebkitTextFillColor: 'transparent',", "") # إزالة هذه الخاصية لأنها تسبب مشاكل في كروم أندرويد

# ضمان بقاء لون النص شفافاً
content = content.replace("color: 'transparent',", "color: 'transparent', textShadow: '0 0 0 #FFFFFF',") # حيلة لإبقاء النص شفافاً مع الحفاظ على المؤشر

with open(comp_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ 1. تم تحديث مكون RichTextarea لضمان لون المؤشر.")

# 2. إجبار لون المؤشر الأصفر في ملفات CSS العامة (للتغلب على أي إعدادات أخرى)
css_files = ['src/index.css', 'src/styles/globals.css']
for file in css_files:
    shutil.copy(file, f"{file}.bak_cssforce_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # استبدال أي قاعدة سابقة بلون أصفر مع !important
    content = content.replace("caret-color: #FFFFFF !important;", "caret-color: #FFC500 !important;")
    content = content.replace("caret-color: #FFFFFF;", "caret-color: #FFC500 !important;")
    content = content.replace("caret-color: #FFC500;", "caret-color: #FFC500 !important;")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("✅ 2. تم إجبار لون المؤشر في ملفات CSS.")

print("✅ اكتمل التعديل.")
