import re

with open("banks.html", "r", encoding="utf-8") as f:
    code = f.read()

# إزالة التدرج المغبر من الغلاف وعرض الصورة بنقائها الطبيعي
# وتثبيت زر إثبات الملكية وضبط الشارة
old_pattern = r'container\.innerHTML = filtered\.map\(bank => \{[\s\S]*?return `[\s\S]*?`;\s*\}\)\.join\(""\);'

new_code = '''container.innerHTML = filtered.map(bank => {
        const targetUrl = "/bank.html?slug=" + encodeURIComponent(bank.slug || bank.id);
        const safeName = (bank.name || "").replace(/'/g, "\\\\'");

        // غلاف نقي 100% بدون أي تدرج أسود أو طبقة مغبرة
        const coverHtml = bank.cover_url
          ? `<img src="${bank.cover_url}" alt="${bank.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />`
          : `<div class="w-full h-full bg-gradient-to-r from-[#0D2137] via-[#102A45] to-[#0A192B] flex items-center justify-center text-center px-4"><h2 class="text-[#EAB308] text-base font-black tracking-wide leading-tight">${bank.name}</h2></div>`;

        // الشعار
        const logoHtml = bank.logo_url
          ? `<img src="${bank.logo_url}" alt="${bank.name}" class="w-full h-full object-cover rounded-2xl" />`
          : `<i class="fa-solid fa-building-columns text-[#EAB308] text-2xl"></i>`;

        // التقييمات
        const ratingHtml = bank.ratingAvg && bank.ratingCount > 0
          ? `<div class="flex items-center justify-start gap-1.5 text-xs font-bold pt-0.5"><i class="fa-solid fa-star text-[#EAB308] text-xs"></i><span class="text-white font-mono">${bank.ratingAvg}</span><span class="text-zinc-400 text-[11px] font-normal">(${bank.ratingCount} تقييم)</span></div>`
          : `<div class="text-right pt-0.5"><span class="text-zinc-500 text-xs font-normal">لا توجد تقييمات بعد</span></div>`;

        // شارة التوثيق بجانب الاسم مباشرة
        const badgeHtml = bank.verified
          ? `<svg class="inline-block select-none shrink-0 align-middle w-4 h-4 text-[#EAB308]" viewBox="0 0 24 24"><path d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.6.15-.44.24-.91.24-1.4 0-2.21-1.79-4-4-4-.49 0-.96.08-1.4.24C14.55 2.48 13.18 1.6 11.6 1.6c-1.58 0-2.95.88-3.6 2.15-.44-.16-.91-.25-1.4-.25-2.21 0-4 1.79-4 4 4 .49 0 .96-.08 1.4-.24.65 1.27 2.02 2.14 3.6 2.14 1.58 0 2.95-.87 3.6-2.14.44.16.91.24 1.4.24 2.21 0 4-1.79 4-4 0-.49-.08-.96-.24-1.4 1.27-.65 2.14-2.02 2.14-3.6z" fill="currentColor"/><path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.9-5.9 1.4 1.4-7.3 7.3z" fill="#000000"/></svg>`
          : "";

        return `
          <article onclick="try{localStorage.setItem('yr_instant_entity_${bank.slug || bank.id}', JSON.stringify(banksList.find(x => x.id === '${bank.id}')))}catch(e){} window.location.href='${targetUrl}'" class="bg-[#0B0F17] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between transition hover:border-zinc-700 cursor-pointer group">
            <div>
              <!-- الغلاف النقي الصافي بدون أي سواد أو تدرج مغبر -->
              <div class="relative w-full h-44 bg-[#0B0F17] flex items-center justify-center overflow-hidden border-b border-zinc-800/50">
                ${coverHtml}
              </div>

              <!-- الشعار في اليمين وزر إثبات الملكية في اليسار دائماً -->
              <div class="px-4 relative flex items-start justify-between -mt-8 mb-2">
                <div class="relative z-10">
                  <div class="w-16 h-16 rounded-2xl bg-[#0B0F17] shadow-2xl border-2 border-[#1F2937] flex items-center justify-center overflow-hidden shrink-0">
                    ${logoHtml}
                  </div>
                </div>
                <div>
                  <button type="button" onclick="event.stopPropagation(); openClaimModal('${bank.id}', '${safeName}')" class="inline-flex items-center gap-1.5 bg-[#2A0E0E] hover:bg-[#3D1414] border border-[#661F1F] text-[#F87171] text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition active:scale-95 cursor-pointer mt-3.5">
                    <i class="fa-solid fa-shield-halved text-[#EF4444] text-xs"></i>
                    <span>إثبات ملكية الصفحة</span>
                  </button>
                </div>
              </div>

              <!-- تفاصيل البنك -->
              <div class="px-4 pt-1 pb-3 text-right space-y-1.5">
                <!-- الاسم وشارة التوثيق في نفس السطر متناسقين -->
                <div class="flex items-center justify-start gap-1.5 flex-wrap">
                  <h2 class="text-sm font-black text-white leading-snug inline">${bank.name}</h2>
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

            <!-- زر عرض صفحة المنشأة الذهبي الموحد -->
            <div class="p-4 pt-1">
              <button type="button" class="w-full py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-black font-black text-sm flex items-center justify-center gap-2 shadow transition active:scale-98 cursor-pointer">
                <span>عرض صفحة المنشأة</span>
                <i class="fa-solid fa-arrow-left text-xs"></i>
              </button>
            </div>
          </article>
        `;
      }).join("");'''

updated = re.sub(old_pattern, new_code, code)

for path in ["banks.html", "public/banks.html", "dist/banks.html"]:
    with open(path, "w", encoding="utf-8") as f:
        f.write(updated)
    print(f"تمت التنقية في: {path}")

print("✨ تم تنقية صور الغلاف 100% وإظهار زر إثبات الملكية دائماً!")
