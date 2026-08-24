import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. تنظيف التنسيقات القديمة التي تسببت بالسواد
html = html.replace(/<style id="tab-strict-isolation-style">[\s\S]*?<\/style>/g, '');
html = html.replace(/<script>[\s\S]*?switchAppTab[\s\S]*?<\/script>/g, '');

// 2. كود مبسط للتحكم بالتبويبات دون تعطيل الشاشة الرئيسية
const cleanTabScript = `
<script>
function showTab(tabId) {
  const tabs = ['app-tab-home', 'app-tab-prices', 'app-tab-trend', 'app-tab-more'];
  
  tabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === tabId) {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    }
  });
  window.scrollTo(0, 0);
}

// تشغيل الرئيسية تلقائياً بعد إتمام تحميل الصفحة
window.addEventListener('load', function() {
  showTab('app-tab-home');
});
</script>
`;

html = html.replace('</body>', `${cleanTabScript}\n</body>`);

fs.writeFileSync('index.html', html);
console.log('✅ Restored layout and applied clean tab control.');
