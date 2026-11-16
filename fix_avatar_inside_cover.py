import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_avatarinside_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. استخراج كود الشعار وزر الترقية الحالي
avatar_match = re.search(r'({/\* 2\. الصورة الشخصية والشارة العلوية \*/\}[\s\S]*?</div>\s*<div className="mt-1">)', content)
if not avatar_match:
    print("⚠️ لم يتم العثور على كتلة الشعار الحالية.")
    exit(1)

avatar_block = avatar_match.group(1)

# 2. تعديل الكتلة المستخرجة لتكون مخصصة للغلاف (absolute)
# إزالة الحاوية الخارجية <div className={px-4...}> واستبدالها بحاوية absolute
new_avatar_block = avatar_block.replace(
    '<div className={`px-4 relative transition-all duration-300 ease-in-out ${isScrolled ? \'z-10\' : \'z-50\'}`}>',
    '<div className="absolute bottom-0 right-4 translate-y-1/2 z-50 flex items-end justify-between w-[calc(100%-2rem)]">'
)
# إزالة الـ flex justify-between items-end -mt-16 (لأننا أصبحنا داخل الغلاف)
new_avatar_block = new_avatar_block.replace('<div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-3">', '<div className="flex justify-between items-end w-full">')
# إزالة -mt-16 من الحاوية الداخلية إذا وجدت
new_avatar_block = new_avatar_block.replace(' -mt-16 sm:-mt-20', '')
# إزالة mb-3 (لأننا في وضع absolute)
new_avatar_block = new_avatar_block.replace(' mb-3', '')

# 3. إزالة الكتلة الأصلية من مكانها (بما فيها حاوية px-4)
content = content.replace(avatar_match.group(1), '')

# 4. إضافة الكتلة الجديدة داخل الغلاف (بعد صورة الغلاف مباشرة)
cover_end_match = re.search(r'(<div className={`sticky top-0 z-40[\s\S]*?</div>\s*</div>)', content)
if cover_end_match:
    # نضيف الكتلة الجديدة قبل إغلاق الغلاف
    cover_block = cover_end_match.group(1)
    new_cover_block = cover_block.replace('</div>\n      </div>', new_avatar_block + '\n      </div>\n      </div>')
    content = content.replace(cover_block, new_cover_block)
    print("✅ 1. تم نقل الشعار وزر الترقية إلى داخل الغلاف.")
else:
    print("⚠️ لم يتم العثور على كتلة الغلاف.")

# 5. إزالة تأثير z-index القديم من الشعار (لم يعد هناك حاوية منفصلة)
# (لا حاجة، لأن الكتلة الجديدة لها z-50 ثابت)

# 6. إعادة الاسم والتفاصيل إلى حاوية جديدة أسفل الغلاف (بدون الشعار)
# الكود الحالي: بعد إزالة كتلة الشعار، بقيت حاوية px-4 (التي كانت تحتوي على الشعار والاسم). نريد إعادة إنشائها للاسم فقط.
# البحث عن مكان الاسم (post.name)
name_match = re.search(r'(<div className="mt-1">[\s\S]*?<\/div>\s*</div>\s*</div>)', content)
if name_match:
    name_block = name_match.group(1)
    # نضيف حاوية px-4 جديدة حول الاسم إذا لم تكن موجودة
    if '<div className="px-4 relative">' not in content:
        new_name_block = '<div className="px-4 relative">\n' + name_block + '\n</div>'
        content = content.replace(name_block, new_name_block)
        print("✅ 2. تم إعادة الاسم إلى حاوية أسفل الغلاف.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل (إذا لم تظهر أخطاء).")
