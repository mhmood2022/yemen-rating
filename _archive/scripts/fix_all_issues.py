import re

# الدالة الموحدة والصارمة للشارات
badge_function = '''function renderVerificationBadge(badgeType, isVerified, size = 18) {
  if (isVerified !== true && isVerified !== "true") return "";
  
  const type = (badgeType || "gold").toLowerCase();
  let color = "#EAB308";
  let title = "موثق - الشارة الذهبية";

  if (type === "blue") {
    color = "#1D9BF0";
    title = "موثق - الشارة الزرقاء";
  } else if (type === "silver" || type === "gray") {
    color = "#9CA3AF";
    title = "موثق - الشارة الفضية";
  }

  return `<svg class="inline-block select-none shrink-0 align-middle mr-1.5" style="width:${size}px; height:${size}px; color:${color};" viewBox="0 0 24 24" title="${title}">
    <path d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.6.15-.44.24-.91.24-1.4 0-2.21-1.79-4-4-4-.49 0-.96.08-1.4.24C14.55 2.48 13.18 1.6 11.6 1.6c-1.58 0-2.95.88-3.6 2.15-.44-.16-.91-.25-1.4-.25-2.21 0-4 1.79-4 4 4 .49 0 .96-.08 1.4-.24.65 1.27 2.02 2.14 3.6 2.14 1.58 0 2.95-.87 3.6-2.14.44.16.91.24 1.4.24 2.21 0 4-1.79 4-4 0-.49-.08-.96-.24-1.4 1.27-.65 2.14-2.02 2.14-3.6z" fill="currentColor"/>
    <path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.9-5.9 1.4 1.4-7.3 7.3z" fill="#FFFFFF"/>
  </svg>`;
}'''

# 1. إصلاح banks.html (إلغاء verification_requests المسبب للخطأ وتفعيل البنوك والشارات)
for path in ["banks.html", "public/banks.html", "dist/banks.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # استبدال دالة fetchRealBanks بدالة نظيفة ومضمونة
    clean_fetch = '''async function fetchRealBanks() {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/banks?select=*`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        });
        if (!resp.ok) throw new Error("تعذر جلب البنوك");
        const rows = await resp.json();

        let reviewsMap = {};
        try {
          const revResp = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=entity_id,stars`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
          });
          if (revResp.ok) {
            const revs = await revResp.json();
            revs.forEach(r => {
              if (!reviewsMap[r.entity_id]) reviewsMap[r.entity_id] = { totalStars: 0, count: 0 };
              reviewsMap[r.entity_id].totalStars += parseInt(r.stars) || 5;
              reviewsMap[r.entity_id].count += 1;
            });
          }
        } catch (_) {}

        banksList = rows.map(b => {
          const r = reviewsMap[b.id];
          const hasReviews = r && r.count > 0;
          return {
            id: b.id,
            name: b.name,
            slug: b.slug,
            city: b.city || b.address || "اليمن",
            address: b.address || b.city || "",
            description: b.description || b.short_description || "",
            verified: b.verified === true || b.is_verified === true,
            badge_type: b.badge_type || "gold",
            logo_url: b.logo_url || b.logo || "",
            cover_url: b.cover_url || b.cover || b.banner_url || "",
            ratingAvg: hasReviews ? (r.totalStars / r.count).toFixed(1) : null,
            ratingCount: hasReviews ? r.count : 0
          };
        });

        renderCards();
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }'''

    content = re.sub(r'async function fetchRealBanks\(\)\s*\{[\s\S]*?renderCards\(\);\s*\}\s*catch[^{]*\{[\s\S]*?\}\s*\}', clean_fetch, content)
    
    # تحديث دالة الشارة
    if "function renderVerificationBadge" in content:
        content = re.sub(r'function renderVerificationBadge\([^)]*\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}', badge_function, content)
    else:
        content = content.replace("<script>", "<script>\n" + badge_function)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم إصلاح banks في: {path}")

# 2. إصلاح bank.html (الربط الموحد للشارة الفردية)
for path in ["bank.html", "public/bank.html", "dist/bank.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # تحديث السطر 790 ليمرر is_verified بدقة
    content = content.replace(
        "document.getElementById('bank-badge-slot').innerHTML = renderVerificationBadge(currentBank.badge_type);",
        "document.getElementById('bank-badge-slot').innerHTML = renderVerificationBadge(currentBank.badge_type, currentBank.is_verified, 20);"
    )

    if "function renderVerificationBadge" in content:
        content = re.sub(r'function renderVerificationBadge\([^)]*\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}', badge_function, content)
    else:
        content = content.replace("<script>", "<script>\n" + badge_function)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم توحيد الشارة الصارمة في: {path}")

print("✨ تم بنجاح إزالة رسالة التعذر وتوحيد الشارات الصارمة في القالبين!")
