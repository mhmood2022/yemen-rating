with open("src/services/adsDatabaseService.ts", "r", encoding="utf-8") as f:
    code = f.read()

import re
# التأكد من وجود order descending
if ".order('created_at'" not in code and '.order("created_at"' not in code:
    code = code.replace(
        ".eq('status', 'active');",
        ".eq('status', 'active')\n        .order('created_at', { ascending: false });"
    )
    with open("src/services/adsDatabaseService.ts", "w", encoding="utf-8") as f:
        f.write(code)
    print("✅ تم تفعيل جلب الأحدث دائماً.")
else:
    print("الكود يحتوي على الترتيب بالفعل.")
