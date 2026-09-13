import re

# 1. إصلاح AuctionsPage.tsx
with open("src/components/pages/AuctionsPage.tsx", "r", encoding="utf-8") as f:
    auc = f.read()

# إغلاق React.Fragment قبل ))}
if "<React.Fragment" in auc and auc.count("<React.Fragment") > auc.count("</React.Fragment>"):
    # استبدال نهاية البطاقة قبل ))}
    auc = re.sub(r'(\s*<\/div>\s*<\/div>\s*)(\)\)\}\s*<\/div>)', r'\1</React.Fragment>\n              \2', auc)
    with open("src/components/pages/AuctionsPage.tsx", "w", encoding="utf-8") as f:
        f.write(auc)
    print("✅ 1. تم إغلاق React.Fragment في AuctionsPage.tsx")
else:
    print("AuctionsPage مضبوط بالفعل.")

# 2. فحص وإصلاح JobsPage.tsx
with open("src/components/pages/JobsPage.tsx", "r", encoding="utf-8") as f:
    jobs = f.read()

if "<React.Fragment" in jobs and jobs.count("<React.Fragment") > jobs.count("</React.Fragment>"):
    # البحث عن ))} التي تلي map الشواغر
    jobs = re.sub(r'(<\/div>\s*)(\)\)\}\s*<\/div>)', r'\1</React.Fragment>\n              \2', jobs, count=1)
    with open("src/components/pages/JobsPage.tsx", "w", encoding="utf-8") as f:
        f.write(jobs)
    print("✅ 2. تم إغلاق React.Fragment في JobsPage.tsx")
else:
    print("JobsPage مضبوط بالفعل.")

# 3. فحص وإصلاح RealEstatePage.tsx
with open("src/components/pages/RealEstatePage.tsx", "r", encoding="utf-8") as f:
    re_code = f.read()

if "<React.Fragment" in re_code and re_code.count("<React.Fragment") > re_code.count("</React.Fragment>"):
    re_code = re.sub(r'(<\/div>\s*)(\)\)\}\s*<\/div>)', r'\1</React.Fragment>\n              \2', re_code, count=1)
    with open("src/components/pages/RealEstatePage.tsx", "w", encoding="utf-8") as f:
        f.write(re_code)
    print("✅ 3. تم إغلاق React.Fragment في RealEstatePage.tsx")
else:
    print("RealEstatePage مضبوط بالفعل.")
