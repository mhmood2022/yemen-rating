import { 
  JobVacancy, 
  JobSeekerProfile, 
  JobMatchRecord, 
  CommissionPolicy, 
  ConfirmedHireRecord 
} from '../types/jobs';

// 1. سياسة العمولة الحالية للإدارة
export const CURRENT_COMMISSION_POLICY: CommissionPolicy = {
  isEnabled: true,
  payer: 'employer_only', // العمولة على الجهة الموظفة
  calculationType: 'percentage',
  percentageValue: 5, // 5% من راتب الشهر الأول
  fixedValue: 15000,
  sectorRules: {
    'محاسبة وبنوك': { type: 'percentage', value: 5 },
    'هندسة ومقاولات': { type: 'fixed', value: 20000 },
    'تقنية وبرمجيات': { type: 'percentage', value: 5 }
  }
};

// 2. قائمة الوظائف (بيانات الاتصال مخفية في الموقع العام ومحفوظة للنظام)
export const DEMO_JOBS: JobVacancy[] = [
  {
    id: 'job_1',
    title: 'مطور برمجيات Full-Stack Senior',
    companyId: 'comp_1',
    companyName: 'شركة تقنية وبرمجيات رائدة',
    contactPerson: 'م. فؤاد الصبري',
    phone: '771234567',
    whatsapp: '771234567',
    email: 'hr@yemen-tech.ye',
    locationDetails: 'صنعاء - شارع حدة',
    isVerifiedEmployer: true,
    city: 'صنعاء',
    sector: 'تقنية وبرمجيات',
    workType: 'دوام كامل',
    experienceLevel: 'خبير (5+ سنوات)',
    salaryRange: 'يحدد بعد المقابلة',
    postedDate: '2026-08-25',
    deadline: '2026-09-25',
    description: 'مطلوب مهندس برمجيات ذو خبرة عالية في بناء وتطوير الأنظمة السحابية باستخدام React و Node.js.',
    requirements: ['خبرة 5 سنوات في React و TypeScript', 'إتقان قواعد البيانات PostgreSQL', 'إدارة المشاريع البرمجية'],
    qualifications: ['بكالوريوس هندسة برمجيات أو علوم حاسوب'],
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    status: 'active',
    employerAgreedCommission: true,
    applicantsCount: 6
  },
  {
    id: 'job_2',
    title: 'محاسب مالي قانوني وتدقيق حسابات',
    companyId: 'comp_2',
    companyName: 'مؤسسة استيراد وتوكيلات تجارية',
    contactPerson: 'أ. طارق الشرجبي',
    phone: '733987654',
    whatsapp: '733987654',
    email: 'jobs@trading-group.ye',
    locationDetails: 'عدن - المنصورة',
    isVerifiedEmployer: true,
    city: 'عدن',
    sector: 'محاسبة وبنوك',
    workType: 'دوام كامل',
    experienceLevel: 'متوسط (2-4 سنوات)',
    salaryRange: 'يحدد بعد المقابلة',
    postedDate: '2026-08-28',
    deadline: '2026-09-28',
    description: 'إدارة القيود اليومية والحسابات الختامية وإعداد التقارير المالية والضريبية الدورية.',
    requirements: ['بكالوريوس محاسبة', 'خبرة 3 سنوات في الشركات التجارية', 'إتقان برامج المحاسبة ERP'],
    qualifications: ['بكالوريوس محاسبة'],
    skills: ['المحاسبة المالية', 'الأنظمة المصرفية', 'إكسل متقدم'],
    status: 'active',
    employerAgreedCommission: true,
    applicantsCount: 4
  },
  {
    id: 'job_3',
    title: 'مسؤول تسويق رقمي وحملات إعلانية',
    companyId: 'comp_3',
    companyName: 'وكالة تسويق ودعاية وإعلان',
    contactPerson: 'أ. مروان اليافعي',
    phone: '774411223',
    whatsapp: '774411223',
    email: 'marketing@media-agency.ye',
    locationDetails: 'المكلا - الشرج',
    isVerifiedEmployer: true,
    city: 'حضرموت - المكلا',
    sector: 'مبيعات وتسويق',
    workType: 'عن بعد (Remote)',
    experienceLevel: 'متوسط (2-4 سنوات)',
    salaryRange: 'يحدد بعد المقابلة',
    postedDate: '2026-08-20',
    deadline: '2026-09-20',
    description: 'إدارة وتصميم الحملات الإعلانية على منصات التواصل الاجتماعي وتحليل معدلات التحويل.',
    requirements: ['خبرة موثقة في إدارة إعلانات Meta و Google', 'صناعة المحتوى الإعلاني الجذاب'],
    qualifications: ['بكالوريوس تسويق أو إدارة أعمال'],
    skills: ['إعلانات فيسبوك', 'تحليل الأداء', 'Copywriting'],
    status: 'active',
    employerAgreedCommission: true,
    applicantsCount: 8
  }
];

// 3. المتقدمين المسجلين في النظام
export const DEMO_SEEKERS: JobSeekerProfile[] = [
  {
    id: 'seeker_1',
    fullName: 'ياسر محمد الرازحي',
    phone: '775551122',
    whatsapp: '775551122',
    email: 'yasser.code@gmail.com',
    city: 'صنعاء',
    qualification: 'بكالوريوس علوم حاسوب',
    specialization: 'تقنية وبرمجيات',
    experienceYears: '5 سنوات',
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    summary: 'مطور Full Stack بخبرة 5 سنوات في بناء الأنظمة والمواقع السحابية.',
    createdAt: '2026-08-26',
    applicantAgreedCommission: true
  },
  {
    id: 'seeker_2',
    fullName: 'سامي عبدالكريم الحبيشي',
    phone: '734449988',
    whatsapp: '734449988',
    email: 'sami.acc@yahoo.com',
    city: 'عدن',
    qualification: 'بكالوريوس محاسبة',
    specialization: 'محاسبة وبنوك',
    experienceYears: '3 سنوات',
    skills: ['المحاسبة المالية', 'الأنظمة المصرفية', 'إكسل متقدم'],
    summary: 'محاسب مالي معتمد ذو كفاءة في مسك الدفاتر والقوائم المالية والضريبية.',
    createdAt: '2026-08-29',
    applicantAgreedCommission: true
  }
];

// 4. سجلات التطابق الذكي (Match Records)
export const DEMO_MATCH_RECORDS: JobMatchRecord[] = [
  {
    id: 'match_101',
    orderNumber: 'YR-8041',
    jobId: 'job_1',
    jobTitle: 'مطور برمجيات Full-Stack Senior',
    companyName: 'شركة تقنية وبرمجيات رائدة',
    companyPhone: '771234567',
    companyWhatsapp: '771234567',
    companyLocation: 'صنعاء - شارع حدة',
    applicantId: 'seeker_1',
    applicantName: 'ياسر محمد الرازحي',
    applicantPhone: '775551122',
    matchDate: '2026-08-27',
    matchedCriteria: ['التخصص: تقنية وبرمجيات', 'المؤهل: بكالوريوس حاسوب', 'الخبرة: 5 سنوات', 'الموقع: صنعاء'],
    status: 'interviewing'
  },
  {
    id: 'match_102',
    orderNumber: 'YR-8042',
    jobId: 'job_2',
    jobTitle: 'محاسب مالي قانوني وتدقيق حسابات',
    companyName: 'مؤسسة استيراد وتوكيلات تجارية',
    companyPhone: '733987654',
    companyWhatsapp: '733987654',
    companyLocation: 'عدن - المنصورة',
    applicantId: 'seeker_2',
    applicantName: 'سامي عبدالكريم الحبيشي',
    applicantPhone: '734449988',
    matchDate: '2026-08-29',
    matchedCriteria: ['التخصص: محاسبة وبنوك', 'المؤهل: بكالوريوس محاسبة', 'الخبرة: 3 سنوات', 'الموقع: عدن'],
    status: 'matched'
  }
];

// 5. سجلات التوظيف وعمولات الشهر الأول
export const DEMO_HIRE_RECORDS: ConfirmedHireRecord[] = [
  {
    id: 'hire_1',
    orderNumber: 'YR-7920',
    jobId: 'job_prev_1',
    jobTitle: 'مهندس شبكات وسيرفرات Cisco',
    companyName: 'مجموعة التضامن التجارية',
    applicantName: 'عبدالرحمن خالد باوزير',
    applicantPhone: '770011223',
    hiredDate: '2026-08-01',
    startDate: '2026-08-05',
    agreedSalary: '$1,200 USD',
    commissionAmountText: '$60 USD (5% من راتب الشهر الأول)',
    payer: 'employer',
    commissionStatus: 'due', // حان وقت استحقاق الشهر الأول
    dueDate: '2026-09-05',
    reminderSent: true
  }
];
