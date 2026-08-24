import fs from 'fs';

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // مسح جميع السكريبتات والتنسيقات الطارئة التي أُضيفت مؤخراً
  html = html.replace(/<script id="global-interactivity-fix">[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script id="master-control-script">[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script id="ultimate-nav-engine">[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script id="sidebar-close-fix">[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script id="native-emergency-fix">[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style id="tab-isolation-styles">[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<style id="clean-duplicate-nav-css">[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<style id="unblock-screen-css">[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<style id="force-touch-interactivity">[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<style id="kill-glass-wall-css">[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<style id="fix-black-screen-css">[\s\S]*?<\/style>/gi, '');

  fs.writeFileSync(filePath, html);
  console.log(`🧹 Cleaned file successfully: ${filePath}`);
}

cleanFile('index.html');
cleanFile('public/index.html');
