import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// إضافة سكريبت موحد ودقيق لإدارة التبويبات
const tabControllerScript = `
<script>
document.addEventListener('DOMContentLoaded', function() {
  // ربط أزرار التنقل السفلي بالتغيير بين التبويبات
  const navItems = document.querySelectorAll('.bottom-nav-item, [data-tab]');
  
  window.switchTab = function(tabId) {
    // 1. إخفاء كافة الأقسام الرئيسية
    const sections = document.querySelectorAll('main > section, .tab-page, #home-page, #rates-page, #more-page, #trend-page');
    sections.forEach(sec => {
      sec.style.display = 'none';
      sec.classList.remove('active-tab');
    });

    // 2. إظهار القسم المطلوب فقط
    const targetSection = document.getElementById(tabId) || document.querySelector('.' + tabId + '-section');
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.classList.add('active-tab');
    }

    // 3. تحديث الزر النشط في الشريط السفلي
    document.querySelectorAll('.bottom-nav-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(\`[onclick*="\${tabId}"]\`);
    if (activeBtn) activeBtn.classList.add('active');

    // الصعود لأعلى الصفحة
    window.scrollTo(0, 0);
  };

  // تفعيل التبويب الافتراضي (الرئيسية) عند فتح الموقع
  switchTab('home-page');
});
</script>
`;

// إدراج السكريبت قبل إغلاق body
if (!html.includes('window.switchTab = function')) {
  html = html.replace('</body>', `${tabControllerScript}\n</body>`);
}

fs.writeFileSync('index.html', html);
console.log('✅ Tabs controller script injected and activated.');
