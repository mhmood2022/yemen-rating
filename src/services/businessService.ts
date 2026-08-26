import { YRBusiness } from '../types/database.types';

// Fallback Mock Data for instant visibility
const MOCK_BUSINESSES: YRBusiness[] = [
  {
    id: '1',
    name: 'مجموعة هائل سعيد أنعم وشركاه',
    slug: 'hayel-saeed-ansam',
    category_id: 'companies',
    category_name: 'الشركات والمؤسسات',
    city: 'صنعاء',
    rating: 4.9,
    description: 'مجموعة تجارية وصناعية رائدة في اليمن والمنطقة تقدم خدمات ومنتجات غذائية واستهلاكية متكاملة.',
    cover_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    whatsapp: '967700000001',
    services: ['الصناعات الغذائية', 'التجارة العامة', 'الخدمات اللوجستية']
  },
  {
    id: '2',
    name: 'بنك اليمن الدولي (YIB)',
    slug: 'yemen-international-bank',
    category_id: 'banks',
    category_name: 'البنوك والمصارف',
    city: 'صنعاء',
    rating: 4.7,
    description: 'أول بنك يمني خاص يقدم خدمات مصرفية شاملة، تمويلات تجارية، وحلول رقمية متطورة.',
    cover_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
    whatsapp: '967700000002',
    services: ['الحسابات الجارية', 'التمويل الإسلامي', 'الخدمات المصرفية الإلكترونية']
  },
  {
    id: '3',
    name: 'مطاعم الشيباني',
    slug: 'al-shaibani-restaurants',
    category_id: 'restaurants',
    category_name: 'المطاعم والكافيهات',
    city: 'تعز',
    rating: 4.8,
    description: 'أشهى المأكولات اليمنية والعربية الأصيلة، جلسات عائلية متميزة وخدمة سريعة.',
    cover_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    whatsapp: '967700000003',
    services: ['مأكولات شعبية', 'جلسات عائلية', 'خدمة الطلبات الخارجية']
  },
  {
    id: '4',
    name: 'شركة الكريمي للصرافة',
    slug: 'alkurimi-exchange',
    category_id: 'exchanges',
    category_name: 'الصرافة والتحويلات',
    city: 'صنعاء',
    rating: 4.9,
    description: 'شبكة الحوالات المالية الأوسع انتشاراً في اليمن، خدمات صرف وتحويل فورية وآمنة.',
    cover_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    whatsapp: '967700000004',
    services: ['حوالات نارية فورية', 'صرافة العملات', 'خدمات كريمي إكسبريس']
  },
  {
    id: '5',
    name: 'فندق برج استرا',
    slug: 'astra-tower-hotel',
    category_id: 'hotels',
    category_name: 'الفنادق والإقامة',
    city: 'عدن',
    rating: 4.6,
    description: 'إقامة فاخرة مطلة على البحر، غرف مجهزة بالكامل ومستوى ضيافة عالمي.',
    cover_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    whatsapp: '967700000005',
    services: ['اجحاز غرف فاخرة', 'قاعات مؤتمرات', 'مطعم ومقهى ملحق']
  },
  {
    id: '6',
    name: 'مستشفى الجمهوري النموذجي',
    slug: 'al-jomhori-hospital',
    category_id: 'health',
    category_name: 'الصحة والمستشفيات',
    city: 'صنعاء',
    rating: 4.5,
    description: 'رعاية صحية متكاملة على مدار الساعة، كوادر طبية متخصصة وأحدث أجهزة التشخيص.',
    cover_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    whatsapp: '967700000006',
    services: ['طوارئ 24 ساعة', 'عيادات تخصصية', 'تشخيص أشعة وتحاليل']
  }
];

export const fetchBusinesses = async (): Promise<YRBusiness[]> => {
  try {
    return MOCK_BUSINESSES;
  } catch (err) {
    console.warn('Using fallback data due to fetch error:', err);
    return MOCK_BUSINESSES;
  }
};

export const sendLeadRequest = async (data: any): Promise<{ success: boolean; message?: string }> => {
  console.log('Lead request submitted:', data);
  return { success: true, message: 'تم إرسال طلبك بنجاح!' };
};

export const sendMessageToBusiness = async (data: any): Promise<{ success: boolean; message?: string }> => {
  console.log('Message sent to business:', data);
  return { success: true, message: 'تم إرسال الرسالة بنجاح!' };
};
