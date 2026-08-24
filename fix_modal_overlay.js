import fs from 'fs';

let htmlContent = fs.readFileSync('index.html', 'utf8');

// إضافة تنسيق CSS لمنع سحب الصفحة الخلفية وجعل القائمة ثابتة بالكامل
const overlayStyle = `
<style>
/* تثبيت القائمة الجانبية كشاشة مستقلة كاملة */
.more-menu-modal, #moreMenu, [id*="more-menu"] {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: #0D0D0D !important;
  z-index: 99999 !important;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch !important;
}

/* منع سحب الصفحة الرئيسية أثناء فتح القائمة */
body.menu-open {
  overflow: hidden !important;
  height: 100vh !important;
}
</style>
`;

if (!htmlContent.includes('body.menu-open')) {
  htmlContent = htmlContent.replace('</head>', `${overlayStyle}\n</head>`);
}

fs.writeFileSync('index.html', htmlContent);
console.log('✅ Modal overlay and background scrolling fixed successfully.');
