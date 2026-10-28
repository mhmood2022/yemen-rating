import re

# 1. إصلاح AppShell.tsx
with open("src/components/layout/AppShell.tsx", "r", encoding="utf-8") as f:
    appshell = f.read()

# استبدال سطر الـ header ليكون معتماً ومصمتاً بالكامل
appshell = re.sub(
    r'<header\s+className="fixed top-0 left-0 right-0 z-50[^"]*"',
    '<header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1120] border-b border-[#1E293B]"',
    appshell
)

with open("src/components/layout/AppShell.tsx", "w", encoding="utf-8") as f:
    f.write(appshell)
print("✅ 1. تم جعل هيدر AppShell.tsx مصمتاً وداكناً 100%.")

# 2. إصلاح MainPublicApp.tsx
with open("src/MainPublicApp.tsx", "r", encoding="utf-8") as f:
    main_app = f.read()

main_app = re.sub(
    r'<header\s+className="fixed top-0 left-0 right-0 z-50[^"]*"',
    '<header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1120] border-b border-[#1E293B]"',
    main_app
)

with open("src/MainPublicApp.tsx", "w", encoding="utf-8") as f:
    f.write(main_app)
print("✅ 2. تم جعل هيدر MainPublicApp.tsx مصمتاً وداكناً 100%.")
