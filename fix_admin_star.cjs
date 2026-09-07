const fs = require('fs');

const path = 'src/components/admin/AdminSidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. تنظيف سطر react-router-dom من أي وجود لـ Star
content = content.replace(/import\s*\{[^}]*Star[^}]*\}\s*from\s*['"]react-router-dom['"];?/g, "import { NavLink, useLocation } from 'react-router-dom';");

// 2. إدخال Star بشكل نظيف ومؤكد داخل استيراد lucide-react
if (!content.includes('  Star,') && !content.includes(', Star') && !content.includes('Star }')) {
  content = content.replace(
    /(import\s*\{[\s\S]*?)(}\s*from\s*['"]lucide-react['"];?)/,
    (match, p1, p2) => p1 + '  Star,\n' + p2
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('✅ تم تصحيح استيراد Star ونقلها إلى lucide-react بشكل دقيق ومضمون.');
