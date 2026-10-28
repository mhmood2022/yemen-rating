import re

files_config = [
    {
        "file": "src/components/pages/JobsPage.tsx",
        "ad_top_pattern": r'(<AdBanner\s+placementId="7"[^>]*\/>\s*)\n\s*<AdBanner\s+placementId="7"[^>]*\/>',
        "middle_ad": '<AdBanner placementId="7" className="my-4 rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />',
        "after_filter_anchor": r'(<\/div>\s*\{\/\*\s*قائمة الوظائف|\{\/\*\s*قائمة الوظائف|jobs\.length === 0)',
        "publish_word": "نشر وظيفة"
    },
    {
        "file": "src/components/pages/RealEstatePage.tsx",
        "ad_top_pattern": r'(<AdBanner\s+placementId="5"[^>]*\/>\s*)\n\s*<AdBanner\s+placementId="5"[^>]*\/>',
        "middle_ad": '<AdBanner placementId="5" className="my-4 rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />',
        "after_filter_anchor": r'(<\/div>\s*\{\/\*\s*قائمة العقارات|\{\/\*\s*قائمة العقارات|properties\.length === 0)',
        "publish_word": "عقار"
    },
    {
        "file": "src/components/pages/AuctionsPage.tsx",
        "ad_top_pattern": r'(<AdBanner\s+placementId="6"[^>]*\/>\s*)\n\s*<AdBanner\s+placementId="6"[^>]*\/>',
        "middle_ad": '<AdBanner placementId="6" className="my-4 rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />',
        "after_filter_anchor": r'(<\/div>\s*\{\/\*\s*قائمة المزادات|\{\/\*\s*قائمة المزادات|auctions\.length === 0)',
        "publish_word": "مزاد"
    }
]

for cfg in files_config:
    filepath = cfg["file"]
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. التأكد من استيراد أيقونات الرجوع Plus و ArrowRight
    imp_match = re.search(r"import\s*\{([^}]+)\}\s*from\s*['\"]lucide-react['\"]", content)
    if imp_match:
        current_imps = [x.strip() for x in imp_match.group(1).split(',')]
        needed = []
        for icon in ['ArrowRight', 'Plus']:
            if icon not in current_imps:
                needed.append(icon)
        if needed:
            new_imp = f"import {{ {imp_match.group(1).strip()}, {', '.join(needed)} }} from 'lucide-react'"
            content = content[:imp_match.start()] + new_imp + content[imp_match.end():]

    # 2. فك تلاصق الإعلانات: الإعلان الأول يبقى في الرأس، والثاني يُنقل لوسط الصفحة
    if re.search(cfg["ad_top_pattern"], content):
        # إبقاء الإعلان الأول فقط في الأعلى
        content = re.sub(cfg["ad_top_pattern"], r'\1', content, count=1)
        # وضع الإعلان الثاني في وسط الصفحة (قبل قائمة الكروت)
        if re.search(cfg["after_filter_anchor"], content):
            content = re.sub(cfg["after_filter_anchor"], f'{cfg["middle_ad"]}\n\\1', content, count=1)

    # 3. زر الرجوع: حذف كلمة "الرئيسية" وجعله أيقونة/رمز ذهبي فقط
    home_btn_pattern = r'<(button|Link)[^>]*>(?:(?!<\/(?:button|Link)>)[\s\S])*?الرئيسية[\s\S]*?<\/(?:button|Link)>'
    m_btn = re.search(home_btn_pattern, content)
    if m_btn:
        orig_btn = m_btn.group(0)
        is_link = orig_btn.startswith('<Link')
        if is_link:
            to_val = re.search(r'to=(?:\{["\']?([^"\'}]+)["\']?\}|["\']([^"\']+)["\'])', orig_btn)
            target = (to_val.group(1) or to_val.group(2)) if to_val else '/'
            new_icon_btn = f'''<Link
          to="{target}"
          title="رجوع"
          aria-label="رجوع"
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-[#FFC500]/40 text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center justify-center shrink-0 shadow-md"
        >
          <ArrowRight size={20} className="stroke-[2.5]" />
        </Link>'''
        else:
            onclick_val = re.search(r'onClick=\{([^}]+)\}', orig_btn)
            handler = f'onClick={{{onclick_val.group(1)}}}' if onclick_val else 'onClick={() => window.history.back()}'
            new_icon_btn = f'''<button
          {handler}
          title="رجوع"
          aria-label="رجوع"
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-[#FFC500]/40 text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center justify-center shrink-0 shadow-md"
        >
          <ArrowRight size={20} className="stroke-[2.5]" />
        </button>'''
        content = content[:m_btn.start()] + new_icon_btn + content[m_btn.end():]

    # 4. زر النشر: تنسيقه ليصبح في سطر واحد بارتفاع محاذٍ (h-10) وشكل متناسق
    pub_pattern = r'(<button[^>]*>(?:(?!<\/button>)[\s\S])*?' + re.escape(cfg["publish_word"]) + r'[\s\S]*?<\/button>)'
    m_pub = re.search(pub_pattern, content)
    if m_pub:
        orig_pub = m_pub.group(0)
        onclick_pub = re.search(r'onClick=\{([^}]+)\}', orig_pub)
        action_pub = f'onClick={{{onclick_pub.group(1)}}}' if onclick_pub else 'onClick={() => {}}'
        
        # استخراج النص المطلوب عرضه (مثلاً: نشر وظيفة / إضافة عقار / إضافة مزاد)
        label = "نشر وظيفة"
        for l in ["نشر وظيفة", "إضافة عقار", "نشر عقار", "إضافة مزاد", "نشر مزاد"]:
            if l in orig_pub:
                label = l
                break

        formatted_pub_btn = f'''<button
          {action_pub}
          className="h-10 px-3.5 rounded-xl bg-[#FFC500] hover:bg-[#e5b200] text-black font-black text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
        >
          <Plus size={16} className="stroke-[3]" />
          <span>{label}</span>
        </button>'''
        content = content[:m_pub.start()] + formatted_pub_btn + content[m_pub.end():]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ تم بنجاح تعديل وتنسيق: {filepath}")

