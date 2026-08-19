// === YEMEN RATING - Supabase Connection ===
// ⚠️ ضع مفاتيحك الحقيقية هنا ⚠️
const SUPABASE_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';

let sb = null;
let initPromise = null;

// initSupabase() الآن آمنة للاستدعاء عدة مرات: أول استدعاء يبدأ التهيئة
// وأي استدعاء لاحق (حتى لو متزامن) يعيد استخدام نفس الـ Promise بدل تكرار العملية
function initSupabase() {
    if (!initPromise) {
        initPromise = (async () => {
            try {
                const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                sb = module.createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log('✅ Supabase connected');
                return sb;
            } catch (e) {
                console.error('❌ Supabase failed:', e);
                initPromise = null; // نسمح بإعادة المحاولة لاحقًا إن فشلت التهيئة
                throw e;
            }
        })();
    }
    return initPromise;
}

// getSB() أصبحت async: إن كانت التهيئة جارية أو لم تبدأ بعد، تنتظرها بدل أن ترمي
// خطأ فوريًا. هذا يحل مشكلة التسابق (race condition) التي كانت تسبب تعليق الشاشة
// عند "جاري الاتصال بقاعدة البيانات..." إلى الأبد.
async function getSB() {
    if (sb) return sb;
    return await initSupabase();
}

// === Company Service ===
const CompanyService = {
    async getAll(filters = {}) {
        const client = await getSB();
        let q = client.from('companies').select('*').eq('status', 'ACTIVE');
        if (filters.city) q = q.eq('city', filters.city);
        if (filters.search) q = q.ilike('name', `%${filters.search}%`);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    async getById(id) {
        const client = await getSB();
        const { data, error } = await client.from('companies').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    },
    async uploadLogo(file, companyId) {
        const client = await getSB();
        const path = `${companyId}/${Date.now()}-${file.name}`;
        const { error } = await client.storage.from('company-logos').upload(path, file);
        if (error) throw error;
        const { data } = client.storage.from('company-logos').getPublicUrl(path);
        return data.publicUrl;
    }
};

// === Bank Service ===
const BankService = {
    async getAll() {
        const client = await getSB();
        const { data, error } = await client.from('banks').select('*').eq('status', 'ACTIVE');
        if (error) throw error;
        return data || [];
    }
};

// === Auth Service ===
const AuthService = {
    async login(email, password) {
        const client = await getSB();
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    async logout() {
        const client = await getSB();
        await client.auth.signOut();
        window.location.href = 'index.html';
    },
    async getSession() {
        const client = await getSB();
        const { data } = await client.auth.getSession();
        return data.session;
    }
};

// === بدء التهيئة فورًا عند تحميل السكربت (لا ننتظر DOMContentLoaded) ===
// نبدأ التحميل بأسرع وقت ممكن حتى تكون العملية جاهزة (أو قيد التقدم) عندما
// تستدعيها admin.html عبر await getSB()
initSupabase();
