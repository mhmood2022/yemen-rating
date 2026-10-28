import re

file_path = "src/MainPublicApp.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. جعل الهيدر fixed وحجبه تماماً إذا كانت هناك منشأة فردية مفتوحة
old_header_block = r'\{/\* 1\. الهيدر المثبت الدائم \*/\}[\s\S]*?</header>'

new_header_block = '''{/* 1. الهيدر المثبت الدائم (يظهر فقط في الرئيسية وقالب الشركات الجماعي ويختفي في الصفحات الفردية) */}
      {!selectedBusiness && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#070A10]/98 backdrop-blur-xl border-b border-[#1F2937] shadow-2xl">
          <Header
            onToggleSidebar={() => setIsSidebarOpen(true)}
            onNavigateHome={handleBackToHome}
            onNavigateNotifications={() => setCurrentPage('notifications')}
            unreadNotificationsCount={3}
          />
          {/* يظهر الإعلان العلوي #1 فقط في الصفحة الرئيسية */}
          {isAtMainHome && (
            <div className="max-w-6xl mx-auto px-3 py-1 border-t border-[#1F2937]/30">
              <AdBanner placementId="1" className="mb-0" />
            </div>
          )}
        </header>
      )}'''

code = re.sub(old_header_block, new_header_block, code)

# 2. إضافة إزاحة علوية للمحتوى الرئيسي pt-16 أو pt-24 فقط عندما يكون الهيدر الثابت ظاهراً
old_main_tag = r'<main className="flex-1 pb-16">'
new_main_tag = '<main className={`flex-1 pb-16 ${!selectedBusiness ? (isAtMainHome ? "pt-24 sm:pt-28" : "pt-16 sm:pt-20") : ""}`}>'

code = re.sub(old_main_tag, new_main_tag, code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("✅ تم تعديل MainPublicApp.tsx بنجاح!")
