import shutil, time

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. إضافة حالة التمرير (isScrolled) ---
if "const [isScrolled, setIsScrolled] = useState(false);" not in content:
    anchor = "const [bio, setBio] = useState('');"
    content = content.replace(anchor, anchor + "\n  const [isScrolled, setIsScrolled] = useState(false);")
    print("✅ تم إضافة حالة isScrolled.")

# --- 2. إضافة مراقب التمرير (useEffect) ---
if "window.addEventListener('scroll'" not in content:
    anchor = "const [avatarUrl, setAvatarUrl] = useState<string>('');"
    effect = """
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 150);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
"""
    content = content.replace(anchor, anchor + effect)
    print("✅ تم إضافة مراقب التمرير.")

# --- 3. حقن الهيدر الثابت (Sticky Header) ---
old_return = '<div className="min-h-screen bg-black text-[#E7E9EA] font-[\'Tahoma\',sans-serif] selection:bg-[#FFC500] selection:text-white pb-32" dir="rtl">'
new_return = '''<div className="min-h-screen bg-black text-[#E7E9EA] font-['Tahoma',sans-serif] selection:bg-[#FFC500] selection:text-white pb-32" dir="rtl">
      {/* الهيدر الثابت (يظهر عند التمرير) */}
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
if old_return in content:
    content = content.replace(old_return, new_return)
    print("✅ تم حقن الهيدر الثابت.")
else:
    print("⚠️ تحذير: لم يتم العثور على بداية الـ return.")

# --- 4. جعل التبويبات (Tabs) مثبتة تحت الهيدر ---
old_tabs = '<div className="mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold">'
new_tabs = '<div className="sticky top-[53px] z-[90] bg-black/95 backdrop-blur-md mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold">'

if old_tabs in content:
    content = content.replace(old_tabs, new_tabs)
    print("✅ تم تثبيت التبويبات أسفل الهيدر.")
else:
    print("⚠️ تحذير: لم يتم العثور على بلوك التبويبات.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتملت جميع التعديلات بنجاح.")
