// ═══ محرك حقن الإعلانات الذكي — يظهر فقط عند وجود إعلان نشط ═══
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
                slot.classList.add('has-ad'); // تفعيل الظهور التلقائي

                if (ad.ad_type === 'adsense' && ad.content_html) {
                    slot.innerHTML = ad.content_html;
                } else if (ad.media_url || ad.img) {
                    var imgUrl = ad.media_url || ad.img;
                    var isVideo = imgUrl.startsWith('data:video') || imgUrl.endsWith('.mp4');
                    slot.innerHTML = '<a href="' + href + '" target="_blank"' + clk + ' style="display:block;width:100%;height:100%;">' +
                        (isVideo ? '<video src="' + imgUrl + '" autoplay muted loop style="width:100%;max-height:180px;object-fit:cover;display:block;border-radius:12px;"></video>' : '<img src="' + imgUrl + '" alt="' + (ad.title || '') + '" style="width:100%;max-height:180px;object-fit:cover;display:block;border-radius:12px;">') +
                        '</a>';
                } else {
                    slot.innerHTML = '<a href="' + href + '" target="_blank"' + clk + ' style="color:var(--gold-400);font-weight:800;font-size:0.95rem;display:flex;align-items:center;justify-content:center;padding:18px;background:var(--navy-900);border:1px solid var(--border);border-radius:12px;gap:10px;text-decoration:none;"><i class="fa-solid fa-bullhorn"></i> ' + (ad.title || 'إعلان مميز') + '</a>';
                }
            } else {
                // إخفاء تام عند عدم وجود إعلان
                slot.classList.remove('has-ad');
                slot.innerHTML = '';
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
