import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# الكود القديم الذي يعرض الاسم فقط
old_span = '<span className="font-bold text-[#E7E9EA] truncate text-[13px]">{post.original.authorName}</span>'

# الكود الجديد الذي يضع الاسم والشارة في حاوية واحدة
new_div = '''<div className="flex items-center gap-1 shrink min-w-0 max-w-[130px] sm:max-w-[160px]">
                                    <span className="font-bold text-[#E7E9EA] truncate text-[13px]">{post.original.authorName}</span>
                                    {((post.original as any).badgeType || (post.original as any).authorBadge || (post.original as any).verification_type) && ((post.original as any).badgeType || (post.original as any).authorBadge || (post.original as any).verification_type) !== 'none' && (
                                      <VerifiedBadge type={((post.original as any).badgeType || (post.original as any).authorBadge || (post.original as any).verification_type) as any} size={14} className="shrink-0" />
                                    )}
                                  </div>'''

if old_span in content:
    content = content.replace(old_span, new_div)
    print("✅ تم استبدال الاسم وإضافة الشارة في بطاقة الاقتباس (صفحة الحساب).")
else:
    print("⚠️ تحذير: لم يتم العثور على السطر المحدد بدقة. يرجى إبلاغي.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

