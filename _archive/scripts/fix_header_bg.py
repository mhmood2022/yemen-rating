import re

# 1. فحص وتعديل Header.tsx إذا كان يحتوي على شفافية
try:
    with open("src/components/layout/Header.tsx", "r", encoding="utf-8") as f:
        header_code = f.read()
    
    # استبدال أي شفافية أو تدرج في وسم header ليصبح داكناً ثابتاً ومصمتاً
    # اللون المعتمد في الصورة هو اللون الداكن المصمت الخاص بالتطبيق (bg-slate-950 أو bg-[#0B132B])
    header_code = re.sub(
        r'(<header[^>]*className=["\'][^"\']*)(bg-transparent|bg-gradient-to-b[^"\']*|bg-background/\d+|backdrop-blur[^"\']*)',
        r'\1bg-[#0B132B] border-b border-slate-800/80',
        header_code
    )
    
    with open("src/components/layout/Header.tsx", "w", encoding="utf-8") as f:
        f.write(header_code)
    print("✅ تم ضبط خلفية Header.tsx لتكون داكنة ومصمتة تماماً.")
except Exception as e:
    print("Header.tsx note:", e)

# 2. فحص وتعديل AppShell.tsx
try:
    with open("src/components/layout/AppShell.tsx", "r", encoding="utf-8") as f:
        appshell = f.read()

    # إذا كان هناك تغليف للهيدر داخل AppShell بخلفية شفافة
    appshell = re.sub(
        r'(<header[^>]*className=["\'][^"\']*)(bg-transparent|bg-gradient-to-b[^"\']*|bg-background/\d+|backdrop-blur[^"\']*)',
        r'\1bg-[#0B132B] border-b border-slate-800/80',
        appshell
    )

    with open("src/components/layout/AppShell.tsx", "w", encoding="utf-8") as f:
        f.write(appshell)
    print("✅ تم ضبط خلفية AppShell.tsx بنجاح.")
except Exception as e:
    print("AppShell.tsx note:", e)
