import shutil, time

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 2. الكود القديم للمعرف
old_tag = '<p className="text-[13px] text-[#71767B] font-normal mt-0.5 text-right select-text">'
# 3. الكود الجديد (حجم 15px مثل X + اتجاه LTR ليظهر @ على اليسار + محاذاة لليمين)
new_tag = '<p className="text-[15px] text-[#71767B] font-normal mt-0.5 select-text" dir="ltr" style={{ textAlign: \'right\', lineHeight: \'1.3\' }}>'

if old_tag in content:
    content = content.replace(old_tag, new_tag)
    print("✅ تم تعديل حجم المعرف وإصلاح اتجاه علامة @ بنجاح.")
else:
    # محاولة بحث بديلة في حال تغيرت المسافات
    import re
    pattern = r'<p className="text-\[13px\] text-\[#71767B\] font-normal mt-0\.5 text-right select-text">'
    content, count = re.subn(pattern, new_tag, content)
    if count > 0:
        print("✅ تم تعديل حجم المعرف وإصلاح اتجاه علامة @ بنجاح (عبر Regex).")
    else:
        print("⚠️ تحذير: لم يتم العثور على كود المعرف، يرجى إبلاغي.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتمل التعديل.")
