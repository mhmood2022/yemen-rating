export interface AdPlacement {
  id: string;
  name: string;
  width: number;
  height: number;
}

export const YR_AD_PLACEMENTS: AdPlacement[] = [
  { id: '1', name: 'الرئيسية — الهيدر العلوي (Top Banner)', width: 1200, height: 160 },
  { id: '2', name: 'الرئيسية — بين الأقسام (In-Feed Main)', width: 800, height: 250 },
  { id: '4', name: 'دليل الشركات — أعلى الصفحة (Company Top)', width: 1200, height: 160 },
  { id: '3', name: 'دليل الشركات — بين البطاقات والفوتر (Directory)', width: 800, height: 220 },
  { id: '5', name: 'قسم العقارات (Real-Estate)', width: 850, height: 200 },
  { id: '6', name: 'قسم المزادات (Auctions)', width: 850, height: 200 },
  { id: '7', name: 'قسم الوظائف (Jobs)', width: 850, height: 200 },
  { id: '8', name: 'دليل البنوك وأسعار الصرف (Banks & Rates)', width: 850, height: 200 },
  { id: '9', name: 'سوق الهواتف (Phones Market)', width: 850, height: 200 },
  { id: '10', name: 'شريط الفوتر العام الثابت (Footer Sticky)', width: 1200, height: 90 },
];
