import fs from 'fs';

function fixBlackScreen(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  const fixBlackCSS = `
<style id="fix-black-screen-css">
  /* 1. إلغاء الخلفيات السوداء المصمتة التي تحجب المحتوى */
  #app-tab-home, #app-tab-prices, #app-tab-trend, #app-tab-more,
  .tab-content, .page-tab {
    background-color: transparent !important;
    color: #ffffff !important;
    min-height: 100vh;
  }

  /* 2. ضمان إظهار المحتوى والبطاقات داخل التبويبات عند تفعيلها */
  #app-tab-home > *, #app-tab-prices > *, #app-tab-trend > *, #app-tab-more > * {
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* 3. إخفاء أي غطاء أسود أو خلفية معتمة معلقة */
  .modal-backdrop, .sidebar-backdrop, .dark-overlay {
    display: none !important;
  }
</style>
`;

  if (!html.includes('fix-black-screen-css')) {
    html = html.replace('</head>', `${fixBlackCSS}\n</head>`);
  }

  fs.writeFileSync(filePath, html);
  console.log(`✅ Fixed black screen issue on: ${filePath}`);
}

fixBlackScreen('index.html');
fixBlackScreen('public/index.html');
