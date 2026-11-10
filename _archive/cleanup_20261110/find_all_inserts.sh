#!/bin/bash
echo "=========================================="
echo " 🔍 البحث عن كل الأماكن التي تنشر في جدول posts في المشروع كله:"
echo "=========================================="
grep -rn -C 2 -E "from\('posts'\)\.insert" --exclude-dir={node_modules,.git,.next,build,dist} src/

echo -e "\n=========================================="
echo " 🔍 فحص دالة showToast (كيف تعمل وكم مدتها؟):"
echo "=========================================="
grep -n -C 5 -E "const showToast" src/pages/CommunityFeedPage.tsx
