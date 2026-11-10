#!/bin/bash

echo "=========================================="
echo " 🔍 1. فحص عداد الحروف في CommunityFeedPage.tsx:"
echo "=========================================="
grep -n -C 5 -E "(280|length|charCount|حرف)" src/pages/CommunityFeedPage.tsx | grep -E "(length|280|char|textarea)" | head -n 20

echo -e "\n=========================================="
echo " 🔍 2. فحص عداد الحروف في AccountPage.tsx:"
echo "=========================================="
grep -n -C 5 -E "(280|length|charCount|حرف)" src/pages/AccountPage.tsx | grep -E "(length|280|char|textarea)" | head -n 20
