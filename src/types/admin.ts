export interface AdminDashboardMetrics {
  totalBusinesses: number;
  totalBanks: number;
  totalWallets: number;
  totalCompanies: number;
  totalShops: number;
  totalRealEstate: number;
  totalCars: number;
  totalJobs: number;
  totalReviews: number;
  pendingVerifications: number;
  activeAds: number;
  totalViews30d: number;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'business_owner' | 'user';
  associatedBusinessId?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin: string;
}
