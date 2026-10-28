import fs from 'fs';

function applyInteractiveFix(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  const globalInteractivityScript = `
<script id="global-interactivity-fix">
document.addEventListener('DOMContentLoaded', function() {
  // 1. معالجة النقر على التبويبات الفرعية داخل صفحة الأسعار (عملات / ذهب / صنعاء / عدن)
  document.body.addEventListener('click', function(e) {
    const target = e.target.closest('button, a, .tab-btn, .sub-tab, .mkt-btn, [data-tab]');
    if (!target) return;

    const text = target.textContent.trim();

    // أزرار التنقل بين العملات والذهب
    if (target.id === 'price-subtab-cur' || text.includes('العملات')) {
      const curContainer = document.getElementById('prices-currencies-container');
      const goldContainer = document.getElementById('prices-gold-container');
      if (curContainer) curContainer.style.display = 'block';
      if (goldContainer) goldContainer.style.display = 'none';
    } 
    else if (target.id === 'price-subtab-gold' || text.includes('الذهب')) {
      const curContainer = document.getElementById('prices-currencies-container');
      const goldContainer = document.getElementById('prices-gold-container');
      if (curContainer) curContainer.style.display = 'none';
      if (goldContainer) goldContainer.style.display = 'block';
    }

    // أزرار التبديل بين صنعاء وعدن
    if (target.id === 'mkt-btn-sanaa' || text.includes('صنعاء')) {
      document.querySelectorAll('.sanaa-rates').forEach(el => el.style.display = 'block');
      document.querySelectorAll('.aden-rates').forEach(el => el.style.display = 'none');
    } 
    else if (target.id === 'mkt-btn-aden' || text.includes('عدن')) {
      document.querySelectorAll('.sanaa-rates').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.aden-rates').forEach(el => el.style.display = 'block');
    }
  });

  // 2. ضمان تفاعل حاسبة التحويل
  const calcAmount = document.getElementById('calc-amount');
  const calcSelect = document.getElementById('calc-currency-select');
  if (calcAmount) {
    calcAmount.addEventListener('input', function() {
      if (typeof window.calculateRate === 'function') {
        window.calculateRate();
      }
    });
  }
});
</script>
`;

  if (!html.includes('global-interactivity-fix')) {
    html = html.replace('</body>', `${globalInteractivityScript}\n</body>`);
    fs.writeFileSync(filePath, html);
    console.log(`✅ Activated interactive logic on: ${filePath}`);
  }
}

applyInteractiveFix('index.html');
applyInteractiveFix('public/index.html');
