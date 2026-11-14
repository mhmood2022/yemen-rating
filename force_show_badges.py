import re, shutil, time

file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. إصلاح جلب بيانات التغريدة المقتبسة (Quote Tweet)
# نضيف حقل badgeType داخل كائن original
old_original_map = "original: r.quote_text ? {"
new_original_map = """original: r.quote_text ? {
              badgeType: originalAuthor?.verification_type || originalAuthor?.badge_type || (originalAuthor?.is_verified ? "blue" : "none"),"""
if "badgeType: originalAuthor?.verification_type" not in content:
    content = content.replace(old_original_map, new_original_map)

# 2. إصلاح جلب بيانات التغريدة الرئيسية (Main Tweet)
# نضيف حقل badgeType للتغريدة إذا لم يكن موجوداً
# نبحث عن مكان إرجاع التغريدة (return { id: ..., authorName: ... })
if "badgeType: p.verification_type" not in content:
    content = re.sub(
        r'(authorName:\s*p\.full_name\s*\|\|.*?,)',
        r'\1\n            badgeType: p.verification_type || p.badge_type || (p.is_verified ? "blue" : "none"),',
        content
    )
    content = re.sub(
        r'(authorName:\s*profile\?\.full_name\s*\|\|.*?,)',
        r'\1\n            badgeType: profile?.verification_type || profile?.badge_type || (profile?.is_verified ? "blue" : "none"),',
        content
    )

# 3. التأكد من أن دالة العرض (JSX) تقوم باستدعاء الشارة بشكل صحيح
# (هذا الجزء يضمن أن الكود يتحقق من القيمة ولا يظهرها إذا كانت "none")
content = content.replace('{tweet.badgeType && tweet.badgeType !== "none" && (', '{tweet.badgeType && tweet.badgeType !== "none" && tweet.badgeType !== false && (')
content = content.replace('{tweet.original.badgeType && tweet.original.badgeType !== "none" && (', '{tweet.original.badgeType && tweet.original.badgeType !== "none" && tweet.original.badgeType !== false && (')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إصلاح جلب بيانات الشارة (Data Mapping) للتغريدة الرئيسية والمقتبسة.")
