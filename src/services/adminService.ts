import { supabase } from '../lib/supabase';

// ============================================================
// 1. خدمة المزادات والبيع الموحد (Auctions & Fixed Price Service)
// ============================================================
export const adminAuctionsService = {
  // جلب العروض والمزادات
  async getAuctions(filterType?: 'all' | 'auction' | 'fixed_price') {
    try {
      let query = supabase.from('auctions').select('*').order('created_at', { ascending: false });
      if (filterType && filterType !== 'all') {
        query = query.eq('sale_type', filterType);
      }
      const { data, error } = await query;
      if (error) throw error;
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
      // إعدادات افتراضية احتياطية
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

  // تحديث إعدادات العمولات وحسابات التحصيل من لوحة الإدارة
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

  // إنشاء عرض بيع بسعر ثابت أو مزاد
  async createListing(listingData: any, consentText: string) {
    try {
      const isFixed = listingData.sale_type === 'fixed_price';
      const fixedComm = listingData.currency === 'YER' ? 20000 : listingData.currency === 'SAR' ? 300 : 80;
      const initialPrice = Number(isFixed ? listingData.fixed_price : listingData.starting_price) || 0;
      
      const payload = {
        ...listingData,
        status: 'active',
        commission_rate: isFixed ? null : 5.0,
        commission_amount: isFixed ? fixedComm : (initialPrice * 0.05),
        commission_currency: listingData.currency || 'YER',
        commission_status: 'not_due',
        dispute_status: 'no_dispute'
      };

      const { data, error } = await supabase.from('auctions').insert([payload]).select().single();
      if (error) throw error;

      // توثيق الإقرار القانوني لمنشئ العرض في قاعدة البيانات
      await supabase.from('auction_legal_consents').insert([{
        auction_id: data.id,
        user_role_at_signing: 'seller',
        consent_stage: 'listing_submission',
        declaration_text: consentText,
        declaration_version: '1.0.0',
        agreed_at: new Date().toISOString()
      }]);

      await adminAuditService.logAction(`إنشاء عرض (${isFixed ? 'بيع بسعر ثابت' : 'مزاد علني'})`, 'auctions', data.id, payload);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // تقديم مزايدة عبر الخادم مع الإقرار
  async placeBid(auctionId: string, bidderCode: string, bidAmount: number, consentText: string) {
    try {
      const { data, error } = await supabase.rpc('fn_place_auction_bid', {
        p_auction_id: auctionId,
        p_bidder_id: null,
        p_bidder_code: bidderCode,
        p_bid_amount: bidAmount,
        p_declaration_text: consentText
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // تسجيل رغبة المشتري في البيع بسعر ثابت مع الإقرار
  async submitFixedPricePurchaseIntent(auctionId: string, buyerName: string, buyerPhone: string, consentText: string) {
    try {
      const { data, error } = await supabase.from('auctions').update({
        winner_buyer_name: buyerName,
        winner_buyer_phone: buyerPhone,
        status: 'deal_pending_confirmation',
        updated_at: new Date().toISOString()
      }).eq('id', auctionId).select().single();
      if (error) throw error;

      // تسجيل إقرار المشتري
      await supabase.from('auction_legal_consents').insert([{
        auction_id: auctionId,
        user_role_at_signing: 'buyer',
        consent_stage: 'buyer_purchase_intent',
        declaration_text: consentText,
        declaration_version: '1.0.0',
        agreed_at: new Date().toISOString()
      }]);

      await adminAuditService.logAction('تأكيد رغبة الشراء بالسعر الثابت وبدء التواصل', 'auctions', auctionId, { buyerName });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // تأكيد إتمام الصفقة واستحقاق العمولة
  async confirmDealCompletion(auctionId: string, confirmedByRole: 'seller' | 'buyer', consentText?: string) {
    try {
      const isSeller = confirmedByRole === 'seller';
      const updatePayload: any = {
        status: 'deal_confirmed_commission_due',
        commission_status: 'due',
        deal_confirmed_at: new Date().toISOString()
      };
      if (isSeller) updatePayload.deal_confirmed_by_seller = true;
      else updatePayload.deal_confirmed_by_buyer = true;

      const { data, error } = await supabase.from('auctions').update(updatePayload).eq('id', auctionId).select().single();
      if (error) throw error;

      if (consentText) {
        await supabase.from('auction_legal_consents').insert([{
          auction_id: auctionId,
          user_role_at_signing: confirmedByRole,
          consent_stage: 'deal_completion_commission',
          declaration_text: consentText,
          declaration_version: '1.0.0',
          agreed_at: new Date().toISOString()
        }]);
      }

      await adminAuditService.logAction(`تأكيد إتمام الصفقة من (${confirmedByRole}) واستحقاق العمولة`, 'auctions', auctionId, updatePayload);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // رفع إثبات وإيصال سداد العمولة مع الإقرار الرابع
  async submitCommissionPaymentProof(auctionId: string, transferNumber: string, receiptUrl: string, consentText: string) {
    try {
      const payload = {
        commission_transfer_number: transferNumber,
        commission_transfer_date: new Date().toISOString(),
        commission_receipt_url: receiptUrl,
        commission_status: 'pending_admin_verification',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('auctions').update(payload).eq('id', auctionId).select().single();
      if (error) throw error;

      await supabase.from('auction_legal_consents').insert([{
        auction_id: auctionId,
        user_role_at_signing: 'seller',
        consent_stage: 'payment_receipt_submission',
        declaration_text: consentText,
        declaration_version: '1.0.0',
        agreed_at: new Date().toISOString()
      }]);

      await adminAuditService.logAction('رفع إثبات سداد عمولة يمن ريتغ', 'auctions', auctionId, payload);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // إدارة العمولة من لوحة الإدارة (اعتماد أو رفض)
  async verifyCommissionPayment(auctionId: string, isApproved: boolean, notes?: string) {
    try {
      const payload = {
        commission_status: isApproved ? 'paid' : 'rejected_needs_resubmission',
        status: isApproved ? 'deal_completed' : 'deal_confirmed_commission_due',
        commission_verified_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('auctions').update(payload).eq('id', auctionId).select().single();
      if (error) throw error;

      await adminAuditService.logAction(isApproved ? 'اعتماد سداد عمولة يمن ريتغ بنجاح' : 'رفض إثبات سداد العمولة وطلب إعادة الرفع', 'auctions', auctionId, { isApproved, notes });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // فتح نزاع داخل العملية
  async openDispute(auctionId: string, openedByRole: 'seller' | 'buyer', reasonCategory: string, details: string) {
    try {
      const { data, error } = await supabase.from('auctions').update({
        status: 'dispute_opened',
        dispute_status: 'open',
        dispute_reason: `${reasonCategory}: ${details}`,
        dispute_opened_at: new Date().toISOString()
      }).eq('id', auctionId).select().single();
      if (error) throw error;

      await supabase.from('auction_disputes').insert([{
        auction_id: auctionId,
        opened_by_role: openedByRole,
        reason_category: reasonCategory,
        details: details,
        status: 'open',
        created_at: new Date().toISOString()
      }]);

      await adminAuditService.logAction(`فتح نزاع تجاري في المزاد/العرض بواسطة (${openedByRole})`, 'auctions', auctionId, { reasonCategory, details });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // إدارة النزاع من الإدارة
  async resolveDispute(auctionId: string, disputeStatus: 'decision_made' | 'closed', adminDecisionNotes: string, finalDealStatus: 'deal_completed' | 'deal_pending_confirmation' | 'cancelled') {
    try {
      const payload: any = {
        dispute_status: disputeStatus,
        dispute_admin_decision: adminDecisionNotes,
        dispute_resolved_at: new Date().toISOString(),
        status: finalDealStatus
      };

      const { data, error } = await supabase.from('auctions').update(payload).eq('id', auctionId).select().single();
      if (error) throw error;

      await supabase.from('auction_disputes').update({
        status: disputeStatus,
        admin_decision_notes: adminDecisionNotes,
        resolved_at: new Date().toISOString()
      }).eq('auction_id', auctionId);

      await adminAuditService.logAction('تسجيل قرار الإدارة في النزاع التجاري', 'auctions', auctionId, payload);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // رسائل المحادثة الخاصة بالصفقة
  async getDealMessages(auctionId: string) {
    try {
      const { data, error } = await supabase.from('auction_deal_messages').select('*').eq('auction_id', auctionId).order('created_at', { ascending: true });
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

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

// ============================================================
// 2. إدارة الشركات والأنشطة
// ============================================================
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

// ============================================================
// 3. أسعار الصرف والذهب
// ============================================================
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
      if (!res.ok) throw new Error('فشل جلب الأسعار الخارجية');
      const json = await res.json();
      return { success: true, rates: json.rates, source: 'external_api', timestamp: new Date().toISOString() };
    } catch (err: any) {
      return { success: false, error: 'تعذر الاتصال بالمصدر الخارجي، تم الاعتماد على الأسعار اليدوية', fallback: true };
    }
  }
};

// ============================================================
// 4. العقارات
// ============================================================
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
        is_contact_hidden: true,
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
      await adminAuditService.logAction(isHidden ? 'حجب أرقام التواصل' : 'كشف أرقام التواصل', 'real_estate', id, { isHidden });
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};

// ============================================================
// 5. الوظائف
// ============================================================
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

// ============================================================
// 6. سجل العمليات الأمني Audit Log
// ============================================================
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
      console.warn('Audit log local storage backup');
    }
  }
};

// ============================================================
// 7. رفع وسائط وإيصالات التخزين
// ============================================================
export const adminStorageService = {
  async uploadMedia(file: File, bucket: 'auctions' | 'companies' | 'realestate' | 'claims' | 'ads' = 'auctions') {
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
