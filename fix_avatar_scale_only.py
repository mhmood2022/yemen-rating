import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_avataronly_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إضافة ref للشعار
if "const avatarRef = useRef<HTMLDivElement>(null);" not in content:
    content = content.replace(
        "const profileDetailsRef = useRef<HTMLDivElement>(null);",
        "const profileDetailsRef = useRef<HTMLDivElement>(null);\n  const avatarRef = useRef<HTMLDivElement>(null);"
    )
    print("✅ 1. تم إضافة ref للشعار.")

# 2. تعديل useEffect لتحريك scale الشعار فقط بشكل مستمر
new_effect = """useEffect(() => {
        window.scrollTo(0, 0);
        setIsScrolled(false);

        let ticking = false;
        const handleScroll = () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              const scrollY = window.scrollY;
              setIsScrolled(scrollY > 50);

              if (avatarRef.current) {
                const progress = Math.min(scrollY / 100, 1);
                const scale = Math.max(0, 1 - progress);
                avatarRef.current.style.transform = `scale(${scale})`;
              }
              ticking = false;
            });
            ticking = true;
          }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);"""

# استبدال useEffect الحالي
effect_pattern = r"useEffect\(\(\) => \{\s*window\.scrollTo\(0, 0\);[\s\S]*?\}, \[\]\);"
if re.search(effect_pattern, content):
    content = re.sub(effect_pattern, new_effect, content, count=1)
    print("✅ 2. تم تحديث useEffect لتحريك الشعار بشكل مستمر.")
else:
    print("⚠️ لم يتم العثور على useEffect الحالي، سيتم استبداله بـ regex بديل.")
    # محاولة أخرى: استبدال أي useEffect يحتوي على scroll
    content = re.sub(r"useEffect\(\(\) => \{[^}]*addEventListener\('scroll'[^}]*\}, \[\]\);", new_effect, content, count=1)

# 3. إزالة التأثير من الحاوية الأم
old_container = "className={`px-4 relative transition-all duration-300 ease-in-out origin-top ${isScrolled ? 'z-10 scale-75 opacity-0 pointer-events-none' : 'z-50 scale-100 opacity-100'}`}"
new_container = "className=\"px-4 relative z-50\""

if old_container in content:
    content = content.replace(old_container, new_container)
    print("✅ 3. تم إزالة التأثير من الحاوية الأم (التفاصيل ستمرر طبيعياً).")
else:
    print("⚠️ لم يتم العثور على الحاوية الأم.")

# 4. إضافة ref و style للشعار
old_avatar_wrapper = '<div className="relative group z-50">\n            <div className="w-[84px] h-[84px] sm:w-[124px] sm:h-[124px] rounded-full'
new_avatar_wrapper = '<div className="relative group z-50 origin-center" ref={avatarRef} style={{ willChange: \'transform\' }}>\n            <div className="w-[84px] h-[84px] sm:w-[124px] sm:h-[124px] rounded-full'

if old_avatar_wrapper in content:
    content = content.replace(old_avatar_wrapper, new_avatar_wrapper)
    print("✅ 4. تم إضافة ref و will-change للشعار.")

# 5. إبقاء تأثير الاختفاء على زر الترقية فقط
old_btn = "<div className={`transition-all duration-300 ${isScrolled ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}>"
if old_btn in content:
    print("✅ 5. زر الترقية سيختفي عند التمرير (بقي كما هو).")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
