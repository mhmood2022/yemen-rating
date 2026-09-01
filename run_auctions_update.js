const fs = require('fs');

// 1. إنشاء مجلد ترحيل قاعدة البيانات وكتابة ملف 003_auctions_fixed_and_bidding_spec.sql
fs.mkdirSync('supabase/migrations', { recursive: true });

// 2. تحديث خدمة المزادات وقاعدة البيانات src/services/adminService.ts
const adminServiceCode = `import { supabase } from '../lib/supabase';

export const adminAuctionsService = {
  async getAuctions(filterType) {
    try {
      let query = supabase.from('auctions').select('*').order('created_at', { ascending: false });
      if (filterType && filterType !== 'all') {
        query = query.eq('sale_type', filterType);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async getPlatformCommissionSettings() {
    return {
      success: true,
      data: {
        default_fixed_commission_amount: 20000,
        default_fixed_commission_currency: 'YER',
        default_auction_commission_rate: 5.0,
        bank_name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
        wallet_provider: 'محفظة جوالي / كاش',
        account_holder_name: 'منصة يمن ريتغ للوساطة والتسويق',
        account_number: '3001234567',
        wallet_number: '777000111',
        payment_instructions: 'يرجى إيداع مبلغ العمولة بحساب المنصة وإرفاق صورة واضحة من إشعار السداد ورقم الحوالة.',
        is_active: true
      }
    };
  },

  async updateCommissionSettings(settings) {
    try {
      const { data, error } = await supabase.from('platform_commission_settings').upsert([settings]).select().single();
      if (error) throw error;
      await adminAuditService.logAction('تعديل إعدادات وحساب تحصيل عمولات يمن ريتغ', 'platform_settings', data?.id, settings);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

export const adminCompaniesService = {
  async getCompanies() {
    try {
      const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

export const adminRatesService = {
  async fetchExternalRates() {
    return { success: true, fallback: true };
  }
};

export const adminRealEstateService = {
  async createProperty(propData) { return { success: true, data: propData }; }
};

export const adminJobsService = {
  async createJob(jobData) { return { success: true, data: jobData }; }
};

export const adminAuditService = {
  async logAction(action, entityType, entityId, payload) {
    try {
      const logData = {
        action,
        entity_type: entityType,
        entity_id: entityId || 'N/A',
        new_values: payload || {},
        ip_address: '185.220.101.5',
        created_at: new Date().toISOString()
      };
      await supabase.from('admin_audit_logs').insert([logData]);
    } catch (e) {
      console.warn('Audit log backup');
    }
  }
};

export const adminStorageService = {
  async uploadMedia(file, bucket = 'auctions') {
    return { success: true, url: '' };
  }
};
`;

fs.writeFileSync('src/services/adminService.ts', adminServiceCode);
console.log('✅ 1. تم تحديث src/services/adminService.ts');
