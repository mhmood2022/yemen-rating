import shutil, time, re

file_path = 'src/pages/AccountPage.tsx'
backup_path = f"{file_path}.bak_{int(time.time())}"

# 1. أخذ نسخة احتياطية
shutil.copy(file_path, backup_path)
print(f"✅ تم أخذ نسخة احتياطية: {backup_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. تكبير المتابعين تكة (9px -> 10px) ---
content = content.replace('className="flex items-center gap-4 mt-3 text-[9px]"', 
                          'className="flex items-center gap-4 mt-3 text-[10px]"')
print("✅ تم تكبير خط المتابعين إلى 10px.")

# --- 2. إضافة دالة الهاشتاج (إذا لم تكن موجودة) ---
if "const renderBioText" not in content:
    target_func = "const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {"
    bio_renderer = """  // دالة لتحويل الهاشتاج إلى رابط قابل للنقر
  const renderBioText = (text: string) => {
    if (!text) return null;
    // هذا التعبير يفصل النص عند أي هاشتاج (#) ويشمل العربية والإنجليزية والأرقام
    const parts = text.split(/(#[^\\s#]+)/g);
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
    if target_func in content:
        content = content.replace(target_func, bio_renderer + target_func)
        print("✅ تم حقن دالة الهاشتاج في الكود.")
else:
    print("ℹ️ دالة الهاشتاج موجودة بالفعل.")

# --- 3. استبدال عرض النبذة باستخدام Regex لضمان عدم فشل الاستبدال ---
# نبحث عن البلوك الذي يحتوي على {bio} داخل <p ...> ... </p>
pattern = r"\{bio \? \([\s\S]*?\{bio\}[\s\S]*?\) : isOwner"
replacement = """{bio ? (
          <p
            className="mt-2.5 text-[#E7E9EA] whitespace-pre-wrap"
            style={{ fontSize: '11px', fontWeight: 400, lineHeight: '1.4' }}
          >
            {renderBioText(bio)}
          </p>
        ) : isOwner"""

new_content, count = re.subn(pattern, replacement, content)

if count > 0:
    content = new_content
    print("✅ تم ربط النبذة بدالة الهاشتاج بنجاح.")
else:
    print("⚠️ تحذير: لم يتم العثور على بلوك النبذة، قد تحتاج لمراجعة يدوية.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ اكتملت جميع التعديلات.")
