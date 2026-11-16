import shutil, time, re

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_fixzbtn_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. رفع z-index للحاوية (الشعار يظهر فوق الغلاف)
content = content.replace(
    '<div className="px-4 relative z-10">\n        <div className="flex justify-between items-end -mt-[46px] sm:-mt-[66px] mb-3">',
    '<div className="px-4 relative z-50">\n        <div className="flex justify-between items-end -mt-[46px] sm:-mt-[66px] mb-3">'
)

# 2. حذف زر الترقية من مكانه الحالي
old_btn = """            {isOwner ? (
              <button
                onClick={() => navigate('/premium')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-700 bg-black/60 hover:bg-white/10 active:scale-95 text-white text-xs font-bold transition"
              >
                <VerifiedBadge
                  type={(verificationType && verificationType !== 'none') ? verificationType as any : 'blue'}
                  size={16}
                />
                <span>{(verificationType && verificationType !== 'none') ? 'ترقية الاشتراك' : 'وثّق حسابك'}</span>
              </button>
            ) : ("""

new_btn = """            {!isOwner && ("""

if old_btn in content:
    content = content.replace(old_btn, new_btn)
    print("✅ 1. تم حذف زر الترقية من مكانه (بجانب الشعار).")

# 3. إضافة زر الترقية بعد الاسم (بجانبه)
old_name = """          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" dir="rtl">
            <h1
              className="text-white select-text" style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.3' }}
            >
              {name || "مستخدم يمن ريتنج"}
            </h1>
            <VerifiedBadge type={verificationType} size={16} />
          </div>"""

new_name = """          <div className="flex items-center gap-2 min-w-0 flex-wrap" dir="rtl">
            <h1
              className="text-white select-text" style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.3' }}
            >
              {name || "مستخدم يمن ريتنج"}
            </h1>
            <VerifiedBadge type={verificationType} size={16} />
            {isOwner && (verificationType === 'none' || !verificationType || verificationType === false) && (
              <button
                onClick={() => navigate('/premium')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#FFC500]/50 bg-[#FFC500]/10 hover:bg-[#FFC500]/20 active:scale-95 text-[#FFC500] text-[10px] font-bold transition"
              >
                <VerifiedBadge type="blue" size={11} />
                <span>وثّق حسابك</span>
              </button>
            )}
          </div>"""

if old_name in content:
    content = content.replace(old_name, new_name)
    print("✅ 2. تم إضافة زر الترقية بجانب الاسم.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ اكتمل التعديل.")
