export type SearchResultType = 'bank' | 'business' | 'job' | 'property' | 'auction' | 'category';

export interface TypedSearchResult {
  id: string;
  type: SearchResultType;
  typeLabel: string;
  title: string;
  subtitle: string;
  slug: string;
  path: string;
  city?: string;
  rating?: number;
  badgeType?: 'gold' | 'blue' | 'gray' | 'none';
  price?: string;
  imageUrl?: string;
}

const GLOBAL_SEARCH_INDEX: TypedSearchResult[] = [
  // بنوك
  { id: 'b1', type: 'bank', typeLabel: 'بنك ومصرف', title: 'بنك الكريمي للتمويل الأصغر الإسلامي', subtitle: 'أكبر شبكة فروع وصرافات آلية في اليمن', slug: 'kuraimi-bank', path: '/banks/kuraimi-bank', city: 'صنعاء — حدة', rating: 4.9, badgeType: 'gold', imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80' },
  { id: 'b2', type: 'bank', typeLabel: 'بنك ومصرف', title: 'بنك التسليف التعاوني والزراعي (CAC Bank)', subtitle: 'خدمات مصرفية للأفراد والشركات وتطبيق كاك موبايل', slug: 'cac-bank', path: '/banks/cac-bank', city: 'عدن / صنعاء', rating: 4.8, badgeType: 'gold', imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80' },
  { id: 'b3', type: 'bank', typeLabel: 'محفظة إلكترونية', title: 'محفظة جوالي (Jawali Wallet)', subtitle: 'دفع فواتير وتحويل فوري بدون حساب بنكي', slug: 'jawali-wallet', path: '/banks/jawali-wallet', city: 'كل المحافظات', rating: 4.7, badgeType: 'blue', imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=100&auto=format&fit=crop&q=80' },
  { id: 'b4', type: 'bank', typeLabel: 'شركة صرافة', title: 'شركة القطيبي للصرافة والتحويلات', subtitle: 'شبكة القطيبي إكسبرس للحوالات وصرافة العملات', slug: 'al-qutaibi', path: '/banks/al-qutaibi', city: 'عدن — الشيخ عثمان', rating: 4.8, badgeType: 'gold', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=80' },

  // منشآت وشركات
  { id: 'bz1', type: 'business', typeLabel: 'شركة برمجيات', title: 'شركة يمن سوفت للحلول البرمجية', subtitle: 'أنظمة أونكس برو والمتكامل بلس لإدارة المؤسسات', slug: 'yemensoft', path: '/businesses/yemensoft', city: 'صنعاء — الدائري', rating: 4.9, badgeType: 'gold', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80' },
  { id: 'bz2', type: 'business', typeLabel: 'مطاعم ومقاهي', title: 'مطعم البيت اليمني للمأكولات الشعبية', subtitle: 'أشهى المأكولات والمندي والسلته والفحسة الأصيلة', slug: 'yemeni-house-restaurant', path: '/businesses/yemeni-house-restaurant', city: 'صنعاء — حدة', rating: 4.8, badgeType: 'blue', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=80' },

  // وظائف
  { id: 'j1', type: 'job', typeLabel: 'وظيفة شاغرة', title: 'مهندس برمجيات وتطبيقات React & Node.js', subtitle: 'يمن سوفت • دوام كامل • 650,000 ﷼', slug: 'senior-react-developer', path: '/jobs/senior-react-developer', city: 'صنعاء', price: '650,000 ﷼' },
  { id: 'j2', type: 'job', typeLabel: 'وظيفة شاغرة', title: 'مدير تسويق رقمي وحملات إعلانية', subtitle: 'مجموعة هائل سعيد • دوام كامل • 480,000 ﷼', slug: 'digital-marketing-manager', path: '/jobs/digital-marketing-manager', city: 'عدن', price: '480,000 ﷼' },

  // عقارات
  { id: 'p1', type: 'property', typeLabel: 'عقار للبيع', title: 'فيلا فاخرة مسبح وحديقة — خور مكسر', subtitle: '5 غرف • 4 حمامات • 480 م²', slug: 'luxury-villa-aden', path: '/properties/luxury-villa-aden', city: 'عدن', price: '240,000,000 ﷼' },
  { id: 'p2', type: 'property', typeLabel: 'عقار للإيجار', title: 'شقة سوبر ديلوكس مفروشة — حدة', subtitle: '3 غرف • 2 حمام • 160 م²', slug: 'furnished-apartment-hadda', path: '/properties/furnished-apartment-hadda', city: 'صنعاء', price: '350,000 ﷼/شهر' },

  // مزادات
  { id: 'a1', type: 'auction', typeLabel: 'مزاد علني', title: 'تويوتا لاندكروزر V8 موديل 2022 وكالة بريمي', subtitle: 'عداد 24,000 كم • أعلى مزايدة حالية', slug: 'toyota-landcruiser-v8-2022', path: '/auctions/toyota-landcruiser-v8-2022', city: 'صنعاء', price: '34,500,000 ﷼' },
];

export const searchService = {
  search(query: string, cityId?: string, typeFilter?: SearchResultType | 'all'): TypedSearchResult[] {
    const q = (query || '').trim().toLowerCase();
    
    return GLOBAL_SEARCH_INDEX.filter(item => {
      const matchType = !typeFilter || typeFilter === 'all' || item.type === typeFilter;
      const matchCity = !cityId || cityId === 'all' || (item.city && item.city.includes(cityId));
      
      if (!q) return matchType && matchCity;
      
      const matchText = item.title.toLowerCase().includes(q) || 
                        item.subtitle.toLowerCase().includes(q) || 
                        item.typeLabel.toLowerCase().includes(q) ||
                        (item.city && item.city.toLowerCase().includes(q));
                        
      return matchType && matchCity && matchText;
    });
  }
};
