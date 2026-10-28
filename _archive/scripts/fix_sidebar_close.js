import fs from 'fs';

function applySidebarFix(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  const sidebarFixScript = `
<script id="sidebar-close-fix">
window.closeAppSidebar = function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // إخفاء تبويب المزيد أو القائمة الجانبية
  const moreTab = document.getElementById('app-tab-more');
  if (moreTab) {
    moreTab.style.setProperty('display', 'none', 'important');
  }

  // إعادة إظهار تبويب الرئيسية افتراضياً
  const homeTab = document.getElementById('app-tab-home');
  if (homeTab) {
    homeTab.style.setProperty('display', 'block', 'important');
  }

  // إغلاق أي نافذة أو عنصر يحمل كلاس الجانبية أو المودال
  const sidebars = document.querySelectorAll('.sidebar, .menu-drawer, .offcanvas, .modal');
  sidebars.forEach(el => {
    el.classList.remove('active', 'open', 'show');
    el.style.setProperty('display', 'none', 'important');
  });

  window.scrollTo(0, 0);
  return false;
};

document.addEventListener('DOMContentLoaded', function() {
  // ربط أزرار الإغلاق داخل القائمة الجانبية (مثل زر X أو العودة)
  const closeBtns = document.querySelectorAll('.sidebar-close, .close-menu, [onclick*="close"], .fa-times, .back-btn');
  closeBtns.forEach(btn => {
    btn.onclick = function(e) {
      window.closeAppSidebar(e);
    };
  });
});
</script>
`;

  if (!html.includes('sidebar-close-fix')) {
    html = html.replace('</body>', `${sidebarFixScript}\n</body>`);
  }

  fs.writeFileSync(filePath, html);
  console.log(`✅ Fixed sidebar close logic on: ${filePath}`);
}

applySidebarFix('index.html');
applySidebarFix('public/index.html');
