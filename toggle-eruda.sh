#!/bin/bash
# toggle-eruda.sh — تشغيل/إيقاف Eruda

if [ "$1" == "on" ]; then
    # حذف أي eruda قديم
    sed -i '/eruda/d' index.html
    # إضافة السكربت قبل </body>
    sed -i 's|</body>|<script>(function(){var src="https://cdn.jsdelivr.net/npm/eruda";if(!/eruda=true/.test(window.location))return;document.write("<scr"+"ipt src=\\"" + src + "\\"></scr"+"ipt>");document.write("<scr"+"ipt>eruda.init();</scr"+"ipt>");})();</script>\n</body>|' index.html
    echo "✅ Eruda مفعّل"
    echo "📱 افتح: http://localhost:5174/admin/community?eruda=true"
elif [ "$1" == "off" ]; then
    sed -i '/eruda/d' index.html
    echo "✅ Eruda مخفي"
    echo "📱 افتح: http://localhost:5174/admin/community"
else
    echo "الاستخدام:"
    echo "  ./toggle-eruda.sh on    ← تفعيل Eruda"
    echo "  ./toggle-eruda.sh off   ← إخفاء Eruda"
fi
