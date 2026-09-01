export type BadgeType = 'gold' | 'blue' | 'gray' | 'none';

export interface BaseEntity {
  id: string;
  slug: string;
  name?: string;
  title?: string;
  description: string;
  is_verified?: boolean;
  badge_type?: BadgeType;
  city_name: string;
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MediaItem {
  id: string;
  file_url: string;
  media_type: 'image' | 'video' | 'document';
  alt_text?: string;
  sort_order: number;
  is_cover?: boolean;
}

export interface ReviewData {
  id: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  entity_type: string;
  entity_id: string;
  rating: number; // 1 to 5 strictly
  title?: string;
  comment: string;
  status: 'approved' | 'pending' | 'rejected' | 'hidden';
  created_at: string;
}

export interface BankEntity extends BaseEntity {
  name: string;
  category_label: string;
  logo_url: string;
  cover_url: string;
  short_description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website_url?: string;
  address?: string;
  branches_count: number;
  atms_count?: number;
  services: string[];
  media: MediaItem[];
  reviews: ReviewData[];
  rating_summary: {
    average: number;
    count: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
}

export interface BusinessEntity extends BaseEntity {
  name: string;
  category_label: string;
  logo_url: string;
  cover_url: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website_url?: string;
  address?: string;
  services: { name: string; price?: number; currency?: string }[];
  media: MediaItem[];
  reviews: ReviewData[];
  rating_summary: {
    average: number;
    count: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
}

export interface JobEntity extends BaseEntity {
  title: string;
  company_id?: string;
  company_name: string;
  employer_phone: string; // محمي للإدارة فقط
  employer_email?: string;
  category_name: string;
  employment_type: string;
  experience_level: string;
  education_level: string;
  gender: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  skills: string[];
  requirements: string[];
  responsibilities: string[];
  fixed_commission_amount: number;
  applicants_count: number;
  status: 'active' | 'closed';
}

export interface PropertyEntity extends BaseEntity {
  title: string;
  property_type: 'شقة' | 'فيلا' | 'أرض' | 'عمارة' | 'محل' | 'مزرعة';
  listing_type: 'sale' | 'rent';
  price: number;
  currency: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  address?: string;
  features: string[];
  publisher_name: string;
  publisher_phone: string; // محمي
  is_contact_masked: boolean;
  media: MediaItem[];
}

export interface AuctionEntity extends BaseEntity {
  title: string;
  item_name: string;
  item_type: string;
  item_condition: 'جديد' | 'مستعمل';
  category_name: string;
  sale_type: 'fixed_price' | 'auction';
  fixed_price?: number;
  starting_price?: number;
  minimum_bid_increment?: number;
  current_bid?: number;
  bids_count: number;
  currency: string;
  seller_name: string;
  seller_phone: string;
  time_left_seconds?: number;
  status: 'active' | 'scheduled' | 'ended_with_winner' | 'ended_no_bids' | 'deal_completed' | 'disputed';
  media: MediaItem[];
  bids_history: { id: string; bidder_code: string; amount: number; created_at: string }[];
}
