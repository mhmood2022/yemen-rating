import shutil, time

# 1. إصلاح لون المؤشر في ملفات CSS العامة (السبب الحقيقي للون الأبيض)
css_files = ['src/index.css', 'src/styles/globals.css']
for file in css_files:
    shutil.copy(file, f"{file}.bak_css_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # تغيير اللون من الأبيض إلى الأصفر (مع إبقاء !important لكي يتغلب على أي شيء)
    content = content.replace("caret-color: #FFFFFF !important;", "caret-color: #FFC500 !important;")
    content = content.replace("caret-color: #FFFFFF;", "caret-color: #FFC500;")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ تم تغيير لون المؤشر إلى الأصفر في {file}")

# 2. تعديل المكون لمنع نزول المؤشر للأسفل
comp_file = 'src/components/common/RichTextarea.tsx'
shutil.copy(comp_file, f"{comp_file}.bak_align_{int(time.time())}")
with open(comp_file, 'r', encoding='utf-8') as f:
    content = f.read()

# إضافة خصائص إجبار النص على البدء من الأعلى وإزالة الحدود الافتراضية
content = content.replace(
    "padding: '0', margin: '0',",
    "padding: '0', margin: '0', border: 'none', outline: 'none', boxShadow: 'none', verticalAlign: 'top',"
)

# إزالة الارتفاع الإجباري 120px (هذا هو سبب نزول المؤشر في المجتمع)
content = content.replace(
    "textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + 'px';",
    "textareaRef.current.style.height = 'auto';\n      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';"
)

# إضافة ارتفاع افتراضي 120px فقط لمربع الحساب (عن طريق النمط الممرر)
with open(comp_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم تعديل المكون لضمان بدء النص من الأعلى.")

# 3. إضافة ارتفاع 120px لمربع الحساب فقط (حتى يظل كبيراً)
file_acc = 'src/pages/AccountPage.tsx'
shutil.copy(file_acc, f"{file_acc}.bak_height_{int(time.time())}")
with open(file_acc, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'placeholder="ماذا يحدث؟"\n                  />',
    'placeholder="ماذا يحدث؟"\n                    style={{ minHeight: "120px" }}\n                  />'
)
# إزالة التكرار إذا كان موجوداً
content = content.replace('style={{ minHeight: "120px" }}\n                    style={{ minHeight: "120px" }}', 'style={{ minHeight: "120px" }}')

with open(file_acc, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم ضبط مربع الحساب ليكون بارتفاع 120px.")
