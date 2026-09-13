import re

with open("src/components/common/AdBanner.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# تنظيف أي بقايا للـ badge المشوه قبل showVerifiedBadge
target_broken_area = r'<div className="flex items-center gap-1 flex-wrap">[\s\S]*?\{adData\.showVerifiedBadge'

cleaned_area = """<div className="flex items-center gap-1 flex-wrap">
            {adData.showVerifiedBadge"""

code = re.sub(target_broken_area, cleaned_area, code)

with open("src/components/common/AdBanner.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("✅ تم تنظيف وإصلاح JSX في AdBanner.tsx بنجاح!")
