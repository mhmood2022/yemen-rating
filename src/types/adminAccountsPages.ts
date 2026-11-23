export type ProfileKind = 'personal' | 'business_owner' | 'businessman';
export type AccountModerationStatus = 'active' | 'restricted' | 'suspended' | 'banned';
export type BadgeKind = 'none' | 'blue' | 'silver' | 'gold' | 'gray';
export type SubscriptionCycle = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatusKind = 'active' | 'expired' | 'cancelled' | 'pending' | 'none';
export type AdsCoverageKind = 'none' | 'banner' | 'text' | 'both';
export type PageKind = 'business' | 'company' | 'businessman';
export type PageStatusKind = 'active' | 'pending' | 'hidden' | 'suspended';
export type PeriodPreset = '7d' | '30d' | '90d' | 'all' | 'custom';

export interface LinkedPageBrief {
  id: string;
  name: string;
  slug: string;
  page_kind: PageKind;
  status: PageStatusKind;
  relation: 'owner' | 'admin';
  role?: string;
}

export interface AccountSummaryRow {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  city: string | null;
  role: string;
  account_type: string;
  profile_kind: ProfileKind;
  followers_count: number;
  following_count: number;
  posts_count: number;
  comments_count: number;
  likes_received_count: number;
  is_verified: boolean;
  badge_type: BadgeKind;
  verified_at: string | null;
  verification_expires_at: string | null;
  verification_reason: string | null;
  verified_by: string | null;
  subscription_cycle: SubscriptionCycle;
  subscription_status: SubscriptionStatusKind;
  subscription_plan_name: string | null;
  subscription_expires_at: string | null;
  ads_coverage: AdsCoverageKind;
  ads_count: number;
  reports_submitted_count: number;
  reports_received_count: number;
  support_tickets_count: number;
  support_open_count: number;
  support_latest_status: string | null;
  owned_pages_count: number;
  managed_pages_count: number;
  linked_pages?: LinkedPageBrief[];
  created_at: string;
  last_activity_at: string | null;
  moderation_status: AccountModerationStatus;
  can_post: boolean;
  can_interact: boolean;
  suspended_until: string | null;
  restriction_reason: string | null;
}

export interface AccountsDashboardStats {
  total: number;
  newInPeriod: number;
  prevPeriodNew: number;
  growthPct: number;
  active: number;
  inactive: number;
  verified: number;
  subscribed: number;
  expiredSubscriptions: number;
  suspendedOrBanned: number;
  withReports: number;
}

export interface PageSummaryRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  business_type: string;
  page_kind: PageKind;
  category_name: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  working_hours: string | null;
  branches: any[];
  map_url: string | null;
  latitude: number | null;
  longitude: number | null;
  owner_id: string | null;
  owner_name: string | null;
  owner_username: string | null;
  owner_avatar: string | null;
  owner_status: AccountModerationStatus | null;
  admins_count: number;
  admins_preview: Array<{ user_id: string; full_name: string; username: string; role: string }>;
  followers_count: number;
  posts_count: number;
  reviews_count: number;
  avg_rating: number;
  comments_count: number;
  interactions_count: number;
  is_verified: boolean;
  badge_type: BadgeKind;
  verified_at: string | null;
  verification_expires_at: string | null;
  verification_reason: string | null;
  verified_by_user_id: string | null;
  subscription_cycle: SubscriptionCycle;
  subscription_status: SubscriptionStatusKind;
  subscription_plan_name: string | null;
  subscription_expires_at: string | null;
  ads_coverage: AdsCoverageKind;
  active_ads_count: number;
  reports_submitted_count: number;
  reports_received_count: number;
  support_tickets_count: number;
  support_open_count: number;
  is_x_page: boolean;
  is_hidden: boolean;
  is_active: boolean;
  status: PageStatusKind;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountDetailBundle {
  account: AccountSummaryRow;
  verifierProfile: { id: string; full_name: string; email?: string } | null;
  ownedPages: PageSummaryRow[];
  managedPages: Array<{ business_id: string; role: string; page_name: string; page_slug: string }>;
  posts: any[];
  comments: any[];
  likesCountGiven: number;
  reposts: any[];
  followers: Array<{ id: string; full_name: string; username: string; avatar_url?: string; created_at: string }>;
  following: Array<{ id: string; full_name: string; username: string; avatar_url?: string; created_at: string }>;
  subscriptions: any[];
  payments: any[];
  paymentProofs: any[];
  ads: any[];
  reportsSubmitted: any[];
  reportsReceived: any[];
  supportTickets: any[];
  moderationLogs: any[];
  plans: any[];
}

export interface PagesDashboardStats {
  total: number;
  newInPeriod: number;
  prevPeriodNew: number;
  growthPct: number;
  active: number;
  verified: number;
  subscribed: number;
  expiredSubscriptions: number;
  withActiveAds: number;
  suspendedOrHidden: number;
  withReports: number;
  topFollowed: PageSummaryRow[];
  topRated: PageSummaryRow[];
}

export interface PageDetailBundle {
  page: PageSummaryRow;
  ownerProfile: any | null;
  verifierProfile: { id: string; full_name: string } | null;
  admins: Array<{ id: string; user_id: string; role: string; permissions?: { can_post?: boolean; can_reply_reviews?: boolean; can_edit_info?: boolean; can_manage_ads?: boolean }; is_active: boolean; created_at: string; full_name: string; username: string; avatar_url?: string; email?: string }>;
  ownershipHistory: Array<{ id: string; previous_owner_id: string | null; new_owner_id: string | null; previous_owner_name?: string; new_owner_name?: string; action_type: string; reason: string; performed_by_email?: string; created_at: string }>;
  transferRequests: any[];
  posts: any[];
  comments: any[];
  followers: Array<{ id: string; full_name: string; username: string; avatar_url?: string; created_at: string }>;
  reviews: any[];
  ratingDistribution: Record<number, number>;
  subscriptions: any[];
  payments: any[];
  ads: any[];
  reports: any[];
  supportTickets: any[];
  moderationLogs: any[];
  plans: any[];
  candidateUsers: Array<{ id: string; full_name: string; username: string; email?: string }>;
}
