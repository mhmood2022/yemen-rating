import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const headerFixScript = `
<script>
document.addEventListener('DOMContentLoaded', function() {
  // 1. ربط زر قائمة الهيدر العلوي (أيقونة القائمة الجانبية)
  const topMenuBtns = document.querySelectorAll('.header-menu-btn, header .fa-bars, header [class*="menu"]');
  topMenuBtns.forEach(btn => {
    const parentBtn = btn.closest('button') || btn.closest('a') || btn;
    parentBtn.setAttribute('onclick', "if(window.forceSwitchTab) { forceSwitchTab('app-tab-more'); } else { showTab('app-tab-more'); } event.preventDefault();");
    parentBtn.style.cursor = 'pointer';
  });

  // 2. ربط زر "الرئيسية ←" الموجود في رأس قائمة المزيد
  const allLinks = document.querySelectorAll('a, button, span, div');
  allLinks.forEach(el => {
    if (el.textContent.includes('الرئيسية') && (el.textContent.includes('←') || el.classList.contains('back-btn'))) {
      el.setAttribute('onclick', "if(window.forceSwitchTab) { forceSwitchTab('app-tab-home'); } else { showTab('app-tab-home'); } event.preventDefault();");
      el.style.cursor = 'pointer';
    }
  });
});
</script>
`;

if (!html.includes('headerFixScriptApplied')) {
  html = html.replace('</body>', `<!-- headerFixScriptApplied -->\n${headerFixScript}\n</body>`);
}

fs.writeFileSync('index.html', html);
console.log('✅ Top header menu and "Back to Home" button successfully fixed.');
