import shutil, time, re

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. إصلاح الغلاف وإرجاعه لطبيعته (إزالة sticky) ---
content = content.replace('sticky top-0 z-30 w-full h-36 sm:h-40 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950 shadow-md', 'relative w-full h-36 sm:h-40 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950')
content = content.replace('sticky top-0 z-30 w-full h-36 sm:h-40 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950', 'relative w-full h-36 sm:h-40 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950')
print("✅ تم إصلاح تداخل الغلاف مع الشعار.")

# --- 2. إصلاح طبقة التفاصيل ---
content = content.replace('<div className="px-4 relative z-20">', '<div className="px-4 relative z-10">')

# --- 3. إضافة حالة التمرير ---
if "const [isScrolled, setIsScrolled] = useState(false);" not in content:
    anchor = "const [bio, setBio] = useState('');"
    content = content.replace(anchor, anchor + "\n  const [isScrolled, setIsScrolled] = useState(false);")

# --- 4. إضافة مراقب التمرير ---
if "window.addEventListener('scroll'" not in content:
    anchor = "const [avatarUrl, setAvatarUrl] = useState<string>('');"
    effect = """
      useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);
    """
    content = content.replace(anchor, anchor + effect)

# --- 5. إضافة الهيدر الثابت (مثل X) ---
if "fixed top-0 left-0 right-0 z-[100]" not in content:
    old_root = '<div className="min-h-screen bg-black text-[#E7E9EA] font-[\'Tahoma\',sans-serif] selection:bg-[#FFC500] selection:text-white pb-32" dir="rtl">'
    new_root = '''<div className="min-h-screen bg-black text-[#E7E9EA] font-['Tahoma',sans-serif] selection:bg-[#FFC500] selection:text-white pb-32" dir="rtl">
      {/* الهيدر الثابت العلوي (يظهر عند التمرير مثل X) */}
      <div
        className={`fixed top-0 left-0 right-0 z-[100] h-[53px] bg-black/80 backdrop-blur-md flex items-center justify-between px-4 transition-all duration-300 border-b border-transparent ${
          isScrolled ? 'translate-y-0 opacity-100 border-[#2F3336]/40' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition active:scale-95"
          >
            <ArrowRight size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-white font-bold text-[17px] leading-tight">{name || "مستخدم يمن ريتنج"}</span>
            <span className="text-[#71767B] text-[13px]">{userPosts.length} منشور</span>
          </div>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-9 h-9 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition active:scale-95"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      '''
    content = content.replace(old_root, new_root)

# --- 6. تثبيت التبويبات أسفل الهيدر مباشرة ---
content = re.sub(r'className="sticky top-36 sm:top-40 z-20 bg-black/95 backdrop-blur-md mt-4 border-b border-\[#2F3336\]/40 flex items-center justify-around text-sm font-bold"', 'className="sticky top-[53px] z-40 bg-black/95 backdrop-blur-md mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold"', content)
content = re.sub(r'className="mt-4 border-b border-\[#2F3336\]/40 flex items-center justify-around text-sm font-bold"', 'className="sticky top-[53px] z-40 bg-black/95 backdrop-blur-md mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold"', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتمل التعديل بنجاح.")
