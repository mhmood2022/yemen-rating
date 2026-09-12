# 1. إصلاح إغلاق وسم main في AppShell.tsx
with open("src/components/layout/AppShell.tsx", "r", encoding="utf-8") as f:
    appshell = f.read()

appshell = appshell.replace(
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}\n          {children}',
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}>\n          {children}'
)
appshell = appshell.replace(
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}\r\n          {children}',
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}>\n          {children}'
)

with open("src/components/layout/AppShell.tsx", "w", encoding="utf-8") as f:
    f.write(appshell)
print("✅ 1. تم إصلاح وسم main في AppShell.tsx بنجاح!")

# 2. إضافة مسار /directory في App.tsx ليرتبط بقالب الشركات الجماعي BusinessesPage
with open("src/App.tsx", "r", encoding="utf-8") as f:
    app_code = f.read()

if 'path="/directory"' not in app_code:
    app_code = app_code.replace(
        '<Route path="/businesses" element={<AppShell><BusinessesPage /></AppShell>} />',
        '<Route path="/businesses" element={<AppShell><BusinessesPage /></AppShell>} />\n        <Route path="/directory" element={<AppShell><BusinessesPage /></AppShell>} />'
    )
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(app_code)
    print("✅ 2. تم إضافة مسار /directory لقالب الشركات الجماعي بنجاح!")
else:
    print("مسار /directory موجود بالفعل.")
