// ═══════════════════════════════════════════════════════════
// admin-sb.js — طبقة Supabase فوق الكود الأصلي
// تعمل تلقائياً دون تغيير أي زر أو قسم في admin.html
// ═══════════════════════════════════════════════════════════
(function(){
    if (typeof window.supabase === 'undefined') {
        console.warn('[SB] Supabase JS غير محمّل');
        return;
    }
    
    var SB_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
    var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';
    
    var sb = window.supabase.createClient(SB_URL, SB_KEY);
    // ═══ شريط تشخيص مرئي على الهاتف ═══
    function showSBLog(msg) {
        var bar = document.getElementById('sb-debug-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'sb-debug-bar';
            bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#0f172a;color:#fbbf24;padding:8px 12px;font-size:12px;z-index:9999;border-top:2px solid #d4af37;font-family:monospace;direction:rtl;max-height:100px;overflow-y:auto;';
            document.body.appendChild(bar);
        }
        var line = document.createElement('div');
        line.textContent = '[' + new Date().toLocaleTimeString('ar-YE') + '] ' + msg;
        bar.insertBefore(line, bar.firstChild);
        while (bar.children.length > 5) bar.removeChild(bar.lastChild);
    }
    var _origLog = console.log;
    var _origWarn = console.warn;
    console.log = function() {
        _origLog.apply(console, arguments);
        if (arguments[0] && String(arguments[0]).indexOf('[SB]') === 0) {
            showSBLog(Array.from(arguments).join(' '));
        }
    };
    console.warn = function() {
        _origWarn.apply(console, arguments);
        if (arguments[0] && String(arguments[0]).indexOf('[SB]') === 0) {
            showSBLog('⚠️ ' + Array.from(arguments).join(' '));
        }
    };

    window.yrSupabase = sb;
    
    function getCurrentUser() {
        try { return JSON.parse(localStorage.getItem('yr_session') || 'null'); }
        catch(e) { return null; }
    }
    
    // ═══ تحميل البيانات من Supabase ═══
    async function loadEntities() {
        try {
            var res = await sb.from('entities').select('*').order('created_at', { ascending: false });
            if (res.error) throw res.error;
            return (res.data || []).map(function(e) {
                return {
                    id: 'sb_' + e.id, _sbId: e.id,
                    name: e.name, type: e.type, city: e.city,
                    addr: e.address, phone: e.phone, wa: e.whatsapp,
                    email: e.email, web: e.website, desc: e.description,
                    services: e.services || [], branches: e.branches || [],
                    logo: e.logo_url, cover: e.cover_url,
                    status: e.status, badge: e.badge,
                    rating: e.rating || 0, count: e.review_count || 0,
                    owner: e.owner_id ? 'مالك' : 'الإدارة',
                    verified: e.status === 'PUBLISHED'
                };
            });
        } catch(err) { console.warn('[SB] loadEntities:', err); return []; }
    }
    
    async function loadJobs() {
        try {
            var res = await sb.from('jobs').select('*').order('created_at', { ascending: false });
            if (res.error) throw res.error;
            return (res.data || []).map(function(j) {
                return {
                    id: 'sb_' + j.id, _sbId: j.id,
                    title: j.title, type: j.type, city: j.city,
                    salary: j.salary || 'يُحدد لاحقاً', deadline: j.deadline,
                    desc: j.description, reqs: j.requirements || [],
                    status: j.status, owner: j.owner_id ? 'مالك' : 'الإدارة'
                };
            });
        } catch(err) { console.warn('[SB] loadJobs:', err); return []; }
    }
    
    async function loadApplications() {
        try {
            var res = await sb.from('applications').select('*').order('created_at', { ascending: false });
            if (res.error) throw res.error;
            return (res.data || []).map(function(a) {
                return {
                    id: a.id, jobId: a.job_id, jobTitle: 'طلب توظيف',
                    name: a.applicant_name, phone: a.applicant_phone,
                    email: a.applicant_email, exp: a.experience,
                    message: a.message, status: a.status,
                    date: new Date(a.created_at).toLocaleString('ar-YE'),
                    source: 'supabase'
                };
            });
        } catch(err) { console.warn('[SB] loadApplications:', err); return []; }
    }
    
    async function loadReviews() {
        try {
            var res = await sb.from('reviews').select('*').order('created_at', { ascending: false });
            if (res.error) throw res.error;
            return (res.data || []).map(function(r) {
                return {
                    id: r.id, compName: 'كيان', name: r.user_name,
                    stars: r.stars, text: r.text, status: r.status,
                    source: 'supabase'
                };
            });
        } catch(err) { console.warn('[SB] loadReviews:', err); return []; }
    }
    
    async function loadAds() {
        try {
            var res = await sb.from('advertisements').select('*').order('created_at', { ascending: false });
            if (res.error) throw res.error;
            return (res.data || []).map(function(a) {
                return {
                    id: a.id, title: a.title,
                    place: a.slot_id || 'homepage_top',
                    link: a.link_url, img: a.image_url,
                    status: a.status, clicks: a.clicks || 0,
                    owner: a.advertiser_id ? 'معلن' : 'الإدارة',
                    source: 'supabase'
                };
            });
        } catch(err) { console.warn('[SB] loadAds:', err); return []; }
    }
    
    // ═══ مزامنة كل البيانات ═══
    async function syncAllData() {
        console.log('[SB] بدء المزامنة...');
        try {
            var results = await Promise.all([
                loadEntities(), loadJobs(), loadApplications(),
                loadReviews(), loadAds()
            ]);
            
            function merge(localKey, sbItems) {
                var local = JSON.parse(localStorage.getItem(localKey) || '[]');
                var sbIds = {};
                sbItems.forEach(function(x) { sbIds[x.id] = true; });
                var filteredLocal = local.filter(function(x) { return !sbIds[x.id]; });
                return sbItems.concat(filteredLocal);
            }
            
            localStorage.setItem('yr_entities', JSON.stringify(merge('yr_entities', results[0])));
            localStorage.setItem('yr_jobs', JSON.stringify(merge('yr_jobs', results[1])));
            localStorage.setItem('yr_applications', JSON.stringify(merge('yr_applications', results[2])));
            localStorage.setItem('yr_reviews', JSON.stringify(merge('yr_reviews', results[3])));
            localStorage.setItem('yr_ads', JSON.stringify(merge('yr_ads', results[4])));
            
            console.log('[SB] ✅ تمت المزامنة:', 
                results[0].length, 'منشأة,',
                results[1].length, 'وظيفة,',
                results[2].length, 'طلب,',
                results[3].length, 'تقييم,',
                results[4].length, 'إعلان'
            );
            
            // إعادة تشغيل render إن كان متاحاً
            if (typeof window.render === 'function') {
                setTimeout(window.render, 100);
            } else if (window.YRA && typeof window.YRA.renderDashboard === 'function') {
                setTimeout(function(){ window.YRA.renderDashboard(); }, 100);
            }
        } catch(err) {
            console.warn('[SB] syncAllData failed:', err);
        }
    }
    
    // ═══ التشغيل التلقائي ═══
    function init() {
        console.log('[SB] admin-sb.js جاهز');
        var user = getCurrentUser();
        if (user && (user.role === 'admin' || user.role === 'super_admin')) {
            setTimeout(syncAllData, 1500);
            setInterval(syncAllData, 30000);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    window.yrSB = { sync: syncAllData, client: sb };
})();
