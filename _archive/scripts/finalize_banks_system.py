import re

# 1. الدالة الموحدة الصارمة للشارة الحية
badge_func = '''function renderVerificationBadge(badgeType, isVerified, size = 18) {
  if (isVerified !== true && isVerified !== "true") return "";
  
  const type = (badgeType || "gold").toLowerCase();
  let color = "#EAB308";
  let title = "موثق رسمياً - الشارة الذهبية";

  if (type === "blue") {
    color = "#1D9BF0";
    title = "موثق رسمياً - الشارة الزرقاء";
  } else if (type === "silver" || type === "gray") {
    color = "#9CA3AF";
    title = "موثق رسمياً - الشارة الفضية";
  }

  return `<svg class="inline-block select-none shrink-0 align-middle mr-1.5" style="width:${size}px; height:${size}px; color:${color};" viewBox="0 0 24 24" title="${title}">
    <path d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.6.15-.44.24-.91.24-1.4 0-2.21-1.79-4-4-4-.49 0-.96.08-1.4.24C14.55 2.48 13.18 1.6 11.6 1.6c-1.58 0-2.95.88-3.6 2.15-.44-.16-.91-.25-1.4-.25-2.21 0-4 1.79-4 4 4 .49 0 .96-.08 1.4-.24.65 1.27 2.02 2.14 3.6 2.14 1.58 0 2.95-.87 3.6-2.14.44.16.91.24 1.4.24 2.21 0 4-1.79 4-4 0-.49-.08-.96-.24-1.4 1.27-.65 2.14-2.02 2.14-3.6z" fill="currentColor"/>
    <path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.9-5.9 1.4 1.4-7.3 7.3z" fill="#FFFFFF"/>
  </svg>`;
}'''

# 2. تحديث ملفات قائمة البطاقات (banks.html)
for path in ["banks.html", "public/banks.html", "dist/banks.html"]:
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()

    # تحديث الدالة
    if "function renderVerificationBadge" in c:
        c = re.sub(r'function renderVerificationBadge\([^)]*\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}', badge_func, c)
    else:
        c = c.replace("<script>", "<script>\n" + badge_func)

    # ضبط قراءة الحقل الحقيقي verified
    c = c.replace("verified: b.verified === true || b.is_verified === true", "verified: b.verified === true")
    c = c.replace("const badgeHtml = bank.verified", "const badgeHtml = renderVerificationBadge(bank.badge_type, bank.verified, 18)")

    with open(path, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"تم الربط الصارم في: {path}")

# 3. تحديث ملفات القالب الفردي (bank.html)
for path in ["bank.html", "public/bank.html", "dist/bank.html"]:
    with open(path, "r", encoding="utf-8") as f:
        c = f.read()

    # تحديث الدالة
    if "function renderVerificationBadge" in c:
        c = re.sub(r'function renderVerificationBadge\([^)]*\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}', badge_func, c)
    else:
        c = c.replace("<script>", "<script>\n" + badge_func)

    # قراءة الحقل الحقيقي verified بدلاً من is_verified
    c = c.replace("bankData.is_verified = b.is_verified === true;", "bankData.is_verified = (b.verified === true || b.is_verified === true);")
    c = c.replace("bankData.is_verified = c.is_verified === true;", "bankData.is_verified = (c.verified === true || c.is_verified === true);")

    # تمرير حالة التوثيق الحقيقية إلى خانة الشارة
    c = re.sub(
        r"document\.getElementById\(['\"]bank-badge-slot['\"]\)\.innerHTML\s*=\s*renderVerificationBadge\([^)]*\);",
        "document.getElementById('bank-badge-slot').innerHTML = renderVerificationBadge(currentBank.badge_type, currentBank.is_verified, 20);",
        c
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"تم الربط الصارم في: {path}")

print("✨ تم توحيد نظام الشارات الحية مع قاعدة البيانات بنجاح 100%!")
