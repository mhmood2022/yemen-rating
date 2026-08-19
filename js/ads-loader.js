// ═══ نظام حقن الإعلانات (داخلي + AdSense تجريبي) ═══
(function(){
    var ads = JSON.parse(localStorage.getItem('yr_ads') || '[]');
    var published = ads.filter(function(a){ return a.status === 'PUBLISHED' });

    // 1. حقن الإعلانات الداخلية الموافَق عليها
    published.forEach(function(ad){
        var slots = document.querySelectorAll('[data-placement="' + ad.place + '"]');
        slots.forEach(function(slot){
            if (ad.img) {
                slot.innerHTML = ad.link
                    ? '<a href="' + ad.link + '" target="_blank" onclick="trackAdClick(' + ad.id + ')"><img src="' + ad.img + '" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px"></a>'
                    : '<img src="' + ad.img + '" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px">';
            } else if (ad.link) {
                slot.innerHTML = '<a href="' + ad.link + '" target="_blank" onclick="trackAdClick(' + ad.id + ')" style="color:var(--gold-400);font-weight:700;font-size:.8rem">' + ad.title + '</a>';
            } else {
                slot.innerHTML = '<span style="color:var(--gold-400);font-weight:700;font-size:.8rem">' + ad.title + '</span>';
            }
            slot.style.border = 'none';
            slot.style.background = 'transparent';
            slot.style.padding = '0';
            var im=slot.querySelector('img');if(im){im.style.width='100%';im.style.height='100%';im.style.objectFit='contain'}
        });
    });

    // 2. AdSense: حقيقي إذا وُجد الكود، وإلا تجريبي ملون
    var code = localStorage.getItem('yr_adsense') || '';
    var testMode = (!code) || code.indexOf('googlesyndication') !== -1 || code.indexOf('TEST') !== -1;
    if (testMode) {
        var colors = ['#1e40af', '#065f46', '#7c2d12', '#4c1d95'];
        var i = 0;
        document.querySelectorAll('.ad-slot').forEach(function(slot){
            if (!slot.querySelector('img') && !slot.querySelector('a')) {
                var color = colors[i % colors.length]; i++;
                slot.innerHTML = '<div style="width:100%;height:100%;background:' + color + ';border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:8px;cursor:pointer">' +
                    '<div style="font-size:.55rem;opacity:.7">إعلان تجريبي AdSense</div>' +
                    '<div style="font-weight:800;font-size:.8rem">يمن ريتغ — إعلان ' + i + '</div>' +
                    '<div style="font-size:.55rem;opacity:.7">مساحة: ' + (slot.getAttribute('data-placement') || '') + '</div>' +
                    '</div>';
                slot.style.border = 'none';
            }
        });
    }
})();

// ═══ شريط الأسعار الملون (أخضر شراء / أحمر بيع / ذهبي ذهب) ═══
(function(){
    var rates = JSON.parse(localStorage.getItem('yr_rates') || 'null');
    if (!rates) return;
    var item = document.querySelector('.ticker-item');
    if (!item) return;
    var track = item.parentElement;
    function it(html){ return '<span class="ticker-item">' + html + '</span>' }
    var h = '';
    if (rates.sanaa) {
        var s = rates.sanaa;
        h += it('<b style="color:#fbbf24">🏙️ صنعاء:</b> <span style="color:#10b981">$ شراء ' + (s.ub||'-') + '</span> <span style="color:#ef4444">بيع ' + (s.us||'-') + '</span> | <span style="color:#10b981">🇸🇦 ' + (s.sb||'-') + '</span> <span style="color:#ef4444">' + (s.ss||'-') + '</span> | <span style="color:#fbbf24">🪙 21=' + (s.g21||'-') + ' 24=' + (s.g24||'-') + '</span>');
    }
    if (rates.aden) {
        var a = rates.aden;
        h += it('<b style="color:#fbbf24">🏙️ عدن:</b> <span style="color:#10b981">$ شراء ' + (a.ub||'-') + '</span> <span style="color:#ef4444">بيع ' + (a.us||'-') + '</span> | <span style="color:#10b981">🇸🇦 ' + (a.sb||'-') + '</span> <span style="color:#ef4444">' + (a.ss||'-') + '</span> | <span style="color:#fbbf24">🪙 21=' + (a.g21||'-') + ' 24=' + (a.g24||'-') + '</span>');
    }
    h += it('<span style="color:#94a3b8">🕐 ' + rates.updated + ' • المصدر: ' + rates.source + '</span>');
    track.innerHTML = h;
})();
