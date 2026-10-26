#!/bin/bash

echo "=========================================="
echo " 🔍 1. ملفات الحساب والمجتمع الموجودة داخل pages:"
echo "=========================================="
ls -la src/pages/ | grep -E -i "account|feed|profile|community"

echo -e "\n=========================================="
echo " 🔍 2. البحث عن كود نشر التغريدة داخل صفحة الحساب:"
echo "=========================================="
account_file=$(find src/pages/ -iname "*account*.tsx" -not -name "*.bak*" | head -n 1)
if [ -n "$account_file" ]; then
    echo "الملف الذي تم العثور عليه: $account_file"
    grep -n -C 4 -E "(handlePost|selectedFile|insert|posts|social-media)" "$account_file" | head -n 35
else
    echo "لم يتم العثور على ملف باسم account داخل pages."
fi

echo -e "\n=========================================="
echo " 🔍 3. هل صفحة الحساب تستدعي Feed أو تنشر بنفسها؟"
echo "=========================================="
if [ -n "$account_file" ]; then
    grep -n -E "(CommunityFeed|TweetCard|<Feed)" "$account_file"
fi
