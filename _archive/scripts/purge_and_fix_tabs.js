import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const masterTabOverrideScript = `
<script>
(function() {
  // دالة موحدة ومعزولة للتبديل بين التبويبات بدون أي تأثيرات جانبية
  window.navigateTab = function(tabId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const allTabs = ['app-tab-home', 'app-tab-prices', 'app-tab-trend', 'app-tab-more'];
    
    // إخفاء كل التبويبات
    allTabs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.setProperty('display', 'none', 'important');
      }
    });

    // إظهار التبويب المطلوب فقط
    const target = document.getElementById(tabId);
    if (target) {
      target.style.setProperty('display', 'block', 'important');
    }

    // التمرير للأعلى
    window.scrollTo(0, 0);
    return false;
  };

  // ربط أزرار الشريط السفلي بالدالة الجديدة فور تحميل الصفحة
  window.addEventListener('load', function() {
    // إلغاء أي أحداث نقر عشوائية مسجلة على صفحة الأسعار أو الترند
    ['app-tab-prices', 'app-tab-trend', 'app-tab-more'].forEach(tabId => {
      const tabEl = document.getElementById(tabId);
      if (tabEl) {
        tabEl.onclick = function(e) {
          e.stopPropagation();
        };
      }
    });

    // إعادة ضبط الأزرار
    const navItems = document.querySelectorAll('.bottom-nav-item');
    if (navItems.length >= 5) {
      navItems[0].setAttribute('onclick', "return navigateTab('app-tab-home', event)");
      navItems[1].setAttribute('onclick', "return navigateTab('app-tab-prices', event)");
      navItems[3].setAttribute('onclick', "return navigateTab('app-tab-trend', event)");
      navItems[4].setAttribute('onclick', "return navigateTab('app-tab-more', event)");
    }
  });
})();
</script>
`;

// إدراج الكود في نهاية الملف
html = html.replace('</body>', `${masterTabOverrideScript}\n</body>`);

fs.writeFileSync('index.html', html);
console.log('✅ Master tab isolation and event override applied successfully!');
