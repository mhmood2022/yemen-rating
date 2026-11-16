import re, shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_scrollreset_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إصلاح useEffect: إعادة ضبط موضع التمرير عند فتح الصفحة
patterns = [
    (r"useEffect\(\(\) => \{\s*const handleScroll = \(\) => setIsScrolled\(window\.scrollY > \d+\);\s*window\.addEventListener\('scroll', handleScroll\);\s*return \(\) => window\.removeEventListener\('scroll', handleScroll\);\s*\}, \[\]\);", 
     """useEffect(() => {
        window.scrollTo(0, 0);
        setIsScrolled(false);

        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);"""),
    (r"useEffect\(\(\) => \{\s*// إعادة الضبط عند فتح/تحديث الصفحة[\s\S]*?\}, \[\]\);",
     """useEffect(() => {
        window.scrollTo(0, 0);
        setIsScrolled(false);

        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);""")
]

for pattern, replacement in patterns:
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        content = new_content
        print("✅ 1. تم إصلاح useEffect (إعادة الضبط عند فتح الصفحة + التمرير عند 50px).")
        break
else:
    print("⚠️ لم يتم العثور على useEffect المعروف.")

# 2. إضافة انتقال سلس للشعار
old_avatar = "<div className={`px-4 relative ${isScrolled ? 'z-10' : 'z-50'}`}>"
new_avatar = "<div className={`px-4 relative transition-all duration-300 ease-in-out ${isScrolled ? 'z-10' : 'z-50'}`}>"

if old_avatar in content:
    content = content.replace(old_avatar, new_avatar)
    print("✅ 2. تم إضافة انتقال سلس للشعار.")
else:
    print("⚠️ لم يتم العثور على حاوية الشعار الدقيقة.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
