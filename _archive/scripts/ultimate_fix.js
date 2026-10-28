import fs from 'fs';

function applyUltimateFix(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. تنظيف أي سكريبتات تنقل سابقة
  html = html.replace(/<script id="master-control-script">[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script id="unified-tab-system">[\s\S]*?<\/script>/gi, '');

  // 2. كود المحرك الرئيسي المباشر للتنقل في الهيدر والأسفل
  const ultimateEngine = `
<script id="ultimate-nav-engine">
(function() {
  window.switchAppTab = function(tabId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // الأقسام الأربعة الأساسية
    const tabs = ['app-tab-home', 'app-tab-prices', 'app-tab-trend', 'app-tab-more'];
    
    tabs.forEach(function(id) {
      const el = document.getElementById(id);
      if (el) {
        if (id === tabId) {
          el.style.setProperty('display', 'block', 'important');
          el.style.setProperty('visibility', 'visible', 'important');
          el.style.setProperty('opacity', '1', 'important');
        } else {
          el.style.setProperty('display', 'none', 'important');
        }
      }
    });

    window.scrollTo(0, 0);
    return false;
  };

  // ربط عام لكافة عناصر التنقل في الشاشة
  document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-tab], .bottom-nav-item, .header-menu-btn, .fa-bell');
    if (!target) return;

    // زر الجرس
    if (target.classList.contains('fa-bell') || target.classList.contains('notification-btn')) {
      const modal = document.getElementById('modal-notifications-center');
      if (modal) modal.style.setProperty('display', 'flex', 'important');
      return;
    }

    // زر قائمة الهيدر
    if (target.classList.contains('header-menu-btn') || target.matches('header .fa-bars')) {
      window.switchAppTab('app-tab-more', e);
      return;
    }

    // الأزرار السفلية بحسب النمط
    const text = target.textContent.trim();
    if (text.includes('الرئيسية')) window.switchAppTab('app-tab-home', e);
    else if (text.includes('الأسعار')) window.switchAppTab('app-tab-prices', e);
    else if (text.includes('الترند')) window.switchAppTab('app-tab-trend', e);
    else if (text.includes('المزيد')) window.switchAppTab('app-tab-more', e);
  }, true);
})();
</script>
`;

  if (!html.includes('ultimate-nav-engine')) {
    html = html.replace('</body>', `${ultimateEngine}\n</body>`);
  }

  fs.writeFileSync(filePath, html);
  console.log(`✅ Applied Ultimate Fix to: ${filePath}`);
}

applyUltimateFix('index.html');
applyUltimateFix('public/index.html');
