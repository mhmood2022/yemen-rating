// ═══ محرك حقن الإعلانات الشامل ═══
(function(){
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

    window.trackAdClick = function(adId) {
        if (!adId || !window.YR_DB) return;
        var ad = YR_DB.findById('advertisements', adId);
        if (ad) YR_DB.update('advertisements', adId, { clicks: (Number(ad.clicks) || 0) + 1 });
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectAds);
    else injectAds();
})();
