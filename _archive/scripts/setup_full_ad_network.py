import re

# ========================================================
# 1. تحديث قائمة المواضع في adGeneratorEngine.ts
# ========================================================
placements_code = """export const YR_AD_PLACEMENTS: AdPlacement[] = [
  // 1. الرئيسية والفوتر العام
  { id: '1', name: 'الرئيسية — الهيدر العلوي (Top Banner)', width: 1200, height: 160 },
  { id: '2', name: 'الرئيسية — بين الأقسام (In-Feed Main)', width: 800, height: 250 },
  { id: '10', name: 'شريط الفوتر العام الثابت (Footer Sticky)', width: 1200, height: 90 },

  // 2. دليل الشركات (الجماعي)
  { id: 'companies_top', name: 'دليل الشركات — أعلى الصفحة (Header)', width: 1200, height: 160 },
  { id: 'companies_feed', name: 'دليل الشركات — بين البطاقات (In-Feed)', width: 800, height: 220 },
  { id: 'companies_footer', name: 'دليل الشركات — الفوتر السفلي', width: 1200, height: 140 },

  // 3. ملف المنشأة الفردي
  { id: 'company_profile_top', name: 'ملف المنشأة الفردي — الهيدر العلوي', width: 1200, height: 160 },
  { id: 'company_profile_footer', name: 'ملف المنشأة الفردي — الفوتر السفلي', width: 1200, height: 140 },

  // 4. دليل البنوك (الجماعي)
  { id: 'banks_top', name: 'دليل البنوك — أعلى الصفحة (Header)', width: 1200, height: 160 },
  { id: 'banks_feed', name: 'دليل البنوك — بين البطاقات (In-Feed)', width: 800, height: 220 },
  { id: 'banks_footer', name: 'دليل البنوك — الفوتر السفلي', width: 1200, height: 140 },

  // 5. ملف البنك الفردي
  { id: 'bank_profile_top', name: 'ملف البنك الفردي — الهيدر العلوي', width: 1200, height: 160 },
  { id: 'bank_profile_footer', name: 'ملف البنك الفردي — الفوتر السفلي', width: 1200, height: 140 },

  // 6. قسم الوظائف
  { id: 'jobs_top', name: 'قسم الوظائف — أعلى الصفحة (Header)', width: 1200, height: 160 },
  { id: 'jobs_feed', name: 'قسم الوظائف — بين الشواغر (In-Feed)', width: 850, height: 200 },
  { id: 'jobs_footer', name: 'قسم الوظائف — الفوتر السفلي', width: 1200, height: 140 },

  // 7. قسم العقارات
  { id: 'realestate_top', name: 'قسم العقارات — أعلى الصفحة (Header)', width: 1200, height: 160 },
  { id: 'realestate_feed', name: 'قسم العقارات — بين العروض (In-Feed)', width: 850, height: 200 },
  { id: 'realestate_footer', name: 'قسم العقارات — الفوتر السفلي', width: 1200, height: 140 },

  // 8. قسم المزادات
  { id: 'auctions_top', name: 'قسم المزادات — أعلى الصفحة (Header)', width: 1200, height: 160 },
  { id: 'auctions_feed', name: 'قسم المزادات — بين البطاقات (In-Feed)', width: 850, height: 200 },
  { id: 'auctions_footer', name: 'قسم المزادات — الفوتر السفلي', width: 1200, height: 140 },
];"""

with open("src/utils/adGeneratorEngine.ts", "r", encoding="utf-8") as f:
    engine = f.read()

engine = re.sub(r'export const YR_AD_PLACEMENTS: AdPlacement\[\] = \[.*?\];', placements_code, engine, flags=re.DOTALL)
with open("src/utils/adGeneratorEngine.ts", "w", encoding="utf-8") as f:
    f.write(engine)
print("✅ 1. تم تحديث خريطة المواضع في استوديو الإعلانات.")

# ========================================================
# 2. تفعيل شريط الفوتر الثابت (الموضع 10) في AppShell.tsx
# ========================================================
with open("src/components/layout/AppShell.tsx", "r", encoding="utf-8") as f:
    appshell = f.read()

footer_ad_code = """      {/* 6. شريط الفوتر الإعلاني الثابت العام (الموضع 10) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-2 sm:px-4 pb-1 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <AdBanner placementId="10" className="shadow-2xl" />
        </div>
      </div>
    </div>"""

if 'placementId="10"' not in appshell:
    # استبدال إغلاق div الأخير
    appshell = re.sub(r'</main>\s*</div>\s*\);\s*};', '</main>\n' + footer_ad_code + '\n  );\n};', appshell)
    with open("src/components/layout/AppShell.tsx", "w", encoding="utf-8") as f:
        f.write(appshell)
    print("✅ 2. تم تفعيل شريط الفوتر الثابت في AppShell بنجاح.")

# ========================================================
# 3. تحديث دليل الشركات BusinessesPage.tsx (هيدر + بين البطاقات + فوتر)
# ========================================================
with open("src/pages/public/businesses/BusinessesPage.tsx", "r", encoding="utf-8") as f:
    biz = f.read()

# إضافة هيدر الشركات
if 'placementId="companies_top"' not in biz:
    biz = biz.replace(
        '<div className="flex flex-col sm:flex-row gap-3">',
        '<AdBanner placementId="companies_top" className="mb-3 rounded-2xl overflow-hidden shadow-lg" />\n        <div className="flex flex-col sm:flex-row gap-3">'
    )

# إضافة إعلان بين البطاقات بعد البطاقة الثانية
old_biz_map = '{filtered.map((item) => ('
new_biz_map = """{filtered.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx === 2 && (
                <div className="col-span-full my-2">
                  <AdBanner placementId="companies_feed" className="rounded-2xl overflow-hidden shadow-md" />
                </div>
              )}"""

if old_biz_map in biz and 'placementId="companies_feed"' not in biz:
    biz = biz.replace(old_biz_map, new_biz_map)
    biz = biz.replace('</article>\n          ))}', '</article>\n            </React.Fragment>\n          ))}')

# إضافة فوتر الشركات
if 'placementId="companies_footer"' not in biz:
    biz = biz.replace(
        '<AdBanner placementId="3" className="mt-6" />',
        '<AdBanner placementId="companies_footer" className="mt-6 rounded-2xl overflow-hidden shadow-lg" />'
    )

with open("src/pages/public/businesses/BusinessesPage.tsx", "w", encoding="utf-8") as f:
    f.write(biz)
print("✅ 3. تم تزويد دليل الشركات بإعلانات (هيدر + بين البطاقات + فوتر).")

# ========================================================
# 4. تحديث قسم الوظائف JobsPage.tsx (هيدر + بين الشواغر + فوتر)
# ========================================================
with open("src/components/pages/JobsPage.tsx", "r", encoding="utf-8") as f:
    jobs = f.read()

# إضافة هيدر الوظائف
if 'placementId="jobs_top"' not in jobs:
    jobs = jobs.replace(
        '<div className="flex items-center justify-between border-b border-[#1F2937]',
        '<AdBanner placementId="jobs_top" className="mb-3 rounded-2xl overflow-hidden shadow-lg" />\n      <div className="flex items-center justify-between border-b border-[#1F2937]'
    )

# إضافة إعلان بين الشواغر
old_jobs_map = '{filteredJobs.map((job) => ('
new_jobs_map = """{filteredJobs.map((job, idx) => (
            <React.Fragment key={job.id}>
              {idx === 2 && (
                <div className="col-span-full my-2">
                  <AdBanner placementId="jobs_feed" className="rounded-2xl overflow-hidden shadow-md" />
                </div>
              )}"""

if old_jobs_map in jobs and 'placementId="jobs_feed"' not in jobs:
    jobs = jobs.replace(old_jobs_map, new_jobs_map)
    jobs = jobs.replace('</article>\n            ))}', '</article>\n            </React.Fragment>\n            ))}')

# استبدال فوتر الوظائف القديم
jobs = jobs.replace('placementId="7"', 'placementId="jobs_footer"')

with open("src/components/pages/JobsPage.tsx", "w", encoding="utf-8") as f:
    f.write(jobs)
print("✅ 4. تم تزويد قسم الوظائف بإعلانات (هيدر + بين الشواغر + فوتر).")

# ========================================================
# 5. تحديث قسم العقارات RealEstatePage.tsx (هيدر + بين العروض + فوتر)
# ========================================================
with open("src/components/pages/RealEstatePage.tsx", "r", encoding="utf-8") as f:
    re_code = f.read()

# إضافة هيدر العقارات
if 'placementId="realestate_top"' not in re_code:
    re_code = re_code.replace(
        '<div className="flex items-center justify-between border-b border-[#1F2937]',
        '<AdBanner placementId="realestate_top" className="mb-3 rounded-2xl overflow-hidden shadow-lg" />\n      <div className="flex items-center justify-between border-b border-[#1F2937]'
    )

# إضافة إعلان بين عروض العقارات
old_re_map = '{filteredProperties.map((prop) => ('
new_re_map = """{filteredProperties.map((prop, idx) => (
            <React.Fragment key={prop.id}>
              {idx === 2 && (
                <div className="col-span-full my-2">
                  <AdBanner placementId="realestate_feed" className="rounded-2xl overflow-hidden shadow-md" />
                </div>
              )}"""

if old_re_map in re_code and 'placementId="realestate_feed"' not in re_code:
    re_code = re_code.replace(old_re_map, new_re_map)
    re_code = re_code.replace('</article>\n            ))}', '</article>\n            </React.Fragment>\n            ))}')

# استبدال فوتر العقارات القديم
re_code = re_code.replace('placementId="5"', 'placementId="realestate_footer"')

with open("src/components/pages/RealEstatePage.tsx", "w", encoding="utf-8") as f:
    f.write(re_code)
print("✅ 5. تم تزويد قسم العقارات بإعلانات (هيدر + بين العروض + فوتر).")

# ========================================================
# 6. تحديث قسم المزادات AuctionsPage.tsx (هيدر + بين البطاقات + فوتر)
# ========================================================
with open("src/components/pages/AuctionsPage.tsx", "r", encoding="utf-8") as f:
    auc = f.read()

# إضافة هيدر المزادات
if 'placementId="auctions_top"' not in auc:
    auc = auc.replace(
        '<div className="flex items-center justify-between border-b border-[#1F2937]',
        '<AdBanner placementId="auctions_top" className="mb-3 rounded-2xl overflow-hidden shadow-lg" />\n      <div className="flex items-center justify-between border-b border-[#1F2937]'
    )

# إضافة إعلان بين المزادات
old_auc_map = '{filteredListings.map((item) => ('
new_auc_map = """{filteredListings.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx === 2 && (
                <div className="col-span-full my-2">
                  <AdBanner placementId="auctions_feed" className="rounded-2xl overflow-hidden shadow-md" />
                </div>
              )}"""

if old_auc_map in auc and 'placementId="auctions_feed"' not in auc:
    auc = auc.replace(old_auc_map, new_auc_map)
    auc = auc.replace('</article>\n            ))}', '</article>\n            </React.Fragment>\n            ))}')

# استبدال فوتر المزادات القديم
auc = auc.replace('placementId="6"', 'placementId="auctions_footer"')

with open("src/components/pages/AuctionsPage.tsx", "w", encoding="utf-8") as f:
    f.write(auc)
print("✅ 6. تم تزويد قسم المزادات بإعلانات (هيدر + بين المزادات + فوتر).")

# ========================================================
# 7. تحديث صفحات البنوك (الجماعي والفردي)
# ========================================================
# أ) دليل البنوك الجماعي
with open("src/pages/public/banks/BanksPage.tsx", "r", encoding="utf-8") as f:
    bp = f.read()

bp = bp.replace('placementId="8"', 'placementId="banks_top"')
if 'placementId="banks_footer"' not in bp:
    bp = re.sub(r'(</div>\s*\);\s*};)', '<AdBanner placementId="banks_footer" className="mt-4" />\n    \\1', bp)

with open("src/pages/public/banks/BanksPage.tsx", "w", encoding="utf-8") as f:
    f.write(bp)

# ب) ملف البنك الفردي
with open("src/pages/templates/BankProfilePage.tsx", "r", encoding="utf-8") as f:
    bprof = f.read()

bprof = bprof.replace('placementId="4"', 'placementId="bank_profile_top"')
if 'placementId="bank_profile_footer"' not in bprof:
    bprof = re.sub(r'(</div>\s*\);\s*};)', '<AdBanner placementId="bank_profile_footer" className="mt-4" />\n    \\1', bprof)

with open("src/pages/templates/BankProfilePage.tsx", "w", encoding="utf-8") as f:
    f.write(bprof)
print("✅ 7. تم تزويد صفحات البنوك الجماعية والفردية بهيدر وفوتر الإعلانات.")
