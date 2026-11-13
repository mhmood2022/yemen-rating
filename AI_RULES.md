# AI_RULES.md — قواعد وخريطة مشروع Yemen Rating

> **للمستخدم:** الصق محتوى هذا الملف كأول رسالة لأي AI قبل أي مهمة.
> **للـ AI:** اقرأه كاملاً وأكّد الالتزام قبل البدء بأي عمل.

═══════════════════════════════════════════════════════════
⚠️ القاعدة الذهبية (احفظها)
═══════════════════════════════════════════════════════════

- لا تعديل بدون قراءة الكود أولاً.
- لا git checkout — يمسح عمل المستخدم.
- لا "تم" بدون تحقق فعلي (grep + tsc).

═══════════════════════════════════════════════════════════
🔴 الممنوعات (Zero Tolerance)
═══════════════════════════════════════════════════════════

| # | الممنوع | السبب |
|---|---------|-------|
| 1 | git checkout -- <file> | يمسح عمل غير محفوظ |
| 2 | git reset --hard / git clean -fd | يمسح كل شيء |
| 3 | sed -i '/pattern/d' | يحذف أسطراً بأقواسها المهمة |
| 4 | regex أعمى بدون grep -c أولاً | يستبدل في أماكن خاطئة |
| 5 | !important عام على index.html أو index.css | يدمر كل حدود الموقع |
| 6 | Hook داخل .map() أو if أو for | يسبب Rendered more hooks crash |
| 7 | "تم" بدون تحقق | يضيع وقت المستخدم |

═══════════════════════════════════════════════════════════
✅ إلزامي قبل كل تعديل
═══════════════════════════════════════════════════════════

sed -n 'START,ENDp' <file>          # اقرأ الكود الحالي
grep -c "<pattern>" <file>          # عد المطابقات
cp <file> <file>.bak_$(date +%s)    # احفظ نسخة احتياطية

═══════════════════════════════════════════════════════════
✅ إلزامي بعد كل تعديل
═══════════════════════════════════════════════════════════

grep -n "<الكود الجديد>" <file>     # تأكد من الاستبدال فعلاً
npx tsc --noEmit                     # تأكد من سلامة الكود

قل "تم" فقط إذا نجح الاثنان. وإلا قل "فشل".

═══════════════════════════════════════════════════════════
🎨 هوية الموقع (التزم بها)
═══════════════════════════════════════════════════════════

- الخلفية: #000000 (أسود نقي)
- اللون الأساسي (أزرار فقط): #FFC500 (أصفر ذهبي)
- النصوص: #FFFFFF (أبيض)
- النصوص الثانوية: #71767B (رمادي)
- حدود الفواصل: rgba(23,27,28,0.15) (شفافية خفيفة)
- حدود الحقول عند التركيز: #FFFFFF (لا أصفر)
- المؤشر النابض (caret): #FFFFFF (لا أصفر)

ممنوع فرض اللون الأصفر على:
- حدود الحقول (input/textarea/select)
- المؤشر النابض (caret-color)
- الإطارات (outline/box-shadow)

═══════════════════════════════════════════════════════════
📊 إحصاءات المشروع
═══════════════════════════════════════════════════════════

- 127 صفحة في src/pages/
- 118 مكوناً في src/components/
- الفرع الحالي: update-tweet-ui
- الفرع المنشور: main (يقرأه Vercel)
- التقنيات: React + TypeScript + Vite + Supabase

═══════════════════════════════════════════════════════════
📁 البنية الكاملة
═══════════════════════════════════════════════════════════

src/
├── components/       (118 مكون)
├── pages/            (127 صفحة)
├── config/           (إعدادات)
├── constants/        (ثوابت)
├── context/          (سياقات React)
├── data/             (بيانات تجريبية)
├── layouts/          (تخطيطات)
├── lib/              (supabase.ts + schema)
├── services/         (socialService, bankService)
├── styles/           (tokens.css, globals.css)
├── types/            (database.types.ts, index.ts)
├── utils/            (أدوات مساعدة)
├── App.tsx           (نظام التوجيه)
└── index.css         (ألوان عامة)

═══════════════════════════════════════════════════════════
📄 الصفحات الرئيسية (src/pages/)
═══════════════════════════════════════════════════════════

- CommunityFeedPage.tsx — المجتمع (hooks أعلى المكون)
- AccountPage.tsx — الحساب (يدعم ?id=USER_ID)
- PostEngagementsPage.tsx — مشاركات المنشور (اقتباسات/ريتويت)
- NotificationsPage.tsx — التنبيهات
- SearchPage.tsx — البحث
- PhoneMarketPage.tsx — سوق الهواتف
- FavoritesPage.tsx — المفضلة
- MessagesPage.tsx — الرسائل
- MoreMenuPage.tsx — المزيد

═══════════════════════════════════════════════════════════
📄 القوالب (src/pages/templates/)
═══════════════════════════════════════════════════════════

- BankProfilePage.tsx — ملف البنك
- BusinessProfilePage.tsx — ملف المنشأة
- JobDetailsPage.tsx — تفاصيل الوظيفة
- PropertyDetailsPage.tsx — تفاصيل العقار
- AuctionDetailsPage.tsx — تفاصيل المزاد

═══════════════════════════════════════════════════════════
📄 الأقسام العامة (src/pages/public/)
═══════════════════════════════════════════════════════════

- banks/BanksPage.tsx — البنوك
- businesses/BusinessesPage.tsx — المنشآت

═══════════════════════════════════════════════════════════
📄 صفحات المحتوى (src/components/pages/)
═══════════════════════════════════════════════════════════

- AuctionsPage.tsx — المزادات
- RealEstatePage.tsx — العقارات
- JobsPage.tsx — الوظائف
- ExchangeRatesPage.tsx — أسعار الصرف

═══════════════════════════════════════════════════════════
📄 المخصصة والمستخدم (src/pages/)
═══════════════════════════════════════════════════════════

- premium/PremiumPage.tsx — الترقية
- premium/PremiumCheckout.tsx — الدفع
- user/UserProfilePage.tsx — ملف مستخدم عام
- user/MyPaymentsPage.tsx — مدفوعاتي
- social/FollowersPage.tsx — المتابعون
- categories/ — التصنيفات
- owner/OwnerDashboardPage.tsx — لوحة المالك

═══════════════════════════════════════════════════════════
📄 لوحة التحكم الإدارية (src/pages/admin/)
═══════════════════════════════════════════════════════════

- AdminMaster.tsx — لوحة التحكم الرئيسية
- AdminDashboardOverview.tsx — النظرة العامة
- auth/AdminLogin.tsx — دخول المسؤولين
- community/CommunityManager.tsx — إدارة المجتمع
- companies/CompaniesManager.tsx — إدارة الشركات
- ratings/RatingsManager.tsx — التقييمات
- banks/BanksManager.tsx — البنوك
- auctions/AuctionsManager.tsx + AuctionLiveMonitor.tsx
- ads/AdsManager.tsx + SponsorManager.tsx + AdGeneratorStudio.tsx
- real-estate/RealEstateManager.tsx — العقارات
- categories/CategoriesManager.tsx — التصنيفات
- users/UsersRolesManager.tsx — المستخدمون
- gold-currency/GoldCurrencyManager.tsx — الذهب والعملات
- jobs/JobsManager.tsx — الوظائف
- matching/MatchingAIManager.tsx — المطابقة
- settings/SettingsAuditManager.tsx — الإعدادات
- markets/MarketsManager.tsx — الأسواق
- phones/PhonesManager.tsx — الهواتف
- cleaning/CleaningManager.tsx — التنظيف
- analytics/AnalyticsFinanceManager.tsx — التحليلات
- subscriptions/SubscriptionsManager.tsx + tabs/
- operations/OperationsHub.tsx + components/ + hooks/ + tabs/
- payments/PaymentsManager.tsx + PaymentProofsTab.tsx + CommissionRulesTab.tsx

═══════════════════════════════════════════════════════════
📄 المكونات الرئيسية (src/components/)
═══════════════════════════════════════════════════════════

- auth/AuthModal.tsx — نافذة تسجيل الدخول
- navigation/MobileBottomNav.tsx — الشريط السفلي
- navigation/Sidebar.tsx — الشريط الجانبي
- layout/AppShell.tsx — هيكل التطبيق
- feed/XActionBar.tsx — أزرار التغريدة
- feed/XImagePlayer.tsx — عارض الصور (لا تلمسه)
- feed/XVideoPlayer.tsx — عارض الفيديو (لا تلمسه)
- feed/TweetCard.tsx — بطاقة التغريدة
- community/ActiveUsersBar.tsx — شريط المستخدمين
- community/ReplyBar.tsx — شريط الرد
- community/ReportPage.tsx — صفحة البلاغ
- support/SupportModal.tsx — الدعم
- ui/Modal.tsx — نافذة عامة
- business/BusinessCard.tsx + UnifiedFacilityEditor.tsx + AddBusinessModal.tsx
- category/CategoryListing.tsx — قائمة التصنيفات
- home/HomeView.tsx — الرئيسية
- account/, admin/, ads/, auctions/, banks/, claim/, claims/, common/, directory/, jobs/, modals/, phones/, prices/, properties/, reviews/

═══════════════════════════════════════════════════════════
📄 الخدمات والقاعدة
═══════════════════════════════════════════════════════════

- src/lib/supabase.ts (لا تلمسه)
- src/lib/supabase_schema.sql (لا تلمسه)
- src/services/socialService.ts
- src/services/bankService.ts
- src/types/database.types.ts
- src/types/index.ts
- src/styles/globals.css (حذر — ألوان عامة)
- src/styles/tokens.css (متغيرات الألوان)
- src/index.css (حذر — ألوان عامة)
- public/yr-logo.png (شعار YR)

═══════════════════════════════════════════════════════════
🧭 المسارات الكاملة (Routes)
═══════════════════════════════════════════════════════════

عام:
/                      — الرئيسية
/feed                  — المجتمع
/community             — alias للمجتمع
/tweets                — alias للمجتمع
/post/:id/engagements  — مشاركات المنشور
/account               — الحساب (يدعم ?id=USER_ID)
/profile               — redirect إلى /account
/search                — البحث
/notifications         — التنبيهات
/favorites             — المفضلة
/messages              — الرسائل
/more                  — المزيد

الأقسام:
/prices                — أسعار الصرف
/exchange-rates        — alias لأسعار الصرف
/banks                 — البنوك
/banks/:slug           — ملف البنك
/businesses            — المنشآت
/directory             — alias للمنشآت
/businesses/:slug      — ملف المنشأة
/jobs                  — الوظائف
/jobs/:slug            — تفاصيل الوظيفة
/properties            — العقارات
/properties/:slug      — تفاصيل العقار
/auctions              — المزادات
/auctions/:slug        — تفاصيل المزاد
/phones                — سوق الهواتف

المخصصة:
/premium               — الترقية
/premium/checkout      — الدفع
/user/:id              — ملف مستخدم عام
/owner                 — لوحة المالك

الإدارة (/admin/*):
/admin                 — لوحة التحكم
/admin/companies       — الشركات
/admin/community       — المجتمع
/admin/ratings         — التقييمات
/admin/categories      — التصنيفات
/admin/subscriptions   — الاشتراكات
/admin/payments        — المدفوعات
/admin/operations      — العمليات
/admin/markets         — الأسواق
/admin/auctions        — المزادات
/admin/auctions/:id    — مراقبة مزاد حي
/admin/ads             — الإعلانات
/admin/ads/sponsor     — الرعاة
/admin/ads/generator   — استوديو الإعلانات
/admin/jobs            — الوظائف
/admin/real-estate     — العقارات
/admin/phones          — الهواتف
/admin/cleaning        — التنظيف
/admin/users           — المستخدمون
/admin/analytics       — التحليلات
/admin/gold-currency   — الذهب والعملات
/admin/matching        — المطابقة
/admin/settings        — الإعدادات

═══════════════════════════════════════════════════════════
⚠️ ملفات حساسة (لا تلمسها إلا بإذن صريح)
═══════════════════════════════════════════════════════════

- src/lib/supabase.ts — اتصال قاعدة البيانات
- src/lib/supabase_schema.sql — مخطط القاعدة
- src/components/feed/XImagePlayer.tsx — يعمل، لا تلمسه
- src/components/feed/XVideoPlayer.tsx — يعمل، لا تلمسه
- index.html — نقطة الدخول
- src/index.css — ألوان عامة (احذر !important)
- src/styles/globals.css — ألوان عامة (احذر !important)
- src/App.tsx — نظام التوجيه

═══════════════════════════════════════════════════════════
⚠️ مجلدات النسخ الاحتياطي (لا تلمسها)
═══════════════════════════════════════════════════════════

- src/components_bak_before_remove_blur/
- src/pages/admin_bak_before_black/
- أي ملف ينتهي بـ: .bak, .backup, .broken, .clean_backup, .full_bak, .safe_bak, .quote_backup, .before-*

لا تعدلها، ولا تبنِ عليها. الكود الحي هو الذي بلا امتداد.

═══════════════════════════════════════════════════════════
🚫 أخطاء سابقة حدثت (لا تكررها)
═══════════════════════════════════════════════════════════

1. استبدال كلمة داخل import بكلمة أضافها داخل JSX → كسر الصفحة.
2. إضافة useEffect داخل .map() → Rendered more hooks crash.
3. حقن CSS بـ !important عام → تدمير كل حدود الموقع.
4. git checkout -- → مسح يومين من عمل المستخدم.
5. sed يحذف سطراً فيه </div> → Expected JSX closing tag.
6. الإبلاغ "تم" رغم فشل السكربت.
7. تعديل ملفات دون قراءتها أولاً.
8. دمج 5 تغييرات في سكربت واحد.

═══════════════════════════════════════════════════════════
🔧 سير العمل الصحيح
═══════════════════════════════════════════════════════════

1. افهم الطلب بدقة
2. اقرأ الكود (sed -n)
3. ابحث عن النمط (grep -n) — كم مرة؟
4. خذ نسخة احتياطية (cp)
5. عدّل بسكربت Python آمن
6. تحقق (grep + tsc)
7. أبلغ المستخدم بالحقيقة (تم/فشل/أحتاج تأكيدك)
8. اقترح git commit بعد النجاح:
   git add . && git commit -m "وصف مختصر لما يعمل الآن"

═══════════════════════════════════════════════════════════
🚑 عند كسر الكود
═══════════════════════════════════════════════════════════

1. اقرأ رسالة الخطأ (اسم الملف + رقم السطر)
2. sed -n 'السطر-10,السطر+10p' <file> (اقرأ السياق)
3. أصلح السطر المحدد فقط (لا git checkout)
4. npx tsc --noEmit (تحقق)

═══════════════════════════════════════════════════════════
📝 إقرار الـ AI قبل البدء
═══════════════════════════════════════════════════════════

قل للمستخدم حرفياً:

"قرأت AI_RULES.md. سأبدأ بقراءة الكود أولاً، ثم أعرض ما سأغيره،
وسأتحقق قبل أن أخبرك أنه تم. إذا فشلت سأقول فشلت.
ولن أستخدم git checkout أو sed -i '/d' أو hooks داخل .map()."

═══════════════════════════════════════════════════════════
الإصدار: 3.0
آخر تحديث: 2026-11-13
الفرع: update-tweet-ui | المنشور: main
═══════════════════════════════════════════════════════════
