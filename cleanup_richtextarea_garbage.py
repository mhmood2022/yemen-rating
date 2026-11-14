import re, shutil, time

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_garbage_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # حذف أي كود يتيم بعد إغلاق RichTextarea /> حتى نهاية الوسم القديم />
    # هذا التعبير يلتقط <RichTextarea ... /> ويحذف كل ما بعده حتى يجد />
    content = re.sub(
        r'(<RichTextarea[^>]*?\/>)[\s\S]*?\/>',
        r'\1',
        content
    )

    # حذف أي قوس إغلاق يتيم بعد RichTextarea مباشرة (إذا كان موجوداً)
    content = re.sub(r'(<RichTextarea[^>]*?\/>)\s*\}', r'\1', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم تنظيف البقايا التالفة بعد RichTextarea بنجاح.")
