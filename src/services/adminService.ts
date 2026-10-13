
// دالة تعريب أخطاء النظام وقاعدة البيانات للمستخدم
export const formatArabicError = (err: any, fallback = 'حدث خطأ أثناء معالجة العملية، يرجى المحاولة لاحقاً.'): string => {
  if (!err) return fallback;
  const msg = typeof err === 'string' ? err : err.message || '';
  console.error('[YemenRating Tech Error]:', err);

  if (msg.includes('JWT') || msg.includes('token') || msg.includes('unauthorized') || msg.includes('not logged in')) {
    return 'انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مجدداً.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
    return 'تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت.';
  }
  if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists')) {
    return 'هذا السجل أو رقم الحوالة مسجل مسبقاً في النظام.';
  }
  if (msg.includes('row-level security') || msg.includes('permission denied') || msg.includes('RLS')) {
    return 'ليس لديك صلاحية لتنفيذ هذه العملية.';
  }
  if (msg.includes('schema cache')) {
    return 'جاري مزامنة قاعدة البيانات، يرجى إعادة المحاولة بعد ثوانٍ.';
  }
  if (/[\u0600-\u06FF]/.test(msg)) {
    return msg;
  }
  return fallback;
};

import { supabase } from '../lib/supabase';





export const adminCompaniesService = {
  async getCompanies() {
    try {
      const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err), data: [] };
    }
  },
  async createCompany(companyData: any) {
    try {
      const { data, error } = await supabase.from('companies').insert([companyData]).select().single();
      if (error) throw error;
      await adminAuditService.log('إنشاء شركة جديدة', 'company', data?.id, companyData);
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  },
  async updateBadge(companyId: string, badge: 'gold' | 'blue' | 'gray' | 'none') {
    try {
      const { data, error } = await supabase.from('companies').update({ badge_type: badge }).eq('id', companyId).select().single();
      if (error) throw error;
      await adminAuditService.log(`تغيير الشارة إلى ${badge}`, 'company', companyId, { badge });
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  },
  async toggleVisibility(companyId: string, isHidden: boolean, reason?: string) {
    try {
      const { data, error } = await supabase.from('companies').update({ is_hidden: isHidden }).eq('id', companyId).select().single();
      if (error) throw error;
      await adminAuditService.log(isHidden ? 'حظر/إخفاء شركة' : 'إعادة تفعيل شركة', 'company', companyId, { reason, isHidden });
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  }
};

export const adminRatesService = {
  async getRates() {
    try {
      const { data, error } = await supabase.from('exchange_rates').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
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
      await adminAuditService.log('تعديل يدوي لأسعار الصرف', 'exchange_rate', id, payload);
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  },
  async fetchExternalRates() {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('فشل جلب الأسعار');
      const json = await res.json();
      return { success: true, rates: json.rates, source: 'external_api', timestamp: new Date().toISOString() };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: 'تم الاعتماد على الأسعار اليدوية', fallback: true };
    }
  }
};

export const adminRealEstateService = {
  async createProperty(propData: any) {
    try {
      const { data, error } = await supabase.from('real_estate').insert([propData]).select().single();
      if (error) throw error;
      await adminAuditService.log('إنشاء عقار جديد', 'real_estate', data?.id, propData);
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  },
  async toggleContactMask(id: string, isHidden: boolean) {
    try {
      const { data, error } = await supabase.from('real_estate').update({ is_contact_hidden: isHidden }).eq('id', id).select().single();
      if (error) throw error;
      await adminAuditService.log(isHidden ? 'حجب أرقام التواصل' : 'كشف أرقام التواصل', 'real_estate', id, { isHidden });
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  }
};

export const adminJobsService = {
  async createJob(jobData: any) {
    try {
      const { data, error } = await supabase.from('jobs').insert([jobData]).select().single();
      if (error) throw error;
      await adminAuditService.log('إنشاء وظيفة جديدة', 'job', data?.id, jobData);
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  }
};

export const adminAuctionsService = {

  // جلب إعدادات العمولة مع الدمج الهجين
  async getPlatformCommissionSettings() {
    try {
      const { data, error } = await supabase
        .from('platform_commission_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return {
        success: true,
        data: data || {
          seller_commission_rate: 10,
          buyer_commission_rate: 5,
          default_min_increment: 1000
        }
      };
    } catch (err: any) {
      console.error('getPlatformCommissionSettings error:', err);
      return {
        success: false,
        error: typeof formatArabicError === 'function' ? formatArabicError(err) : err.message,
        data: {
          seller_commission_rate: 10,
          buyer_commission_rate: 5,
          default_min_increment: 1000
        }
      };
    }
  },

  // حفظ وتحديث إعدادات العمولة
  async savePlatformCommissionSettings(settings: { seller_commission_rate: number; buyer_commission_rate?: number; default_min_increment?: number }) {
    try {
      const payload = {
        ...settings,
        updated_at: new Date().toISOString()
      };
      const { data: existing } = await supabase
        .from('platform_commission_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await supabase
          .from('platform_commission_settings')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return { success: true, data };
      } else {
        const { data, error } = await supabase
          .from('platform_commission_settings')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return { success: true, data };
      }
    } catch (err: any) {
      console.error('savePlatformCommissionSettings error:', err);
      return {
        success: false,
        error: typeof formatArabicError === 'function' ? formatArabicError(err) : err.message
      };
    }
  },


  // حفظ إعدادات العمولة المعتمدة بنظام التخزين الهجين الفوري المضمون

  // جلب إعدادات العمولة مع الدمج الهجين

  // تعديل وتحديث بيانات مزاد من لوحة الإدارة

  // حذف مزاد من قاعدة البيانات


  // تعديل بيانات المزاد بالكامل من لوحة الإدارة

  // حذف المزاد نهائياً من قاعدة البيانات


  // جلب كافة المزايدات عبر كافة المزادات لسجل الإدارة الشامل
  async getAllBids(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('auction_bids')
        .select('*, auctions(title, currency)')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      console.error('getAllBids error:', err);
      return { success: false, error: formatArabicError(err), data: [] };
    }
  },

  // تحديث شروط الاتفاق والعمولة والتأمين لمزاد محدد

  // جلب كافة المزادات والعروض الحقيقية مع الفلاتر
  async getAuctions(filterType?: 'all' | 'auction' | 'fixed_price', statusFilter?: string) {
    try {
      let query = supabase.from('auctions').select('*').order('created_at', { ascending: false });
      if (filterType && filterType !== 'all') {
        query = query.eq('sale_type', filterType);
      }
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      console.error('خطأ أثناء جلب المزادات:', err);
      return { success: false, error: formatArabicError(err), data: [] };
    }
  },

  // جلب تفاصيل مزاد محدد
  async getAuctionById(id: string) {
    try {
      const { data, error } = await supabase.from('auctions').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err), data: null };
    }
  },

  // جلب سجل المزايدات الحي الحقيقي لمزاد
  async getAuctionBids(auctionId: string) {
    try {
      const { data, error } = await supabase
        .from('auction_bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err), data: [] };
    }
  },

  // تنفيذ المزايدة الآمنة خادمياً عبر دالة RPC
  async placeSafeBid(auctionId: string, bidAmount: number) {
    try {
      const { data, error } = await supabase.rpc('place_auction_bid', {
        p_auction_id: auctionId,
        p_bid_amount: bidAmount
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  },

  // تحديث حالة المزاد المعتمد مع تسجيل التدقيق

  // إعدادات عمولة المنصة

  // حفظ إعدادات العمولة

  // جلب طرق الدفع اليدوية (جيب، أم فلوس، بنوك)
  async getPaymentMethods() {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err), data: [] };
    }
  },

  // حفظ أو تحديث طريقة دفع
  async savePaymentMethod(method: any) {
    try {
      const { data, error } = await supabase.from('payment_methods').upsert([method]).select().single();
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  },

  // جلب طلبات التحقق من الدفع اليدوي
  async getPaymentRequests(statusFilter?: string) {
    try {
      let query = supabase
        .from('payment_requests')
        .select('*, payment_methods(provider_name, account_number, type)')
        .order('created_at', { ascending: false });
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err), data: [] };
    }
  },

  // اعتماد أو رفض إثبات الدفع اليدوي عبر RPC
  async verifyPaymentRequest(requestId: string, action: 'verify' | 'reject', adminNotes?: string) {
    try {
      const { data, error } = await supabase.rpc('admin_verify_payment_request', {
        p_request_id: requestId,
        p_action: action,
        p_admin_notes: adminNotes || null
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err) };
    }
  },

  // جلب سجلات تأمينات المزادات
  async getAuctionDeposits(auctionId?: string) {
    try {
      let query = supabase.from('auction_deposits').select('*, auctions(title)').order('created_at', { ascending: false });
      if (auctionId) {
        query = query.eq('auction_id', auctionId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", err?.message || err);
      return { success: false, error: formatArabicError(err), data: [] };
    }
  },

  // الاشتراك اللحظي في مزايدات المزاد الحقيقية
  subscribeToBids(auctionId: string, onNewBid: (bid: any) => void) {
    return supabase
      .channel(`realtime-bids-${auctionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'auction_bids',
        filter: `auction_id=eq.${auctionId}`
      }, (payload) => onNewBid(payload.new))
      .subscribe();
  }
};

export const adminAuditService = {
  async log(action: string, entityType: string, entityId: string, details?: any, reason?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('admin_audit_logs').insert([{
        admin_user_id: user?.id || null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        new_value: details || null,
        reason: reason || null,
        created_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.error('Audit log error:', e);
    }
  },

  async getLogs(entityType?: string, limit = 50) {
    try {
      let q = supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
      if (entityType) q = q.eq('entity_type', entityType);
      const { data, error } = await q;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (e: any) {
      console.error("🚨 SUPABASE_REAL_ERROR in src/services/adminService.ts:", e?.message || e);
      return { success: false, error: e.message, data: [] };
    }
  }
};
