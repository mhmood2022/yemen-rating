export interface AdPlacement {
  id: string;
  name: string;
  width: number;
  height: number;
}

export const YR_AD_PLACEMENTS: AdPlacement[] = [
  { id: '1', name: 'الهيدر الرئيسي (Top Banner)', width: 1200, height: 160 },
  { id: '2', name: 'بين أقسام الرئيسية (In-Feed Main)', width: 800, height: 250 },
  { id: '3', name: 'السايدبار الجانبي (Sidebar Banner)', width: 300, height: 600 },
  { id: '4', name: 'أعلى صفحات الشركات (Company Top)', width: 970, height: 150 },
  { id: '5', name: 'داخل تفاصيل العقار (Real-Estate Inner)', width: 728, height: 90 },
  { id: '6', name: 'شريط المزادات العاجل (Auction Ribbon)', width: 1100, height: 100 },
  { id: '7', name: 'بين نتائج الوظائف (Jobs Sponsored)', width: 850, height: 180 },
  { id: '8', name: 'شريط أسعار الصرف (Rates Sticky)', width: 320, height: 480 },
  { id: '9', name: 'شاشة الهاتف المحمول (Mobile Interstitial)', width: 360, height: 640 },
  { id: '10', name: 'شريط الفوتر الثابت (Footer Sticky)', width: 1200, height: 90 },
];
