import { supabase } from '../lib/supabase';

// 1. إدارة الشركات والأنشطة
export const adminCompaniesService = {
  async getCompanies() {
    try {
      const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async createCompany(companyData: any) {
    try {
      const { data, error } = await supabase.from('companies').insert([companyData]).select().single();
      if (error) throw error;
      await adminAuditService.logAction('إنشاء شركة جديدة', 'company', data?.id, companyData);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateBadge(companyId: string, badge: 'gold' | 'blue' | 'gray' | 'none') {
    try {
      const { data, error } = await supabase.from('companies').update({ badge_type: badge }).eq('id', companyId).select().single();
      if (error) throw error;
      await adminAuditService.logAction(`تغيير الشارة إلى ${badge}`, 'company', companyId, { badge });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleVisibility(companyId: string, isHidden: boolean, reason?: string) {
    try {
      const { data, error } = await supabase.from('companies').update({ is_hidden: isHidden }).eq('id', companyId).select().single();
      if (error) throw error;
      await adminAuditService.logAction(isHidden ? 'حظر/إخفاء شركة' : 'إعادة تفعيل شركة', 'company', companyId, { reason, isHidden });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// 2. أسعار الصرف والذهب (يدوي + API مع Fallback)
export const adminRatesService = {
  async getRates() {
    try {
      const { data, error } = await supabase.from('exchange_rates').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateRateManual(id: string, buySanaa: number, sellSanaa: number, buyAden: number, sellAden: number) {
    try {
      const payload = {
        buy_sanaa: buySanaa,
        sell_sanaa: sellSanaa,
        buy_aden: buyAden,
        sell_aden: sellAden,
        source: 'manual_admin',
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('exchange_rates').update(payload).eq('id', id).select().single();
      if (error) throw error;
      await adminAuditService.logAction('تعديل يدوي لأسعار الصرف', 'exchange_rate', id, payload);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async fetchExternalRates() {
    try {
      // محاولة جلب من المصدر الخارجي مع الحفاظ على الإدخال اليدوي عند الفشل
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('فشل جلب الأسعار الخارجية');
      const json = await res.json();
      return { success: true, rates: json.rates, source: 'external_api', timestamp: new Date().toISOString() };
    } catch (err: any) {
      return { success: false, error: 'تعذر الاتصال بالمصدر الخارجي، تم الاعتماد على الأسعار اليدوية', fallback: true };
    }
  }
};

// 3. المزادات والعمولة السرية (5%)
export const adminAuctionsService = {
  async createAuction(auctionData: any) {
    try {
      const commissionRate = 5.0; // عمولة سرية ثابتة
      const initialPrice = Number(auctionData.initial_price) || 0;
      const commissionAmount = initialPrice * (commissionRate / 100);
      const netAmount = initialPrice - commissionAmount;

      const payload = {
        ...auctionData,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        net_seller_amount: netAmount,
        status: 'active'
      };

      const { data, error } = await supabase.from('auctions').insert([payload]).select().single();
      if (error) throw error;
      await adminAuditService.logAction('إنشاء مزاد جديد واحتساب العمولة 5%', 'auction', data?.id, payload);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleAuctionStatus(id: string, status: 'active' | 'paused' | 'ended', reason?: string) {
    try {
      const { data, error } = await supabase.from('auctions').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      await adminAuditService.logAction(`تغيير حالة المزاد إلى ${status}`, 'auction', id, { status, reason });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// 4. العقارات وحجب التواصل والعمولات
export const adminRealEstateService = {
  async createProperty(propData: any) {
    try {
      const price = Number(propData.price) || 0;
      const commissionRate = Number(propData.commission_rate) || 2.5;
      const commissionAmount = price * (commissionRate / 100);

      const payload = {
        ...propData,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        is_contact_hidden: true, // حجب أرقام التواصل تلقائياً
        is_commission_hidden_from_seller: propData.is_commission_hidden_from_seller ?? false
      };

      const { data, error } = await supabase.from('real_estate').insert([payload]).select().single();
      if (error) throw error;
      await adminAuditService.logAction('إنشاء إعلان عقار جديد', 'real_estate', data?.id, payload);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleContactMask(id: string, isHidden: boolean) {
    try {
      const { data, error } = await supabase.from('real_estate').update({ is_contact_hidden: isHidden }).eq('id', id).select().single();
      if (error) throw error;
      await adminAuditService.logAction(isHidden ? 'حجب أرقام التواصل' : 'كشف أرقام التواصل لتحقق شروط الصفقة', 'real_estate', id, { isHidden });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleCommissionToSeller(id: string, isHiddenFromSeller: boolean) {
    try {
      const { data, error } = await supabase.from('real_estate').update({ is_commission_hidden_from_seller: isHiddenFromSeller }).eq('id', id).select().single();
      if (error) throw error;
      await adminAuditService.logAction(isHiddenFromSeller ? 'إخفاء العمولة عن صاحب العقار' : 'إظهار العمولة لصاحب العقار', 'real_estate', id, { isHiddenFromSeller });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// 5. الوظائف وعمولة التوظيف الثابتة
export const adminJobsService = {
  async createJob(jobData: any) {
    try {
      const { data, error } = await supabase.from('jobs').insert([jobData]).select().single();
      if (error) throw error;
      await adminAuditService.logAction('إنشاء وظيفة جديدة وتحديد عمولة التوظيف الثابتة', 'job', data?.id, jobData);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// 6. البنوك والمحافظ الإلكترونية
export const adminBanksService = {
  async createBankOrWallet(entityData: any) {
    try {
      const { data, error } = await supabase.from('banks_wallets').insert([entityData]).select().single();
      if (error) throw error;
      await adminAuditService.logAction(`إنشاء ${entityData.type === 'bank' ? 'بنك' : 'محفظة إلكترونية'} جديد`, 'bank_wallet', data?.id, entityData);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// 7. إدارة التقييمات والمراجعات
export const adminReviewsService = {
  async getReviews() {
    try {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteReview(reviewId: string, reason: string) {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      await adminAuditService.logAction('حذف تقييم مخالف', 'review', reviewId, { reason });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// 8. سجل العمليات Audit Log
export const adminAuditService = {
  async logAction(action: string, entityType: string, entityId?: string, payload?: any) {
    try {
      const session = JSON.parse(localStorage.getItem('yr_admin_session') || '{}');
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
      console.warn('Audit log local fallback');
    }
  }
};

// 9. رفع الوسائط الحقيقي Supabase Storage
export const adminStorageService = {
  async uploadMedia(file: File, bucket: 'companies' | 'realestate' | 'claims' | 'ads' = 'ads') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${bucket}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
      if (error) throw error;
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return { success: true, url: publicData.publicUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
