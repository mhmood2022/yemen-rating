// ═══ نظام حقن الإعلانات (Supabase + localStorage fallback) ═══
(async function(){
    var SB_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
    var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';
    
    var sb = window.yrSupabase || (typeof window.supabase !== 'undefined' ? window.supabase.createClient(SB_URL, SB_KEY) : null);
    if (!window.yrSupabase && sb) window.yrSupabase = sb;
    
    // 1. جلب الإعلانات من Supabase
    var supabaseAds = [];
    if (sb) {
        try {
            var res = await sb.from('advertisements')
                .select('id, title, image_url, link_url, slot_id, status, clicks')
                .eq('status', 'ACTIVE')
                .order('created_at', { ascending: false });
            if (!res.error && res.data) {
                supabaseAds = res.data.map(function(a) {
                    // جلب slot_id لمعرفة place
                    return {
                        id: a.id,
                        title: a.title,
                        img: a.image_url,
                        link: a.link_url,
                        place: a.slot_id, // سيتم استبداله باسم المكان لاحقاً
                        status: 'ACTIVE',
                        clicks: a.clicks || 0,
                        source: 'supabase'
                    };
                });
            }
        } catch(e) {
            console.warn('[Ads] Supabase fetch failed:', e);
        }
    }
    
    // 2. جلب أسماء الأماكن من ad_slots
    if (sb && supabaseAds.length > 0) {
        try {
            var slotsRes = await sb.from('ad_slots').select('id, placement');
            if (!slotsRes.error && slotsRes.data) {
                var slotMap = {};
                slotsRes.data.forEach(function(s) { slotMap[s.id] = s.placement; });
                supabaseAds.forEach(function(a) {
                    if (a.place && slotMap[a.place]) {
                        a.place = slotMap[a.place];
                    }
                });
            }
        } catch(e) {
            console.warn('[Ads] Slots fetch failed:', e);
        }
    }
    
    // 3. دمج مع localStorage (fallback)
    var localAds = JSON.parse(localStorage.getItem('yr_ads') || '[]');
    var localPublished = localAds.filter(function(a){ return a.status === 'PUBLISHED' || a.status === 'ACTIVE'; });
    
    // الإعلانات من Supabase لها الأولوية
    var allAds = supabaseAds.concat(localPublished);
    
    console.log('[Ads] تحميل: ' + supabaseAds.length + ' من Supabase, ' + localPublished.length + ' من localStorage');
    
    // 4. حقن الإعلانات الداخلية الموافَق عليها
    allAds.forEach(function(ad){
        if (!ad.place) return;
        var slots = document.querySelectorAll('[data-placement="' + ad.place + '"]');
        slots.forEach(function(slot){
            if (ad.img) {
                slot.innerHTML = ad.link
                    ? '<a href="' + ad.link + '" target="_blank" onclick="trackAdClick(\'' + ad.id + '\')"><img src="' + ad.img + '" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px"></a>'
                    : '<img src="' + ad.img + '" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px">';
            } else if (ad.link) {
                slot.innerHTML = '<a href="' + ad.link + '" target="_blank" onclick="trackAdClick(\'' + ad.id + '\')" style="color:var(--gold-400);font-weight:700;font-size:.8rem">' + ad.title + '</a>';
            } else {
                slot.innerHTML = '<span style="color:var(--gold-400);font-weight:700;font-size:.8rem">' + ad.title + '</span>';
            }
            slot.style.border = 'none';
            slot.style.background = 'transparent';
            slot.style.padding = '0';
            var im=slot.querySelector('img');if(im){im.style.width='100%';im.style.height='100%';im.style.objectFit='contain'}
        });
    });

    // 5. AdSense: حقيقي إذا وُجد الكود، وإلا تجريبي ملون
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

// ═══ دالة عدّ النقرات (Supabase) ═══
window.trackAdClick = async function(adId) {
    if (!adId) return;
    if (window.yrSupabase) {
        try {
            // جلب العدد الحالي
            var res = await window.yrSupabase.from('advertisements').select('clicks').eq('id', adId).single();
            if (!res.error && res.data) {
                var newClicks = (res.data.clicks || 0) + 1;
                await window.yrSupabase.from('advertisements').update({ clicks: newClicks }).eq('id', adId);
                console.log('[Ads] نقرة مسجلة للإعلان:', adId, '→', newClicks);
            }
        } catch(e) {
            console.warn('[Ads] Click tracking failed:', e);
        }
    } else {
        // Fallback: localStorage
        var ads = JSON.parse(localStorage.getItem('yr_ads') || '[]');
        var ad = ads.find(function(a){ return a.id == adId; });
        if (ad) {
            ad.clicks = (ad.clicks || 0) + 1;
            localStorage.setItem('yr_ads', JSON.stringify(ads));
        }
    }
};

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
