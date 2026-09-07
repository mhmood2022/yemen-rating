const fs = require('fs');

const path = 'src/components/admin/AdminSidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// استبدال ترويسة الاستيرادات بالكامل بفواصل صحيحة ومضبوطة
content = content.replace(
  /^[\s\S]*?from\s*['"]lucide-react['"];/m,
`import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import {
  LayoutDashboard,
  FolderTree,
  ShieldCheck,
  Store,
  Gavel,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  Building2,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';`
);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ تم وضع الفواصل والاستيرادات بشكل صحيح وسليم.');
