const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminSidebar.tsx', 'utf8');

// 1. إزالة Star من سطر react-router-dom
code = code.replace(/import\s*\{\s*Star,\s*/g, 'import { ');

// 2. إضافة Star إلى مكتبة lucide-react بشكل سليم
if (!code.includes('Star,') && !code.includes('Star }')) {
  code = code.replace(/from\s*['"]lucide-react['"];/, ", Star } from 'lucide-react';");
  code = code.replace(/\},\s*Star\s*\}\s*from\s*['"]lucide-react['"];/, ", Star } from 'lucide-react';");
}

fs.writeFileSync('src/components/admin/AdminSidebar.tsx', code, 'utf8');
console.log('✅ تم تصحيح استيراد أيقونة Star ونقلها إلى lucide-react بنجاح.');
