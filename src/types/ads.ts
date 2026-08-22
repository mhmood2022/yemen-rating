export type AdType =
  | 'video'
  | 'banner'
  | 'mobile_banner'
  | 'desktop_leaderboard'
  | 'in_feed';

export type AdPlacement =
  | 'home_top'
  | 'home_middle'
  | 'directory_sidebar'
  | 'business_profile'
  | 'jobs_page'
  | 'prices_page'
  | 'category_page';

export type AdStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'paused'
  | 'expired'
  | 'rejected';

export interface AdItem {
  id: string;
  title: string;
  advertiserName: string;
  advertiserId?: string;
  type: AdType;
  placements: AdPlacement[];
  status: AdStatus;
  mediaUrl: string;
  thumbnailUrl?: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  budget?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  createdAt: string;
}

export interface AdMediaItem {
  id: string;
  fileName: string;
  fileType: 'video/mp4' | 'image/jpeg' | 'image/png' | 'image/webp';
  fileSize: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  associatedAdTitle?: string;
  uploadedAt: string;
}
