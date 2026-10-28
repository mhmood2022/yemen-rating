import re

file_path = "src/components/layout/AppShell.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. تحديد هل الصفحة الحالية هي صفحة منشأة فردية (حيث يجب إخفاء الهيدر تماماً)
condition_logic = '''  const isMainHome = location.pathname === '/';
  
  // فحص صارم: هل الصفحة الحالية هي قالب فردي لمنشأة أو بنك؟
  const isIndividualProfile = 
    (location.pathname.startsWith('/businesses/') && location.pathname !== '/businesses') ||
    (location.pathname.startsWith('/banks/') && location.pathname !== '/banks') ||
    location.pathname.includes('/bank');
'''

code = code.replace("  const isMainHome = location.pathname === '/';", condition_logic)

# 2. جعل الهيدر Fixed دائماً في القمة وحجبه تماماً عن أي صفحة فردية
old_header_block = r'\{/\* 1\. الهيدر الثابت \+ الوحدة الإعلانية المنزلقة من جذره مباشرة \*/\}[\s\S]*?</header>'

new_header_block = '''{/* 1. الهيدر المثبت الدائم: يظهر في الرئيسية وقالب الشركات الجماعي ويختفي تماماً في الصفحات الفردية */}
      {!isIndividualProfile && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#070A10]/98 backdrop-blur-xl border-b border-[#1F2937] shadow-2xl">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(true)}
            onNavigateHome={() => navigate('/')}
            onNavigateNotifications={() => navigate('/notifications')}
            unreadNotificationsCount={3}
          />
          {/* الوحدة الإعلانية المنزلقة في الصفحة الرئيسية */}
          {isMainHome && (
            <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 pb-2 pt-0.5 yr-header-ad-slide overflow-hidden border-t border-[#1F2937]/40">
              <AdBanner placementId="1" className="mb-0 shadow-lg" />
            </div>
          )}
        </header>
      )}'''

code = re.sub(old_header_block, new_header_block, code)

# 3. إزاحة شريط البحث في الصفحة الرئيسية ليتناسب مع الهيدر الثابت
code = code.replace(
    '{isMainHome && (\n        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 pt-3 pb-1">',
    '{isMainHome && (\n        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-1">'
)

# 4. إضافة مسافة علوية مناسبة للجسم الرئيسي في صفحات الدليل الجماعية
code = code.replace(
    '<main className="flex-1 pb-16">',
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("✅ تم تعديل AppShell.tsx وتثبيت الهيدر بنجاح تام!")
