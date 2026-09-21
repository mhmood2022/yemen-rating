export type UserRole = 'visitor' | 'owner' | 'admin';
export type UserStatus = 'active' | 'suspended';

export type OwnerRequestStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'needs_update'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

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
