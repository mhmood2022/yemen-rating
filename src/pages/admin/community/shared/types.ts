export type CommunityTab = 'reports' | 'posts' | 'users' | 'storage' | 'logs' | 'support';

export type BadgeType = 'blue' | 'gold' | 'gray' | null;

export interface PostItem {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  views_count?: number;
  created_at: string;
  is_hidden?: boolean;
  status?: string;
  quote_text?: string;
  original_post_id?: string;
  is_pinned?: boolean;
  reports_count?: number;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorBadge?: BadgeType;
}

export interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
}

export interface ProfileItem {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  verification_type?: BadgeType;
  is_verified?: boolean;
  is_blocked?: boolean;
  posts_count?: number;
  created_at?: string;
}

export interface ReportItem {
  id: string;
  reason: string;
  details?: string;
  reported_item_type: 'post' | 'user' | 'comment';
  reported_item_id: string;
  reported_user_id?: string;
  reporter_id?: string;
  reporter_name?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  targetPost?: PostItem;
  targetUser?: ProfileItem;
}

export interface AuditLogItem {
  id: string;
  admin_name: string;
  admin_email: string;
  action_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface StorageStats {
  imagesCount: number;
  videosCount: number;
  totalBytes: number;
  dailyUploads: number;
  quotaBytes: number;
}

export const PAGE_SIZE = 10;

export const formatNumber = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

export const timeAgo = (dateStr: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return Math.floor(diff / 60) + ' د';
  if (diff < 86400) return Math.floor(diff / 3600) + ' س';
  if (diff < 604800) return Math.floor(diff / 86400) + ' ي';
  return new Date(dateStr).toLocaleDateString('ar-YE');
};
