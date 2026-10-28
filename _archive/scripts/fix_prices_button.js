import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// إضافة سكريبت يضمن ربط زر الأسعار وزر الرئيسية بالتبويبات الصحيحة
const fixPricesScript = `
<script>
document.addEventListener('DOMContentLoaded', function() {
  // البحث عن كافة أزرار الأسعار في الشريط السفلي أو القوائم
  const allNavBtns = document.querySelectorAll('.bottom-nav-item, nav a, button');
  
  allNavBtns.forEach(btn => {
    const text = btn.textContent.trim();
    if (text.includes('الأسعار') || text.includes('أسعار')) {
      btn.setAttribute('onclick', "showTab('app-tab-prices'); event.preventDefault();");
      btn.style.cursor = 'pointer';
    } else if (text.includes('الرئيسية')) {
      btn.setAttribute('onclick', "showTab('app-tab-home'); event.preventDefault();");
      btn.style.cursor = 'pointer';
    } else if (text.includes('المزيد')) {
      btn.setAttribute('onclick', "showTab('app-tab-more'); event.preventDefault();");
      btn.style.cursor = 'pointer';
    } else if (text.includes('الترند')) {
      btn.setAttribute('onclick', "showTab('app-tab-trend'); event.preventDefault();");
      btn.style.cursor = 'pointer';
    }
  });
});
</script>
`;

if (!html.includes('fixPricesScriptApplied')) {
  html = html.replace('</body>', `<!-- fixPricesScriptApplied -->\n${fixPricesScript}\n</body>`);
}

fs.writeFileSync('index.html', html);
console.log('✅ Prices button successfully re-linked to app-tab-prices.');
