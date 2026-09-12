import re

# الكود الدقيق المطابق للصورة: حواف دائرية ناعمة ومنحنية (بدون أي سنون حادة) مع علامة صح مستديرة الأطراف
exact_badges_code = '''function renderVerificationBadge(badgeType, isVerified, size = 22) {
  if (isVerified !== true && isVerified !== "true") return "";
  
  const type = (badgeType || "gold").toLowerCase();
  let color = "#EBB82E"; // الذهبي المعتمد في صورتك
  let title = "موثق - الشارة الذهبية";

  if (type === "blue") {
    color = "#339AF0";   // الأزرق السماوي المعتمد في صورتك
    title = "موثق - الشارة الزرقاء";
  } else if (type === "silver" || type === "gray") {
    color = "#9CA3AF";   // الفضي المعتمد في صورتك
    title = "موثق - الشارة الفضية";
  }

  return `<span class="inline-flex items-center justify-center shrink-0 select-none align-middle" style="margin-right: 6px;" title="${title}">
    <svg style="width:${size}px; height:${size}px;" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0 drop-shadow-sm">
      <!-- الشكل الخارجي السحابي المنحني بدون أي سنون حادة -->
      <path fill-rule="evenodd" clip-rule="evenodd" d="M50 8C55.2 8 60 11.8 62.4 16.4C67.3 15.6 72.5 17.7 75.4 21.8C78.4 25.9 78.4 31.4 75.8 35.8C79.8 39.2 81.3 44.7 79.5 49.6C81.3 54.5 79.8 60 75.8 63.4C78.4 67.8 78.4 73.3 75.4 77.4C72.5 81.5 67.3 83.6 62.4 82.8C60 87.4 55.2 91.2 50 91.2C44.8 91.2 40 87.4 37.6 82.8C32.7 83.6 27.5 81.5 24.6 77.4C21.6 73.3 21.6 67.8 24.2 63.4C20.2 60 18.7 54.5 20.5 49.6C18.7 44.7 20.2 39.2 24.2 35.8C21.6 31.4 21.6 25.9 24.6 21.8C27.5 17.7 32.7 15.6 37.6 16.4C40 11.8 44.8 8 50 8Z" fill="${color}"/>
      <!-- علامة الصح البيضاء المستديرة الأطراف المطابقة للصورة -->
      <path d="M33 51L44 62L67 37" stroke="#FFFFFF" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>`;
}'''

for path in ["bank.html", "banks.html", "public/bank.html", "public/banks.html", "dist/bank.html", "dist/banks.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(
        r'function renderVerificationBadge\([^)]*\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}',
        exact_badges_code,
        content
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم تطبيق الشارة الأصلية في: {path}")

print("✅ تم تطبيق شارة السحابة الناعمة الأصلية بدقة تامة!")
