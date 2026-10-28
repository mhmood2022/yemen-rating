with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# إزالة الأسطر المكررة بعد السطر 140
new_lines = []
for i, line in enumerate(lines):
    # إذا كان السطر هو تعريف مكرر بعد السطر 140 نتجاوزه
    if i > 145 and ("const [isMediaUploading, setIsMediaUploading]" in line or "const [uploadStatusText, setUploadStatusText]" in line):
        continue
    new_lines.append(line)

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("✅ تم حذف التعريفات المكررة بنجاح!")
