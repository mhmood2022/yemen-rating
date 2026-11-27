import { supabase } from '../lib/supabase';
import { uploadSocialImage } from './socialService';

export type AdProductType = 'phone_feed' | 'sponsor' | 'banner';

export type AdOrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'expired'
  | 'cancelled';

export interface AdPackageRecord {
  id: string;
  code: string;
  ad_type: AdProductType;
  tier_key: string;
  name: string;
  description: string;
  duration_days: number;
  post_quota: number;
  highlight_quota: number;
  default_price_yer: number;
  default_price_usd: number;
  previous_price_yer: number | null;
  previous_price_usd: number | null;
  is_free: boolean;
  discount_percent: number;
  discount_amount_yer: number;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
  features: string[];
  visual_tier: string;
  is_exclusive: boolean;
  allow_rotation: boolean;
  requires_approval: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdSectionPricingRecord {
  id: string;
  package_id: string;
  ad_type: AdProductType;
  section_id: string;
  slot_key: string;
  price_yer: number;
  price_usd: number;
  previous_price_yer: number | null;
  previous_price_usd: number | null;
  is_free: boolean;
  discount_percent: number;
  discount_amount_yer: number;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
  allow_rotation: boolean | null;
  is_exclusive: boolean | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdOrderQuote {
  package_id: string;
  package_name: string;
  ad_type: AdProductType;
  tier_key: string;
  visual_tier: string;
  duration_days: number;
  post_quota: number;
  highlight_quota: number;
  section_id: string;
  slot_key: string;
  currency: 'YER' | 'USD';
  base_price: number;
  discount_amount: number;
  final_price: number;
  is_free: boolean;
  promo_active: boolean;
  promo_ends_at: string | null;
  pricing_source: 'section_slot_custom' | 'package_default';
  is_exclusive: boolean;
  allow_rotation: boolean;
  requires_approval: boolean;
  features: string[];
}

export interface AdSlotAvailability {
  available: boolean;
  conflict_count: number;
  conflict_until: string | null;
  is_exclusive?: boolean;
  allow_rotation?: boolean;
}

export interface AdSubscriptionOrder {
  id: string;
  user_id: string;
  business_id: string | null;
  ad_type: AdProductType;
  package_id: string;
  section_id: string;
  slot_key: string;
  package_name_snapshot: string;
  duration_days: number;
  post_quota: number;
  highlight_quota: number;
  remaining_posts: number;
  remaining_highlights: number;
  currency: 'YER' | 'USD';
  base_price: number;
  discount_amount: number;
  final_price: number;
  is_free_order: boolean;
  pricing_source: string;
  ad_payload: Record<string, any>;
  status: AdOrderStatus;
  payment_method_id: string | null;
  payment_method_name: string | null;
  payment_reference: string | null;
  payment_proof_url: string | null;
  payment_proof_hash: string | null;
  starts_at: string | null;
  ends_at: string | null;
  published_ad_id: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // حقول مجمعة للعرض
  user_name?: string;
  user_avatar?: string | null;
  business_name?: string | null;
  package_visual_tier?: string;
}

export interface PhoneAdPostRecord {
  id: string;
  order_id: string;
  user_id: string;
  business_id: string | null;
  ad_tier: 'basic' | 'pro' | 'vip';
  is_highlighted: boolean;
  item_payload: Record<string, any>;
  status: 'pending' | 'active' | 'paused' | 'expired' | 'rejected';
  starts_at: string;
  ends_at: string;
  views_count: number;
  created_at: string;
}

export interface NormalizedPaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_url: string | null;
  qr_code_url: string | null;
  phone_number: string | null;
  wallet_number: string | null;
  point_number: string | null;
  account_number: string | null;
  iban: string | null;
  account_name: string | null;
  bank_name: string | null;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
}

export interface AdPricingAuditLog {
  id: string;
  admin_id: string | null;
  admin_name: string | null;
  target_table: string;
  target_id: string;
  action: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

const parseFeatures = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizePkg = (row: any): AdPackageRecord => ({
  ...row,
  default_price_yer: Number(row.default_price_yer || 0),
  default_price_usd: Number(row.default_price_usd || 0),
  previous_price_yer: row.previous_price_yer != null ? Number(row.previous_price_yer) : null,
  previous_price_usd: row.previous_price_usd != null ? Number(row.previous_price_usd) : null,
  discount_percent: Number(row.discount_percent || 0),
  discount_amount_yer: Number(row.discount_amount_yer || 0),
  duration_days: Number(row.duration_days || 30),
  post_quota: Number(row.post_quota || 0),
  highlight_quota: Number(row.highlight_quota || 0),
  features: parseFeatures(row.features),
});

export const calculateFileSHA256 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const adSubscriptionsService = {
  async getActivePackages(adType?: AdProductType): Promise<AdPackageRecord[]> {
    let q = supabase
      .from('ad_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (adType) q = q.eq('ad_type', adType);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(normalizePkg);
  },

  async adminGetAllPackages(adType?: AdProductType): Promise<AdPackageRecord[]> {
    let q = supabase
      .from('ad_packages')
      .select('*')
      .order('ad_type', { ascending: true })
      .order('sort_order', { ascending: true });
    if (adType) q = q.eq('ad_type', adType);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(normalizePkg);
  },

  async getSectionPricing(packageId?: string): Promise<AdSectionPricingRecord[]> {
    let q = supabase
      .from('ad_section_pricing')
      .select('*')
      .order('section_id', { ascending: true });
    if (packageId) q = q.eq('package_id', packageId);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map((r: any) => ({
      ...r,
      price_yer: Number(r.price_yer || 0),
      price_usd: Number(r.price_usd || 0),
      previous_price_yer: r.previous_price_yer != null ? Number(r.previous_price_yer) : null,
      previous_price_usd: r.previous_price_usd != null ? Number(r.previous_price_usd) : null,
      discount_percent: Number(r.discount_percent || 0),
      discount_amount_yer: Number(r.discount_amount_yer || 0),
    }));
  },

  async calculateQuote(
    packageId: string,
    sectionId: string = 'phones',
    slotKey: string = 'all',
    currency: 'YER' | 'USD' = 'YER'
  ): Promise<AdOrderQuote> {
    const { data, error } = await supabase.rpc('calculate_ad_order_quote', {
      p_package_id: packageId,
      p_section_id: sectionId,
      p_slot_key: slotKey,
      p_currency: currency,
    });
    if (error) throw error;
    return {
      ...data,
      base_price: Number(data.base_price || 0),
      discount_amount: Number(data.discount_amount || 0),
      final_price: Number(data.final_price || 0),
      features: parseFeatures(data.features),
    };
  },

  async checkSlotAvailability(
    adType: AdProductType,
    packageId: string,
    sectionId: string = 'phones',
    slotKey: string = 'all',
    startDate?: string
  ): Promise<AdSlotAvailability> {
    const { data, error } = await supabase.rpc('check_ad_slot_availability', {
      p_ad_type: adType,
      p_package_id: packageId,
      p_section_id: sectionId,
      p_slot_key: slotKey,
      p_start_date: startDate || new Date().toISOString(),
    });
    if (error) throw error;
    return data as AdSlotAvailability;
  },

  async getActivePaymentMethods(): Promise<NormalizedPaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return (data || [])
      .map((m: any) => ({
        id: m.id,
        name: m.name || m.provider_name || 'دفع يدوي',
        type: m.type || 'wallet',
        icon_url: m.icon_url || m.logo_url || null,
        qr_code_url: m.qr_code_url || m.qr_image_url || null,
        phone_number: m.phone_number || null,
        wallet_number: m.wallet_number || null,
        point_number: m.point_number || null,
        account_number: m.account_number || null,
        iban: m.iban || null,
        account_name: m.account_name || null,
        bank_name: m.bank_name || null,
        instructions: m.instructions || null,
        is_active: Boolean(m.is_active),
        display_order: Number(m.display_order ?? m.sort_order ?? 0),
      }))
      .sort((a, b) => a.display_order - b.display_order);
  },

  async uploadPaymentProof(file: File, userId: string): Promise<{ path: string; hash: string }> {
    const hash = await calculateFileSHA256(file);
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/ad-order-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('payment-proofs').upload(filePath, file);
    if (error) throw error;
    return { path: filePath, hash };
  },

  async resolveProofUrl(proofPathOrUrl: string | null): Promise<string | null> {
    if (!proofPathOrUrl) return null;
    if (/^https?:\/\//i.test(proofPathOrUrl)) return proofPathOrUrl;
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(proofPathOrUrl, 3600);
    if (!error && data?.signedUrl) return data.signedUrl;
    const pub = supabase.storage.from('payment-proofs').getPublicUrl(proofPathOrUrl);
    return pub?.data?.publicUrl || proofPathOrUrl;
  },

  async uploadAdMedia(file: File, folder: 'banners' | 'sponsors' | 'phones' = 'banners'): Promise<string> {
    return uploadSocialImage(file, folder);
  },

  async submitOrder(params: {
    packageId: string;
    sectionId: string;
    slotKey: string;
    currency: 'YER' | 'USD';
    businessId?: string | null;
    adPayload: Record<string, any>;
    paymentMethodId?: string | null;
    paymentReference?: string | null;
    paymentProofUrl?: string | null;
    paymentProofHash?: string | null;
  }): Promise<AdSubscriptionOrder> {
    const { data, error } = await supabase.rpc('submit_ad_subscription_order', {
      p_package_id: params.packageId,
      p_section_id: params.sectionId,
      p_slot_key: params.slotKey,
      p_currency: params.currency,
      p_business_id: params.businessId || null,
      p_ad_payload: params.adPayload || {},
      p_payment_method_id: params.paymentMethodId || null,
      p_payment_reference: params.paymentReference || null,
      p_payment_proof_url: params.paymentProofUrl || null,
      p_payment_proof_hash: params.paymentProofHash || null,
    });
    if (error) throw error;
    return data as AdSubscriptionOrder;
  },

  async attachPaymentProof(params: {
    orderId: string;
    paymentMethodId: string;
    paymentReference: string;
    proofUrl?: string | null;
    proofHash?: string | null;
  }): Promise<AdSubscriptionOrder> {
    const { data, error } = await supabase.rpc('attach_ad_order_payment_proof', {
      p_order_id: params.orderId,
      p_payment_method_id: params.paymentMethodId,
      p_payment_reference: params.paymentReference,
      p_proof_url: params.proofUrl || null,
      p_proof_hash: params.proofHash || null,
    });
    if (error) throw error;
    return data as AdSubscriptionOrder;
  },

  async getMyOrders(userId?: string): Promise<AdSubscriptionOrder[]> {
    let uid = userId;
    if (!uid) {
      const { data } = await supabase.auth.getUser();
      uid = data?.user?.id;
    }
    if (!uid) return [];
    const { data, error } = await supabase
      .from('ad_subscription_orders')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as AdSubscriptionOrder[];
  },

  async getMyActivePhoneOrders(userId: string): Promise<AdSubscriptionOrder[]> {
    const { data, error } = await supabase
      .from('ad_subscription_orders')
      .select('*, pkg:ad_packages(visual_tier)')
      .eq('user_id', userId)
      .eq('ad_type', 'phone_feed')
      .eq('status', 'active')
      .order('ends_at', { ascending: false });
    if (error) throw error;
    const now = Date.now();
    return (data || [])
      .filter((o: any) => !o.ends_at || new Date(o.ends_at).getTime() >= now)
      .map((o: any) => ({
        ...o,
        package_visual_tier: o.pkg?.visual_tier || 'basic',
      }));
  },

  async publishPhoneFeaturedAd(params: {
    orderId: string;
    adTier: 'basic' | 'pro' | 'vip';
    highlight: boolean;
    itemPayload: Record<string, any>;
  }): Promise<PhoneAdPostRecord> {
    const { data, error } = await supabase.rpc('publish_phone_featured_ad', {
      p_order_id: params.orderId,
      p_ad_tier: params.adTier,
      p_highlight: params.highlight,
      p_item_payload: params.itemPayload,
    });
    if (error) throw error;
    return data as PhoneAdPostRecord;
  },

  async getActivePhoneAdPosts(): Promise<PhoneAdPostRecord[]> {
    const { data, error } = await supabase
      .from('phone_ad_posts')
      .select('*')
      .eq('status', 'active')
      .gte('ends_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []) as PhoneAdPostRecord[];
  },

  // ========================================================================
  // دوال الإدارة (Admin Only via RLS & SECURITY DEFINER)
  // ========================================================================
  async adminUpsertPackage(pkg: Partial<AdPackageRecord> & { name: string; ad_type: AdProductType }): Promise<AdPackageRecord> {
    const { data, error } = await supabase.rpc('admin_upsert_ad_package', {
      p_id: pkg.id || null,
      p_code: pkg.code || null,
      p_ad_type: pkg.ad_type,
      p_tier_key: pkg.tier_key || 'basic',
      p_name: pkg.name,
      p_description: pkg.description || '',
      p_duration_days: Number(pkg.duration_days || 30),
      p_post_quota: Number(pkg.post_quota || 0),
      p_highlight_quota: Number(pkg.highlight_quota || 0),
      p_default_price_yer: Number(pkg.default_price_yer || 0),
      p_default_price_usd: Number(pkg.default_price_usd || 0),
      p_is_free: Boolean(pkg.is_free),
      p_discount_percent: Number(pkg.discount_percent || 0),
      p_discount_amount_yer: Number(pkg.discount_amount_yer || 0),
      p_promo_starts_at: pkg.promo_starts_at || null,
      p_promo_ends_at: pkg.promo_ends_at || null,
      p_features: pkg.features || [],
      p_visual_tier: pkg.visual_tier || 'basic',
      p_is_exclusive: Boolean(pkg.is_exclusive),
      p_allow_rotation: pkg.allow_rotation !== false,
      p_requires_approval: pkg.requires_approval !== false,
      p_is_active: pkg.is_active !== false,
      p_sort_order: Number(pkg.sort_order || 0),
    });
    if (error) throw error;
    return normalizePkg(data);
  },

  async adminTogglePackageFree(packageId: string, makeFree: boolean): Promise<AdPackageRecord> {
    const { data, error } = await supabase.rpc('admin_toggle_package_free', {
      p_package_id: packageId,
      p_make_free: makeFree,
    });
    if (error) throw error;
    return normalizePkg(data);
  },

  async adminRestorePreviousPrice(packageId: string): Promise<AdPackageRecord> {
    const { data, error } = await supabase.rpc('admin_restore_package_previous_price', {
      p_package_id: packageId,
    });
    if (error) throw error;
    return normalizePkg(data);
  },

  async adminUpsertSectionPricing(params: {
    packageId: string;
    sectionId: string;
    slotKey: string;
    priceYer: number;
    priceUsd: number;
    isFree: boolean;
    discountPercent?: number;
    discountAmountYer?: number;
    promoStartsAt?: string | null;
    promoEndsAt?: string | null;
    allowRotation?: boolean | null;
    isExclusive?: boolean | null;
    isActive?: boolean;
  }): Promise<AdSectionPricingRecord> {
    const { data, error } = await supabase.rpc('admin_upsert_ad_section_pricing', {
      p_package_id: params.packageId,
      p_section_id: params.sectionId,
      p_slot_key: params.slotKey || 'all',
      p_price_yer: Number(params.priceYer || 0),
      p_price_usd: Number(params.priceUsd || 0),
      p_is_free: Boolean(params.isFree),
      p_discount_percent: Number(params.discountPercent || 0),
      p_discount_amount_yer: Number(params.discountAmountYer || 0),
      p_promo_starts_at: params.promoStartsAt || null,
      p_promo_ends_at: params.promoEndsAt || null,
      p_allow_rotation: params.allowRotation ?? null,
      p_is_exclusive: params.isExclusive ?? null,
      p_is_active: params.isActive !== false,
    });
    if (error) throw error;
    return data as AdSectionPricingRecord;
  },

  async adminDeleteSectionPricing(id: string): Promise<void> {
    const { error } = await supabase.from('ad_section_pricing').delete().eq('id', id);
    if (error) throw error;
  },

  async adminGetAllOrders(): Promise<AdSubscriptionOrder[]> {
    const { data: orders, error } = await supabase
      .from('ad_subscription_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!orders || orders.length === 0) return [];

    const userIds = Array.from(new Set(orders.map((o: any) => o.user_id).filter(Boolean)));
    const bizIds = Array.from(new Set(orders.map((o: any) => o.business_id).filter(Boolean)));

    const [{ data: profiles }, { data: businesses }] = await Promise.all([
      userIds.length > 0
        ? supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
        : Promise.resolve({ data: [] as any[] }),
      bizIds.length > 0
        ? supabase.from('businesses').select('id, name').in('id', bizIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const profMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    const bizMap = new Map((businesses || []).map((b: any) => [b.id, b]));

    return orders.map((o: any) => {
      const p = profMap.get(o.user_id);
      const b = o.business_id ? bizMap.get(o.business_id) : null;
      return {
        ...o,
        base_price: Number(o.base_price || 0),
        discount_amount: Number(o.discount_amount || 0),
        final_price: Number(o.final_price || 0),
        user_name: p?.full_name || 'مستخدم',
        user_avatar: p?.avatar_url || null,
        business_name: b?.name || null,
      };
    });
  },

  async adminReviewOrder(
    orderId: string,
    action: 'approve_activate' | 'approve_only' | 'reject' | 'pause' | 'cancel' | 'extend',
    adminNotes?: string,
    customEndDate?: string
  ): Promise<AdSubscriptionOrder> {
    const { data, error } = await supabase.rpc('admin_review_ad_order', {
      p_order_id: orderId,
      p_action: action,
      p_admin_notes: adminNotes || null,
      p_custom_end_date: customEndDate || null,
    });
    if (error) throw error;
    return data as AdSubscriptionOrder;
  },

  async adminExpireElapsed(): Promise<number> {
    const { data, error } = await supabase.rpc('expire_elapsed_ad_subscriptions');
    if (error) throw error;
    return Number(data || 0);
  },

  async adminGetPricingAuditLogs(limit = 60): Promise<AdPricingAuditLog[]> {
    const { data, error } = await supabase
      .from('ad_pricing_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as AdPricingAuditLog[];
  },
};
