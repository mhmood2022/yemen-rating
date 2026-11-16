import { AuditLogItem } from '../types/audit';

export const DEMO_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log_1',
    adminName: 'م. أحمد المشرف',
    adminEmail: 'admin@yemenrating.com',
    action: 'BADGE_CHANGE',
    targetType: 'نشاط تجاري',
    targetName: 'بنك الكريمي للتمويل الأصغر',
    details: 'منح الشارة الذهبية (gold) الرسمية للبنك بعد استكمال كافة التراخيص المصرفية.',
    timestamp: '2026-08-22 16:45'
  },
  {
    id: 'log_2',
    adminName: 'م. أحمد المشرف',
    adminEmail: 'admin@yemenrating.com',
    action: 'PRICE_UPDATE',
    targetType: 'أسعار الصرف',
    targetName: 'سوق صنعاء - الدولار والسعودي',
    details: 'تحديث سعر شراء الدولار إلى 535 ريال وسعر البيع إلى 538 ريال وفق تعميم جمعية الصرافين.',
    timestamp: '2026-08-22 14:30'
  },
  {
    id: 'log_3',
    adminName: 'إدارة النظام YR',
    adminEmail: 'admin@yemenrating.com',
    action: 'AD_PUBLISH',
    targetType: 'إعلان فيديو',
    targetName: 'فيديو إطلاق محفظة جيب كاش باك',
    details: 'نشر واعتماد الحملة الإعلانية على الصفحة الرئيسية بعد مراجعة محتوى الفيديو.',
    timestamp: '2026-08-20 11:20'
  }
];
