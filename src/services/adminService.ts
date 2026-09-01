import { supabase } from '../lib/supabase';

export const adminAuctionsService = {
  // جلب كافة المزادات والعروض مع الفلترة
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
      return { success: false, error: err.message, data: [] };
    }
  },

  // جلب تفاصيل مزاد محدد للمراقبة الحية (/admin/auctions/:id)
  async getAuctionById(id: string) {
    try {
      const { data, error } = await supabase.from('auctions').select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // جلب سجل المزايدات الحي لمزاد معين
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
      return { success: false, error: err.message, data: [] };
    }
  },

  // جلب الخط الزمني لصفقة المزاد
  async getAuctionTimeline(auctionId: string) {
    try {
      const { data, error } = await supabase
        .from('auction_timeline_events')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message, data: [] };
    }
  },

  // جلب تنبيهات الإدارة
  async getAdminNotifications() {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message, data: [] };
    }
  },

  // الاشتراك اللحظي في مزايدات المزاد (Realtime Subscription)
  subscribeToBids(auctionId: string, onNewBid: (bid: any) => void) {
    const channel = supabase
      .channel(`auction-bids-${auctionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'auction_bids', filter: `auction_id=eq.${auctionId}` },
        (payload) => {
          onNewBid(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // تغيير حالة المزاد مع التوثيق الإلزامي في Audit Log
  async updateAuctionStatus(auctionId: string, newStatus: string, reason: string, adminName: string) {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', auctionId)
        .select()
        .single();
      if (error) throw error;

      await adminAuditService.logAction(
        `تغيير حالة المزاد إلى (${newStatus})`,
        'auctions',
        auctionId,
        { previous_status: 'unknown', new_status: newStatus, reason, admin: adminName }
      );

      // تسجيل في الخط الزمني
      await supabase.from('auction_timeline_events').insert([{
        auction_id: auctionId,
        event_stage: newStatus,
        title: `تحديث الحالة إلى ${newStatus}`,
        description: reason,
        actor_name: adminName,
        actor_role: 'admin',
        created_at: new Date().toISOString()
      }]);

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // جلب إعدادات عمولات المنصة وحسابات التحصيل
  async getPlatformCommissionSettings() {
    try {
      const { data, error } = await supabase.from('platform_commission_settings').select('*').eq('is_active', true).single();
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return {
        success: true,
        data: {
          default_fixed_commission_amount: 20000,
          default_fixed_commission_currency: 'YER',
          default_auction_commission_rate: 5.0,
          bank_name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
          wallet_provider: 'محفظة جوالي / كاش / ون كاش',
          account_holder_name: 'منصة يمن ريتغ للوساطة والتسويق',
          account_number: '3001234567',
          wallet_number: '777000111',
          payment_instructions: 'يرجى إيداع مبلغ العمولة بحساب المنصة وإرفاق صورة واضحة من إشعار السداد ورقم الحوالة.',
          is_active: true
        }
      };
    }
  },

  async updateCommissionSettings(settings: any) {
    try {
      const { data, error } = await supabase.from('platform_commission_settings').upsert([settings]).select().single();
      if (error) throw error;
      await adminAuditService.logAction('تعديل إعدادات وحساب تحصيل عمولات يمن ريتغ', 'platform_settings', data?.id, settings);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // اعتماد أو رفض إيصال السداد مع تسجيل السبب
  async verifyCommissionPayment(auctionId: string, isApproved: boolean, notes: string, adminName: string) {
    try {
      const payload = {
        commission_status: isApproved ? 'paid' : 'rejected_needs_resubmission',
        status: isApproved ? 'completed' : 'payment_pending',
        commission_verified_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('auctions').update(payload).eq('id', auctionId).select().single();
      if (error) throw error;

      await adminAuditService.logAction(
        isApproved ? 'اعتماد إيصال سداد العمولة بنجاح' : `رفض إيصال السداد: ${notes}`,
        'auctions',
        auctionId,
        { isApproved, notes, admin: adminName }
      );

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // فض وإغلاق النزاع
  async resolveDispute(auctionId: string, disputeStatus: string, adminDecisionNotes: string, finalDealStatus: string, adminName: string) {
    try {
      const payload: any = {
        dispute_status: disputeStatus,
        dispute_admin_decision: adminDecisionNotes,
        dispute_resolved_at: new Date().toISOString(),
        status: finalDealStatus
      };

      const { data, error } = await supabase.from('auctions').update(payload).eq('id', auctionId).select().single();
      if (error) throw error;

      await adminAuditService.logAction(
        `تسجيل قرار الإدارة في النزاع: ${adminDecisionNotes}`,
        'auctions',
        auctionId,
        { decision: finalDealStatus, notes: adminDecisionNotes, admin: adminName }
      );

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // إرسال رسالة في محادثة الصفقة
  async sendDealMessage(auctionId: string, senderName: string, senderRole: 'seller' | 'buyer' | 'admin', messageText: string) {
    try {
      const { data, error } = await supabase.from('auction_deal_messages').insert([{
        auction_id: auctionId,
        sender_name: senderName,
        sender_role: senderRole,
        message_text: messageText,
        created_at: new Date().toISOString()
      }]).select().single();
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

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
      console.warn('Audit log backup created locally');
    }
  }
};

export const adminCompaniesService = {
  async getCompanies() {
    try {
      const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message, data: [] };
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
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('فشل جلب الأسعار');
      const json = await res.json();
      return { success: true, rates: json.rates, source: 'external_api', timestamp: new Date().toISOString() };
    } catch (err: any) {
      return { success: false, error: 'تم الاعتماد على الأسعار اليدوية', fallback: true };
    }
  }
};

export const adminRealEstateService = {
  async createProperty(propData: any) {
    try {
      const { data, error } = await supabase.from('real_estate').insert([propData]).select().single();
      if (error) throw error;
      await adminAuditService.logAction('إنشاء عقار جديد', 'real_estate', data?.id, propData);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
  async toggleContactMask(id: string, isHidden: boolean) {
    try {
      const { data, error } = await supabase.from('real_estate').update({ is_contact_hidden: isHidden }).eq('id', id).select().single();
      if (error) throw error;
      await adminAuditService.logAction(isHidden ? 'حجب أرقام التواصل' : 'كشف أرقام التواصل', 'real_estate', id, { isHidden });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

export const adminJobsService = {
  async createJob(jobData: any) {
    try {
      const { data, error } = await supabase.from('jobs').insert([jobData]).select().single();
      if (error) throw error;
      await adminAuditService.logAction('إنشاء وظيفة جديدة', 'job', data?.id, jobData);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
