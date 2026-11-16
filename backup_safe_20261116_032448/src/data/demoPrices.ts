import { CurrencyPriceItem, GoldPriceItem, CommodityPriceItem } from '../types/prices';

/* ==================== 1. أسعار صرف العملات ==================== */
export const DEMO_CURRENCIES: CurrencyPriceItem[] = [
  // سوق صنعاء
  {
    id: 'c_usd_san',
    currencyName: 'الدولار الأمريكي',
    currencyCode: 'USD',
    symbol: '$',
    market: 'sanaa',
    buyPrice: 535,
    sellPrice: 538,
    change: 'stable',
    changeAmount: '0.0%',
    source: 'جمعية الصرافين بصنعاء',
    lastUpdated: 'اليوم 02:30 م'
  },
  {
    id: 'c_sar_san',
    currencyName: 'الريال السعودي',
    currencyCode: 'SAR',
    symbol: 'ر.س',
    market: 'sanaa',
    buyPrice: 140.0,
    sellPrice: 140.5,
    change: 'stable',
    changeAmount: '0.0%',
    source: 'جمعية الصرافين بصنعاء',
    lastUpdated: 'اليوم 02:30 م'
  },
  {
    id: 'c_eur_san',
    currencyName: 'اليورو الأوروبي',
    currencyCode: 'EUR',
    symbol: '€',
    market: 'sanaa',
    buyPrice: 580,
    sellPrice: 585,
    change: 'up',
    changeAmount: '+0.5%',
    source: 'سوق الصرافة المعتمد',
    lastUpdated: 'اليوم 02:00 م'
  },
  {
    id: 'c_aed_san',
    currencyName: 'الدرهم الإماراتي',
    currencyCode: 'AED',
    symbol: 'د.إ',
    market: 'sanaa',
    buyPrice: 145,
    sellPrice: 146,
    change: 'stable',
    changeAmount: '0.0%',
    source: 'سوق الصرافة المعتمد',
    lastUpdated: 'اليوم 02:00 م'
  },

  // سوق عدن
  {
    id: 'c_usd_adn',
    currencyName: 'الدولار الأمريكي',
    currencyCode: 'USD',
    symbol: '$',
    market: 'aden',
    buyPrice: 1910,
    sellPrice: 1925,
    change: 'up',
    changeAmount: '+5 ريال',
    source: 'نقابة الصرافين بعدن',
    lastUpdated: 'اليوم 02:45 م'
  },
  {
    id: 'c_sar_adn',
    currencyName: 'الريال السعودي',
    currencyCode: 'SAR',
    symbol: 'ر.س',
    market: 'aden',
    buyPrice: 501.5,
    sellPrice: 503.0,
    change: 'up',
    changeAmount: '+1.5 ريال',
    source: 'نقابة الصرافين بعدن',
    lastUpdated: 'اليوم 02:45 م'
  },
  {
    id: 'c_eur_adn',
    currencyName: 'اليورو الأوروبي',
    currencyCode: 'EUR',
    symbol: '€',
    market: 'aden',
    buyPrice: 2060,
    sellPrice: 2085,
    change: 'up',
    changeAmount: '+10 ريال',
    source: 'سوق الصرافة بعدن',
    lastUpdated: 'اليوم 02:15 م'
  },
  {
    id: 'c_aed_adn',
    currencyName: 'الدرهم الإماراتي',
    currencyCode: 'AED',
    symbol: 'د.إ',
    market: 'aden',
    buyPrice: 518,
    sellPrice: 522,
    change: 'up',
    changeAmount: '+2 ريال',
    source: 'سوق الصرافة بعدن',
    lastUpdated: 'اليوم 02:15 م'
  }
];

/* ==================== 2. أسعار الذهب ==================== */
export const DEMO_GOLD: GoldPriceItem[] = [
  // سوق صنعاء
  {
    id: 'g_24_san',
    karatName: 'ذهب عيار 24',
    market: 'sanaa',
    buyPrice: 42500,
    sellPrice: 43200,
    unit: 'جرام',
    change: 'up',
    changeAmount: '+300 ريال',
    source: 'نقابة صاغة الذهب بصنعاء',
    lastUpdated: 'اليوم 01:30 م'
  },
  {
    id: 'g_21_san',
    karatName: 'ذهب عيار 21 (الأكثر تداولاً)',
    market: 'sanaa',
    buyPrice: 36800,
    sellPrice: 37500,
    unit: 'جرام',
    change: 'up',
    changeAmount: '+250 ريال',
    source: 'نقابة صاغة الذهب بصنعاء',
    lastUpdated: 'اليوم 01:30 م'
  },
  {
    id: 'g_18_san',
    karatName: 'ذهب عيار 18',
    market: 'sanaa',
    buyPrice: 31500,
    sellPrice: 32200,
    unit: 'جرام',
    change: 'stable',
    changeAmount: '0.0%',
    source: 'نقابة صاغة الذهب بصنعاء',
    lastUpdated: 'اليوم 01:30 م'
  },
  {
    id: 'g_pnd_san',
    karatName: 'الجنيه الذهب (8 جرام)',
    market: 'sanaa',
    buyPrice: 294000,
    sellPrice: 298000,
    unit: 'حبة',
    change: 'up',
    changeAmount: '+2000 ريال',
    source: 'سوق الذهب المركزي',
    lastUpdated: 'اليوم 01:30 م'
  },

  // سوق عدن
  {
    id: 'g_24_adn',
    karatName: 'ذهب عيار 24',
    market: 'aden',
    buyPrice: 152000,
    sellPrice: 156000,
    unit: 'جرام',
    change: 'up',
    changeAmount: '+1200 ريال',
    source: 'سوق الصاغة بكريتر',
    lastUpdated: 'اليوم 02:00 م'
  },
  {
    id: 'g_21_adn',
    karatName: 'ذهب عيار 21 (الأكثر تداولاً)',
    market: 'aden',
    buyPrice: 133000,
    sellPrice: 136500,
    unit: 'جرام',
    change: 'up',
    changeAmount: '+1000 ريال',
    source: 'سوق الصاغة بكريتر',
    lastUpdated: 'اليوم 02:00 م'
  },
  {
    id: 'g_18_adn',
    karatName: 'ذهب عيار 18',
    market: 'aden',
    buyPrice: 114000,
    sellPrice: 117000,
    unit: 'جرام',
    change: 'up',
    changeAmount: '+800 ريال',
    source: 'سوق الصاغة بكريتر',
    lastUpdated: 'اليوم 02:00 م'
  },
  {
    id: 'g_pnd_adn',
    karatName: 'الجنيه الذهب (8 جرام)',
    market: 'aden',
    buyPrice: 1064000,
    sellPrice: 1092000,
    unit: 'حبة',
    change: 'up',
    changeAmount: '+8000 ريال',
    source: 'سوق الصاغة بكريتر',
    lastUpdated: 'اليوم 02:00 م'
  }
];

/* ==================== 3. أسعار السلع الأساسية والمشتقات ==================== */
export const DEMO_COMMODITIES: CommodityPriceItem[] = [
  // سوق صنعاء
  {
    id: 'cmd_flr_san',
    commodityName: 'دقيق القمح الأبيض (السنابل)',
    category: 'food',
    market: 'sanaa',
    price: 15800,
    unit: 'كيس 50 كجم',
    change: 'stable',
    changeAmount: 'ثابت',
    source: 'الغرفة التجارية بصنعاء',
    lastUpdated: 'اليوم 12:00 م'
  },
  {
    id: 'cmd_sgr_san',
    commodityName: 'السكر الأبيض النقي',
    category: 'food',
    market: 'sanaa',
    price: 19500,
    unit: 'كيس 50 كجم',
    change: 'stable',
    changeAmount: 'ثابت',
    source: 'الغرفة التجارية بصنعاء',
    lastUpdated: 'اليوم 12:00 م'
  },
  {
    id: 'cmd_oil_san',
    commodityName: 'زيت الطبخ النباتي',
    category: 'food',
    market: 'sanaa',
    price: 12500,
    unit: 'دبة 20 لتر',
    change: 'down',
    changeAmount: '-200 ريال',
    source: 'سوق السلع المركزي',
    lastUpdated: 'اليوم 12:00 م'
  },
  {
    id: 'cmd_pet_san',
    commodityName: 'بنزين ممتاز (سعر رسمي)',
    category: 'fuel',
    market: 'sanaa',
    price: 9500,
    unit: 'دبة 20 لتر',
    change: 'stable',
    changeAmount: 'رسمي',
    source: 'شركة النفط اليمنية',
    lastUpdated: 'اليوم 10:00 ص'
  },
  {
    id: 'cmd_gas_san',
    commodityName: 'الغاز المنزلي',
    category: 'fuel',
    market: 'sanaa',
    price: 6000,
    unit: 'أسطوانة',
    change: 'stable',
    changeAmount: 'رسمي',
    source: 'الشركة اليمنية للغاز',
    lastUpdated: 'اليوم 10:00 ص'
  },

  // سوق عدن
  {
    id: 'cmd_flr_adn',
    commodityName: 'دقيق القمح الأبيض (السنابل)',
    category: 'food',
    market: 'aden',
    price: 48500,
    unit: 'كيس 50 كجم',
    change: 'up',
    changeAmount: '+500 ريال',
    source: 'الغرفة التجارية بعدن',
    lastUpdated: 'اليوم 01:00 م'
  },
  {
    id: 'cmd_sgr_adn',
    commodityName: 'السكر الأبيض النقي',
    category: 'food',
    market: 'aden',
    price: 58000,
    unit: 'كيس 50 كجم',
    change: 'up',
    changeAmount: '+800 ريال',
    source: 'الغرفة التجارية بعدن',
    lastUpdated: 'اليوم 01:00 م'
  },
  {
    id: 'cmd_oil_adn',
    commodityName: 'زيت الطبخ النباتي',
    category: 'food',
    market: 'aden',
    price: 42000,
    unit: 'دبة 20 لتر',
    change: 'up',
    changeAmount: '+1000 ريال',
    source: 'سوق السلع بعدن',
    lastUpdated: 'اليوم 01:00 م'
  },
  {
    id: 'cmd_pet_adn',
    commodityName: 'بنزين ممتاز (سعر رسمي)',
    category: 'fuel',
    market: 'aden',
    price: 29000,
    unit: 'دبة 20 لتر',
    change: 'stable',
    changeAmount: 'رسمي',
    source: 'شركة النفط بعدن',
    lastUpdated: 'اليوم 10:30 ص'
  },
  {
    id: 'cmd_gas_adn',
    commodityName: 'الغاز المنزلي',
    category: 'fuel',
    market: 'aden',
    price: 13500,
    unit: 'أسطوانة',
    change: 'stable',
    changeAmount: 'رسمي',
    source: 'الشركة اليمنية للغاز',
    lastUpdated: 'اليوم 10:30 ص'
  }
];
