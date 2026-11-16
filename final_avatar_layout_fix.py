import shutil, time

file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_finalavatar_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. تعديل z-index والموضع لحاوية الشعار
content = content.replace(
    '<div className="px-4 relative z-50">',
    '<div className="px-4 relative z-10">'
)
content = content.replace(
    '<div className="flex justify-between items-end -mt-12 sm:-mt-14 mb-3">',
    '<div className="flex justify-between items-end -mt-[46px] sm:-mt-[66px] mb-3">'
)

# 2. تعديل useEffect (إزالة translateY، إبقاء scale و opacity)
old_anim = """              if (avatarRef.current) {
                const progress = Math.min(scrollY / 100, 1);
                const scale = Math.max(0, 1 - progress);
                // نطبق التحويل على الشعار نفسه ليبقى مثبتاً في مكانه ويتقلص
                avatarRef.current.style.transform = `translateY(${scrollY}px) scale(${scale})`;
                avatarRef.current.style.transformOrigin = 'center';
              }"""
new_anim = """              if (avatarRef.current) {
                const progress = Math.min(scrollY / 100, 1);
                const scale = Math.max(0, 1 - progress);
                const opacity = Math.max(0, 1 - progress);
                avatarRef.current.style.transform = `scale(${scale})`;
                avatarRef.current.style.opacity = opacity.toString();
                avatarRef.current.style.transformOrigin = 'center';
              }"""
content = content.replace(old_anim, new_anim)

# 3. إزالة زر الترقية من صف الشعار
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
content = content.replace(old_btn, new_btn)

# 4. إضافة زر الترقية بعد الاسم
old_name = """          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" dir="rtl">
            <h1
              className="text-white select-text" style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.3' }}
            >
              {name || "مستخدم يمن ريتنج"}
            </h1>
            <VerifiedBadge type={verificationType} size={16} />
          </div>"""
new_name = """          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap" dir="rtl">
            <h1
              className="text-white select-text" style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.3' }}
            >
              {name || "مستخدم يمن ريتنج"}
            </h1>
            <VerifiedBadge type={verificationType} size={16} />
            {isOwner && (verificationType === 'none' || verificationType === false || !verificationType) && (
              <button
                onClick={() => navigate('/premium')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#FFC500]/50 bg-[#FFC500]/10 hover:bg-[#FFC500]/20 active:scale-95 text-[#FFC500] text-[10px] font-bold transition mr-auto"
              >
                <VerifiedBadge type="blue" size={12} />
                <span>وثّق حسابك</span>
              </button>
            )}
          </div>"""
content = content.replace(old_name, new_name)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم تطبيق كافة التعديلات.")
