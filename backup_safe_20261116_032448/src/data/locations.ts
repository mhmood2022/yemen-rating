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
    name: 'صنعاء',
    cities: [
      { id: 'all', name: 'كل صنعاء' },
      { id: 'sabaeen', name: 'السبعين وحدّة' },
      { id: 'tahrir', name: 'التحرير ووسط البلد' },
      { id: 'shaoob', name: 'شعوب' },
      { id: 'shumailah', name: 'شميلة وبيت بوس' },
      { id: 'hasaba', name: 'الحصبة والثورة' },
      { id: 'matar', name: 'المطار وبني الحارث' },
      { id: 'azal', name: 'آزال وباب اليمن' },
      { id: 'main', name: 'معين والدائري' },
      { id: 'hamdan', name: 'همدان وضلاع' },
      { id: 'sanhan', name: 'سنحان وبني بهلول' },
      { id: 'manakhah', name: 'مناخة وحراز' }
    ]
  },
  {
    id: 'aden',
    name: 'عدن',
    cities: [
      { id: 'all', name: 'كل عدن' },
      { id: 'crater', name: 'كريتر' },
      { id: 'mansoura', name: 'المنصورة وريمي' },
      { id: 'sheikh-othman', name: 'الشيخ عثمان' },
      { id: 'mualla', name: 'المعلا' },
      { id: 'tawahi', name: 'التواهي' },
      { id: 'khor-maksar', name: 'خور مكسر' },
      { id: 'inma', name: 'إنماء والشعب' },
      { id: 'buraika', name: 'البريقة' }
    ]
  },
  {
    id: 'taiz',
    name: 'تعز',
    cities: [
      { id: 'all', name: 'كل تعز' },
      { id: 'center', name: 'وسط المدينة وشارع جمال' },
      { id: 'hawban', name: 'الحوبان' },
      { id: 'turbah', name: 'التربة' },
      { id: 'mudhaffar', name: 'المظفر' },
      { id: 'qahirah', name: 'القاهرة' },
      { id: 'mokha', name: 'المخا' }
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
      { id: 'tarim', name: 'تريم' },
      { id: 'shibam', name: 'شبام' },
      { id: 'qatan', name: 'القطن' }
    ]
  },
  {
    id: 'hodeidah',
    name: 'الحديدة',
    cities: [
      { id: 'all', name: 'كل الحديدة' },
      { id: 'mina', name: 'الميناء' },
      { id: 'hali', name: 'الحالي' },
      { id: 'hook', name: 'الحوك' },
      { id: 'zabiyd', name: 'زبيد' },
      { id: 'bajt', name: 'باجل' },
      { id: 'bayt-faqih', name: 'بيت الفقيه' }
    ]
  },
  {
    id: 'ibb',
    name: 'إب',
    cities: [
      { id: 'all', name: 'كل إب' },
      { id: 'dhafrah', name: 'الظهار' },
      { id: 'mishna', name: 'المشنة' },
      { id: 'yareem', name: 'يريم' },
      { id: 'jiblah', name: 'جبلة' },
      { id: 'qaidah', name: 'القاعدة' }
    ]
  },
  {
    id: 'dhamar',
    name: 'ذمار',
    cities: [
      { id: 'all', name: 'كل ذمار' },
      { id: 'city', name: 'مدينة ذمار' },
      { id: 'mabar', name: 'معبر' },
      { id: 'ans', name: 'عنس' }
    ]
  },
  {
    id: 'marib',
    name: 'مأرب',
    cities: [
      { id: 'all', name: 'كل مأرب' },
      { id: 'city', name: 'مدينة مأرب' },
      { id: 'wadi', name: 'الوادي' },
      { id: 'harib', name: 'حريب' }
    ]
  },
  {
    id: 'shabwah',
    name: 'شبوة',
    cities: [
      { id: 'all', name: 'كل شبوة' },
      { id: 'ataq', name: 'عتق' },
      { id: 'bayhan', name: 'بيحان' },
      { id: 'habban', name: 'حبان' }
    ]
  },
  {
    id: 'al-mahrah',
    name: 'المهرة',
    cities: [
      { id: 'all', name: 'كل المهرة' },
      { id: 'ghaydah', name: 'الغيضة' },
      { id: 'shahn', name: 'شحن' },
      { id: 'hasween', name: 'حوف' }
    ]
  },
  {
    id: 'saadah',
    name: 'صعدة',
    cities: [
      { id: 'all', name: 'كل صعدة' },
      { id: 'city', name: 'مدينة صعدة' },
      { id: 'talh', name: 'الطلح' },
      { id: 'haydan', name: 'حيدان' }
    ]
  },
  {
    id: 'amran',
    name: 'عمران',
    cities: [
      { id: 'all', name: 'كل عمران' },
      { id: 'city', name: 'مدينة عمران' },
      { id: 'khamir', name: 'خمر' },
      { id: 'thula', name: 'ثلاء' }
    ]
  },
  {
    id: 'hajjah',
    name: 'حجة',
    cities: [
      { id: 'all', name: 'كل حجة' },
      { id: 'city', name: 'مدينة حجة' },
      { id: 'abs', name: 'عبس' },
      { id: 'haradh', name: 'حرض' }
    ]
  },
  {
    id: 'al-bayda',
    name: 'البيضاء',
    cities: [
      { id: 'all', name: 'كل البيضاء' },
      { id: 'city', name: 'مدينة البيضاء' },
      { id: 'radaa', name: 'رداع' }
    ]
  },
  {
    id: 'lahj',
    name: 'لحج',
    cities: [
      { id: 'all', name: 'كل لحج' },
      { id: 'hawtah', name: 'الحوطة' },
      { id: 'yafa', name: 'يافع' },
      { id: 'radfan', name: 'ردفان' }
    ]
  },
  {
    id: 'abyan',
    name: 'أبين',
    cities: [
      { id: 'all', name: 'كل أبين' },
      { id: 'zinjibar', name: 'زنجبار' },
      { id: 'khanfir', name: 'خنفر' },
      { id: 'shokra', name: 'شقرة' }
    ]
  },
  {
    id: 'al-dhalee',
    name: 'الضالع',
    cities: [
      { id: 'all', name: 'كل الضالع' },
      { id: 'city', name: 'مدينة الضالع' },
      { id: 'damt', name: 'دمت' },
      { id: 'qaatabah', name: 'قعطبة' }
    ]
  },
  {
    id: 'raymah',
    name: 'ريمة',
    cities: [
      { id: 'all', name: 'كل ريمة' },
      { id: 'jabin', name: 'الجبين' },
      { id: 'kusmah', name: 'كسمة' }
    ]
  },
  {
    id: 'al-mahwit',
    name: 'المحويت',
    cities: [
      { id: 'all', name: 'كل المحويت' },
      { id: 'city', name: 'مدينة المحويت' },
      { id: 'shibam-kawkaban', name: 'شبام كوكبان' }
    ]
  },
  {
    id: 'al-jawf',
    name: 'الجوف',
    cities: [
      { id: 'all', name: 'كل الجوف' },
      { id: 'hazm', name: 'الحزم' },
      { id: 'khabb', name: 'خب والشعف' }
    ]
  },
  {
    id: 'socotra',
    name: 'سقطرى',
    cities: [
      { id: 'all', name: 'كل سقطرى' },
      { id: 'hadibu', name: 'حديبو' },
      { id: 'qalansiyah', name: 'قلنسية' }
    ]
  }
];
