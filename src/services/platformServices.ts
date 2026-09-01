import { 
  BankEntity, BusinessEntity, JobEntity, 
  PropertyEntity, AuctionEntity, ReviewData 
} from '../types/schema.types';
import { calculateYRMatch } from '../utils/matchingEngine';

// 1. خدمة البنوك والمحافظ
export const BankService = {
  getDemoRecord(): BankEntity {
    return {
      id: 'demo-bank-kuraimi',
      slug: 'kuraimi-bank',
      name: 'بنك الكريمي',
      category_label: 'بنوك ومصارف',
      badge_type: 'gold',
      city_name: 'صنعاء — حدة',
      address: 'شارع حدة — تقاطع الرويشان',
      logo_url: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=200&auto=format&fit=crop&q=85',
      cover_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1400&auto=format&fit=crop&q=85',
      short_description: 'أكبر شبكة فروع وصرافات آلية في الجمهورية اليمنية ورائد الخدمات المصرفية الرقمية.',
      description: 'يقدم بنك الكريمي حلولاً مالية ومصرفية إسلامية شاملة للأفراد والشركات، وتطبيق كريمي جوال، وحوالات مُميّز الفورية، وتمويل المشاريع الصغيرة.',
      phone: '8008800',
      whatsapp: '967777000111',
      email: 'info@kuraimibank.com',
      website_url: 'https://kuraimibank.com',
      branches_count: 185,
      atms_count: 220,
      is_verified: true,
      is_demo: true,
      services: [
        'حسابات جارية وتوفير إسلامية',
        'تطبيق كريمي جوال المالي',
        'حوالات مُميّز الفورية',
        'تمويل مشاريع صغيرة وأصغر',
        'صراف آلي واسع الانتشار في كل المحافظات'
      ],
      media: [
        { id: 'm1', file_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 1, is_cover: true },
        { id: 'm2', file_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 2 },
        { id: 'm3', file_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 3 }
      ],
      reviews: [
        { id: 'r1', user_name: 'م. سالم الكاف', user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', entity_type: 'bank', entity_id: 'demo-bank-kuraimi', rating: 5, comment: 'خدمة مصرفية ممتازة وتطبيق سهل الاستخدام وسرعة في الحوالات.', status: 'approved', created_at: 'منذ يومين' },
        { id: 'r2', user_name: 'أحمد الوصابي', user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', entity_type: 'bank', entity_id: 'demo-bank-kuraimi', rating: 5, comment: 'انتشار الصرافات في كل مكان وسهولة السحب والإيداع.', status: 'approved', created_at: 'منذ أسبوع' }
      ],
      rating_summary: {
        average: 5.0,
        count: 2,
        distribution: { 5: 2, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    };
  }
};

// 2. خدمة الشركات والأنشطة
export const BusinessService = {
  getDemoRecord(): BusinessEntity {
    return {
      id: 'demo-biz-yemensoft',
      slug: 'yemensoft',
      name: 'شركة يمن سوفت للحلول البرمجية',
      category_label: 'تكنولوجيا ومعلومات',
      badge_type: 'gold',
      city_name: 'صنعاء — الدائري',
      address: 'شارع الدائري الغربي — برج يمن سوفت',
      logo_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=85',
      cover_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=85',
      description: 'رائد أنظمة وحلول تخطيط الموارد والأنظمة المالية والمصرفية وإدارة الأعمال وسلسلة إمداد المؤسسات في اليمن والشرق الأوسط.',
      phone: '777123456',
      whatsapp: '967777123456',
      email: 'info@yemensoft.com',
      website_url: 'https://yemensoft.com',
      is_verified: true,
      is_demo: true,
      services: [
        { name: 'نظام أونكس برو للشركات الكبرى (Onyx Pro)', price: 1500000, currency: 'YER' },
        { name: 'نظام المتكامل بلس للمحلات والمتاجر', price: 450000, currency: 'YER' },
        { name: 'حلول الفوترة الإلكترونية والربط مع المنصات', price: 250000, currency: 'YER' }
      ],
      media: [
        { id: 'mb1', file_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 1, is_cover: true },
        { id: 'mb2', file_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 2 }
      ],
      reviews: [
        { id: 'rb1', user_name: 'د. خالد العولقي', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', entity_type: 'business', entity_id: 'demo-biz-yemensoft', rating: 5, comment: 'أنظمة متطورة ودعم فني متواصل واحترافي.', status: 'approved', created_at: 'منذ 3 أيام' }
      ],
      rating_summary: {
        average: 5.0,
        count: 1,
        distribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    };
  }
};

// 3. خدمة الوظائف والمطابقة الذكية والعمولة الثابتة
export const JobService = {
  getDemoRecord(): JobEntity {
    return {
      id: 'demo-job-react-dev',
      slug: 'senior-react-developer',
      title: 'مهندس برمجيات وتطبيقات React & Node.js',
      company_name: 'شركة يمن سوفت للحلول',
      employer_phone: '777123456',
      employer_email: 'careers@yemensoft.com',
      category_name: 'تكنولوجيا ومعلومات',
      city_name: 'صنعاء — حدة',
      employment_type: 'دوام كامل',
      experience_level: '3-5 سنوات',
      education_level: 'بكالوريوس تقنية معلومات / علوم حاسوب',
      gender: 'لا يشترط',
      salary_min: 600000,
      salary_max: 750000,
      salary_currency: 'YER',
      description: 'مطلوب مهندس برمجيات ذو كفاءة عالية لتطوير وصيانة منصات الويب وقواعد البيانات والربط مع الـ API.',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
      requirements: [
        'خبرة عملية مثبتة لا تقل عن 3 سنوات في React و TypeScript',
        'معرفة ممتازة بقواعد بيانات PostgreSQL أو MySQL',
        'القدرة على العمل بروح الفريق والالتزام بمواعيد التسليم'
      ],
      responsibilities: [
        'بناء وتطوير واجهات المستخدم التفاعلية المتوافقة مع كافة الشاشات',
        'كتابة كود نظيف وقابل للتوسع والصيانة',
        'التعاون مع فريق الـ Backend لربط استعلامات البيانات'
      ],
      fixed_commission_amount: 20000, // 20,000 YER ثابتة
      applicants_count: 12,
      status: 'active',
      is_demo: true
    };
  },

  calculateCandidateMatch(candidate: any, job: JobEntity) {
    return calculateYRMatch(
      {
        id: candidate.id || 'cand-1',
        name: candidate.name || 'المرشح',
        title: candidate.title || '',
        skills: candidate.skills || [],
        experienceYears: Number(candidate.experienceYears) || 0,
        city: candidate.city || '',
        education: candidate.education || ''
      },
      {
        id: job.id,
        title: job.title,
        requiredSkills: job.skills,
        minExperience: 3,
        city: job.city_name.split('—')[0].trim(),
        jobType: job.employment_type
      }
    );
  }
};

// 4. خدمة العقارات والصفقات
export const PropertyService = {
  getDemoRecord(): PropertyEntity {
    return {
      id: 'demo-prop-villa-aden',
      slug: 'luxury-villa-aden',
      title: 'فيلا مستقلة فاخرة مسبح وحديقة — خور مكسر',
      property_type: 'فلل',
      listing_type: 'sale',
      price: 240000000,
      currency: 'YER',
      area: 480,
      bedrooms: 5,
      bathrooms: 4,
      floor: 2,
      city_name: 'عدن — خور مكسر',
      address: 'شارع المطار القديم — حي النخبة',
      description: 'فيلا فخمة على شوارع عريضة، حديقة خاصة ومسبح وموقف لثلاث سيارات، تشطيبات ديلوكس رخام وجبس وإضاءات مخفية، موقع هادئ وراقٍ.',
      features: ['مسبح خاص', 'حديقة واسعة', 'موقف سيارات', 'طاقة شمسية متكاملة', 'خزان مياه أرضي وسيع'],
      publisher_name: 'مكتب الكاف العقاري',
      publisher_phone: '967733987654',
      is_contact_masked: true,
      is_verified: true,
      is_demo: true,
      media: [
        { id: 'mp1', file_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 1, is_cover: true },
        { id: 'mp2', file_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 2 },
        { id: 'mp3', file_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 3 }
      ]
    };
  }
};

// 5. خدمة المزادات والمزايدة والعمولة السرية 5%
export const AuctionService = {
  getDemoRecord(): AuctionEntity {
    return {
      id: 'demo-auc-landcruiser',
      slug: 'toyota-landcruiser-v8-2022',
      title: 'تويوتا لاندكروزر V8 موديل 2022 وكالة بريمي',
      item_name: 'تويوتا لاندكروزر V8',
      item_type: 'سيارة',
      item_condition: 'مستعمل',
      category_name: 'سيارات',
      city_name: 'صنعاء — حدة',
      description: 'سيارة وكالة بحالة ممتازة، عداد 24,000 كم فقط، صيانة دورية منتظمة، طلاء المصنع بالكامل، جلد بيج، كاميرات 360، فتحة سقف، بصمة.',
      sale_type: 'auction',
      starting_price: 32000000,
      minimum_bid_increment: 500000,
      current_bid: 34500000,
      bids_count: 18,
      currency: 'YER',
      seller_name: 'معرض النخبة للسيارات',
      seller_phone: '777123456',
      time_left_seconds: 15480,
      status: 'active',
      is_demo: true,
      media: [
        { id: 'ma1', file_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 1, is_cover: true },
        { id: 'ma2', file_url: 'https://images.unsplash.com/photo-1541348263662-e0c86629c983?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 2 },
        { id: 'ma3', file_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=85', media_type: 'image', sort_order: 3 }
      ],
      bids_history: [
        { id: 'bh1', bidder_code: 'مزايد #9700', amount: 34500000, created_at: 'الآن' },
        { id: 'bh2', bidder_code: 'مزايد #8392', amount: 34000000, created_at: 'منذ 15 دقيقة' },
        { id: 'bh3', bidder_code: 'مزايد #4110', amount: 33500000, created_at: 'منذ ساعة' }
      ]
    };
  }
};
