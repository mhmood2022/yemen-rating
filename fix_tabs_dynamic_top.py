import shutil, time, re

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_tabsdyn_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# البحث عن حاوية التبويبات باستخدام ref={tabsRef}
pattern = r'<div\s+className="([^"]*)"\s+ref=\{tabsRef\}>'
match = re.search(pattern, content)

if match:
    old_class = match.group(1)
    if 'top-36 sm:top-40' in old_class:
        # إزالة top-36 sm:top-40 من الكلاس الأصلي
        new_class_inner = old_class.replace('top-36 sm:top-40', '').strip()
        new_class_inner = ' '.join(new_class_inner.split())
        
        # بناء كلاس ديناميكي
        new_div = f'<div className={{`sticky ${{isScrolled ? \'top-24 sm:top-28\' : \'top-36 sm:top-40\'}} transition-all duration-300 {new_class_inner}`}} ref={{tabsRef}}>'
        
        content = content.replace(match.group(0), new_div)
        print("✅ تم جعل التبويبات ديناميكية (تتحرك مع الغلاف عند التصغير).")
    else:
        print(f"⚠️ الكلاس لا يحتوي على top-36 sm:top-40. المحتوى الحالي: {old_class[:100]}")
else:
    print("⚠️ لم يتم العثور على حاوية التبويبات.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
