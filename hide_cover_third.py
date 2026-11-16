import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_coverthird_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# الكود القديم (الغلاف بحجم ثابت)
old_cover = '<div className="sticky top-0 z-40 w-full h-36 sm:h-40 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950">'

# الكود الجديد (ديناميكي: ثلثين عند التثبيت)
new_cover = '<div className={`sticky top-0 z-40 w-full bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950 transition-all duration-300 ease-in-out ${isScrolled ? \'h-24 sm:h-28\' : \'h-36 sm:h-40\'}`}>'

if old_cover in content:
    content = content.replace(old_cover, new_cover)
    print("✅ 1. تم تحويل الغلاف إلى ديناميكي (ثلثان عند التثبيت).")
else:
    print("⚠️ لم يتم العثور على الغلاف الدقيق.")

# إضافة overflow-hidden لضمان عدم خروج الصورة عند التصغير
# نبحث عن الصورة داخل الغلاف
old_img = '<img src={coverUrl} alt="الغلاف" className="w-full h-full object-cover" />'
new_img = '<img src={coverUrl} alt="الغلاف" className="w-full h-full object-cover transition-all duration-300" />'

if old_img in content:
    content = content.replace(old_img, new_img)
    print("✅ 2. تم إضافة انتقال سلس للصورة.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
