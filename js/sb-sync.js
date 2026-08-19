// ═══ sb-sync.js — طبقة المزامنة بين Supabase و localStorage ═══
(function(){
    if (typeof window.supabase === 'undefined') return;
    
    var sb = window.supabase.createClient(
        'https://wkdqeghotlipciqiytuj.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE'
    );
    window.yrSupabase = sb;

    // ═══ دوال مساعدة للقراءة ═══
    async function fetchEntities(status) {
        var q = sb.from('entities').select('*');
        if (status) q = q.eq('status', status);
        var res = await q.order('created_at', { ascending: false });
        return res.data || [];
    }
    async function fetchJobs(status) {
        var q = sb.from('jobs').select('*');
        if (status) q = q.eq('status', status);
        var res = await q.order('created_at', { ascending: false });
        return res.data || [];
    }
    async function fetchApplications() {
        var res = await sb.from('applications').select('*').order('created_at', { ascending: false });
        return res.data || [];
    }
    async function fetchReviews(status) {
        var q = sb.from('reviews').select('*');
        if (status) q = q.eq('status', status);
        var res = await q.order('created_at', { ascending: false });
        return res.data || [];
    }
    async function fetchAds(status) {
        var q = sb.from('advertisements').select('*');
        if (status) q = q.eq('status', status);
        var res = await q.order('created_at', { ascending: false });
        return res.data || [];
    }

    // ═══ تحويل بيانات Supabase إلى تنسيق localStorage ═══
    function mapEntity(e) {
        return {
            id: 'sb_' + e.id,
            _sbId: e.id,
            name: e.name,
            type: e.type,
            city: e.city,
            addr: e.address,
            phone: e.phone,
            wa: e.whatsapp,
            email: e.email,
            web: e.website,
            desc: e.description,
            services: e.services || [],
            branches: e.branches || [],
            logo: e.logo_url,
            cover: e.cover_url,
            status: e.status,
            badge: e.badge,
            rating: e.rating || 0,
            count: e.review_count || 0,
            owner: e.owner_id ? 'مالك' : 'الإدارة',
            verified: e.status === 'PUBLISHED'
        };
    }
    function mapJob(j) {
        return {
            id: 'sb_' + j.id,
            _sbId: j.id,
            title: j.title,
            type: j.type,
            city: j.city,
            salary: j.salary || 'يُحدد لاحقاً',
            deadline: j.deadline,
            desc: j.description,
            reqs: j.requirements || [],
            status: j.status,
            owner: j.owner_id ? 'مالك' : 'الإدارة'
        };
    }
    function mapApp(a) {
        return {
            id: a.id,
            jobId: a.job_id,
            jobTitle: 'طلب توظيف',
            name: a.applicant_name,
            phone: a.applicant_phone,
            email: a.applicant_email,
            exp: a.experience,
            message: a.message,
            status: a.status,
            date: new Date(a.created_at).toLocaleString('ar-YE'),
            source: 'supabase'
        };
    }
    function mapReview(r) {
        return {
            id: r.id,
            compName: 'كيان',
            name: r.user_name,
            stars: r.stars,
            text: r.text,
            status: r.status,
            source: 'supabase'
        };
    }
    function mapAd(a) {
        return {
            id: a.id,
            title: a.title,
            place: a.slot_id || 'homepage_top',
            link: a.link_url,
            img: a.image_url,
            status: a.status,
            clicks: a.clicks || 0,
            owner: a.advertiser_id ? 'معلن' : 'الإدارة',
            source: 'supabase'
        };
    }

    // ═══ دمج البيانات (Supabase + localStorage) بدون تكرار ═══
    function merge(localKey, sbItems, mapper) {
        var local = JSON.parse(localStorage.getItem(localKey) || '[]');
        var localIds = {};
        local.forEach(function(x){ if (x._sbId) localIds['sb_'+x._sbId] = true; });
        var mapped = sbItems.map(mapper).filter(function(x){ return !localIds[x.id]; });
        return mapped.concat(local);
    }

    // ═══ تحميل البيانات حسب الصفحة ═══
    async function syncForPage() {
        var path = location.pathname;
        try {
            if (path.includes('admin.html')) {
                // الإدارة: كل البيانات (بما فيها المعلقة)
                var [ents, jobs, apps, revs, ads] = await Promise.all([
                    fetchEntities(), fetchJobs(), fetchApplications(),
                    fetchReviews(), fetchAds()
                ]);
                localStorage.setItem('yr_entities', JSON.stringify(merge('yr_entities', ents, mapEntity)));
                localStorage.setItem('yr_jobs', JSON.stringify(merge('yr_jobs', jobs, mapJob)));
                localStorage.setItem('yr_applications', JSON.stringify(merge('yr_applications', apps, mapApp)));
                localStorage.setItem('yr_reviews', JSON.stringify(merge('yr_reviews', revs, mapReview)));
                localStorage.setItem('yr_ads', JSON.stringify(merge('yr_ads', ads, mapAd)));
                if (typeof render === 'function') render();
            } else if (path.includes('entities.html') || path.includes('companies.html') || path.includes('banks.html')) {
                var ents = await fetchEntities('PUBLISHED');
                localStorage.setItem('yr_entities', JSON.stringify(merge('yr_entities', ents, mapEntity)));
                if (typeof renderEnts === 'function') renderEnts();
                if (typeof renderBanks === 'function') renderBanks();
                if (typeof getAllComps === 'function' && typeof renderComps === 'function') renderComps();
            } else if (path.includes('entity.html') || path.includes('company.html') || path.includes('bank.html')) {
                var ents = await fetchEntities('PUBLISHED');
                localStorage.setItem('yr_entities', JSON.stringify(merge('yr_entities', ents, mapEntity)));
            } else if (path.includes('jobs.html')) {
                var jobs = await fetchJobs('PUBLISHED');
                var mapped = jobs.map(mapJob);
                if (typeof DEMO_JOBS !== 'undefined') {
                    window.DEMO_JOBS = mapped.concat(DEMO_JOBS);
                    if (typeof renderJobs === 'function') renderJobs();
                }
            }
        } catch (err) {
            console.warn('Sync failed:', err);
        }
    }

    // ═══ دوال الكتابة (لـ owner.html) ═══
    window.yrSaveEntity = async function(data) {
        var user = JSON.parse(localStorage.getItem('yr_session') || 'null');
        var res = await sb.from('entities').insert({
            type: data.type, name: data.name, city: data.city,
            address: data.addr, phone: data.phone, whatsapp: data.wa,
            email: data.email, website: data.web, description: data.desc,
            services: data.services, branches: data.branches,
            logo_url: data.logo, cover_url: data.cover,
            owner_id: user?.userId || null,
            status: data.status || 'PENDING'
        }).select().single();
        return res;
    };
    window.yrSaveJob = async function(data) {
        var user = JSON.parse(localStorage.getItem('yr_session') || 'null');
        var res = await sb.from('jobs').insert({
            title: data.title, type: data.type, city: data.city,
            salary: data.salary, deadline: data.deadline,
            description: data.desc, requirements: data.reqs,
            owner_id: user?.userId || null,
            status: data.status || 'PENDING'
        }).select().single();
        return res;
    };

    // تشغيل المزامنة عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncForPage);
    } else {
        syncForPage();
    }
})();
