/* ═══════════════════════════════════════════════════════════
   YEMEN RATING — طبقة الاتصال الموحدة بـ Supabase
   يجب أن تكون هذه أول سكربت يُحمَّل في كل صفحة تحتاج بيانات
═══════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4StPj676njVXlDg4UUwaJg_xSqhsIuT';

// وعد عالمي واحد: أي صفحة تنتظره قبل استخدام sb أو أي خدمة
window.sbReady = (async () => {
    const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const client = module.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.sb = client; // متاح عالميًا لكل الصفحات والسكربتات اللاحقة
    console.log('✅ Supabase connected');
    return client;
})().catch(err => {
    console.error('❌ Supabase connection failed:', err);
    return null;
});

function getSB() {
    if (!window.sb) throw new Error('استخدم: await window.sbReady; قبل أي استدعاء لقاعدة البيانات');
    return window.sb;
}

/* ═══════════════ رفع الملفات إلى Storage ═══════════════ */
const StorageService = {
    async upload(bucket, file, pathPrefix = '') {
        const ext = file.name.split('.').pop();
        const path = `${pathPrefix}${pathPrefix ? '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await getSB().storage.from(bucket).upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = getSB().storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    }
};

/* ═══════════════ Auth ═══════════════ */
const AuthService = {
    async register(email, password, fullName, role = 'user') {
        const { data, error } = await getSB().auth.signUp({
            email, password,
            options: { data: { full_name: fullName, role } }
        });
        if (error) throw error;
        return data;
    },
    async login(email, password) {
        const { data, error } = await getSB().auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    async logout() {
        await getSB().auth.signOut();
    },
    async getSession() {
        const { data } = await getSB().auth.getSession();
        return data.session;
    },
    async getProfile() {
        const session = await this.getSession();
        if (!session) return null;
        const { data, error } = await getSB().from('profiles').select('*').eq('id', session.user.id).single();
        if (error) return null;
        return data;
    },
    onAuthStateChange(callback) {
        getSB().auth.onAuthStateChange((_event, session) => callback(session));
    }
};

/* ═══════════════ Categories / Cities (بيانات مرجعية) ═══════════════ */
const CategoryService = {
    async getAll() {
        const { data, error } = await getSB().from('categories').select('*').order('name');
        if (error) throw error;
        return data || [];
    }
};

const CityService = {
    async getAll() {
        const { data, error } = await getSB().from('cities').select('*').order('name');
        if (error) throw error;
        return data || [];
    }
};

/* ═══════════════ Companies ═══════════════ */
const CompanyService = {
    async getAll(filters = {}) {
        let q = getSB().from('companies').select('*').eq('status', 'ACTIVE');
        if (filters.city_id) q = q.eq('city_id', filters.city_id);
        if (filters.category_id) q = q.eq('category_id', filters.category_id);
        if (filters.verified) q = q.eq('verified', true);
        if (filters.search) q = q.ilike('name', `%${filters.search}%`);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async getById(id) {
        const { data, error } = await getSB().from('companies').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    },
    async getByOwner(ownerId) {
        const { data, error } = await getSB().from('companies').select('*').eq('owner_id', ownerId);
        if (error) throw error;
        return data || [];
    },
    async create(payload) {
        const { data, error } = await getSB().from('companies').insert(payload).select().single();
        if (error) throw error;
        return data;
    },
    async update(id, payload) {
        const { data, error } = await getSB().from('companies').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },
    async remove(id) {
        const { error } = await getSB().from('companies').delete().eq('id', id);
        if (error) throw error;
    }
};

/* ═══════════════ Banks ═══════════════ */
const BankService = {
    async getAll(filters = {}) {
        let q = getSB().from('banks').select('*').eq('status', 'ACTIVE');
        if (filters.city_id) q = q.eq('city_id', filters.city_id);
        if (filters.search) q = q.ilike('name', `%${filters.search}%`);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async getById(id) {
        const { data, error } = await getSB().from('banks').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    },
    async getByOwner(ownerId) {
        const { data, error } = await getSB().from('banks').select('*').eq('owner_id', ownerId);
        if (error) throw error;
        return data || [];
    },
    async create(payload) {
        const { data, error } = await getSB().from('banks').insert(payload).select().single();
        if (error) throw error;
        return data;
    },
    async update(id, payload) {
        const { data, error } = await getSB().from('banks').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },
    async remove(id) {
        const { error } = await getSB().from('banks').delete().eq('id', id);
        if (error) throw error;
    }
};

/* ═══════════════ Jobs ═══════════════ */
const JobService = {
    async getAll(filters = {}) {
        let q = getSB().from('jobs').select('*, companies(name, city_id, logo_url)').eq('status', 'active');
        if (filters.city_id) q = q.eq('city_id', filters.city_id);
        if (filters.company_id) q = q.eq('company_id', filters.company_id);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async getById(id) {
        const { data, error } = await getSB().from('jobs').select('*, companies(name, city_id, logo_url, phone)').eq('id', id).single();
        if (error) throw error;
        return data;
    },
    async getByCompany(companyId) {
        const { data, error } = await getSB().from('jobs').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async create(payload) {
        const { data, error } = await getSB().from('jobs').insert(payload).select().single();
        if (error) throw error;
        return data;
    },
    async update(id, payload) {
        const { data, error } = await getSB().from('jobs').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },
    async remove(id) {
        const { error } = await getSB().from('jobs').delete().eq('id', id);
        if (error) throw error;
    }
};

/* ═══════════════ Job Applications ═══════════════ */
const JobApplicationService = {
    async create(payload) {
        const { data, error } = await getSB().from('job_applications').insert(payload).select().single();
        if (error) throw error;
        return data;
    },
    async getByJob(jobId) {
        const { data, error } = await getSB().from('job_applications').select('*').eq('job_id', jobId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async getByCompanyJobs(jobIds) {
        if (!jobIds.length) return [];
        const { data, error } = await getSB().from('job_applications').select('*, jobs(title)').in('job_id', jobIds).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async updateStatus(id, status) {
        const { error } = await getSB().from('job_applications').update({ status }).eq('id', id);
        if (error) throw error;
    }
};

/* ═══════════════ Candidate Profiles ═══════════════ */
const CandidateProfileService = {
    async getByUser(userId) {
        const { data, error } = await getSB().from('candidate_profiles').select('*').eq('user_id', userId).maybeSingle();
        if (error) throw error;
        return data;
    },
    async upsert(userId, payload) {
        const existing = await this.getByUser(userId);
        if (existing) {
            const { data, error } = await getSB().from('candidate_profiles').update(payload).eq('id', existing.id).select().single();
            if (error) throw error;
            return data;
        }
        const { data, error } = await getSB().from('candidate_profiles').insert({ ...payload, user_id: userId }).select().single();
        if (error) throw error;
        return data;
    }
};

/* ═══════════════ Reviews ═══════════════ */
const ReviewService = {
    async getByEntity(entityId, entityType) {
        const { data, error } = await getSB().from('reviews').select('*')
            .eq('entity_id', entityId).eq('entity_type', entityType)
            .eq('status', 'APPROVED').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async create(payload) {
        const { data, error } = await getSB().from('reviews').insert({ ...payload, status: 'PENDING' }).select().single();
        if (error) throw error;
        return data;
    },
    calcRating(reviews) {
        if (!reviews.length) return { avg: 0, count: 0 };
        const sum = reviews.reduce((a, r) => a + (r.stars || 0), 0);
        return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
    }
};

/* ═══════════════ Verification Requests ═══════════════ */
const VerificationService = {
    async create(payload) {
        const { data, error } = await getSB().from('verification_requests').insert({ ...payload, status: 'PENDING' }).select().single();
        if (error) throw error;
        return data;
    },
    async getByUser(userId) {
        const { data, error } = await getSB().from('verification_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
};

/* ═══════════════ Market Prices ═══════════════ */
const PriceService = {
    async getExchangeRates() {
        const { data, error } = await getSB().from('exchange_rates').select('*').order('updated_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async getGoldPrices() {
        const { data, error } = await getSB().from('gold_prices').select('*').order('updated_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
};

// إتاحة كل الخدمات عالميًا (نفس نمط الاستخدام القديم لتقليل إعادة الكتابة)
window.StorageService = StorageService;
window.AuthService = AuthService;
window.CategoryService = CategoryService;
window.CityService = CityService;
window.CompanyService = CompanyService;
window.BankService = BankService;
window.JobService = JobService;
window.JobApplicationService = JobApplicationService;
window.CandidateProfileService = CandidateProfileService;
window.ReviewService = ReviewService;
window.VerificationService = VerificationService;
window.PriceService = PriceService;
