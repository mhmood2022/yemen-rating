# 1. إصلاح إغلاق React.Fragment في BusinessesPage.tsx
with open("src/pages/public/businesses/BusinessesPage.tsx", "r", encoding="utf-8") as f:
    biz = f.read()

target = """    window.location.href = "/bank.html?slug=" + (item.slug || item.id);
                      }}
                    />
                  ))}"""

replacement = """    window.location.href = "/bank.html?slug=" + (item.slug || item.id);
                      }}
                    />
                  </React.Fragment>
                ))}"""

if target in biz:
    biz = biz.replace(target, replacement)
else:
    # استخدام استبدال ذكي للوسم قبل ))}
    import re
    biz = re.sub(
        r'(\/>\s*)(\)\)\}\s*<\/div>)',
        r'\1</React.Fragment>\n              \2',
        biz,
        count=1
    )

with open("src/pages/public/businesses/BusinessesPage.tsx", "w", encoding="utf-8") as f:
    f.write(biz)
print("✅ 1. تم إغلاق React.Fragment في BusinessesPage.tsx بنجاح!")

# 2. فحص وإصلاح JobsPage.tsx
with open("src/components/pages/JobsPage.tsx", "r", encoding="utf-8") as f:
    jobs = f.read()

if "<React.Fragment" in jobs and "</React.Fragment>" not in jobs:
    import re
    jobs = re.sub(r'(\n\s*\}\)\s*\)\)\}\s*<\/div>)', r'</React.Fragment>\1', jobs, count=1)
    with open("src/components/pages/JobsPage.tsx", "w", encoding="utf-8") as f:
        f.write(jobs)
    print("✅ 2. تم التأكد من إغلاق React.Fragment في JobsPage.tsx.")

# 3. فحص وإصلاح RealEstatePage.tsx
with open("src/components/pages/RealEstatePage.tsx", "r", encoding="utf-8") as f:
    realestate = f.read()

if "<React.Fragment" in realestate and "</React.Fragment>" not in realestate:
    import re
    realestate = re.sub(r'(\n\s*\}\)\s*\)\)\}\s*<\/div>)', r'</React.Fragment>\1', realestate, count=1)
    with open("src/components/pages/RealEstatePage.tsx", "w", encoding="utf-8") as f:
        f.write(realestate)
    print("✅ 3. تم التأكد من إغلاق React.Fragment في RealEstatePage.tsx.")

# 4. فحص وإصلاح AuctionsPage.tsx
with open("src/components/pages/AuctionsPage.tsx", "r", encoding="utf-8") as f:
    auctions = f.read()

if "<React.Fragment" in auctions and "</React.Fragment>" not in auctions:
    import re
    auctions = re.sub(r'(\n\s*\}\)\s*\)\)\}\s*<\/div>)', r'</React.Fragment>\1', auctions, count=1)
    with open("src/components/pages/AuctionsPage.tsx", "w", encoding="utf-8") as f:
        f.write(auctions)
    print("✅ 4. تم التأكد من إغلاق React.Fragment في AuctionsPage.tsx.")
