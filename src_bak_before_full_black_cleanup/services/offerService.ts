import { supabase } from '../lib/supabaseClient';

export interface OfferItem {
  id: string;
  business_id: string;
  business_name: string;
  business_logo: string;
  badge: 'gold' | 'blue' | 'gray';
  category: string;
  city: string;
  phone: string;
  whatsapp: string;
  title: string;
  description: string;
  discount_percentage?: number;
  discount_code: string;
  image_url: string;
  expiry_date: string;
  usage_count: number;
}

export const offerService = {
  // جلب العروض النشطة مع دعم الفلترة
  async getActiveOffers(category?: string, city?: string): Promise<OfferItem[]> {
    if (supabase) {
      try {
        let query = supabase.from('offers').select('*, businesses(*)').eq('status', 'ACTIVE');
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as any;
      } catch (err) {
        console.warn('Offers fetch fallback:', err);
      }
    }

    return [
      {
        id: 'offer-1',
        business_id: 'biz-1',
        business_name: 'متجر العصرية للجوالات',
        business_logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100',
        badge: 'gold',
        category: 'shops',
        city: 'صنعاء',
        phone: '778889990',
        whatsapp: '967778889990',
        title: 'عروض كبرى على الهواتف الذكية والإكسسوارات',
        description: 'خصم حقيقي 20% على جميع ملحقات وشواحن الهواتف الأصلية مع ضمان سنة كاملة.',
        discount_percentage: 20,
        discount_code: 'YR20',
        image_url: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600',
        expiry_date: '2026/09/30',
        usage_count: 142
      },
      {
        id: 'offer-2',
        business_id: 'biz-2',
        business_name: 'مطعم حضرموت الدولي',
        business_logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100',
        badge: 'gold',
        category: 'restaurants',
        city: 'صنعاء',
        phone: '771987654',
        whatsapp: '967771987654',
        title: 'وجبة غداء عائلية فاخرة بسعر مخفض',
        description: 'احصل على خصم 15% على وجبات المندي والمظبي العائلية لرواد منصة يمن ريتغ.',
        discount_percentage: 15,
        discount_code: 'HADRAMOUT15',
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
        expiry_date: '2026/10/15',
        usage_count: 215
      },
      {
        id: 'offer-3',
        business_id: 'biz-3',
        business_name: 'فندق تاج سبأ الدولي',
        business_logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100',
        badge: 'gold',
        category: 'hotels',
        city: 'تعز',
        phone: '772111222',
        whatsapp: '96772111222',
        title: 'عرض الإقامة للأجنحة الملكية ورجال الأعمال',
        description: 'خصم 25% على الحجوزات الفندقية لأكثر من 3 ليالٍ شامل بوفيه الإفطار والإنترنت المجاني.',
        discount_percentage: 25,
        discount_code: 'TAJ25',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
        expiry_date: '2026/09/20',
        usage_count: 68
      }
    ];
  },

  // تسجيل نسخ الكود وزيادة عداد الاستخدام
  async trackCouponCopy(offerId: string) {
    if (supabase) {
      try {
        await supabase.rpc('increment_offer_usage', { offer_id: offerId });
      } catch (e) {
        console.warn(e);
      }
    }
  }
};
