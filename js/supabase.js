// ═══════════════════════════════════════════════════════════════
// YEMEN RATING — Central Services Engine (Isolated & Safe)
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const DEFAULT_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
  const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';

  let sbClient = null;

  function isValidUUID(str) {
    if (!str || typeof str !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  }

  function getClient() {
    if (sbClient) return sbClient;
    try {
      const cfg = window.SUPABASE_CONFIG || {};
      const url = cfg.url || DEFAULT_URL;
      const key = cfg.anonKey || DEFAULT_KEY;
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        sbClient = window.supabase.createClient(url, key);
        return sbClient;
      }
    } catch (e) {
      console.warn('[Supabase] Init warning:', e);
    }
    return null;
  }

  window.getSB = getClient;

  // ── 1. خدمة الشركات ──
  const CompanyService = {
    async getAll(filters = {}) {
      const client = getClient();
      if (!client) return (window.YR_DB ? YR_DB.get('companies') : []);
      try {
        let q = client.from('companies').select('*').eq('status', 'ACTIVE');
        if (filters.search) q = q.ilike('name', `%${filters.search}%`);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (e) {
        return (window.YR_DB ? YR_DB.get('companies') : []);
      }
    }
  };

  // ── 2. خدمة البنوك ──
  const BankService = {
    async getAll() {
      const client = getClient();
      if (!client) return (window.YR_DB ? YR_DB.get('banks') : []);
      try {
        const { data, error } = await client.from('banks').select('*').eq('status', 'ACTIVE');
        if (error) throw error;
        return data || [];
      } catch (e) {
        return (window.YR_DB ? YR_DB.get('banks') : []);
      }
    }
  };

  // ── 3. خدمة الوظائف والتقديم ──
  const JobService = {
    async getAll() {
      const client = getClient();
      if (!client) return (window.YR_DB ? YR_DB.get('jobs') : []);
      try {
        const { data, error } = await client.from('jobs').select('*').in('status', ['APPROVED', 'PUBLISHED', 'ACTIVE']);
        if (error) throw error;
        return data || [];
      } catch (e) {
        return (window.YR_DB ? YR_DB.get('jobs') : []);
      }
    },

    async apply(jobId, applicantData) {
      const client = getClient();
      
      const appPayload = {
        applicant_name: applicantData.applicant_name || 'مرشح',
        applicant_phone: applicantData.applicant_phone || '',
        applicant_email: applicantData.applicant_email || '',
        experience: applicantData.experience || '',
        message: applicantData.message || 'طلب تقديم عبر منصة يمن ريتغ',
        cv_url: applicantData.cv_url || null,
        status: 'PENDING'
      };

      if (isValidUUID(jobId)) {
        appPayload.job_id = jobId;
      }

      let remoteSaved = false;
      if (client) {
        try {
          const { data, error } = await client.from('applications').insert([appPayload]).select();
          if (!error && data) {
            remoteSaved = true;
            console.log('✅ Remote Supabase Insert:', data);
          } else if (error) {
            console.warn('⚠️ Remote Supabase Notice:', error.message);
          }
        } catch (netErr) {
          console.warn('⚠️ Network Supabase Notice:', netErr.message);
        }
      }

      // حفظ محلي لضمان تجربة فورية وسريعة
      if (window.YR_DB) {
        try {
          await YR_DB.add('job_applications', {
            job_id: jobId,
            full_name: appPayload.applicant_name,
            phone: appPayload.applicant_phone,
            email: appPayload.applicant_email,
            cv_url: appPayload.cv_url,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Local save note:', dbErr);
        }
      }

      return { success: true, remote: remoteSaved };
    }
  };

  // ── 4. خدمة رفع الملفات ──
  const StorageService = {
    async uploadFile(bucket, file, customPath = '') {
      const client = getClient();
      if (!client || !file) return { success: true, publicUrl: null };
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${customPath ? customPath + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data, error } = await client.storage.from(bucket).upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(fileName);
        return { success: true, publicUrl };
      } catch (e) {
        console.warn('File upload fallback:', e.message);
        return { success: true, publicUrl: file.name };
      }
    }
  };

  // تصدير كل الخدمات إلى النطاق العام window
  window.CompanyService = CompanyService;
  window.BankService = BankService;
  window.JobService = JobService;
  window.StorageService = StorageService;

  console.log('✅ Yemen Rating Services Initialized Successfully!');
})();
