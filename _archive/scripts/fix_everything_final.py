import re

# ========================================================
# 1. مطابقة أرقام المواضع في الصفحات مع أرقام Supabase
# ========================================================

# أ) دليل الشركات BusinessesPage.tsx (الموضع 4 هيدر، والموضع 3 بين البطاقات/فوتر)
with open("src/pages/public/businesses/BusinessesPage.tsx", "r", encoding="utf-8") as f:
    biz = f.read()

biz = biz.replace('placementId="companies_top"', 'placementId="4"')
biz = biz.replace('placementId="companies_feed"', 'placementId="3"')
biz = biz.replace('placementId="companies_footer"', 'placementId="3"')

with open("src/pages/public/businesses/BusinessesPage.tsx", "w", encoding="utf-8") as f:
    f.write(biz)
print("✅ 1. تم ضبط أرقام دليل الشركات لتطابق 4 و 3 في Supabase.")

# ب) قسم الوظائف JobsPage.tsx (الموضع 7)
with open("src/components/pages/JobsPage.tsx", "r", encoding="utf-8") as f:
    jobs = f.read()

jobs = jobs.replace('placementId="jobs_top"', 'placementId="7"')
jobs = jobs.replace('placementId="jobs_feed"', 'placementId="7"')
jobs = jobs.replace('placementId="jobs_footer"', 'placementId="7"')

with open("src/components/pages/JobsPage.tsx", "w", encoding="utf-8") as f:
    f.write(jobs)
print("✅ 2. تم ضبط إعلانات الوظائف لتطابق الموضع 7.")

# ج) قسم العقارات RealEstatePage.tsx (الموضع 5)
with open("src/components/pages/RealEstatePage.tsx", "r", encoding="utf-8") as f:
    re_code = f.read()

re_code = re_code.replace('placementId="realestate_top"', 'placementId="5"')
re_code = re_code.replace('placementId="realestate_feed"', 'placementId="5"')
re_code = re_code.replace('placementId="realestate_footer"', 'placementId="5"')

with open("src/components/pages/RealEstatePage.tsx", "w", encoding="utf-8") as f:
    f.write(re_code)
print("✅ 3. تم ضبط إعلانات العقارات لتطابق الموضع 5.")

# د) قسم المزادات AuctionsPage.tsx (الموضع 6)
with open("src/components/pages/AuctionsPage.tsx", "r", encoding="utf-8") as f:
    auc = f.read()

auc = auc.replace('placementId="auctions_top"', 'placementId="6"')
auc = auc.replace('placementId="auctions_feed"', 'placementId="6"')
auc = auc.replace('placementId="auctions_footer"', 'placementId="6"')

with open("src/components/pages/AuctionsPage.tsx", "w", encoding="utf-8") as f:
    f.write(auc)
print("✅ 4. تم ضبط إعلانات المزادات لتطابق الموضع 6.")

# هـ) تأكيد وجود شريط الفوتر (الموضع 10) في AppShell.tsx
with open("src/components/layout/AppShell.tsx", "r", encoding="utf-8") as f:
    appshell = f.read()

if 'placementId="10"' not in appshell:
    footer_banner = '''      {/* 6. شريط الفوتر الإعلاني الثابت العام (الموضع 10) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-2 sm:px-4 pb-1 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <AdBanner placementId="10" className="shadow-2xl" />
        </div>
      </div>
    </div>'''
    appshell = re.sub(r'</main>\s*</div>\s*\);\s*};', '</main>\n' + footer_banner + '\n  );\n};', appshell)
    with open("src/components/layout/AppShell.tsx", "w", encoding="utf-8") as f:
        f.write(appshell)
    print("✅ 5. تم تثبيت إعلان الفوتر 10 في AppShell.tsx.")
else:
    print("إعلان الفوتر 10 موجود في AppShell.tsx بالفعل.")

# و) تحديث قائمة adGeneratorEngine لتطابق الأرقام
engine_code = """export const YR_AD_PLACEMENTS: AdPlacement[] = [
  { id: '1', name: 'الرئيسية — الهيدر العلوي (Top Banner)', width: 1200, height: 160 },
  { id: '2', name: 'الرئيسية — بين الأقسام (In-Feed Main)', width: 800, height: 250 },
  { id: '4', name: 'دليل الشركات — أعلى الصفحة (Company Top)', width: 1200, height: 160 },
  { id: '3', name: 'دليل الشركات — بين البطاقات والفوتر (Directory)', width: 800, height: 220 },
  { id: '5', name: 'قسم العقارات (Real-Estate)', width: 850, height: 200 },
  { id: '6', name: 'قسم المزادات (Auctions)', width: 850, height: 200 },
  { id: '7', name: 'قسم الوظائف (Jobs)', width: 850, height: 200 },
  { id: '8', name: 'دليل البنوك وأسعار الصرف (Banks & Rates)', width: 850, height: 200 },
  { id: '9', name: 'سوق الهواتف (Phones Market)', width: 850, height: 200 },
  { id: '10', name: 'شريط الفوتر العام الثابت (Footer Sticky)', width: 1200, height: 90 },
];"""

with open("src/utils/adGeneratorEngine.ts", "r", encoding="utf-8") as f:
    eng = f.read()

eng = re.sub(r'export const YR_AD_PLACEMENTS: AdPlacement\[\] = \[.*?\];', engine_code, eng, flags=re.DOTALL)
with open("src/utils/adGeneratorEngine.ts", "w", encoding="utf-8") as f:
    f.write(eng)
print("✅ 6. تم توحيد أرقام المواضع في استوديو الإعلانات.")
