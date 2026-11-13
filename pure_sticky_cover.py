import shutil, time, re

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. حذف الهيدر الأسود المصطنع الذي أضضناه سابقاً بالكامل ---
pattern_header = r"\{/\* الهيدر الثابت العلوي \(يظهر عند التمرير مثل X\) \*/\}.*?\{/\* 1\. الغلاف بنمط أبو شرواني \*/\}"
content = re.sub(pattern_header, "{/* 1. الغلاف بنمط أبو شرواني */}", content, flags=re.DOTALL)
print("✅ تم إزالة الهيدر الأسود المصطنع.")

# --- 2. التأكد من وجود حالة التمرير ---
if "const [isScrolled, setIsScrolled] = useState(false);" not in content:
    anchor = "const [bio, setBio] = useState('');"
    content = content.replace(anchor, anchor + "\n  const [isScrolled, setIsScrolled] = useState(false);")

if "window.addEventListener('scroll'" not in content:
    anchor = "const [avatarUrl, setAvatarUrl] = useState<string>('');"
    effect = """
      useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 80);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);
    """
    content = content.replace(anchor, anchor + effect)

# --- 3. جعل الغلاف ثابتاً (Sticky) بطبقة عليا (z-20) ---
old_cover = 'className="relative w-full h-36 sm:h-40 bg-gradient-to-r'
new_cover = 'className="sticky top-0 z-20 w-full h-36 sm:h-40 bg-gradient-to-r'
content = content.replace(old_cover, new_cover)
print("✅ تم تثبيت الغلاف (Sticky).")

# --- 4. جعل التفاصيل فوق الغلاف (z-30) في البداية، وتحت الغلاف (z-10) عند التمرير ---
# نستهدف الحاوية التي تحمل الكلاس relative z-10 (التي تحتوي على الصورة والاسم)
old_profile = '<div className="px-4 relative z-10">'
new_profile = '<div className={`px-4 relative ${isScrolled ? \'z-10\' : \'z-30\'}`}>'
content = content.replace(old_profile, new_profile)
print("✅ تم ضبط طبقات التفاصيل لتختفي تحت الغلاف عند التمرير.")

# --- 5. تثبيت التبويبات أسفل الغلاف مباشرة (top-36) ---
# نبحث عن التبويبات ونستبدل كلاسها
content = re.sub(r'className="sticky top-\[53px\].*?flex items-center justify-around text-sm font-bold"', 'className="sticky top-36 sm:top-40 z-20 bg-black/95 backdrop-blur-md mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold"', content, flags=re.DOTALL)
content = re.sub(r'className="mt-4 border-b border-\[#2F3336\]/40 flex items-center justify-around text-sm font-bold"', 'className="sticky top-36 sm:top-40 z-20 bg-black/95 backdrop-blur-md mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold"', content, flags=re.DOTALL)
print("✅ تم تثبيت التبويبات تحت الغلاف مباشرة.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتمل التعديل بنجاح.")
