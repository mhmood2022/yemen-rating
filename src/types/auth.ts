export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'business_owner' | 'user';
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}
