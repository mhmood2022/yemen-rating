import fs from 'fs';

let htmlContent = fs.readFileSync('index.html', 'utf8');

// إضافة تنسيق لإخفاء قسم المزيد واقتطاعه ليكون تبويباً منفصلاً
const tabFixStyle = `
<style>
/* إخفاء قسم المزيد من التمرير العادي في الرئيسية */
#more-tab, .more-tab-page, #moreMenu {
  display: none;
}

/* إظهاره فقط عندما يكون التبويب النشط هو المزيد */
#more-tab.active-tab, .more-tab-page.active-tab, #moreMenu.active {
  display: block !important;
}
</style>
`;

// دالة إدارة التبويبات للتأكد من الفصل التام بين الرئيسية والمزيد
const tabScript = `
<script>
function switchTab(tabName) {
  // إخفاء جميع التبويبات
  const tabs = document.querySelectorAll('.tab-content, .page-section, #home-tab, #more-tab');
  tabs.forEach(tab => tab.style.display = 'none');

  // إزالة التنشيط عن الأزرار
  document.querySelectorAll('.bottom-nav-item').forEach(btn => btn.classList.remove('active'));

  // إظهار التبويب المطلوب فقط
  if (tabName === 'home') {
    const homeEl = document.getElementById('home-tab') || document.querySelector('.main-content');
    if (homeEl) homeEl.style.display = 'block';
    window.scrollTo(0, 0);
  } else if (tabName === 'more') {
    const moreEl = document.getElementById('more-tab') || document.getElementById('moreMenu');
    if (moreEl) moreEl.style.display = 'block';
    window.scrollTo(0, 0);
  }
}
</script>
`;

if (!htmlContent.includes('switchTab(tabName)')) {
  htmlContent = htmlContent.replace('</head>', `${tabFixStyle}\n</head>`);
  htmlContent = htmlContent.replace('</body>', `${tabScript}\n</body>`);
}

fs.writeFileSync('index.html', htmlContent);
console.log('✅ More tab completely isolated from homepage stream.');
