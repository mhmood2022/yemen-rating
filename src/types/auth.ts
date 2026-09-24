// الأدوار الخمسة المعتمدة
export type UserRole = 'visitor' | 'owner' | 'staff' | 'admin' | 'super_admin';

// نوع الحساب الأساسي (فصل تام عن الدور)
export type AccountType = 'visitor' | 'owner';

// حالات الحساب الثلاث
export type UserStatus = 'active' | 'suspended' | 'disabled';

// مجالات الصلاحيات
export type PermissionDomain = 'users' | 'facilities' | 'ads' | 'settings';

export interface Permission {
  id: string;
  domain: PermissionDomain;
  name: string;
  description: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  account_type?: AccountType;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
}

export type OwnerRequestStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'needs_update'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface OwnerRequest {
  id: string;
  user_id: string;
  request_type: 'new_business' | 'claim_business';
  business_name: string;
  business_category?: string;
  city?: string;
  contact_phone: string;
  notes?: string;
  status: OwnerRequestStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}
