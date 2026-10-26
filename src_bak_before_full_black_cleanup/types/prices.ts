export type PriceMarket = 'sanaa' | 'aden';

export type PriceCategoryType = 'currencies' | 'gold' | 'commodities';

export interface CurrencyPriceItem {
  id: string;
  currencyName: string;
  currencyCode: string;
  symbol: string;
  market: PriceMarket;
  buyPrice: number;
  sellPrice: number;
  change: 'up' | 'down' | 'stable';
  changeAmount?: string;
  source: string;
  lastUpdated: string;
}

export interface GoldPriceItem {
  id: string;
  karatName: string; // e.g. عيار 24، عيار 21، عيار 18، الجنيه الذهب
  market: PriceMarket;
  buyPrice: number;
  sellPrice: number;
  unit: string; // جرام، حبة
  change: 'up' | 'down' | 'stable';
  changeAmount?: string;
  source: string;
  lastUpdated: string;
}

export interface CommodityPriceItem {
  id: string;
  commodityName: string;
  category: 'food' | 'fuel' | 'construction';
  market: PriceMarket;
  price: number;
  unit: string; // كيس 50 كجم، لتر، أسطوانة
  change: 'up' | 'down' | 'stable';
  changeAmount?: string;
  source: string;
  lastUpdated: string;
}
