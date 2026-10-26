export interface CityConfig {
  id: string;
  name_ar: string;
  name_en: string;
  districts?: string[];
}

export const YEMEN_CITIES: CityConfig[] = [
  { id: 'all', name_ar: 'كل المحافظات', name_en: 'All Governorates' },
  { id: 'sanaa_city', name_ar: 'أمانة العاصمة (صنعاء)', name_en: 'Sanaa City', districts: ['حدة', 'السبعين', 'التحرير', 'شعوب', 'معين', 'الوحدة', 'الثورة', 'بني الحارث'] },
  { id: 'sanaa_gov', name_ar: 'محافظة صنعاء', name_en: 'Sanaa Governorate', districts: ['سنحان', 'بني مطر', 'همدان', 'أرحب'] },
  { id: 'aden', name_ar: 'عدن', name_en: 'Aden', districts: ['كريتر', 'المعلا', 'التواهي', 'خور مكسر', 'المنصورة', 'الشيخ عثمان', 'دار سعد', 'البريقة'] },
  { id: 'taiz', name_ar: 'تعز', name_en: 'Taiz', districts: ['صالة', 'المظفر', 'القاهرة', 'الحوبان', 'التربة'] },
  { id: 'hadramout', name_ar: 'حضرموت', name_en: 'Hadramout', districts: ['المكلا', 'سيئون', 'الشحر', 'تريم', 'شحن'] },
  { id: 'ibb', name_ar: 'إب', name_en: 'Ibb', districts: ['الظهار', 'المشنة', 'جبلة', 'يريم', 'بعدان'] },
  { id: 'hodeidah', name_ar: 'الحديدة', name_en: 'Hodeidah', districts: ['الميناء', 'الحوك', 'الحالي', 'باجل', 'زبيد'] },
  { id: 'marib', name_ar: 'مأرب', name_en: 'Marib', districts: ['المدينة', 'الوادي', 'صرواح'] },
  { id: 'dhamar', name_ar: 'ذمار', name_en: 'Dhamar', districts: ['المدينة', 'عنس', 'معبر'] },
  { id: 'shabwah', name_ar: 'شبوة', name_en: 'Shabwah', districts: ['عتق', 'بيحان', 'حبان'] },
  { id: 'al_mahrah', name_ar: 'المهرة', name_en: 'Al Mahrah', districts: ['الغيضة', 'حوف', 'شحن'] },
  { id: 'abyan', name_ar: 'أبين', name_en: 'Abyan', districts: ['زنجبار', 'خنفر', 'لودر'] },
  { id: 'lahj', name_ar: 'لحج', name_en: 'Lahj', districts: ['الحوطة', 'تبن', 'يافع'] },
  { id: 'ad_dhale', name_ar: 'الضالع', name_en: 'Ad Dhale', districts: ['المدينة', 'دمت', 'قعطبة'] },
  { id: 'saada', name_ar: 'صعدة', name_en: 'Saada', districts: ['المدينة', 'سحار', 'حيدان'] },
  { id: 'hajjah', name_ar: 'حجة', name_en: 'Hajjah', districts: ['المدينة', 'عبس', 'المحابشة'] },
  { id: 'al_bayda', name_ar: 'البيضاء', name_en: 'Al Bayda', districts: ['المدينة', 'رداع'] },
  { id: 'amran', name_ar: 'عمران', name_en: 'Amran', districts: ['المدينة', 'خمر', 'ريدة'] },
  { id: 'al_jawf', name_ar: 'الجوف', name_en: 'Al Jawf', districts: ['الحزم', 'المتون'] },
  { id: 'al_mahwit', name_ar: 'المحويت', name_en: 'Al Mahwit', districts: ['المدينة', 'شبام كوكبان'] },
  { id: 'raymah', name_ar: 'ريمة', name_en: 'Raymah', districts: ['الجبين', 'بلاد الطعام'] },
  { id: 'socotra', name_ar: 'سقطرى', name_en: 'Socotra', districts: ['حديبو', 'قلنسية'] },
];
