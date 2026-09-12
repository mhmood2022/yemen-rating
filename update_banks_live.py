import os

new_html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>دليل البنوك والمصارف | يمن ريتنغ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Tajawal:wght@500;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { gold: "#EAB308", goldHover: "#CA8A04" }
          },
          fontFamily: { cairo: ["Cairo", "Tajawal", "sans-serif"] }
        }
      }
    }
  </script>
  <style>
    * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
    *::-webkit-scrollbar { display: none !important; }
    body { background-color: #070A10; color: #FFFFFF; font-family: "Cairo", sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-[#070A10] text-white selection:bg-[#EAB308] selection:text-black">

  <!-- 1. الهيدر الرسمي الموحد للمنصة -->
  <header class="w-full border-b border-[#1F2937]/70 bg-[#070A10]/95 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button type="button" onclick="if (document.referrer) { window.history.back(); } else { window.location.href = '/'; }" class="text-white hover:text-[#EAB308] transition p-1 bg-transparent border-0 cursor-pointer active:scale-95" title="القائمة">
          <i class="fa-solid fa-bars text-xl"></i>
        </button>
        <a href="/" class="flex items-center gap-2 select-none">
          <svg viewBox="0 0 120 120" class="h-8 sm:h-9 w-auto shrink-0 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 10L98 26V58C98 82 60 106 60 106C60 106 22 82 22 58V26L60 10Z" fill="#070A10" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
            <path d="M60 18L92 31V57C92 76 60 96 60 96C60 96 28 76 28 57V31L60 18Z" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M60 32L65.5 46H81L68.5 55.5L73.5 70L60 61L46.5 70L51.5 55.5L39 46H54.5L60 32Z" fill="#FFC500" stroke="#FFC500" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M10 65C10 88 36 108 60 110C84 108 110 88 110 64C104 80 82 98 60 100C38 98 16 80 10 65Z" fill="#FFC500"/>
          </svg>
          <div class="flex flex-col items-start justify-center leading-none text-right">
            <span class="text-[#FFC500] font-black text-sm sm:text-base tracking-wide">يمن ريتنغ</span>
            <span class="text-white font-black text-[9px] sm:text-[10px] tracking-widest uppercase mt-0.5">YEMENRATING</span>
          </div>
        </a>
      </div>
      <div class="flex items-center">
        <a href="/" class="text-zinc-200 hover:text-[#EAB308] transition p-1 relative" title="الإشعارات">
          <i class="fa-regular fa-bell text-lg"></i>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#DC2626] animate-pulse"></span>
        </a>
      </div>
    </div>
  </header>

  <!-- الحاوية الرئيسية المطابقة لقالب الشركات -->
  <main class="min-h-screen max-w-7xl mx-auto px-3 sm:px-4 pt-3 pb-16">

    <!-- 2. عنوان القسم الموحد وزر الرجوع -->
    <div class="mb-4 flex items-center justify-between border-b border-[#1F2937]/70 pb-3">
      <div class="flex items-center gap-2 text-right">
        <i class="fa-solid fa-building-columns text-xl text-[#EAB308] shrink-0"></i>
        <h1 class="text-xl sm:text-2xl font-black text-white leading-none">دليل البنوك والمصارف</h1>
      </div>
      <button type="button" onclick="if (document.referrer) { window.history.back(); } else { window.location.href = '/'; }" class="text-[#EAB308] hover:text-white p-1.5 bg-transparent border-0 transition cursor-pointer active:scale-90 flex items-center justify-center" title="الرئيسية">
        <i class="fa-solid fa-arrow-right text-xl"></i>
      </button>
    </div>

    <!-- 3. شريط البحث والقائمة المنسدلة للمحافظات -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-[#0B0F17] p-2.5 rounded-2xl border border-[#1F2937]">
      <div class="sm:col-span-2 relative">
        <i class="fa-solid fa-magnifying-glass text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 text-xs"></i>
        <input type="text" id="search-input" oninput="handleSearch()" placeholder="ابحث في البنوك والمصارف..." class="w-full bg-[#121620] border border-[#1F2937] focus:border-[#EAB308] text-zinc-200 pr-10 pl-3 py-2.5 rounded-xl text-xs outline-none transition text-right" />
      </div>

      <div class="relative" id="dropdown-container">
        <button type="button" id="city-dropdown-btn" onclick="toggleCityDropdown()" class="w-full bg-[#121620] hover:bg-[#161D2B] border border-[#1F2937] focus:border-[#EAB308] text-zinc-200 px-3.5 py-2.5 rounded-xl text-xs outline-none transition cursor-pointer flex items-center justify-between font-bold">
          <span id="selected-city-label" class="truncate">كل المدن والمحافظات</span>
          <i id="dropdown-arrow" class="fa-solid fa-chevron-down text-xs text-[#EAB308] transition-transform duration-200"></i>
        </button>
        <div id="city-dropdown-menu" class="hidden absolute top-full left-0 right-0 mt-1.5 z-40 bg-[#0B0F17] border border-[#1F2937] rounded-xl shadow-2xl p-1.5 max-h-60 overflow-y-auto space-y-0.5 text-right">
        </div>
      </div>
    </div>

    <!-- 4. شبكة الكروت (مطابقة لقالب الشركات) -->
    <div id="banks-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="col-span-full py-16 text-center flex flex-col items-center justify-center">
        <i class="fa-solid fa-circle-notch animate-spin text-2xl text-[#EAB308] mb-2"></i>
        <p class="text-xs text-zinc-400 font-bold">جاري تحميل البنوك والمصارف...</p>
      </div>
    </div>

  </main>

  <!-- 5. نافذة طلب إثبات الملكية -->
  <div id="claim-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4" onclick="closeClaimModal()">
    <div class="bg-[#0B0F17] border border-zinc-800 rounded-2xl w-full max-w-sm p-4 space-y-3 text-right shadow-2xl" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
        <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
          <i class="fa-solid fa-shield-halved text-[#EF4444]"></i> طلب إثبات ملكية الصفحة
        </h4>
        <button type="button" onclick="closeClaimModal()" class="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
      <p id="claim-bank-title" class="text-xs font-bold text-[#EAB308] bg-black/60 p-2 rounded-lg border border-zinc-800/80"></p>
      <form id="claim-form" onsubmit="submitClaimRequest(event)" class="space-y-2.5 text-xs">
        <input type="hidden" id="claim-bank-id" value="" />
        <div>
          <label class="block text-zinc-400 mb-1 text-[11px]">اسم المفوض / ممثل البنك*</label>
          <input type="text" id="claim-name" required placeholder="مثال: صالح المقطري" class="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#EAB308] text-xs text-right" />
        </div>
        <div>
          <label class="block text-zinc-400 mb-1 text-[11px]">الصفة أو المسمى الوظيفي*</label>
          <input type="text" id="claim-role" required placeholder="مثال: مدير العلاقات العامة / الممثل القانوني" class="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#EAB308] text-xs text-right" />
        </div>
        <div>
          <label class="block text-zinc-400 mb-1 text-[11px]">رقم الهاتف / الواتساب الرسمي*</label>
          <input type="tel" id="claim-phone" required placeholder="مثال: 771234567" class="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white outline-none focus:border-[#EAB308] text-xs text-right" />
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-zinc-800">
          <button type="button" onclick="closeClaimModal()" class="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white text-xs cursor-pointer">إلغاء</button>
          <button type="submit" id="claim-submit-btn" class="px-4 py-1.5 rounded-lg bg-[#EF4444] hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition">إرسال الطلب</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const SUPABASE_URL = "https://wkdqeghotlipciqiytuj.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE";

    const CITIES = [
      { id: "all", name: "كل المدن والمحافظات" },
      { id: "صنعاء", name: "صنعاء" },
      { id: "عدن", name: "عدن" },
      { id: "تعز", name: "تعز" },
      { id: "الحديدة", name: "الحديدة" },
      { id: "حضرموت", name: "حضرموت" },
      { id: "إب", name: "إب" },
      { id: "ذمار", name: "ذمار" },
      { id: "مأرب", name: "مأرب" }
    ];

    let banksList = [];
    let searchKeyword = "";
    let selectedCity = "all";
    let pendingClaimsSet = new Set();

    function setupDropdown() {
      const menu = document.getElementById("city-dropdown-menu");
      if (!menu) return;
      menu.innerHTML = CITIES.map(c => {
        const isSel = selectedCity === c.id;
        return `<div onclick="selectCity('${c.id}')" class="px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${isSel ? 'bg-[#EAB308]/15 text-[#EAB308]' : 'text-zinc-300 hover:bg-[#121620] hover:text-white'}">
          <span>${c.name}</span>
          ${isSel ? '<i class="fa-solid fa-check text-xs text-[#EAB308]"></i>' : ''}
        </div>`;
      }).join("");
    }

    function toggleCityDropdown() {
      const menu = document.getElementById("city-dropdown-menu");
      const arrow = document.getElementById("dropdown-arrow");
      if (!menu) return;
      if (!menu.classList.contains("hidden")) {
        menu.classList.add("hidden");
        arrow.classList.remove("rotate-180");
      } else {
        menu.classList.remove("hidden");
        arrow.classList.add("rotate-180");
      }
    }

    function selectCity(cityId) {
      selectedCity = cityId;
      const found = CITIES.find(c => c.id === cityId);
      document.getElementById("selected-city-label").innerText = found ? found.name : "كل المدن والمحافظات";
      toggleCityDropdown();
      setupDropdown();
      renderCards();
    }

    document.addEventListener("click", (e) => {
      const container = document.getElementById("dropdown-container");
      if (container && !container.contains(e.target)) {
        const menu = document.getElementById("city-dropdown-menu");
        const arrow = document.getElementById("dropdown-arrow");
        if (menu && !menu.classList.contains("hidden")) {
          menu.classList.add("hidden");
          arrow.classList.remove("rotate-180");
        }
      }
    });

    async function fetchRealBanks() {
      try {
        const resp = await fetch(
          `${SUPABASE_URL}/rest/v1/banks?status=eq.active&select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        if (!resp.ok) throw new Error("فشل جلب قائمة البنوك");
        const rows = await resp.json();

        // جلب التقييمات
        const revResp = await fetch(
          `${SUPABASE_URL}/rest/v1/reviews?entity_type=eq.bank&select=entity_id,stars`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        const reviews = revResp.ok ? await revResp.json() : [];
        const reviewsMap = {};
        reviews.forEach(r => {
          if (!reviewsMap[r.entity_id]) reviewsMap[r.entity_id] = { totalStars: 0, count: 0 };
          reviewsMap[r.entity_id].totalStars += parseInt(r.stars) || 5;
          reviewsMap[r.entity_id].count += 1;
        });

        // طلبات التوثيق المعلقة
        try {
          const claimsResp = await fetch(
            `${SUPABASE_URL}/rest/v1/verification_requests?entity_type=eq.bank&status=eq.PENDING&select=entity_id`,
            {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
              }
            }
          );
          if (claimsResp.ok) {
            const claims = await claimsResp.json();
            pendingClaimsSet = new Set(claims.map(c => c.entity_id));
          }
        } catch (_) {}

        banksList = rows.map(b => {
          const r = reviewsMap[b.id];
          const hasReviews = r && r.count > 0;
          const avg = hasReviews ? (r.totalStars / r.count).toFixed(1) : null;
          const count = hasReviews ? r.count : 0;
          return {
            id: b.id,
            name: b.name,
            slug: b.slug,
            city: b.city || b.address || "اليمن",
            address: b.address || b.city || "",
            description: b.description || b.short_description || "",
            verified: b.verified === true || b.is_verified === true,
            badge_type: b.badge_type || (b.is_verified ? "gold" : "gray"),
            logo_url: b.logo_url || b.logo || "",
            cover_url: b.cover_url || b.cover || b.banner_url || "",
            ratingAvg: avg,
            ratingCount: count
          };
        });

        renderCards();
      } catch (err) {
        console.error("Fetch error:", err);
        // في حال حدوث أي تأخير أو خطأ، نعرض رسالة واضحة للمستخدم
        const container = document.getElementById("banks-grid");
        if (container) {
          container.innerHTML = `
            <div class="col-span-full py-12 text-center text-zinc-400 bg-[#0B0F17] rounded-2xl border border-[#1F2937]">
              <i class="fa-solid fa-triangle-exclamation text-2xl text-[#EAB308] mb-2"></i>
              <p class="text-xs font-bold">تعذر تحميل بيانات البنوك حالياً، يرجى المحاولة لاحقاً.</p>
            </div>
          `;
        }
      }
    }

    function handleSearch() {
      searchKeyword = document.getElementById("search-input").value.trim();
      renderCards();
    }

    function renderCards() {
      const container = document.getElementById("banks-grid");
      if (!container) return;

      let filtered = banksList.filter(b => {
        const matchesSearch = !searchKeyword || b.name.toLowerCase().includes(searchKeyword.toLowerCase()) || (b.description && b.description.toLowerCase().includes(searchKeyword.toLowerCase()));
        const matchesCity = selectedCity === "all" || b.city.includes(selectedCity) || b.address.includes(selectedCity);
        return matchesSearch && matchesCity;
      });

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="col-span-full py-16 text-center text-zinc-500 bg-[#0B0F17] rounded-2xl border border-[#1F2937]">
            <i class="fa-solid fa-magnifying-glass text-3xl mb-2 text-zinc-600"></i>
            <p class="text-xs font-bold">لا توجد بنوك مطابقة للبحث حالياً</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(bank => {
        const targetUrl = "/bank.html?slug=" + encodeURIComponent(bank.slug || bank.id);
        const safeName = (bank.name || "").replace(/'/g, "\\'");

        // الغلاف المستقيم الأنيق بدون أي تشوه
        const coverHtml = bank.cover_url
          ? `<img src="${bank.cover_url}" alt="${bank.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />`
          : `<div class="text-center px-4"><h2 class="text-[#EAB308] text-lg font-black tracking-wide leading-tight">${bank.name}</h2><p class="text-zinc-400 text-[11px] mt-0.5 font-medium">${bank.city || "اليمن"}</p></div>`;

        // الشعار متداخل بنظافة
        const logoHtml = bank.logo_url
          ? `<img src="${bank.logo_url}" alt="${bank.name}" class="w-full h-full object-cover rounded-2xl" />`
          : `<i class="fa-solid fa-building-columns text-[#EAB308] text-2xl"></i>`;

        // التقييمات
        const ratingHtml = bank.ratingAvg && bank.ratingCount > 0
          ? `<div class="flex items-center justify-start gap-1.5 text-xs font-bold pt-0.5"><i class="fa-solid fa-star text-[#EAB308] text-xs"></i><span class="text-white font-mono">${bank.ratingAvg}</span><span class="text-zinc-400 text-[11px] font-normal">(${bank.ratingCount} تقييم)</span></div>`
          : `<div class="text-right pt-0.5"><span class="text-zinc-500 text-xs font-normal">لا توجد تقييمات بعد</span></div>`;

        // بادج التوثيق
        const badgeHtml = bank.verified
          ? `<svg class="inline-block select-none shrink-0 align-middle w-4 h-4 text-[#EAB308]" viewBox="0 0 24 24"><path d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.6.15-.44.24-.91.24-1.4 0-2.21-1.79-4-4-4-.49 0-.96.08-1.4.24C14.55 2.48 13.18 1.6 11.6 1.6c-1.58 0-2.95.88-3.6 2.15-.44-.16-.91-.25-1.4-.25-2.21 0-4 1.79-4 4 4 0 .49.08.96.24 1.4C1.58 9.55.7 10.92.7 12.5c0 1.58.88 2.95 2.15 3.6-.16.44-.25.91-.25 1.4 0 2.21 1.79 4 4 4 .49 0 .96-.08 1.4-.24.65 1.27 2.02 2.14 3.6 2.14 1.58 0 2.95-.87 3.6-2.14.44.16.91.24 1.4.24 2.21 0 4-1.79 4-4 0-.49-.08-.96-.24-1.4 1.27-.65 2.14-2.02 2.14-3.6z" fill="currentColor"/><path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.9-5.9 1.4 1.4-7.3 7.3z" fill="#FFFFFF"/></svg>`
          : "";

        return `
          <article onclick="try{localStorage.setItem('yr_instant_entity_${bank.slug || bank.id}', JSON.stringify(banksList.find(x => x.id === '${bank.id}')))}catch(e){} window.location.href='${targetUrl}'" class="bg-[#0B0F17] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between transition hover:border-zinc-700 cursor-pointer group">
            <div>
              <div class="relative w-full h-40 bg-gradient-to-r from-[#0D2137] via-[#102A45] to-[#0A192B] flex items-center justify-center overflow-hidden">
                ${coverHtml}
                <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent opacity-80"></div>
              </div>

              <div class="px-4 relative flex items-start justify-between -mt-7 mb-2">
                <div class="relative z-10">
                  <div class="w-16 h-16 rounded-2xl bg-[#0B0F17] shadow-2xl border-2 border-[#1F2937] flex items-center justify-center overflow-hidden shrink-0">
                    ${logoHtml}
                  </div>
                </div>
                <div>
                  ${!bank.verified ? `
                    <button type="button" onclick="event.stopPropagation(); openClaimModal('${bank.id}', '${safeName}')" class="inline-flex items-center gap-1.5 bg-[#2A0E0E] hover:bg-[#3D1414] border border-[#661F1F] text-[#F87171] text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition active:scale-95 cursor-pointer mt-3">
                      <i class="fa-solid fa-shield-halved text-[#EF4444] text-xs"></i>
                      <span>إثبات ملكية الصفحة</span>
                    </button>
                  ` : ""}
                </div>
              </div>

              <div class="px-4 pt-1 pb-3 text-right space-y-1.5">
                <div class="flex items-center justify-start gap-1.5">
                  <h2 class="text-base font-black text-white leading-tight">${bank.name}</h2>
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

            <div class="p-4 pt-1">
              <button type="button" class="w-full py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-black font-black text-sm flex items-center justify-center gap-2 shadow transition active:scale-98 cursor-pointer">
                <span>عرض صفحة المنشأة</span>
                <i class="fa-solid fa-arrow-left text-xs"></i>
              </button>
            </div>
          </article>
        `;
      }).join("");
    }

    function openClaimModal(id, name) {
      document.getElementById("claim-bank-id").value = id;
      document.getElementById("claim-bank-title").innerText = "المنشأة: " + name;
      document.getElementById("claim-modal").classList.remove("hidden");
    }

    function closeClaimModal() {
      document.getElementById("claim-modal").classList.add("hidden");
    }

    async function submitClaimRequest(e) {
      e.preventDefault();
      const id = document.getElementById("claim-bank-id").value;
      const name = document.getElementById("claim-name").value.trim();
      const role = document.getElementById("claim-role").value.trim();
      const phone = document.getElementById("claim-phone").value.trim();
      const btn = document.getElementById("claim-submit-btn");

      btn.disabled = true;
      btn.innerText = "جاري الإرسال...";

      try {
        await fetch(`${SUPABASE_URL}/rest/v1/business_claims`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            business_id: id,
            claimant_name: name,
            claimant_role: role,
            claimant_phone: phone,
            status: "PENDING"
          })
        });

        alert("تم إرسال طلب إثبات الملكية بنجاح! سيتم مراجعته والتواصل معكم.");
        closeClaimModal();
      } catch (err) {
        alert("حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.");
      } finally {
        btn.disabled = false;
        btn.innerText = "إرسال الطلب";
      }
    }

    setupDropdown();
    fetchRealBanks();
  </script>
</body>
</html>
"""

for path in ["banks.html", "public/banks.html", "dist/banks.html"]:
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_html)
    print(f"تم بنجاح تحديث: {path}")

print("✨ تم اكتمال بناء القالب والاتصال بقاعدة البيانات بنجاح!")
