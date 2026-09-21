export interface OwnerProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role: 'owner' | 'business_owner' | 'user';
  created_at?: string;
}

export type BusinessClassification = 
  | 'company'
  | 'store'
  | 'hotel'
  | 'restaurant'
  | 'service'
  | 'bank'
  | string;

export interface BusinessItem {
  id: string;
  owner_id: string;
  name: string;
  classification: BusinessClassification;
  category_name?: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  cover_image?: string;
  images?: string[];
  status: 'active' | 'pending' | 'suspended' | 'draft';
  is_featured: boolean;
  featured_until?: string | null;
  subscription_status?: 'active' | 'expired' | 'trial' | 'none';
  subscription_plan?: string | null;
  rating?: number;
  reviews_count?: number;
  views_count?: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ReviewItem {
  id: string;
  business_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  reply?: string;
}
