export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface YRBusiness {
  id: string;
  name: string;
  slug?: string;
  category_id?: string;
  category_name?: string;
  city?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  images?: string[];
  videos?: string[];
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  is_featured?: boolean;
  latitude?: number;
  longitude?: number;
  opening_hours?: Record<string, string>;
  services?: string[];
  products?: Array<{ name: string; price?: string; description?: string }>;
  created_at?: string;
}

export interface YRMessage {
  id: string;
  business_id: string;
  sender_id?: string;
  sender_name: string;
  sender_phone: string;
  sender_email?: string;
  subject?: string;
  message: string;
  reply_text?: string;
  is_read: boolean;
  created_at: string;
}

export interface YRLead {
  id: string;
  business_id: string;
  user_id?: string;
  service_requested?: string;
  details: string;
  budget_estimation?: string;
  preferred_contact_method: 'phone' | 'whatsapp' | 'email';
  status: 'pending' | 'contacted' | 'quoted' | 'closed' | 'rejected';
  created_at: string;
}

export interface YRAdCampaign {
  id: string;
  business_id: string;
  campaign_name: string;
  ad_title: string;
  ad_description?: string;
  media_url?: string;
  destination_url?: string;
  placement_type: 'home_banner' | 'category_top' | 'search_result';
  target_category_id?: string;
  target_city_id?: string;
  target_keywords?: string[];
  daily_budget: number;
  total_budget: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending_review' | 'active' | 'paused' | 'completed' | 'rejected';
  created_at: string;
}

export interface YRAdAnalytics {
  id: string;
  campaign_id: string;
  impressions: number;
  clicks: number;
  leads_generated: number;
  calls_initiated: number;
  website_visits: number;
  directions_requested: number;
  ctr: number;
  cpc: number;
  recorded_date: string;
}

export interface YRBusinessAnalytics {
  id: string;
  business_id: string;
  views_count: number;
  phone_clicks: number;
  directions_clicks: number;
  website_clicks: number;
  messages_sent: number;
  recorded_date: string;
}

export interface AnonymizedJob {
  id: string;
  business_id: string;
  title: string;
  city: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  experience_years: number;
  skills_required: string[];
  description: string;
  requirements: string;
  status: string;
  applicants_count: number;
  commission_amount: number;
  commission_currency: string;
  commission_locked_at: string;
  created_at: string;
}

export interface JobApplication {
  id?: string;
  job_id: string;
  applicant_name: string;
  phone: string;
  email?: string;
  skills: string[];
  experience_years: number;
  education_level: string;
  ai_match_score?: number;
  ai_match_reasons?: Record<string, any>;
  status?: string;
  commission_paid?: boolean;
  created_at?: string;
}

export interface Property {
  id: string;
  title: string;
  property_type: string;
  listing_type: string;
  price: number;
  currency: string;
  area_sqm: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  district: string;
  features: string[];
  image_urls: string[];
  commission_amount: number;
  commission_locked_at: string;
  status?: string;
}

export interface PropertyInquiry {
  id?: string;
  property_id: string;
  contact_name: string;
  phone: string;
  message?: string;
  status?: string;
  ai_match_score?: number;
  created_at?: string;
}

export interface ExchangeRate {
  id: string;
  market: 'sanaa' | 'aden';
  currency_code: string;
  buy_price: number;
  sell_price: number;
  previous_buy_price: number;
  previous_sell_price: number;
  source_name: string;
  created_at: string;
}
