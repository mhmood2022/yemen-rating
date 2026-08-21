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

window.trackAdClick = async function(adId) {
    if (!adId) return;
    if (window.YR_DB) {
        var ad = YR_DB.findById('advertisements', adId);
        if (ad) YR_DB.update('advertisements', adId, { clicks: (Number(ad.clicks) || 0) + 1 });
    }
    var sb = await yrGetSB();
    if (sb) {
        try { await sb.rpc('increment_ad_clicks', { ad_id: adId }); } catch(e) {}
    }
};

(async function(){
    function injectAds() {
        var localAds = (window.YR_DB && YR_DB.get('advertisements')) || JSON.parse(localStorage.getItem('yr_advertisements') || '[]');
        var activeAds = localAds.filter(function(a){ return a.status === 'ACTIVE' || a.status === 'PUBLISHED'; });

        document.querySelectorAll('[data-placement]').forEach(function(slot){
            var placement = slot.getAttribute('data-placement');
            var ad = activeAds.find(function(a){ return a.slot_id === placement || a.place === placement; });
            if (ad) {
                var href = ad.link_url || ad.link || '#';
                var clk = ' onclick="trackAdClick(\'' + ad.id + '\')"';
                if (ad.ad_type === 'adsense' && ad.content_html) {
                    slot.innerHTML = ad.content_html;
                } else if (ad.media_url || ad.img) {
                    var imgUrl = ad.media_url || ad.img;
                    var isVideo = imgUrl.startsWith('data:video') || imgUrl.endsWith('.mp4');
                    slot.innerHTML = '<a href="' + href + '" target="_blank"' + clk + '>' +
                        (isVideo ? '<video src="' + imgUrl + '" autoplay muted loop style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></video>' : '<img src="' + imgUrl + '" alt="' + (ad.title || '') + '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">') +
                        '</a>';
                } else {
                    slot.innerHTML = '<a href="' + href + '" target="_blank"' + clk + ' style="color:var(--gold-400);font-weight:700;font-size:0.9rem;display:flex;align-items:center;justify-content:center;height:100%;gap:8px;"><i class="fa-solid fa-bullhorn"></i> ' + (ad.title || 'إعلان مميز') + '</a>';
                }
                slot.style.border = 'none';
                slot.style.background = 'transparent';
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectAds);
    else injectAds();
})();
