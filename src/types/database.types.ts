export interface DbBusiness {
  id: string;
  slug: string | null;
  name: string;
  category_id: string | null;
  sub_category: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website_url: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  yr_score: number | null;
  rating: number | null;
  review_count: number | null;
  tier_level: number | null;
  badge_type: 'gold' | 'blue' | 'gray' | null;
  is_verified: boolean | null;
  verification_reason: string | null;
  verified_at: string | null;
  verified_by_user_id: string | null;
  claim_status: string | null;
  claimed_by_user_id: string | null;
  sections_config: any | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  // من الـ join
  categories?: { id: string; slug: string; name: string; icon: string } | null;
}

export interface BusinessItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  city: string;
  district: string;
  phone: string;
  whatsapp: string;
  email?: string;
  website_url?: string;
  logo_url?: string;
  cover_url?: string;
  gallery_urls?: string[];
  yr_score: number;
  rating: number;
  reviews_count: number;
  price_range?: string;
  hours?: string;
  is_open_now?: boolean;
  badge_type: 'gold' | 'blue' | 'gray';
  is_verified: boolean;
  claim_status?: string;
  quote_text?: string;
  services?: string[];
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
}
