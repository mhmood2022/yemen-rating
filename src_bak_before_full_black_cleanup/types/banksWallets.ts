import { YemenCity } from './business';

export type EntityType = 'bank' | 'wallet';

export interface BankWalletFee {
  serviceName: string;
  feeAmount: string;
  limits?: string;
  notes?: string;
}

export interface BankWalletItem {
  id: string;
  type: EntityType;
  name: string;
  commercialName?: string;
  entityCategory: string; // e.g. بنك إسلامي، بنك تجاري، محفظة إلكترونية، بنك تمويل أصغر
  logoUrl?: string;
  headquartersCity: YemenCity;
  branchCount?: number;
  atmCount?: number;
  agentCount?: number; // نقاط الخدمة والوكلاء
  yrScore: number; // 0 to 100
  rating: number; // 0.0 to 5.0
  reviewCount: number;
  isVerified: boolean;
  isTrending: boolean;
  phone?: string;
  supportPhone?: string;
  email?: string;
  website?: string;
  appDownloadUrl?: string;
  description: string;
  services: string[];
  features: string[];
  fees: BankWalletFee[];
}

export interface BankWalletFilterState {
  type: 'all' | 'bank' | 'wallet';
  searchQuery: string;
  city: string;
  category: string;
  verifiedOnly: boolean;
  sortBy: 'highest_score' | 'most_reviewed' | 'trending' | 'branches';
}
