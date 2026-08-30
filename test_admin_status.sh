#!/bin/bash
clear
echo -e "\033[1;33m====================================================\033[0m"
echo -e "\033[1;33m    🔍 فحص حالة لوحة الإدارة - Yemen Rating Admin     \033[0m"
echo -e "\033[1;33m====================================================\033[0m"
echo ""

# 1. فحص مجلدات الإدارة
echo -e "\033[1;36m[1] فحص ملفات ومجلدات الإدارة:\033[0m"
if [ -d "src/pages/admin" ]; then
    echo -e "  ✅ مجلد الصفحات: src/pages/admin موجود"
    ls -lh src/pages/admin | awk '{if (NR>1) print "     └── " $9 " (" $5 ")"}'
else
    echo -e "  ❌ مجلد src/pages/admin غير موجود"
fi

echo ""
if [ -d "src/components/admin" ]; then
    echo -e "  ✅ مجلد المكونات: src/components/admin موجود"
    ls -lh src/components/admin | awk '{if (NR>1) print "     └── " $9 " (" $5 ")"}'
else
    echo -e "  ⚠️ مجلد src/components/admin فارغ أو غير موجود"
fi

# 2. فحص الهيكل الأساسي للوحة التحكم
echo ""
echo -e "\033[1;36m[2] فحص الهيكل الأساسي (Shell & Layout):\033[0m"
[ -f "src/pages/AdminDashboardShell.tsx" ] && echo -e "  ✅ src/pages/AdminDashboardShell.tsx موجود ($(wc -l < src/pages/AdminDashboardShell.tsx) سطر)" || echo -e "  ❌ src/pages/AdminDashboardShell.tsx مفقود"
[ -f "src/layouts/AdminLayout.tsx" ] && echo -e "  ✅ src/layouts/AdminLayout.tsx موجود ($(wc -l < src/layouts/AdminLayout.tsx) سطر)" || echo -e "  ❌ src/layouts/AdminLayout.tsx مفقود"

# 3. فحص شاشات الإدارة المحددة
echo ""
echo -e "\033[1;36m[3] فحص شاشات الإدارة المحددة:\033[0m"
[ -f "src/pages/admin/AdminCategoriesView.tsx" ] && echo -e "  ✅ شاشة إدارة التصنيفات (AdminCategoriesView): جاهزة ($(wc -l < src/pages/admin/AdminCategoriesView.tsx) سطر)" || echo -e "  ❌ شاشة إدارة التصنيفات (AdminCategoriesView): غير موجودة"
[ -f "src/pages/admin/AdminAdsView.tsx" ] && echo -e "  ✅ شاشة إدارة الإعلانات (AdminAdsView): جاهزة ($(wc -l < src/pages/admin/AdminAdsView.tsx) سطر)" || echo -e "  ❌ شاشة إدارة الإعلانات (AdminAdsView): غير موجودة"
[ -f "src/pages/admin/AdminAuditLogsView.tsx" ] && echo -e "  ✅ شاشة سجل التدقيق (AdminAuditLogsView): جاهزة ($(wc -l < src/pages/admin/AdminAuditLogsView.tsx) سطر)" || echo -e "  ❌ شاشة سجل التدقيق (AdminAuditLogsView): غير موجودة"

# 4. فحص ربط لوحة الإدارة في App.tsx
echo ""
echo -e "\033[1;36m[4] فحص ربط لوحة التحكم بالتطبيق العام (App.tsx):\033[0m"
if grep -q "Admin" src/App.tsx; then
    echo -e "  ✅ لوحة الإدارة مربوطة في src/App.tsx:"
    grep -n "Admin" src/App.tsx | sed 's/^/     └── /'
else
    echo -e "  ⚠️ لوحة الإدارة ليست مربوطة بعد في src/App.tsx (تحتاج إضافة زر وصول وتبويب admin)"
fi

echo ""
echo -e "\033[1;33m====================================================\033[0m"
echo -e "\033[1;32m       انتهى الفحص بنجاح - انسخ التقرير هنا       \033[0m"
echo -e "\033[1;33m====================================================\033[0m"
