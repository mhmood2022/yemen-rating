import fs from 'fs';

function restoreAndFix(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. تنظيف السكريبت المسبب للمشكلة
  html = html.replace(/<script id="global-interactivity-fix">[\s\S]*?<\/script>/gi, '');

  // 2. كود نظيف وشامل لإدارة كافة الأزرار
  const masterControlScript = `
<script id="master-control-script">
function switchTabDirect(tabId) {
  const tabs = ['app-tab-home', 'app-tab-prices', 'app-tab-trend', 'app-tab-more'];
  tabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.setProperty('display', id === tabId ? 'block' : 'none', 'important');
    }
  });
  window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', function() {
  // تفعيل الرئيسية أولاً
  switchTabDirect('app-tab-home');

  // ربط الأزرار السفلية صراحة
  const navItems = document.querySelectorAll('.bottom-nav-item');
  if (navItems.length >= 5) {
    navItems[0].onclick = function(e) { e.preventDefault(); switchTabDirect('app-tab-home'); };
    navItems[1].onclick = function(e) { e.preventDefault(); switchTabDirect('app-tab-prices'); };
    navItems[3].onclick = function(e) { e.preventDefault(); switchTabDirect('app-tab-trend'); };
    navItems[4].onclick = function(e) { e.preventDefault(); switchTabDirect('app-tab-more'); };
  }

  // ربط أزرار الهيدر العلوية
  const headerMenuBtn = document.querySelector('.header-menu-btn, header .fa-bars');
  if (headerMenuBtn) {
    headerMenuBtn.onclick = function(e) { e.preventDefault(); switchTabDirect('app-tab-more'); };
  }

  // ربط أيقونة الجرس
  const bellBtn = document.querySelector('.fa-bell, .notification-btn');
  if (bellBtn) {
    bellBtn.onclick = function(e) {
      e.preventDefault();
      const modal = document.getElementById('modal-notifications-center');
      if (modal) modal.style.setProperty('display', 'flex', 'important');
    };
  }
});
</script>
`;

  if (!html.includes('master-control-script')) {
    html = html.replace('</body>', `${masterControlScript}\n</body>`);
  }
  
  fs.writeFileSync(filePath, html);
  console.log(`✅ Fully restored functionality for: ${filePath}`);
}

restoreAndFix('index.html');
restoreAndFix('public/index.html');
