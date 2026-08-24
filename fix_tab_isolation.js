import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. إضافة تنسيق CSS صارم لإخفاء التبويبات غير النشطة
const strictTabStyle = `
<style id="tab-strict-isolation-style">
  /* إخفاء كافة التبويبات افتراضياً */
  #app-tab-home, #app-tab-prices, #app-tab-trend, #app-tab-more {
    display: none !important;
  }
  /* إظهار التبويب النشط فقط */
  #app-tab-home.active-tab, #app-tab-prices.active-tab, #app-tab-trend.active-tab, #app-tab-more.active-tab {
    display: block !important;
  }
</style>
`;

// 2. دالة التبديل الصحيحة والمطابقة للـ IDs الفعلية
const tabControllerScript = `
<script>
function switchAppTab(tabId) {
  // قائمة التبويبات المعتمدة
  const tabs = ['app-tab-home', 'app-tab-prices', 'app-tab-trend', 'app-tab-more'];
  
  // إخفاء الجميع وإزالة الكلاس Active
  tabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.setProperty('display', 'none', 'important');
      el.classList.remove('active-tab');
    }
  });

  // إظهار التبويب المستهدف فقط
  const target = document.getElementById(tabId);
  if (target) {
    target.style.setProperty('display', 'block', 'important');
    target.classList.add('active-tab');
  }

  // التمرير إلى أعلى الشاشة عند التبديل
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// تشغيل التبويب الافتراضي (الرئيسية) فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  switchAppTab('app-tab-home');
  
  // ربط الأزرار السفلي بالدالة الجديدة
  const navHome = document.querySelector('[onclick*="home"]') || document.querySelectorAll('.bottom-nav-item')[0];
  const navPrices = document.querySelector('[onclick*="price"]') || document.querySelectorAll('.bottom-nav-item')[1];
  const navTrend = document.querySelector('[onclick*="trend"]') || document.querySelectorAll('.bottom-nav-item')[3];
  const navMore = document.querySelector('[onclick*="more"]') || document.querySelectorAll('.bottom-nav-item')[4];

  if (navHome) navHome.setAttribute('onclick', "switchAppTab('app-tab-home')");
  if (navPrices) navPrices.setAttribute('onclick', "switchAppTab('app-tab-prices')");
  if (navTrend) navTrend.setAttribute('onclick', "switchAppTab('app-tab-trend')");
  if (navMore) navMore.setAttribute('onclick', "switchAppTab('app-tab-more')");
});
</script>
`;

// إدراج التعديلات في ملف HTML
if (!html.includes('tab-strict-isolation-style')) {
  html = html.replace('</head>', `${strictTabStyle}\n</head>`);
}
if (!html.includes('function switchAppTab')) {
  html = html.replace('</body>', `${tabControllerScript}\n</body>`);
}

fs.writeFileSync('index.html', html);
console.log('✅ Tab isolation successfully applied using actual IDs!');
