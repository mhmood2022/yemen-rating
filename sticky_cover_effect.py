import shutil, time, re

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. حذف الهيدر الثابت القديم الذي أضفناه سابقاً ---
pattern_header = r"\{/\* الهيدر الثابت \(يظهر عند التمرير\) \*/\}.*?\{/\* 1\. الغلاف بنمط أبو شرواني \*/\}"
content = re.sub(pattern_header, "{/* 1. الغلاف بنمط أبو شرواني */}", content, flags=re.DOTALL)

# حذف حالة isScrolled والـ useEffect الخاص بها
content = content.replace("  const [isScrolled, setIsScrolled] = useState(false);\n", "")
pattern_effect = r"\n  useEffect\(\(\) => \{\n    const handleScroll = \(\) => setIsScrolled\(window\.scrollY > 150\);\n    window\.addEventListener\('scroll', handleScroll\);\n    return \(\) => window\.removeEventListener\('scroll', handleScroll\);\n  \}, \[\]\);\n"
content = re.sub(pattern_effect, "", content)

# --- 2. جعل الغلاف ثابتاً (Sticky) وإعطائه طبقة عليا (z-30) ---
old_cover = '<div className="relative w-full h-36 sm:h-40 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950">'
new_cover = '<div className="sticky top-0 z-30 w-full h-36 sm:h-40 bg-gradient-to-r from-zinc-950 via-[#0A1224] to-zinc-950 shadow-md">'
content = content.replace(old_cover, new_cover)

# رفع طبقة أزرار الغلاف (الرجوع والنقاط) لتكون فوق الغلاف (z-40)
old_nav = '<div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">'
new_nav = '<div className="absolute top-3 left-3 right-3 flex items-center justify-between z-40">'
content = content.replace(old_nav, new_nav)

# --- 3. إعطاء التفاصيل طبقة أقل (z-20) لتختفي تحت الغلاف عند التمرير ---
old_profile = '<div className="px-4 relative">'
new_profile = '<div className="px-4 relative z-20">'
content = content.replace(old_profile, new_profile)

# --- 4. جعل التبويبات تلتصق أسفل الغلاف مباشرة (top-36) ---
# نبحث عن أي كلاس يخص التبويبات ونستبدله
old_tabs_regex = r'<div className=".*?mt-4 border-b border-\[#2F3336\]/40 flex items-center justify-around text-sm font-bold">'
new_tabs = '<div className="sticky top-36 sm:top-40 z-20 bg-black/95 backdrop-blur-md mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold">'
content = re.sub(old_tabs_regex, new_tabs, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم تطبيق تأثير الغلاف الثابت (Sticky Cover) بنجاح.")
