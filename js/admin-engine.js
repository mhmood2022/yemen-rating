// ═══ محرك لوحة الإدارة: إشعارات حيّة + عدّاد نقرات الإعلانات ═══
(function(){
    // ── 1. توليد إشعار عند أي حدث جديد (مالك/كيان/وظيفة/إعلان/تقييم/طلب) ──
    function pushNotif(type, msg){
        var n = JSON.parse(localStorage.getItem('yr_notifs') || '[]');
        n.unshift({ id: Date.now(), type: type, msg: msg, time: new Date().toLocaleString('ar-YE'), read: false });
        if (n.length > 60) n = n.slice(0, 60);
        localStorage.setItem('yr_notifs', JSON.stringify(n));
    }
    // مراقبة التغييرات عبر storage event (بين التبويبات) + فحص دوري
    var lastCounts = {};
    function snapshot(){
        return {
            owners: (JSON.parse(localStorage.getItem('yr_users')||'[]')).filter(function(u){return u.role==='owner'&&u.status==='PENDING'}).length,
            ents: (JSON.parse(localStorage.getItem('yr_entities')||'[]')).filter(function(x){return x.status==='PENDING'}).length,
            jobs: (JSON.parse(localStorage.getItem('yr_jobs')||'[]')).filter(function(x){return x.status==='PENDING'}).length,
            ads: (JSON.parse(localStorage.getItem('yr_ads')||'[]')).filter(function(x){return x.status==='PENDING'}).length,
            revs: (JSON.parse(localStorage.getItem('yr_reviews')||'[]')).filter(function(x){return x.status==='PENDING'}).length,
            apps: (JSON.parse(localStorage.getItem('yr_applications')||'[]')).length
        };
    }
    function checkNew(){
        var cur = snapshot();
        if (lastCounts.owners !== undefined) {
            if (cur.owners > lastCounts.owners) pushNotif('owner', '👤 مالك جديد بانتظار التفعيل');
            if (cur.ents > lastCounts.ents) pushNotif('ent', '🏢 منشأة جديدة بانتظار المراجعة');
            if (cur.jobs > lastCounts.jobs) pushNotif('job', '💼 وظيفة جديدة بانتظار النشر');
            if (cur.ads > lastCounts.ads) pushNotif('ad', '📢 إعلان جديد بانتظار الموافقة');
            if (cur.revs > lastCounts.revs) pushNotif('rev', '⭐ تقييم جديد بانتظار المراجعة');
            if (cur.apps > lastCounts.apps) pushNotif('app', '📨 طلب توظيف جديد');
        }
        lastCounts = cur;
        // تحديث العدّاد في اللوحة إن كانت مفتوحة
        var badge = document.getElementById('notifBadge');
        if (badge) {
            var unread = (JSON.parse(localStorage.getItem('yr_notifs')||'[]')).filter(function(x){return !x.read}).length;
            badge.textContent = unread > 0 ? (unread > 9 ? '9+' : unread) : '';
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }
    }
    lastCounts = snapshot();
    setInterval(checkNew, 2500);
    window.addEventListener('storage', checkNew);
    window.checkNew=checkNew;

    // ── 2. عدّاد نقرات الإعلانات (يُستدعى عند الضغط على إعلان داخلي) ──
    window.trackAdClick = function(adId){
        var ads = JSON.parse(localStorage.getItem('yr_ads') || '[]');
        ads = ads.map(function(a){ if (a.id === adId) a.clicks = (a.clicks || 0) + 1; return a; });
        localStorage.setItem('yr_ads', JSON.stringify(ads));
    };
})();
