import fs from 'fs';

function restoreSidebar(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. تنظيف كافة تنسيقات العزل السابقة
  html = html.replace(/<style id="isolate-scroll-css">[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<style id="clean-layout-engine-css">[\s\S]*?<\/style>/gi, '');

  // 2. إعادة القائمة الجانبية والإعلانات لتكون طبقة جانبية مخفية تظهر فوق الشاشة فقط عند الاستدعاء
  const sidebarRestoreCSS = `
<style id="restore-sidebar-original-css">
  /* إعادة تثبيت القائمة الجانبية كشريط جانبي خارج تدفق الصفحة */
  .sidebar, .menu-drawer, .offcanvas, #app-tab-more {
    position: fixed !important;
    top: 0 !important;
    right: -100% !important; /* مخفية خارج الشاشة يميناً */
    width: 280px !important;
    max-width: 80vw !important;
    height: 100vh !important;
    z-index: 999999 !important;
    transition: right 0.3s ease !important;
    display: block !important;
    box-shadow: -5px 0 15px rgba(0,0,0,0.5) !important;
  }

  /* عند تفعيل القائمة تظهر فوق الصفحة بسلاسة دون أن تنزل للأسفل */
  .sidebar.active, .menu-drawer.active, .offcanvas.active, #app-tab-more.active {
    right: 0 !important;
  }

  /* إعادة الصفحة الرئيسية لتدفقها الطبيعي السلس */
  #app-tab-home {
    display: block !important;
    width: 100% !important;
  }
</style>
`;

  if (!html.includes('restore-sidebar-original-css')) {
    html = html.replace('</head>', `${sidebarRestoreCSS}\n</head>`);
  }

  fs.writeFileSync(filePath, html);
  console.log(`✅ Restored original fixed sidebar overlay for: ${filePath}`);
}

restoreSidebar('index.html');
restoreSidebar('public/index.html');
