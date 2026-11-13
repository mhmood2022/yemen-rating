import shutil, time, sys

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# قائمة التعديلات الدقيقة (النص القديم -> النص الجديد)
changes = [
    # 1. تكبير زر النقاط الثلاث وجعله أبيض
    ('<MoreHorizontal size={14} className="rotate-90 text-[#71767B]" />',
     '<MoreHorizontal size={20} className="rotate-90 text-white" />'),

    # 2. تكبير الصورة الشخصية وضبط المسافة السالبة فوقها
    ('<div className="flex justify-between items-end -mt-10 sm:-mt-12 mb-3">',
     '<div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-3">'),
    ('<div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full border-[3px] border-black bg-zinc-950 overflow-hidden shadow-xl flex items-center justify-center">',
     '<div className="w-[84px] h-[84px] sm:w-[124px] sm:h-[124px] rounded-full border-4 border-black bg-zinc-950 overflow-hidden shadow-xl flex items-center justify-center">'),

    # 3. تصغير حجم الاسم من 20px إلى 18px
    ("style={{ fontSize: '20px', fontWeight: 700, lineHeight: '1.3' }}",
     "style={{ fontSize: '18px', fontWeight: 700, lineHeight: '1.3' }}"),

    # 4. ضبط مسافة النبذة (Bio)
    ('<p className="mt-3 text-[#E7E9EA] whitespace-pre-wrap"',
     '<p className="mt-2.5 text-[#E7E9EA] whitespace-pre-wrap"'),

    # 5. ضبط تفاصيل الموقع والتاريخ
    ('<div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-3 text-sm text-[#71767B]">',
     '<div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2.5 text-[14.5px] text-[#71767B]">'),

    # 6. ضبط حجم عداد المتابعين
    ('<div className="flex items-center gap-4 mt-3.5 text-sm">',
     '<div className="flex items-center gap-4 mt-3 text-[15px]">')
]

for old, new in changes:
    if old in content:
        content = content.replace(old, new)
        print(f"✅ تم الاستبدال: {old[:40]}...")
    else:
        print(f"⚠️ تحذير: لم يتم العثور على النص: {old[:40]}...")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتمل التعديل.")
