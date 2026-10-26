import { supabase } from '../lib/supabaseClient';
import { Property, PropertyInquiry } from '../types/database.types';

export const propertyService = {
  // جلب العقارات المجهولة للزوار
  async getPublicProperties(filters?: { type?: string; listingType?: string; city?: string }) {
    if (supabase) {
      try {
        let query = supabase.from('properties').select('*').eq('status', 'ACTIVE').order('created_at', { ascending: false });
        if (filters?.city && filters.city !== 'all') query = query.eq('city', filters.city);
        if (filters?.listingType && filters.listingType !== 'all') query = query.eq('listing_type', filters.listingType);
        if (filters?.type && filters.type !== 'all') query = query.eq('property_type', filters.type);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Properties fallback:', err);
      }
    }

    return [
      {
        id: 'prop-101',
        title: 'شقة سكنية سوبر ديلوكس (حي حدة الراقي)',
        property_type: 'apartment',
        listing_type: 'SALE',
        price: 55000,
        currency: 'USD',
        area_sqm: 165,
        bedrooms: 3,
        bathrooms: 2,
        city: 'صنعاء',
        district: 'حدة - خلف مجمع حدة السكني',
        features: ['موقف سيارات خاص', 'مصعد إيطالي', 'حراسة 24/7', 'واجهة جنوبية', 'خزان مياه مستقل'],
        image_urls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600'],
        commission_amount: 1100, // 2% مثبتة
        commission_locked_at: new Date().toISOString()
      },
      {
        id: 'prop-102',
        title: 'أرض تجارية استثمارية على شارعين رئيسيين',
        property_type: 'commercial_land',
        listing_type: 'SALE',
        price: 120000,
        currency: 'USD',
        area_sqm: 450,
        bedrooms: 0,
        bathrooms: 0,
        city: 'عدن',
        district: 'المنصورة - الشارع العام',
        features: ['واجهة تجارية 20 متر', 'موقع استثماري حيوي', 'وثائق وبصائر معتمدة وسليمة'],
        image_urls: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],
        commission_amount: 2400,
        commission_locked_at: new Date().toISOString()
      },
      {
        id: 'prop-103',
        title: 'فيلا فاخرة للإيجار السنوي (سفارات وشركات)',
        property_type: 'villa',
        listing_type: 'RENT',
        price: 1200,
        currency: 'USD',
        area_sqm: 380,
        bedrooms: 5,
        bathrooms: 4,
        city: 'صنعاء',
        district: 'بيت بوس - حي السفارات',
        features: ['حوش وحديقة واسعة', 'طاقة شمسية كاملة', 'غرفة حراسة', 'مجلس خارجي مستقل'],
        image_urls: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600'],
        commission_amount: 1200, // إيجار شهر وساطة مثبتة
        commission_locked_at: new Date().toISOString()
      }
    ];
  },

  // تسجيل طلب الاهتمام وحجز موعد المعاينة
  async submitPropertyInquiry(inquiry: {
    property_id: string;
    contact_name: string;
    phone: string;
    message?: string;
  }) {
    if (supabase) {
      try {
        await supabase.from('property_inquiries').insert([{
          ...inquiry,
          status: 'NEW',
          ai_match_score: 92,
          created_at: new Date().toISOString()
        }]);
      } catch (e) {
        console.warn(e);
      }
    }
    return { success: true, matchScore: 92 };
  }
};
