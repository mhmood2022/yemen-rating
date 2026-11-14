import shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إصلاح بيانات التغريدة الرئيسية (السطر 517)
content = content.replace(
    'authorName: author?.full_name || "مستخدم يمن ريتنج",',
    'authorName: author?.full_name || "مستخدم يمن ريتنج",\n            badgeType: (author as any)?.verification_type || (author as any)?.badge_type || (author?.is_verified ? \'blue\' : \'none\'),'
)

# 2. إصلاح بيانات الناشر الذي يقتبس (السطر 559) - وهذا هو سبب المشكلة الرئيسي
content = content.replace(
    "authorName: reposter.full_name || 'مستخدم',",
    "authorName: reposter.full_name || 'مستخدم',\n            badgeType: (reposter as any).verification_type || (reposter as any).badge_type || (reposter.is_verified ? 'blue' : 'none'),"
)

# 3. إصلاح بيانات إضافية (السطر 651)
content = content.replace(
    "authorName: prof?.full_name || 'مستخدم يمن ريتنج',",
    "authorName: prof?.full_name || 'مستخدم يمن ريتنج',\n            badgeType: (prof as any)?.verification_type || (prof as any)?.badge_type || (prof?.is_verified ? 'blue' : 'none'),"
)

# 4. إصلاح بيانات إضافية (السطر 737)
content = content.replace(
    "authorName: profile?.full_name || 'مستخدم',",
    "authorName: profile?.full_name || 'مستخدم',\n            badgeType: (profile as any)?.verification_type || (profile as any)?.badge_type || (profile?.is_verified ? 'blue' : 'none'),"
)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إصلاح جلب بيانات الشارة (Data Mapping) لرأس التغريدة المقتبسة.")
