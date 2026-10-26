#!/bin/bash
echo "=== 1. مربع الكتابة في CommunityFeedPage.tsx ==="
grep -n -C 5 "clean-tweet-textarea" src/pages/CommunityFeedPage.tsx

echo -e "\n=== 2. مربع الكتابة في AccountPage.tsx ==="
grep -n -C 5 "clean-tweet-textarea" src/pages/AccountPage.tsx
