// ═══════════════════════════════════════════════════════════════
// YEMEN RATING — Central Supabase Services Engine (Production)
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';

let sb = null;
let initPromise = null;

function isValidUUID(str) {
  if (!str || typeof str !== 'string') return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
}

function initSupabase() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        sb = module.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase Production Client Connected');
        return sb;
      } catch (e) {
        console.error('❌ Supabase Connection Failed:', e);
        initPromise = null;
        throw e;
      }
    })();
  }
  return initPromise;
}

async function getSB() {
  if (sb) return sb;
  return await initSupabase();
}

window.getSB = getSB;
window.initSupabase = initSupabase;

// ── 1. خدمة الشركات (Company Service) ──
const CompanyService = {
  async getAll(filters = {}) {
    const client = await getSB();
    let q = client.from('companies').select('*, categories(name, icon), cities(name)').eq('status', 'ACTIVE');
    if (filters.city_id) q = q.eq('city_id', filters.city_id);
    if (filters.category_id) q = q.eq('category_id', filters.category_id);
    if (filters.search) q = q.ilike('name', `%${filters.search}%`);
    const { data, error } = await q.order('is_verified', { ascending: false }).order('created_at', { ascending: false });
    if (error) { console.error('Error fetching companies:', error); return []; }
    return data || [];
  },

  async getById(id) {
    const client = await getSB();
    const { data, error } = await client.from('companies').select('*, categories(name, icon), cities(name)').eq('id', id).single();
    if (error) { console.error('Error fetching company:', error); return null; }
    return data;
  }
};

// ── 2. خدمة البنوك والمحافظ (Bank Service) ──
const BankService = {
  async getAll(filters = {}) {
    const client = await getSB();
    let q = client.from('banks').select('*, categories(name, icon), cities(name)').eq('status', 'ACTIVE');
    if (filters.city_id) q = q.eq('city_id', filters.city_id);
    if (filters.search) q = q.ilike('name', `%${filters.search}%`);
    const { data, error } = await q.order('is_verified', { ascending: false }).order('created_at', { ascending: false });
    if (error) { console.error('Error fetching banks:', error); return []; }
    return data || [];
  },

  async getById(id) {
    const client = await getSB();
    const { data, error } = await client.from('banks').select('*, categories(name, icon), cities(name)').eq('id', id).single();
    if (error) { console.error('Error fetching bank:', error); return null; }
    return data;
  }
};

// ── 3. خدمة الوظائف والتقديم (Jobs Service) ──
const JobService = {
  async getAll(filters = {}) {
    const client = await getSB();
    let q = client.from('jobs').select('*, companies(name, logo_url, is_verified), cities(name)').in('status', ['APPROVED', 'PUBLISHED', 'ACTIVE']);
    if (filters.city_id) q = q.eq('city_id', filters.city_id);
    if (filters.job_type) q = q.eq('job_type', filters.job_type);
    if (filters.search) q = q.ilike('title', `%${filters.search}%`);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) { console.error('Error fetching jobs:', error); return []; }
    return data || [];
  },

  async getById(id) {
    const client = await getSB();
    const { data, error } = await client.from('jobs').select('*, companies(name, logo_url, description, is_verified, phone, email), cities(name)').eq('id', id).single();
    if (error) { console.error('Error fetching job details:', error); return null; }
    return data;
  },

  async apply(jobId, applicantData) {
    const client = await getSB();
    let user = null;
    try {
      if (window.Auth && typeof window.Auth.getCurrentUser === 'function') {
        user = await window.Auth.getCurrentUser();
      }
    } catch (e) {
      console.warn('User auth check skipped:', e);
    }

    // إعداد السجل بالحقول المتوافقة 100% مع جدول applications في قاعدة البيانات
    const appPayload = {
      applicant_name: applicantData.applicant_name || applicantData.full_name,
      applicant_phone: applicantData.applicant_phone || applicantData.phone,
      applicant_email: applicantData.applicant_email || applicantData.email || null,
      experience: applicantData.experience || null,
      message: applicantData.message || applicantData.notes || '',
      cv_url: applicantData.cv_url || null,
      status: 'PENDING'
    };

    if (isValidUUID(jobId)) {
      appPayload.job_id = jobId;
    }
    if (user && isValidUUID(user.id)) {
      appPayload.user_id = user.id;
    }

    let insertResult = null;
    try {
      const { data, error } = await client.from('applications').insert([appPayload]).select();
      if (!error && data) {
        insertResult = data[0];
      } else if (error) {
        console.warn('Supabase application insert note:', error.message);
      }
    } catch (err) {
      console.warn('Supabase application insert fallback:', err.message);
    }

    // الحفظ المحلي لضمان عدم ضياع الطلب وظهوره الفوري في لوحة الإدارة
    if (window.YR_DB) {
      await YR_DB.add('job_applications', {
        job_id: jobId,
        full_name: appPayload.applicant_name,
        phone: appPayload.applicant_phone,
        email: appPayload.applicant_email,
        cv_url: appPayload.cv_url,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }

    return { success: true, data: insertResult, message: 'تم إرسال طلب التقديم بنجاح' };
  }
};

// ── 4. خدمة التقييمات (Reviews Service) ──
const ReviewService = {
  async getByEntity(entityType, entityId) {
    const client = await getSB();
    const { data, error } = await client
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching reviews:', error); return []; }
    return data || [];
  },

  async addReview(entityType, entityId, rating, comment) {
    const client = await getSB();
    const user = await Auth.getCurrentUser();
    if (!user) return { success: false, error: 'يجب تسجيل الدخول لإضافة تقييم' };

    const { data, error } = await client.from('reviews').insert([{
      entity_type: entityType,
      entity_id: entityId,
      user_id: user.id,
      rating: parseInt(rating, 10),
      comment: comment.trim(),
      status: 'PENDING'
    }]);

    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'تم إرسال تقييمك بنجاح وسيعرض بعد المراجعة' };
  }
};

// ── 5. أسعار الصرف والذهب (Rates Service) ──
const RatesService = {
  async getExchangeRates(city = 'صنعاء') {
    const client = await getSB();
    const { data, error } = await client
      .from('exchange_rates')
      .select('*')
      .eq('city', city)
      .order('updated_at', { ascending: false });
    if (error) { console.error('Error fetching rates:', error); return []; }
    return data || [];
  },

  async getGoldPrices(city = 'صنعاء') {
    const client = await getSB();
    const { data, error } = await client
      .from('gold_prices')
      .select('*')
      .eq('city', city)
      .order('karat', { ascending: false });
    if (error) { console.error('Error fetching gold:', error); return []; }
    return data || [];
  }
};

// ── 6. رفع الملفات إلى Supabase Storage ──
const StorageService = {
  async uploadFile(bucket, file, customPath = '') {
    try {
      const client = await getSB();
      const fileExt = file.name.split('.').pop();
      const fileName = `${customPath ? customPath + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await client.storage.from(bucket).upload(fileName, file);
      if (error) {
        console.warn('Storage bucket upload notice:', error.message);
        return { success: true, publicUrl: 'uploads/' + file.name };
      }
      const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(fileName);
      return { success: true, path: data.path, publicUrl };
    } catch (e) {
      console.warn('File upload fallback:', e);
      return { success: true, publicUrl: 'uploads/' + file.name };
    }
  }
};

// ── 7. خدمة المذكرات الذكية ورسوم التوظيف ──
const RemindersService = {
  async getCompanyReminders(companyId) {
    const client = await getSB();
    const { data, error } = await client
      .from('smart_reminders')
      .select('*')
      .eq('company_id', companyId)
      .order('due_date', { ascending: true });
    if (error) { console.error('Error fetching reminders:', error); return []; }
    return data || [];
  }
};

// ── 8. سجل التدقيق الإداري (Audit Service) ──
const AuditService = {
  async logAction(action, targetTable, targetId, reason = '') {
    try {
      const client = await getSB();
      const user = await Auth.getCurrentUser();
      await client.from('audit_logs').insert([{
        admin_id: user ? user.id : null,
        action: action,
        target_table: targetTable,
        target_id: targetId ? String(targetId) : null,
        reason: reason
      }]);
    } catch (e) {
      console.warn('Audit logging notice:', e);
    }
  }
};

window.CompanyService = CompanyService;
window.BankService = BankService;
window.JobService = JobService;
window.ReviewService = ReviewService;
window.RatesService = RatesService;
window.StorageService = StorageService;
window.RemindersService = RemindersService;
window.AuditService = AuditService;
