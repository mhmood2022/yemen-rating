
/* Yemen Rating Module - Phase 9 & 10 (Exchange Rates & Ads/Offers Engine) */

// 1. نظام أسعار الصرف (صنعاء / عدن)
const EXCHANGE_RATES_CONFIG = {
  cities: ['Sanaa', 'Aden'],
  currencies: ['USD', 'SAR'],
  updateRate: function(city, currency, buyRate, sellRate, adminId) {
    console.log(`[Exchange System] Updated ${currency} in ${city}: Buy ${buyRate}, Sell ${sellRate} by Admin ${adminId}`);
  }
};

// 2. نظام الإعلانات والعروض المخصص
const AD_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  ACTIVE: 'active',
  PAUSED: 'paused',
  EXPIRED: 'expired',
  REJECTED: 'rejected'
};

function createAdOffer(businessId, categoryScope, adData) {
  return {
    id: 'ad_' + Date.now(),
    businessId: businessId || 'Custom/Manual',
    scope: categoryScope,
    status: AD_STATUSES.PENDING,
    title: adData.title,
    bannerUrl: adData.bannerUrl,
    createdAt: new Date().toISOString()
  };
}

console.log("Phase 9 & 10 Exchange Rates & Ads/Offers Engine Loaded.");
