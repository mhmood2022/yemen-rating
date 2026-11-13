import shutil, time

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- التعديلات ---

# 1. تكبير النبذة (10px -> 11px)
content = content.replace("style={{ fontSize: '10px', fontWeight: 400, lineHeight: '1.4' }}",
                          "style={{ fontSize: '11px', fontWeight: 400, lineHeight: '1.4' }}")

# 2. تكبير التاريخ والتفاصيل (9px -> 11px)
content = content.replace('className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2.5 text-[9px] text-[#71767B]"',
                          'className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-2.5 text-[11px] text-[#71767B]"')

# 3. تكبير المتابعين (7px -> 9px)
content = content.replace('className="flex items-center gap-4 mt-3 text-[7px]"',
                          'className="flex items-center gap-4 mt-3 text-[9px]"')

# 4. إضافة دالة الهاشتاج
# نبحث عن دالة handlePhotoUpload لنضع دالتنا قبلها
target_func = "const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {"
bio_renderer = """  // دالة لتحويل الهاشتاج إلى رابط قابل للنقر
  const renderBioText = (text: string) => {
    if (!text) return null;
    // هذا التعبير يبحث عن أي كلمة تبدأ بـ # وتحتوي على أحرف عربية أو إنجليزية أو أرقام
    const parts = text.split(/(#[\\u0600-\\u06FFa-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={i}
            className="text-[#1D9BF0] hover:underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/search?q=${encodeURIComponent(part)}`);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

"""
if target_func in content and "const renderBioText" not in content:
    content = content.replace(target_func, bio_renderer + target_func)
    print("✅ تم إضافة دالة تفعيل الهاشتاج.")
else:
    print("⚠️ تحذير: تعذر إضافة دالة الهاشتاج (قد تكون موجودة مسبقاً).")

# 5. استبدال عرض النبذة ليستخدم الدالة
content = content.replace(">{bio}</p>", ">{renderBioText(bio)}</p>")
print("✅ تم تفعيل عرض الهاشتاج داخل النبذة.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتملت جميع التعديلات بنجاح.")
