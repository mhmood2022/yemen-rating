import shutil, time

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. تعديل سرعة تفعيل التمرير (من 80 إلى 10 بكسل) ليكون سلساً جداً ---
content = content.replace("window.scrollY > 80", "window.scrollY > 10")

# --- 2. ضبط طبقة الغلاف ليكون z-40 ---
content = content.replace(
    'className="sticky top-0 z-20 w-full h-36 sm:h-40 bg-gradient-to-r',
    'className="sticky top-0 z-40 w-full h-36 sm:h-40 bg-gradient-to-r'
)

# --- 3. ضبط طبقة التفاصيل (z-50 قبل التمرير لكي لا تقطع الشعار، و z-20 بعد التمرير لتختفي تحت الغلاف) ---
content = content.replace(
    "className={`px-4 relative ${isScrolled ? 'z-10' : 'z-30'}`}",
    "className={`px-4 relative ${isScrolled ? 'z-20' : 'z-50'}`}"
)

# --- 4. ضبط التبويبات لتلتصق أسفل الغلاف مباشرة (z-30 وإزالة mt-4) ---
content = content.replace(
    'className="sticky top-36 sm:top-40 z-20 bg-black/95 backdrop-blur-md mt-4 border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold"',
    'className="sticky top-36 sm:top-40 z-30 bg-black/95 backdrop-blur-md border-b border-[#2F3336]/40 flex items-center justify-around text-sm font-bold"'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إصلاح تداخل الشعار وتثبيت التبويبات بنجاح.")
