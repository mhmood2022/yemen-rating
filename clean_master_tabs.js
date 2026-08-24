import fs from 'fs';

function cleanHtml(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. مسح جميع سكريبتات الإصلاحات السابقة المكررة والمتضاربة
  html = html.replace(/<script>[\s\S]*?switchTab[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script>[\s\S]*?showTab[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script>[\s\S]*?forceSwitchTab[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script>[\s\S]*?navigateTab[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<!-- fixPricesScriptApplied -->[\s\S]*?<!-- headerFixScriptApplied -->/gi, '');
  html = html.replace(/<!-- tabClickFixScriptApplied -->/gi, '');

  // 2. كود التنقل الموحد والصارم الخالي من أي أخطاء
  const cleanTabSystem = `
<script id="unified-tab-system">
window.appGoToTab = function(tabId, evt) {
  if (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  const validTabs = ['app-tab-home', 'app-tab-prices', 'app-tab-trend', 'app-tab-more'];

  validTabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === tabId) {
        el.style.setProperty('display', 'block', 'important');
      } else {
        el.style.setProperty('display', 'none', 'important');
      }
    }
  });

  window.scrollTo(0, 0);
  return false;
};

document.addEventListener('DOMContentLoaded', function() {
  // ربط الأزرار بحسب ترتيبها في الشريط السفلي
  const navItems = document.querySelectorAll('.bottom-nav-item');
  if (navItems.length >= 5) {
    navItems[0].onclick = (e) => appGoToTab('app-tab-home', e);
    navItems[1].onclick = (e) => appGoToTab('app-tab-prices', e);
    navItems[3].onclick = (e) => appGoToTab('app-tab-trend', e);
    navItems[4].onclick = (e) => appGoToTab('app-tab-more', e);
  }

  // تفعيل الرئيسية افتراضياً
  appGoToTab('app-tab-home');
});
</script>
`;

  html = html.replace('</body>', `${cleanTabSystem}\n</body>`);
  fs.writeFileSync(filePath, html);
  console.log(`✅ Cleaned and applied unified tab system to: ${filePath}`);
}

cleanHtml('index.html');
cleanHtml('public/index.html');
