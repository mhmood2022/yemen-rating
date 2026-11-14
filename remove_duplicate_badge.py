import shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# حذف السطر المكرر القديم فقط
content = content.replace("\n            badgeType: badgeType,", "")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم حذف السطر المكرر وإصلاح خطأ TS1117.")
