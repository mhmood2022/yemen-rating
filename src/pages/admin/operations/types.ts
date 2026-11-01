export type RequestType = 
  | 'report' 
  | 'support' 
  | 'verification' 
  | 'claim' 
  | 'job_application' 
  | 'property_inquiry' 
  | 'payment' 
  | 'subscription' 
  | 'ad' 
  | 'appeal';

export type RequestStatus = 
  | 'new' 
  | 'reviewing' 
  | 'waiting_user' 
  | 'waiting_documents' 
  | 'in_progress' 
  | 'approved' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled' 
  | 'closed';

export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AdminRequest {
  id: string;
  reference_number: string;
  type: RequestType;
  source_table: string | null;
  source_id: string | null;
  user_id: string | null;
  target_id: string | null;
  target_type: string | null;
  title: string;
  description: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  assigned_to: string | null;
  resolution: string | null;
  rejection_reason: string | null;
  internal_notes: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  // بيانات إضافية من joins
  user_name?: string;
  user_avatar?: string;
  assigned_name?: string;
}

export interface RequestMessage {
  id: string;
  request_id: string;
  sender_type: 'admin' | 'user' | 'system';
  sender_id: string | null;
  message: string;
  is_internal: boolean;
  created_at: string;
  sender_name?: string;
}

export interface RequestStatusHistory {
  id: string;
  request_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
  changed_by_name?: string;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  uploaded_by: string | null;
  file_name: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

// التسميات العربية
export const TYPE_LABELS: Record<RequestType, string> = {
  report: 'بلاغ',
  support: 'رسالة دعم',
  verification: 'طلب توثيق',
  claim: 'إثبات ملكية',
  job_application: 'طلب وظيفة',
  property_inquiry: 'استفسار عقار',
  payment: 'مدفوعات',
  subscription: 'اشتراك',
  ad: 'إعلان',
  appeal: 'اعتراض',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'جديد',
  reviewing: 'قيد المراجعة',
  waiting_user: 'بانتظار المستخدم',
  waiting_documents: 'بانتظار مستندات',
  in_progress: 'قيد التنفيذ',
  approved: 'معتمد',
  completed: 'مكتمل',
  rejected: 'مرفوض',
  cancelled: 'ملغى',
  closed: 'مغلق',
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  new: '#FFC500',
  reviewing: '#1D9BF0',
  waiting_user: '#F59E0B',
  waiting_documents: '#F59E0B',
  in_progress: '#8B5CF6',
  approved: '#22C55E',
  completed: '#22C55E',
  rejected: '#EF4444',
  cancelled: '#9CA3AF',
  closed: '#6B7280',
};

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: 'منخفضة',
  normal: 'عادية',
  high: 'عالية',
  urgent: 'عاجلة',
};

export const PRIORITY_COLORS: Record<RequestPriority, string> = {
  low: '#9CA3AF',
  normal: '#1D9BF0',
  high: '#F59E0B',
  urgent: '#EF4444',
};

export const TYPE_ICONS: Record<RequestType, string> = {
  report: 'ShieldAlert',
  support: 'MessageCircle',
  verification: 'ShieldCheck',
  claim: 'Building2',
  job_application: 'Briefcase',
  property_inquiry: 'Home',
  payment: 'CreditCard',
  subscription: 'Crown',
  ad: 'Megaphone',
  appeal: 'AlertTriangle',
};

export const timeAgo = (dateStr: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ي`;
  return new Date(dateStr).toLocaleDateString('ar-YE');
};
