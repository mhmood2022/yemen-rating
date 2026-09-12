import re

for path in ["banks.html", "public/banks.html", "dist/banks.html"]:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. تحديث دالة الشارة لتكون كاملة ومستقلة 100%
    badge_func = '''function renderVerificationBadge(badgeType, isVerified, size = 20) {
  if (isVerified === false || isVerified === "false") return "";
  
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

  return `<span class="inline-flex items-center justify-center shrink-0 select-none" title="${title}">
    <svg style="width:${size}px; height:${size}px; color:${color};" viewBox="0 0 24 24" fill="none" class="shrink-0 drop-shadow-sm">
      <path d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.6.15-.44.24-.91.24-1.4 0-2.21-1.79-4-4-4-.49 0-.96.08-1.4.24C14.55 2.48 13.18 1.6 11.6 1.6c-1.58 0-2.95.88-3.6 2.15-.44-.16-.91-.25-1.4-.25-2.21 0-4 1.79-4 4 0 .49.08.96.24 1.4C1.58 9.55.7 10.92.7 12.5c0 1.58.88 2.95 2.15 3.6-.16.44-.25.91-.25 1.4 0 2.21 1.79 4 4 4 .49 0 .96-.08 1.4-.24.65 1.27 2.02 2.14 3.6 2.14 1.58 0 2.95-.87 3.6-2.14.44.16.91.24 1.4.24 2.21 0 4-1.79 4-4 0-.49-.08-.96-.24-1.4 1.27-.65 2.14-2.02 2.14-3.6z" fill="currentColor"/>
      <path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.9-5.9 1.4 1.4-7.3 7.3z" fill="#FFFFFF"/>
    </svg>
  </span>`;
}'''

    content = re.sub(r'function renderVerificationBadge\([^)]*\)\s*\{[\s\S]*?return `[\s\S]*?`;\s*\}', badge_func, content)

    # 2. تحديث رسم كرت البنك (ارتفاع الغلاف + عدم طمس الصورة + فصل الشارة)
    old_card_pattern = r'container\.innerHTML = filtered\.map\(bank => \{[\s\S]*?return `[\s\S]*?`;\s*\}\)\.join\(""\);'
    
    new_card_code = '''container.innerHTML = filtered.map(bank => {
        const targetUrl = "/bank.html?slug=" + encodeURIComponent(bank.slug || bank.id);
        const safeName = (bank.name || "").replace(/'/g, "\\\\'");

        // غلاف كامل بنسبة عرض وارتفاع متناسقة تمنع قص الصورة
        const coverHtml = bank.cover_url
          ? `<img src="${bank.cover_url}" alt="${bank.name}" class="w-full h-full object-cover object-center group-hover:scale-102 transition duration-300" />`
          : `<div class="w-full h-full bg-[#0F172A] flex items-center justify-center text-center px-4"><h2 class="text-[#EAB308] text-base font-black tracking-wide leading-tight">${bank.name}</h2></div>`;

        // الشعار
        const logoHtml = bank.logo_url
          ? `<img src="${bank.logo_url}" alt="${bank.name}" class="w-full h-full object-cover rounded-2xl" />`
          : `<i class="fa-solid fa-building-columns text-[#EAB308] text-2xl"></i>`;

        // التقييمات
        const ratingHtml = bank.ratingAvg && bank.ratingCount > 0
          ? `<div class="flex items-center justify-start gap-1.5 text-xs font-bold pt-0.5"><i class="fa-solid fa-star text-[#EAB308] text-xs"></i><span class="text-white font-mono">${bank.ratingAvg}</span><span class="text-zinc-400 text-[11px] font-normal">(${bank.ratingCount} تقييم)</span></div>`
          : `<div class="text-right pt-0.5"><span class="text-zinc-500 text-xs font-normal">لا توجد تقييمات بعد</span></div>`;

        const badgeHtml = renderVerificationBadge(bank.badge_type, bank.verified, 20);

        return `
          <article onclick="try{localStorage.setItem('yr_instant_entity_${bank.slug || bank.id}', JSON.stringify(banksList.find(x => x.id === '${bank.id}')))}catch(e){} window.location.href='${targetUrl}'" class="bg-[#0B0F17] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between transition hover:border-zinc-700 cursor-pointer group">
            <div>
              <!-- الغلاف الواسع المفتوح بدون أي قص أو طمس -->
              <div class="relative w-full h-48 bg-[#0B0F17] flex items-center justify-center overflow-hidden border-b border-zinc-800/40">
                ${coverHtml}
              </div>

              <!-- الشعار وزر إثبات الملكية مع تقليل التداخل لعدم طمس الغلاف -->
              <div class="px-4 relative flex items-start justify-between -mt-5 mb-2">
                <div class="relative z-10">
                  <div class="w-16 h-16 rounded-2xl bg-[#0B0F17] shadow-2xl border-2 border-[#1F2937] flex items-center justify-center overflow-hidden shrink-0">
                    ${logoHtml}
                  </div>
                </div>
                <div>
                  <button type="button" onclick="event.stopPropagation(); openClaimModal('${bank.id}', '${safeName}')" class="inline-flex items-center gap-1.5 bg-[#2A0E0E] hover:bg-[#3D1414] border border-[#661F1F] text-[#F87171] text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition active:scale-95 cursor-pointer mt-2">
                    <i class="fa-solid fa-shield-halved text-[#EF4444] text-xs"></i>
                    <span>إثبات ملكية الصفحة</span>
                  </button>
                </div>
              </div>

              <!-- البيانات الأساسية -->
              <div class="px-4 pt-1 pb-3 text-right space-y-1.5">
                <!-- اسم المنشأة والشارة بجواره بمسافة مريحة وبدون أي تداخل -->
                <div class="flex items-center justify-start gap-2">
                  <h2 class="text-sm sm:text-base font-black text-white leading-tight">${bank.name}</h2>
                  ${badgeHtml}
                </div>

                <div class="flex items-center justify-start gap-1 text-xs text-zinc-400">
                  <i class="fa-solid fa-location-dot text-[#EAB308] text-xs shrink-0"></i>
                  <span>${bank.city || bank.address || "اليمن"}</span>
                </div>

                ${ratingHtml}

                ${bank.description ? `<p class="text-xs text-zinc-300 leading-relaxed pt-1 line-clamp-2">${bank.description}</p>` : ""}
              </div>
            </div>

            <!-- زر العرض -->
            <div class="p-4 pt-1">
              <button type="button" class="w-full py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-black font-black text-sm flex items-center justify-center gap-2 shadow transition active:scale-98 cursor-pointer">
                <span>عرض صفحة المنشأة</span>
                <i class="fa-solid fa-arrow-left text-xs"></i>
              </button>
            </div>
          </article>
        `;
      }).join("");'''

    content = re.sub(old_card_pattern, new_card_code, content)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"تم إصلاح الطمس في: {path}")

print("✨ تم بنجاح إزالة أي طمس من الغلاف وإظهار الشارة كاملة 100%!")
