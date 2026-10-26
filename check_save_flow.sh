#!/bin/bash
file="src/pages/CommunityFeedPage.tsx"

echo "=========================================="
echo " 🔍 فحص كود رفع وحفظ الصورة (السطور 610 إلى 670)"
echo "=========================================="
sed -n '610,670p' "$file"

echo -e "\n=========================================="
echo " 🔍 فحص حالة الـ state للصورة في المكون"
echo "=========================================="
grep -n -C 2 -E "(selectedFile|finalImageUrl|imagePreview|setSelectedFile)" "$file" | head -n 25
