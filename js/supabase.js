cat > js/supabase.js << 'ENDOFFILE'
// === YEMEN RATING - Supabase Connection ===
// ⚠️ ضع مفاتيحك الحقيقية هنا ⚠️
const SUPABASE_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';

const SUPABASE_KEY = 'sb_publishable_4StPj676njVXlDg4UUwaJg_xSqhsIuT';

let sb = null;

async function initSupabase() {
    try {
        const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        sb = module.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase connected');
        return sb;
    } catch (e) {
        console.error('❌ Supabase failed:', e);
        return null;
    }
}

function getSB() {
    if (!sb) throw new Error('Call initSupabase() first');
    return sb;
}

// === Company Service ===
const CompanyService = {
    async getAll(filters = {}) {
        let q = getSB().from('companies').select('*').eq('status', 'ACTIVE');
        if (filters.city) q = q.eq('city', filters.city);
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
    async uploadLogo(file, companyId) {
        const path = `${companyId}/${Date.now()}-${file.name}`;
        const { error } = await getSB().storage.from('company-logos').upload(path, file);
        if (error) throw error;
        const { data } = getSB().storage.from('company-logos').getPublicUrl(path);
        return data.publicUrl;
    }
};

// === Bank Service ===
const BankService = {
    async getAll() {
        const { data, error } = await getSB().from('banks').select('*').eq('status', 'ACTIVE');
        if (error) throw error;
        return data || [];
    }
};

// === Auth Service ===
const AuthService = {
    async login(email, password) {
        const { data, error } = await getSB().auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    async logout() {
        await getSB().auth.signOut();
        window.location.href = 'index.html';
    },
    async getSession() {
        const { data } = await getSB().auth.getSession();
        return data.session;
    }
};

// === تهيئة تلقائية عند تحميل الصفحة ===
document.addEventListener('DOMContentLoaded', async () => {
    await initSupabase();
    console.log('🚀 Yemen Rating System Ready');
});
ENDOFFILE
echo "✅ تم إنشاء js/supabase.js"
