#!/bin/bash
clear
echo -e "\033[1;33m=================================================================\033[0m"
echo -e "\033[1;33m      🔍 التدقيق الإلزامي للوحة الإدارة فقط (Admin Dashboard Audit) \033[0m"
echo -e "\033[1;33m=================================================================\033[0m"
echo ""

echo -e "\033[1;36m[1] فحص ملفات وحدات الإدارة في (src/pages/admin/):\033[0m"
for dir in src/pages/admin/*; do
  if [ -d "$dir" ]; then
    count=$(find "$dir" -maxdepth 2 -name "*.tsx" -o -name "*.ts" | wc -l)
    files=$(find "$dir" -maxdepth 2 -name "*.tsx" -o -name "*.ts" -exec basename {} \; | tr '\n' ', ')
    if [ $count -gt 0 ]; then
      echo -e "  ✅ $(basename "$dir"): ($count ملف) ──> [ ${files%, } ]"
    else
      echo -e "  ❌ $(basename "$dir"): (فارغ - لم يُبنَ بعد)"
    fi
  fi
done

echo ""
echo -e "\033[1;36m[2] فحص مكونات الإدارة التفاعلية (src/components/admin/):\033[0m"
for file in src/components/admin/*.tsx; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    echo -e "  📄 $(basename "$file") ──> ($lines سطر)"
  fi
done

echo ""
echo -e "\033[1;36m[3] فحص ملفات الهيكل والتوجيه الإداري:\033[0m"
[ -f "src/pages/admin/AdminMaster.tsx" ] && echo -e "  ✅ AdminMaster.tsx موجود ($(wc -l < src/pages/admin/AdminMaster.tsx) سطر)" || echo -e "  ❌ AdminMaster.tsx مفقود"
[ -f "src/pages/admin/AdminDashboardOverview.tsx" ] && echo -e "  ✅ AdminDashboardOverview.tsx موجود ($(wc -l < src/pages/admin/AdminDashboardOverview.tsx) سطر)" || echo -e "  ❌ AdminDashboardOverview.tsx مفقود"
[ -f "src/layouts/AdminLayout.tsx" ] && echo -e "  ✅ AdminLayout.tsx موجود ($(wc -l < src/layouts/AdminLayout.tsx) سطر)" || echo -e "  ❌ AdminLayout.tsx مفقود"

echo ""
echo -e "\033[1;33m=================================================================\033[0m"
