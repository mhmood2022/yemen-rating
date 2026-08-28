export interface City {
  id: string;
  name: string;
}

export interface Governorate {
  id: string;
  name: string;
  cities: City[];
}

export const YEMEN_LOCATIONS: Governorate[] = [
  {
    id: 'sanaa',
    name: 'أمانة العاصمة / صنعاء',
    cities: [
      { id: 'all', name: 'كل صنعاء' },
      { id: 'tahrir', name: 'التحرير' },
      { id: 'sabaeen', name: 'السبعين وحدّة' },
      { id: 'shaoob', name: 'شعوب' },
      { id: 'shumailah', name: 'شميلة' },
      { id: 'hasaba', name: 'الحصبة' },
      { id: 'matar', name: 'المطار وبني الحارث' }
    ]
  },
  {
    id: 'aden',
    name: 'عدن',
    cities: [
      { id: 'all', name: 'كل عدن' },
      { id: 'crater', name: 'كريتر' },
      { id: 'mualla', name: 'المعلا' },
      { id: 'tawahi', name: 'التواهي' },
      { id: 'mansoura', name: 'المنصورة' },
      { id: 'sheikh-othman', name: 'الشيخ عثمان' },
      { id: 'khor-maksar', name: 'خور مكسر' },
      { id: 'inma', name: 'إنماء والشعب' }
    ]
  },
  {
    id: 'taiz',
    name: 'تعز',
    cities: [
      { id: 'all', name: 'كل تعز' },
      { id: 'center', name: 'وسط المدينة وشارع جمال' },
      { id: 'hawban', name: 'الحوبان' },
      { id: 'turbah', name: 'التربة' }
    ]
  },
  {
    id: 'hadramout',
    name: 'حضرموت',
    cities: [
      { id: 'all', name: 'كل حضرموت' },
      { id: 'mukalla', name: 'المكلا' },
      { id: 'seiyun', name: 'سيئون' },
      { id: 'shihr', name: 'الشحر' },
      { id: 'tarim', name: 'تريم' }
    ]
  },
  {
    id: 'hodeidah',
    name: 'الحديدة',
    cities: [
      { id: 'all', name: 'كل الحديدة' },
      { id: 'mina', name: 'الميناء' },
      { id: 'hali', name: 'الحالي' },
      { id: 'hook', name: 'الحوك' }
    ]
  },
  {
    id: 'marib',
    name: 'مأرب',
    cities: [
      { id: 'all', name: 'كل مأرب' },
      { id: 'city', name: 'المدينة' },
      { id: 'wadi', name: 'الوادي' }
    ]
  },
  {
    id: 'ibb',
    name: 'إب',
    cities: [
      { id: 'all', name: 'كل إب' },
      { id: 'dhafrah', name: 'الظهار' },
      { id: 'mishna', name: 'المشنة' },
      { id: 'yareem', name: 'يريم' }
    ]
  }
];
