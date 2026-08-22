import { AdItem, AdMediaItem } from '../types/ads';

export const DEMO_ADS: AdItem[] = [
  {
    id: 'ad_1',
    title: 'حملة تطبيق كريمي جوال 2026',
    advertiserName: 'بنك الكريمي للتمويل الأصغر',
    advertiserId: 'b1',
    type: 'banner',
    placements: ['home_top', 'prices_page'],
    status: 'published',
    mediaUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    targetUrl: 'https://kuraimibank.com',
    startDate: '2026-08-01',
    endDate: '2026-09-01',
    budget: '$500',
    impressions: 48200,
    clicks: 3410,
    ctr: 7.07,
    createdAt: '2026-07-28'
  },
  {
    id: 'ad_2',
    title: 'فيديو إطلاق محفظة جيب كاش باك',
    advertiserName: 'بنك اليمن والكويت',
    advertiserId: 'w1',
    type: 'video',
    placements: ['home_middle', 'category_page'],
    status: 'published',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80',
    targetUrl: 'https://jeeb.ye',
    startDate: '2026-08-10',
    endDate: '2026-09-10',
    budget: '$850',
    impressions: 62400,
    clicks: 5120,
    ctr: 8.2,
    createdAt: '2026-08-08'
  },
  {
    id: 'ad_3',
    title: 'عروض آيفون 16 متجر العصرية',
    advertiserName: 'متجر العصرية للإلكترونيات',
    advertiserId: 't5',
    type: 'mobile_banner',
    placements: ['business_profile', 'home_middle'],
    status: 'scheduled',
    mediaUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
    targetUrl: '/phones',
    startDate: '2026-09-01',
    endDate: '2026-09-15',
    budget: '$300',
    impressions: 0,
    clicks: 0,
    ctr: 0,
    createdAt: '2026-08-20'
  }
];

export const DEMO_AD_MEDIA: AdMediaItem[] = [
  {
    id: 'm_1',
    fileName: 'kuraimi_banner_2026.webp',
    fileType: 'image/webp',
    fileSize: '245 KB',
    mediaUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80',
    associatedAdTitle: 'حملة تطبيق كريمي جوال 2026',
    uploadedAt: '2026-07-28 14:30'
  },
  {
    id: 'm_2',
    fileName: 'jeeb_launch_promo.mp4',
    fileType: 'video/mp4',
    fileSize: '4.2 MB',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80',
    associatedAdTitle: 'فيديو إطلاق محفظة جيب كاش باك',
    uploadedAt: '2026-08-08 11:15'
  }
];
