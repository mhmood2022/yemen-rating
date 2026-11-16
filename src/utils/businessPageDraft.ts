export interface StoredBusinessReview {
  id: string;
  businessId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export interface StoredBusinessPage {
  id: string;
  ownerId?: string;
  name: string;
  username: string;
  businessType: string;
  city: string;
  phone: string;
  description: string;
  avatarUrl: string;
  coverUrl: string;
  verificationType?: string;
  rating: number;
  reviewCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

const BIZ_PAGE_KEY = 'yr_business_page_draft_v1';
const BIZ_REVIEWS_KEY = 'yr_business_reviews_draft_v1';
const BIZ_POSTS_KEY = 'yr_business_posts_draft_v1';

export function getStoredBusinessPage(): StoredBusinessPage | null {
  try {
    const raw = localStorage.getItem(BIZ_PAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredBusinessPage(page: StoredBusinessPage): void {
  try {
    localStorage.setItem(BIZ_PAGE_KEY, JSON.stringify(page));
  } catch {}
}

export function getStoredBusinessPosts(businessId: string): any[] {
  try {
    const raw = localStorage.getItem(BIZ_POSTS_KEY);
    const all: any[] = raw ? JSON.parse(raw) : [];
    return all.filter((p) => p.businessId === businessId);
  } catch {
    return [];
  }
}

export function addStoredBusinessPost(post: any): void {
  try {
    const raw = localStorage.getItem(BIZ_POSTS_KEY);
    const all: any[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(BIZ_POSTS_KEY, JSON.stringify([post, ...all].slice(0, 50)));
  } catch {}
}

export function getStoredBusinessReviews(businessId: string): StoredBusinessReview[] {
  try {
    const raw = localStorage.getItem(BIZ_REVIEWS_KEY);
    const all: StoredBusinessReview[] = raw ? JSON.parse(raw) : [];
    return all.filter((r) => r.businessId === businessId);
  } catch {
    return [];
  }
}

export function addStoredBusinessReview(review: StoredBusinessReview): {
  reviews: StoredBusinessReview[];
  avgRating: number;
  count: number;
} {
  let all: StoredBusinessReview[] = [];
  try {
    const raw = localStorage.getItem(BIZ_REVIEWS_KEY);
    all = raw ? JSON.parse(raw) : [];
  } catch {}

  const updatedAll = [review, ...all];
  try {
    localStorage.setItem(BIZ_REVIEWS_KEY, JSON.stringify(updatedAll));
  } catch {}

  const bizReviews = updatedAll.filter((r) => r.businessId === review.businessId);
  const count = bizReviews.length;
  const avgRating = count > 0
    ? Number((bizReviews.reduce((acc, r) => acc + r.stars, 0) / count).toFixed(1))
    : 0;

  const currentPage = getStoredBusinessPage();
  if (currentPage && currentPage.id === review.businessId) {
    saveStoredBusinessPage({
      ...currentPage,
      rating: avgRating,
      reviewCount: count,
    });
  }

  return { reviews: bizReviews, avgRating, count };
}
