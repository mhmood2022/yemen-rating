with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    studio = f.read()

# التأكد من أن المعاينة الحية تستخدم حواف مستقيمة وارتفاعاً مريحاً متطابقاً مع ما سينشر
studio = studio.replace("minHeight: '260px'", "minHeight: '130px'")

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(studio)
print("✅ تم تحديث أبعاد المعاينة الحية في الاستوديو لتطابق العرض الفعلي.")
