#!/bin/bash
# toggle-eruda.sh — تشغيل/إيقاف Eruda (نسخة موثوقة)

FILES=(index.html public/index.html)

SNIPPET='<script>(function(){var src="https://cdn.jsdelivr.net/npm/eruda";if(!/eruda=true/.test(window.location))return;document.write("<scr"+"ipt src=\"" + src + "\"></scr"+"ipt>");document.write("<scr"+"ipt>eruda.init();</scr"+"ipt>");})();</script>'

if [ "$1" == "on" ]; then
    for f in "${FILES[@]}"; do
        if [ -f "$f" ]; then
            # احذف أي سطر فيه eruda
            grep -v "eruda" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
            # أضف السكربت قبل </body> باستخدام perl
            perl -0pi -e "s|</body>|$SNIPPET\n</body>|" "$f"
            # إن لم يوجد </body>، أضف السكربت في نهاية الملف
            if ! grep -q "eruda" "$f"; then
                printf '\n%s\n' "$SNIPPET" >> "$f"
            fi
        fi
    done
    echo "✅ Eruda مفعّل في: ${FILES[*]}"
    echo "📱 افتح: http://localhost:5174/?eruda=true"
    echo "📱 أو:   http://localhost:5174/admin/community?eruda=true"
elif [ "$1" == "off" ]; then
    for f in "${FILES[@]}"; do
        if [ -f "$f" ]; then
            grep -v "eruda" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
        fi
    done
    echo "✅ Eruda مخفي من: ${FILES[*]}"
else
    echo "الاستخدام:"
    echo "  ./toggle-eruda.sh on    ← تفعيل Eruda"
    echo "  ./toggle-eruda.sh off   ← إخفاء Eruda"
fi
