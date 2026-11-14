import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_surgical_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    
    # 1. تنظيف الحالة الأكثر شمولاً (RichTextarea + setText + onInput + className + placeholder + />)
    content = re.sub(
        r'(<RichTextarea[^>]*/>)\s+set(?:EditPostText|EditText|NewPostText)\(e\.target\.value\)\}\s*\n\s*(?:onInput=\{\(e\) => \{\s*\n\s*const t = e\.currentTarget;\s*\n\s*t\.style\.height = \'auto\';\s*\n\s*t\.style\.height = t\.scrollHeight \+ \'px\';\s*\n\s*\}\}\s*\n\s*)?className="[^"]*"\s*\n\s*placeholder="[^"]*"\s*\n\s*/>',
        r'\1',
        content
    )
    
    # 2. تنظيف الحالة الوسطى (RichTextarea + setText + />)
    content = re.sub(
        r'(<RichTextarea[^>]*/>)\s+set(?:EditPostText|EditText|NewPostText)\(e\.target\.value\)\}\s*\n\s*/>',
        r'\1',
        content
    )
    
    # 3. تنظيف الحالة البسيطة (RichTextarea + setText)
    content = re.sub(
        r'(<RichTextarea[^>]*/>)\s+set(?:EditPostText|EditText|NewPostText)\(e\.target\.value\)\}',
        r'\1',
        content
    )
    
    # 4. تنظيف أي "const t = e.currentTarget;" يتيمة
    content = re.sub(
        r'\s*const t = e\.currentTarget;\s*\n\s*t\.style\.height = \'auto\';\s*\n\s*t\.style\.height = t\.scrollHeight \+ \'px\';\s*\n\s*\}\}',
        '',
        content
    )
    
    # 5. تنظيف أي "setEditPostText(e.target.value)}" يتيمة في أي مكان
    content = re.sub(
        r'(<RichTextarea[^>]*/>)\s+setEditPostText\(e\.target\.value\)\}',
        r'\1',
        content
    )
    
    new_len = len(content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {file}: تم تنظيف {original_len - new_len} حرف من الأكواد التالفة.")

print("\n✅ اكتمل التنظيف الجراحي.")
