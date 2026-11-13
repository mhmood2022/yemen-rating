import shutil, time

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

changes = [
    # 1. الاسم (16px)
    ("style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}",
     "style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.3' }}"),

    # 2. المعرف (13px)
    ('<p className="text-[15px] text-[#71767B] font-normal mt-0.5 text-right select-text">',
     '<p className="text-[13px] text-[#71767B] font-normal mt-0.5 text-right select-text">'),

    # 3. النبذة (10px)
    ("style={{ fontSize: '15px', fontWeight: 400, lineHeight: '1.4' }}",
     "style={{ fontSize: '10px', fontWeight: 400, lineHeight: '1.4' }}"),

    # 4. التاريخ والتفاصيل (9px)
    ('<div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2.5 text-[14.5px] text-[#71767B]">',
     '<div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2.5 text-[9px] text-[#71767B]">'),

    # 5. المتابعين (7px)
    ('<div className="flex items-center gap-4 mt-3 text-[15px]">',
     '<div className="flex items-center gap-4 mt-3 text-[7px]">')
]

for old, new in changes:
    if old in content:
        content = content.replace(old, new)
        print(f"✅ تم الاستبدال: {old[:50]}...")
    else:
        print(f"⚠️ تحذير: لم يتم العثور على النص: {old[:50]}...")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتملت جميع التعديلات.")
