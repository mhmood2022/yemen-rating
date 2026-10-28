import re

# 1. إزالة تعريف uploadStatusText المكرر في السطر 230 من AdGeneratorStudio.tsx
with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    studio = f.read()

# حذف السطر المكرر قبل handleFileUpload
dup_decl = "const [uploadStatusText, setUploadStatusText] = useState<string>('');"
# سنستبدل السطر المكرر الثاني بفراغ
first_idx = studio.find(dup_decl)
if first_idx != -1:
    second_idx = studio.find(dup_decl, first_idx + len(dup_decl))
    if second_idx != -1:
        studio = studio[:second_idx] + studio[second_idx + len(dup_decl):]
        print("✅ 1. تم حذف تعريف uploadStatusText المكرر من AdGeneratorStudio.tsx")

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(studio)

# 2. إصلاح المفتاح المكرر announcement في BanksManager.tsx
with open("src/pages/admin/banks/BanksManager.tsx", "r", encoding="utf-8") as f:
    banks = f.read()

# البحث عن تكرار announcement داخل نفس الكائن وحذف التكرار
pattern = r'(announcement:\s*formData\.announcement\s*\|\|\s*null,[\s\S]*?)announcement:\s*formData\.announcement\s*\|\|\s*null,'
if re.search(pattern, banks):
    banks = re.sub(pattern, r'\1', banks)
    print("✅ 2. تم إزالة المفتاح المكرر announcement من BanksManager.tsx")
else:
    # فحص أسطر الكائن حول السطر 230-240
    lines = banks.splitlines()
    found_first = False
    new_lines = []
    for line in lines:
        if "announcement:" in line:
            if not found_first:
                found_first = True
                new_lines.append(line)
            else:
                # تجاوز السطر المكرر
                print(f"تم إزالة السطر المكرر: {line.strip()}")
                continue
        else:
            new_lines.append(line)
    banks = "\n".join(new_lines)
    print("✅ 2. تم تنظيف تكرار announcement من BanksManager.tsx")

with open("src/pages/admin/banks/BanksManager.tsx", "w", encoding="utf-8") as f:
    f.write(banks)
