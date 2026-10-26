import { Permission, UserRole } from '../types/auth';

// 1. مصفوفة الصلاحيات معربة 100%
export const SYSTEM_PERMISSIONS: Permission[] = [
  // مجال إدارة المستخدمين والحسابات
  { id: 'users.view', domain: 'users', name: 'الاطلاع على قائمة المستخدمين', description: 'عرض بيانات المستخدمين والحسابات المسجلة' },
  { id: 'users.edit', domain: 'users', name: 'تعديل بيانات وأدوار المستخدمين', description: 'تعديل الأسماء والهواتف والأدوار الإدارية' },
  { id: 'users.disable', domain: 'users', name: 'إيقاف وتجميد الحسابات', description: 'تعطيل الحسابات المخالفة ومنعها من الدخول' },

  // مجال المنشآت والأنشطة التجارية
  { id: 'facilities.view', domain: 'facilities', name: 'تصفح واستعراض المنشآت', description: 'الاطلاع على المنشآت في الدليل الرسمي' },
  { id: 'facilities.create', domain: 'facilities', name: 'إضافة ونشر منشأة جديدة', description: 'تسجيل منشأة جديدة مباشرة في المنصة' },
  { id: 'facilities.edit', domain: 'facilities', name: 'تعديل المنشآت والبيانات', description: 'تحديث أرقام وصور وأنشطة المنشآت' },
  { id: 'facilities.delete', domain: 'facilities', name: 'حذف المنشآت نهائياً', description: 'إزالة المنشأة من قاعدة البيانات' },

  // مجال الإعلانات والترويج (YR Ads)
  { id: 'ads.view', domain: 'ads', name: 'عرض الحملات الإعلانية', description: 'مشاهدة إعلانات المنصة وبنرات الشركات' },
  { id: 'ads.create', domain: 'ads', name: 'حجز وإنشاء إعلان جديد', description: 'طلب حجز مساحات إعلانية للمنشآت' },
  { id: 'ads.edit', domain: 'ads', name: 'تفعيل واعتماد الإعلانات', description: 'مراجعة ونشر الحملات الإعلانية' },
  { id: 'ads.delete', domain: 'ads', name: 'إيقاف وحذف الإعلانات', description: 'إنهاء الحملات الإعلانية المنتهية' },

  // مجال إعدادات النظام والتقارير المالية
  { id: 'settings.view', domain: 'settings', name: 'مشاهدة إعدادات ومؤشرات النظام', description: 'الاطلاع على التقارير والمؤشرات العامة' },
  { id: 'settings.edit', domain: 'settings', name: 'تعديل ثوابت وسياسات المنصة', description: 'تعديل نسب العمولات والإعدادات العامة' },
];

// 2. ربط الصلاحيات بالأدوار (المشرف العام يمتلك الكل)
export const ROLE_PERMISSIONS_MAP: Record<UserRole, string[]> = {
  super_admin: SYSTEM_PERMISSIONS.map(p => p.id), // كافة الصلاحيات بدون استثناء

  admin: [
    'users.view', 'users.edit',
    'facilities.view', 'facilities.create', 'facilities.edit', 'facilities.delete',
    'ads.view', 'ads.create', 'ads.edit',
    'settings.view'
  ],

  staff: [
    'users.view',
    'facilities.view', 'facilities.edit',
    'ads.view'
  ],

  owner: [
    'facilities.view', 'facilities.edit',
    'ads.view', 'ads.create'
  ],

  visitor: [
    'facilities.view'
  ]
};

// 3. أسماء الأدوار باللغة العربية الخالصة
export const ROLE_DETAILS: Record<UserRole, { label: string; desc: string; color: string }> = {
  super_admin: { label: 'المشرف العام للنظام', desc: 'صلاحيات عليا ومطلقة لإدارة كافة أقسام المنصة والمستخدمين والصلاحيات', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  admin: { label: 'مسؤول إدارة عامة', desc: 'إدارة وتدقيق المنشآت والأنشطة والتوثيق والإعلانات ومراجعة العمليات', color: 'bg-amber-500/15 text-[#FFD000] border-amber-500/30' },
  staff: { label: 'موظف دعم وإشراف', desc: 'متابعة الدعم الفني، مراجعة البلاغات، وتدقيق التقييمات اليومية', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  owner: { label: 'مالك منشأة معتمد', desc: 'إدارة صفحات منشآته المعتمدة فقط، وتحديث الصور والعروض والردود', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  visitor: { label: 'مستخدم عام / زائر', desc: 'تصفح الدليل الشامل، البحث، التقييم، واستعراض الأسعار والأنشطة', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
};
