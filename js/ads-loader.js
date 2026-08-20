// ═══ نظام الإعلانات — مستقل تماماً (يحمّل Supabase بنفسه) ═══
var YR_ADS_SB_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
var YR_ADS_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';

async function yrGetSB() {
    if (window.yrSupabase) return window.yrSupabase;
    if (window.supabase && window.supabase.createClient) {
        window.yrSupabase = window.supabase.createClient(YR_ADS_SB_URL, YR_ADS_SB_KEY);
        return window.yrSupabase;
    }
    try {
        var mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        var create = mod.createClient || (mod.default && mod.default.createClient);
        if (create) { window.yrSupabase = create(YR_ADS_SB_URL, YR_ADS_SB_KEY); return window.yrSupabase; }
    } catch(e) {}
    return null;
}

function adToast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;z-index:99999;font-family:sans-serif';
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 2000);
}

window.trackAdClick = async function(adId) {
    if (!adId) return;
    var sb = await yrGetSB();
    if (sb) {
        try {
            var res = await sb.rpc('increment_ad_clicks', { ad_id: adId });
            if (!res.error) adToast('✅ تم تسجيل النقرة');
        } catch(e) {}
    }
};

(async function(){
    var sb = await yrGetSB();
    var supabaseAds = [];
    if (sb) {
        try {
            var res = await sb.from('advertisements')
                .select('id, title, image_url, link_url, slot_id, status')
                .in('status', ['ACTIVE','PUBLISHED']);
            if (!res.error && res.data && res.data.length) {
                var slotsRes = await sb.from('ad_slots').select('id, placement');
                var slotMap = {};
                if (!slotsRes.error && slotsRes.data) slotsRes.data.forEach(function(s){ slotMap[s.id] = s.placement; });
                supabaseAds = res.data.map(function(a){
                    return { id: a.id, title: a.title, img: a.image_url, link: a.link_url, place: slotMap[a.slot_id] || '' };
                });
            }
        } catch(e) {}
    }

    var localAds = JSON.parse(localStorage.getItem('yr_ads') || '[]');
    var localPub = localAds.filter(function(a){ return a.status === 'PUBLISHED' || a.status === 'ACTIVE'; });
    var allAds = supabaseAds.concat(localPub);

    function inject() {
        allAds.forEach(function(ad){
            if (!ad.place) return;
            document.querySelectorAll('[data-placement="' + ad.place + '"]').forEach(function(slot){
                var href = ad.link || 'javascript:void(0)';
                var tgt = ad.link ? ' target="_blank"' : '';
                var clk = ' onclick="trackAdClick(\'' + ad.id + '\')"';
                if (ad.img) {
                    slot.innerHTML = '<a href="' + href + '"' + tgt + clk + '><img src="' + ad.img + '" style="width:100%;height:100%;object-fit:contain;border-radius:4px"></a>';
                } else {
                    slot.innerHTML = '<a href="' + href + '"' + tgt + clk + ' style="color:var(--gold-400);font-weight:700;font-size:.85rem">📢 ' + ad.title + '</a>';
                }
                slot.style.border = 'none'; slot.style.background = 'transparent'; slot.style.padding = '0';
            });
        });

        // AdSense تجريبي فقط للأماكن الفارغة المتبقية
        var code = localStorage.getItem('yr_adsense') || '';
        var testMode = (!code) || code.indexOf('googlesyndication') !== -1 || code.indexOf('TEST') !== -1;
        if (testMode) {
            var colors = ['#1e40af', '#065f46', '#7c2d12', '#4c1d95']; var i = 0;
            document.querySelectorAll('.ad-slot').forEach(function(slot){
                if (!slot.querySelector('img') && !slot.querySelector('a') && !slot.querySelector('span')) {
                    var color = colors[i % colors.length]; i++;
                    slot.innerHTML = '<div style="width:100%;height:100%;background:' + color + ';border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:8px"><div style="font-size:.55rem;opacity:.7">إعلان تجريبي</div><div style="font-weight:800;font-size:.8rem">يمن ريتغ — إعلان ' + i + '</div></div>';
                    slot.style.border = 'none';
                }
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
    else inject();
})();

// ═══ شريط الأسعار الملون ═══
(function(){
    var rates = JSON.parse(localStorage.getItem('yr_rates') || 'null');
    if (!rates) return;
    var item = document.querySelector('.ticker-item');
    if (!item) return;
    var track = item.parentElement;
    function it(html){ return '<span class="ticker-item">' + html + '</span>' }
    var h = '';
    if (rates.sanaa) { var s = rates.sanaa; h += it('<b style="color:#fbbf24">🏙️ صنعاء:</b> <span style="color:#10b981">$ شراء ' + (s.ub||'-') + '</span> <span style="color:#ef4444">بيع ' + (s.us||'-') + '</span> | <span style="color:#10b981">🇸 ' + (s.sb||'-') + '</span> <span style="color:#ef4444">' + (s.ss||'-') + '</span> | <span style="color:#fbbf24">🪙 21=' + (s.g21||'-') + ' 24=' + (s.g24||'-') + '</span>'); }
    if (rates.aden) { var a = rates.aden; h += it('<b style="color:#fbbf24">🏙️ عدن:</b> <span style="color:#10b981">$ شراء ' + (a.ub||'-') + '</span> <span style="color:#ef4444">بيع ' + (a.us||'-') + '</span> | <span style="color:#10b981">🇸 ' + (a.sb||'-') + '</span> <span style="color:#ef4444">' + (a.ss||'-') + '</span> | <span style="color:#fbbf24">🪙 21=' + (a.g21||'-') + ' 24=' + (a.g24||'-') + '</span>'); }
    h += it('<span style="color:#94a3b8">🕐 ' + rates.updated + ' • المصدر: ' + rates.source + '</span>');
    track.innerHTML = h;
})();
