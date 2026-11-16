import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_pinnedzoom_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إزالة تأثير الاختفاء من الحاوية الأم (حتى تمرر التفاصيل طبيعياً)
old_wrapper = "className={`px-4 relative transition-all duration-300 ease-in-out origin-top ${isScrolled ? 'z-10 scale-75 opacity-0 pointer-events-none' : 'z-50 scale-100 opacity-100'}`}"
new_wrapper = 'className="px-4 relative z-10"'

if old_wrapper in content:
    content = content.replace(old_wrapper, new_wrapper)
    print("✅ 1. تم إزالة تأثير الاختفاء من التفاصيل (ستمرر طبيعياً).")
else:
    print("⚠️ لم يتم العثور على الحاوية الأم بالشكل الدقيق.")

# 2. إضافة ref لصف الشعار وزر الترقية
old_row = '<div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-3">'
new_row = '<div ref={avatarRowRef} className="flex justify-between items-end -mt-16 sm:-mt-20 mb-3" style={{ willChange: \'transform\' }}>'

if old_row in content:
    content = content.replace(old_row, new_row, 1)
    print("✅ 2. تم إضافة ref لصف الشعار وزر الترقية.")
else:
    print("⚠️ لم يتم العثور على صف الشعار.")

# 3. إضافة تعريف avatarRowRef
if "const avatarRowRef = useRef" not in content:
    if "const avatarRef = useRef" in content:
        content = content.replace(
            "const avatarRef = useRef<HTMLDivElement>(null);",
            "const avatarRef = useRef<HTMLDivElement>(null);\n  const avatarRowRef = useRef<HTMLDivElement>(null);"
        )
    else:
        content = content.replace(
            "const profileDetailsRef = useRef<HTMLDivElement>(null);",
            "const profileDetailsRef = useRef<HTMLDivElement>(null);\n  const avatarRowRef = useRef<HTMLDivElement>(null);"
        )
    print("✅ 3. تم إضافة تعريف avatarRowRef.")

# 4. تحديث useEffect لتحريك الصف فقط (ترجمة عكسية + تقليص)
effect_pattern = r"useEffect\(\(\) => \{\s*window\.scrollTo\(0, 0\);[\s\S]*?window\.removeEventListener\('scroll', handleScroll\);\s*\}, \[\]\);"

new_effect = """useEffect(() => {
        window.scrollTo(0, 0);
        setIsScrolled(false);

        let ticking = false;
        const handleScroll = () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              const scrollY = window.scrollY;
              setIsScrolled(scrollY > 50);

              if (avatarRowRef.current) {
                const progress = Math.min(scrollY / 100, 1);
                const scale = Math.max(0, 1 - progress);
                // translateY(scrollY) يعوض التمرير ليبقى في مكانه، ثم scale يصغره
                avatarRowRef.current.style.transform = `translateY(${scrollY}px) scale(${scale})`;
                avatarRowRef.current.style.transformOrigin = 'center';
              }
              ticking = false;
            });
            ticking = true;
          }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);"""

if re.search(effect_pattern, content):
    content = re.sub(effect_pattern, new_effect, content, count=1)
    print("✅ 4. تم تحديث useEffect (الشعار يبقى في مكانه ويتقلص).")
else:
    print("⚠️ لم يتم العثور على useEffect الحالي.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
