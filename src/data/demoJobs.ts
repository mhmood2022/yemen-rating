import { JobVacancy } from '../types/jobs';

export const DEMO_JOBS: JobVacancy[] = [
  {
    id: 'job_1',
    title: 'مطور برمجيات Full-Stack Senior',
    companyId: 'comp_1',
    companyName: 'شركة يمن سوفت للأنظمة والاستشارات',
    companyLogo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80',
    isVerifiedEmployer: true,
    verifiedBadgeType: 'gold',
    city: 'صنعاء',
    sector: 'تقنية وبرمجيات',
    workType: 'دوام كامل',
    experienceLevel: 'خبير (5+ سنوات)',
    salaryRange: '$1,200 - $1,800',
    postedDate: 'منذ يومين',
    deadline: '2026-09-15',
    description: 'مطلوب مهندس برمجيات ذو خبرة عالية للانضمام إلى فريق تطوير أنظمة المؤسسات السحابية (Onyx Cloud ERP). العمل يشمل بناء واجهات تفاعلية وخدمات خلفية متطورة.',
    requirements: [
      'خبرة لا تقل عن 5 سنوات في React و TypeScript و Node.js',
      'إتقان التعامل مع قواعد البيانات PostgreSQL و Redis',
      'خبرة في معمارية المايكروسيرفس والحوسبة السحابية',
      'مهارات تواصل ممتازة والقدرة على قيادة الفرق البرمجية'
    ],
    benefits: [
      'راتب مجزٍ بالدولار الأمريكي مع حوافز أداء دورية',
      'تأمين صحي شامل للموظف وعائلته',
      'بيئة عمل تقنية متطورة وتدريب مستمر'
    ],
    matchScore: 96,
    applicantsCount: 24
  },
  {
    id: 'job_2',
    title: 'محاسب مالي أول (Senior Financial Accountant)',
    companyId: 'b1',
    companyName: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    companyLogo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=500&auto=format&fit=crop&q=80',
    isVerifiedEmployer: true,
    verifiedBadgeType: 'gold',
    city: 'صنعاء',
    sector: 'محاسبة وبنوك',
    workType: 'دوام كامل',
    experienceLevel: 'متوسط (2-4 سنوات)',
    salaryRange: '550,000 - 750,000 ريال يمني',
    postedDate: 'اليوم',
    deadline: '2026-09-10',
    description: 'يعلن بنك الكريمي عن حاجته إلى محاسب مالي أول للعمل في الإدارة العامة. المسؤوليات تشمل إعداد التقارير والقوائم المالية وتدقيق الحسابات المصرفية.',
    requirements: [
      'بكالوريوس محاسبة أو علوم مالية ومصرفية بتقدير جيد جداً',
      'خبرة من 3 إلى 5 سنوات في المؤسسات المصرفية أو المالية',
      'إتقان البرامج المحاسبية والأنظمة المصرفية المعتمدة',
      'معرفة تامة بمعايير المحاسبة للمؤسسات المالية الإسلامية'
    ],
    benefits: [
      'رواتب ومكافآت بنكية مجزية',
      'تأمين صحي وبدل مواصلات وسكن',
      'فرص ترقي وتطوير وظيفي'
    ],
    matchScore: 92,
    applicantsCount: 42
  },
  {
    id: 'job_3',
    title: 'طبيب عام طوارئ (Emergency Doctor)',
    companyId: '3',
    companyName: 'مستشفى الدكتور عبدالقادر المتخصص',
    companyLogo: 'https://images.unsplash.com/photo-1586015555751-63c25b7b9195?w=500&auto=format&fit=crop&q=80',
    isVerifiedEmployer: true,
    verifiedBadgeType: 'blue',
    city: 'تعز',
    sector: 'طب ورعاية صحية',
    workType: 'دوام كامل',
    experienceLevel: 'متوسط (2-4 سنوات)',
    salaryRange: '600,000 - 900,000 ريال يمني',
    postedDate: 'منذ 3 أيام',
    deadline: '2026-09-20',
    description: 'فرصة عمل لطبيب عام في قسم الطوارئ والعناية الأولية بمستشفى عبدالقادر التخصصي بتعز لتقديم الرعاية الإسعافية الفورية للمرضى.',
    requirements: [
      'بكالوريوس طب وجراحة عامة مع ترخيص مزاولة المهنة ساري المفعول',
      'خبرة سنتين على الأقل في أقسام الطوارئ والإسعاف',
      'القدرة على التعامل مع الحالات الحرجة وضغط العمل'
    ],
    benefits: [
      'راتب وحوافز مناوبات ممتازة',
      'سكن مؤثث للأطباء من خارج المحافظة',
      'تأمين طبي كامل'
    ],
    matchScore: 88,
    applicantsCount: 16
  },
  {
    id: 'job_4',
    title: 'كابتن وسائق حافلات دولية VIP',
    companyId: 'tr_1',
    companyName: 'شركة راحة للنقل الدولي والمحلي',
    companyLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    isVerifiedEmployer: true,
    verifiedBadgeType: 'gray',
    city: 'صنعاء',
    sector: 'نقل وخدمات لوجستية',
    workType: 'دوام كامل',
    experienceLevel: 'خبير (5+ سنوات)',
    salaryRange: '450,000 - 650,000 ريال يمني + بدلات',
    postedDate: 'منذ يوم',
    deadline: '2026-09-30',
    description: 'تعلن شركة راحة للنقل الدولي عن رغبتها في توظيف سائقين محترفين لأسطول الحافلات الحديثة على خطوط السفر بين المحافظات والمملكة العربية السعودية.',
    requirements: [
      'رخصة قيادة نقل ثقيل سارية المفعول',
      'خبرة لا تقل عن 5 سنوات في قيادة الحافلات على الطرق الطويلة',
      'حسن السيرة والسلوك وخلو السجل من أي مخالفات جسيمة'
    ],
    benefits: [
      'بدلات سفر وإقامة وإعاشة ممتازة',
      'عقود عمل سنوية رسمية مع تأمين صحي',
      'مكافآت شهرية للسائقين الملتزمين'
    ],
    matchScore: 90,
    applicantsCount: 19
  },
  {
    id: 'job_5',
    title: 'فني صيانة جوالات وأجهزة ذكية معتمد',
    companyId: 't5',
    companyName: 'متجر العصرية للإلكترونيات والجوالات',
    companyLogo: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80',
    isVerifiedEmployer: true,
    verifiedBadgeType: 'blue',
    city: 'عدن',
    sector: 'تقنية وبرمجيات',
    workType: 'دوام كامل',
    experienceLevel: 'متوسط (2-4 سنوات)',
    salaryRange: '400,000 - 600,000 ريال يمني + نسبة',
    postedDate: 'منذ يومين',
    deadline: '2026-09-12',
    description: 'مطلوب فني هاردوير وسوفت وير محترف لصيانة أجهزة آيفون وسامسونج في الفرع الرئيسي بعدن (كريتر).',
    requirements: [
      'خبرة مثبتة في صيانة المذربورد وتبديل الآيسيات والشاشات',
      'إتقان التعامل مع أجهزة المخططات والميكروسكوب واللحام الدقيق',
      'معرفة شاملة ببرمجة وتخطي مشاكل السوفت وير'
    ],
    benefits: [
      'راتب أساسي + عمولة شهرية على عمليات الصيانة',
      'بيئة عمل مجهزة بأحدث معدات ومستلزمات الصيانة'
    ],
    matchScore: 94,
    applicantsCount: 28
  },
  {
    id: 'job_6',
    title: 'مدير تسويق رقمي وحملات إعلانية (Remote)',
    companyId: 'w1',
    companyName: 'محفظة جيب (Jeeb Wallet)',
    companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
    isVerifiedEmployer: true,
    verifiedBadgeType: 'blue',
    city: 'صنعاء',
    sector: 'مبيعات وتسويق',
    workType: 'عن بعد (Remote)',
    experienceLevel: 'متوسط (2-4 سنوات)',
    salaryRange: '$700 - $1,100',
    postedDate: 'اليوم',
    deadline: '2026-09-18',
    description: 'إدارة وتطوير الحملات الرقمية ونمو المستخدمين لتطبيق محفظة جيب عبر منصات التواصل الاجتماعي ومحركات البحث.',
    requirements: [
      'خبرة سابقة في تسويق التطبيقات المالية (FinTech Growth)',
      'إتقان إدارة إعلانات Meta و Google Ads و TikTok',
      'تحليل البيانات ومعدلات التحويل (CAC & LTV)'
    ],
    benefits: [
      'مرونة تامة في العمل عن بعد من أي محافظة',
      'راتب بالدولار وحوافز عند تحقيق مستهدفات النمو'
    ],
    matchScore: 95,
    applicantsCount: 35
  }
];
