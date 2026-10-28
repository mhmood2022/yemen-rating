with open("src/components/layout/AppShell.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# إغلاق وسم main بشكل سليم بوضع >
code = code.replace(
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}\n          {children}',
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}>\n          {children}'
)
code = code.replace(
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}\r\n          {children}',
    '<main className={`flex-1 pb-16 ${!isIndividualProfile ? (!isMainHome ? "pt-16 sm:pt-20" : "") : ""}`}>\n          {children}'
)

with open("src/components/layout/AppShell.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("✅ تم تصحيح إغلاق وسم main!")
