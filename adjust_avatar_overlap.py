import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_overlap_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# تقليل الهامش السالب ليكون الثلث فوق والثلثين تحت
# للجوال: 84px / 3 = 28px فوق. للديسكتوب: 124px / 3 = 41px فوق.
old_margin = '<div className="flex justify-between items-end -mt-[46px] sm:-mt-[66px] mb-3">'
new_margin = '<div className="flex justify-between items-end -mt-[28px] sm:-mt-[41px] mb-3">'

if old_margin in content:
    content = content.replace(old_margin, new_margin)
    print("✅ تم تعديل هامش الشعار (الثلث فوق والثلثين تحت).")
else:
    print("⚠️ لم يتم العثور على الهامش الدقيق، سيتم استخدام المحاولة البديلة.")
    content = content.replace('-mt-[46px] sm:-mt-[66px]', '-mt-[28px] sm:-mt-[41px]')
    print("✅ تم التعديل (بالطريقة البديلة).")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
