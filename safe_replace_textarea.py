import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_safereplace_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. استبدال <textarea بـ <RichTextarea
    content = content.replace('<textarea', '<RichTextarea')
    
    # 2. إزالة وسم الإغلاق </textarea> (لأن RichTextarea يغلق ذاتياً)
    # نقوم بإزالة </textarea> مع أي مسافات أو أسطر جديدة حولها
    content = re.sub(r'\s*</textarea>', '', content)

    # 3. إضافة الاستيراد
    if "import { RichTextarea }" not in content:
        if "import { HashtagText }" in content:
            content = content.replace("import { HashtagText }", "import { RichTextarea } from '../components/common/RichTextarea';\nimport { HashtagText }", 1)
        elif "import React" in content:
            content = content.replace("import React", "import { RichTextarea } from '../components/common/RichTextarea';\nimport React", 1)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم استبدال textarea بـ RichTextarea بشكل آمن في الملفين.")
