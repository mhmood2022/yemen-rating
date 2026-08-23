import { YemenCity } from './business';

export type PhoneCategoryType =
  | 'all'
  | 'phones'
  | 'accessories'
  | 'maintenance'
  | 'sim_services'
  | 'deals';

export interface PhoneDeviceItem {
  id: string;
  name: string;
  brand: string; // Apple, Samsung, Xiaomi, etc.
  category: 'phones' | 'accessories' | 'maintenance' | 'sim_services';
  condition: 'new' | 'used' | 'service';
  storage?: string; // 128GB, 256GB, 512GB
  ram?: string;
  priceSanaa: number;
  priceAden: number;
  imageUrl: string;
  storeId: string;
  storeName: string;
  city: YemenCity;
  isOffer?: boolean;
  warranty?: string;
  specs?: string[];
}
