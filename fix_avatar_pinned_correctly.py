import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_pinnedcorrect_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. تعديل useEffect ليطبق التحويل على avatarRef فقط
old_effect = """              if (avatarRowRef.current) {
                const progress = Math.min(scrollY / 100, 1);
                const scale = Math.max(0, 1 - progress);
                // translateY(scrollY) يعوض التمرير ليبقى في مكانه، ثم scale يصغره
                avatarRowRef.current.style.transform = `translateY(${scrollY}px) scale(${scale})`;
                avatarRowRef.current.style.transformOrigin = 'center';
              }"""

new_effect = """              if (avatarRef.current) {
                const progress = Math.min(scrollY / 100, 1);
                const scale = Math.max(0, 1 - progress);
                // نطبق التحويل على الشعار نفسه ليبقى مثبتاً في مكانه ويتقلص
                avatarRef.current.style.transform = `translateY(${scrollY}px) scale(${scale})`;
                avatarRef.current.style.transformOrigin = 'center';
              }"""

if old_effect in content:
    content = content.replace(old_effect, new_effect)
    print("✅ 1. تم تعديل useEffect ليطبق التحويل على الشعار فقط (وليس الصف).")
else:
    print("⚠️ لم يتم العثور على useEffect الدقيق.")

# 2. إزالة willChange من صف الشعار
content = content.replace(
    '<div ref={avatarRowRef} className="flex justify-between items-end -mt-16 sm:-mt-20 mb-3" style={{ willChange: \'transform\' }}>',
    '<div className="flex justify-between items-end -mt-12 sm:-mt-14 mb-3">'
)

# 3. التأكد من أن الشعار له transformOrigin: center
content = content.replace(
    '<div className="relative group z-50 origin-center" ref={avatarRef} style={{ willChange: \'transform\' }}>',
    '<div className="relative group z-50 origin-center" ref={avatarRef} style={{ willChange: \'transform\', transformOrigin: \'center\' }}>'
)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ 2. تم نقل الشعار ليكون في المنتصف السفلي للغلاف، وتطبيق التأثير عليه فقط.")
