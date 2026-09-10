import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export interface SectorFeatureItem {
  id: string;
  label: string;
  enabled: boolean;
  details?: string;
  isCustom?: boolean;
}

// ميزات القطاعات الـ 28 المعتمدة رسمياً (غير مفعلة افتراضياً)
export const CATEGORY_SECTOR_SPECS: Record<string, string[]> = {
  banks: [
    'خدمات مصرفية للأفراد', 'خدمات الشركات والمؤسسات', 'تحويلات مالية محلية ودولية',
    'شبكة الصرافات الآلية (ATM)', 'تطبيق مصرفي عبر الهاتف', 'إصدار بطاقات فيزا وماستركارد',
    'تمويل إسلامي وتسهيلات', 'محفظة إلكترونية نقدية', 'صرف وشراء العملات الأجنبية',
    'فروع ومكاتب معتمدة', 'خدمة عملاء على مدار الساعة'
  ],
  transport: [
    'نقل ركاب بين المحافظات', 'حجز تذاكر إلكتروني', 'شحن طرود وبضائع',
    'خدمات النقل السريع VIP', 'تتبع مسار الرحلات والشحنات', 'أسطول حافلات حديث ومكيف',
    'شحن مبرد', 'توصيل طلبات محلي'
  ],
  hospitals: [
    'طوارئ وإسعاف 24/7', 'غرف عناية مركزة (ICU)', 'عمليات جراحية كبرى ودقيقة',
    'مختبر تحاليل متقدم', 'أشعة وموجات ورنين مغناطيسي', 'صيدلية داخلية 24 ساعة',
    'حضانات أطفال حديثي الولادة', 'بنك دم معتمد', 'عيادات استشارية متخصصة'
  ],
  clinics: [
    'حجز مسبق واستشارة', 'أجهزة تشخيص وفحص متقدمة', 'استشارات طبية تخصصية',
    'إجراءات وعمليات صغرى', 'ملفات طبية إلكترونية', 'متابعة الحالات المزمنة'
  ],
  laboratories: [
    'فحوصات شاملة وفورية', 'سحب عينات منزلي', 'إرسال النتائج إلكترونياً',
    'فحوصات ما قبل الزواج', 'تحاليل هرمونات ومناعة', 'استلام النتائج بنفس اليوم'
  ],
  pharmacies: [
    'أدوية تخصصية ومزمنة', 'خدمة توصيل منزلي', 'استشارات دوائية وصيدلانية',
    'قياس الضغط والسكر', 'مستلزمات طبية وتجميلية', 'خدمة على مدار 24 ساعة'
  ],
  universities: [
    'برامج بكالوريوس معتمدة', 'دراسات عليا وماجستير', 'مكتبات إلكترونية ومراجع',
    'معامل ومختبرات تخصصية', 'سكن طلابي', 'باصات ونقل جامعي', 'منح وتسهيلات دراسية'
  ],
  schools: [
    'تعليم أساسي وثانوي', 'مناهج لغات ودولية', 'باصات توصيل مراقبة',
    'معامل حاسوب ومختبرات علمية', 'أنشطة رياضية وملاعب', 'منصة متابعة إلكترونية لأولياء الأمور'
  ],
  hotels: [
    'غرف وأجنحة فندقية فاخرة', 'مسبح مغطى أو مفتوح', 'مطاعم وبوفيه مفتوح',
    'خدمة غرف ونظافة 24/7', 'قاعات مؤتمرات واجتماعات', 'نادي صحي وسبا وجيم',
    'مواقف سيارات خاصة ومجانية', 'إفطار صباحي مشمول'
  ],
  chalets: [
    'مسبح خاص عائلي', 'حدائق وجلسات شواء خارجية', 'ألعاب أطفال ترفيهية',
    'صالات واسعة ومجهزة', 'خصوصية وأمان تام', 'مطبخ مجهز بالكامل'
  ],
  parks: [
    'ألعاب أطفال وملاهي', 'مسطحات خضراء وجلسات عائلية', 'بوفيهات ومطاعم',
    'مواقف سيارات واسعة', 'أمن وسلامة ومراقبة'
  ],
  'wedding-halls': [
    'قاعة مخصصة للنساء', 'قاعة مخصصة للرجال', 'إضاءة وصوتيات احترافية',
    'كوشات وديكورات مخصصة', 'بوفيه وضيافة راقية', 'غرف تجهيز للعرائس', 'تكييف مركزي'
  ],
  barbershops: [
    'قص وتسريحات عصرية', 'عناية بالبشرة وتنظيف عميق', 'فرد وكيراتين للشعر',
    'أدوات معقمة واستخدام مرة واحدة', 'خدمة تجهيز العرسان VIP', 'حلاقة وتشذيب لحية'
  ],
  'beauty-salons': [
    'تجهيز كامل للعرائس', 'مكياج وتسريحات متقدمة', 'عناية بالأظافر وبديكير ومنيكير',
    'معالجات وبروتين الشعر', 'جلسات عناية بالبشرة وتفتيح', 'خصوصية تامة للسيدات'
  ],
  saunas: [
    'حمام بخار تقليدي وحديث', 'جلسات تدليك وتلييف ومساج', 'جاكوزي دافئ وبارد',
    'عناية بالطمي والأعشاب الطبيعية', 'غرف استراحة مريحة'
  ],
  cafes: [
    'قهوة مختصة وأنواع البن اليمني', 'مشروبات باردة وعصائر طازجة', 'حلويات ومعجنات',
    'قسم خاص بالعائلات', 'جلسات خارجية مفتوحة', 'شاشات لنقل المباريات الكبرى'
  ],
  buffets: [
    'سندوتشات ووجبات خفيفة', 'عصائر طبيعية ومشروبات ساخنة', 'خدمة سريعة للسيارات',
    'توصيل سريع للمكاتب والمنازل', 'وجبات إفطار يومية'
  ],
  restaurants: [
    'أكلات يمنية وشعبية أصيلة', 'مشاوي وأطباق عربية وغربية', 'مأكولات بحرية طازجة',
    'قسم واسع للعائلات بخصوصية', 'خدمة توصيل سفري', 'تجهيز ولائم وحفلات'
  ],
  supermarkets: [
    'أقسام متكاملة للمواد الغذائية', 'خضار وفواكه طازجة يومياً', 'لحوم وأسماك طازجة',
    'قسم للمجمدات والألبان', 'توصيل للمنازل', 'دفع إلكتروني ونقاط بيع'
  ],
  'shopping-centers': [
    'تنوع في المحلات والماركات', 'مواقف سيارات كافية', 'تكييف مركزي وممرات مريحة',
    'أمن ونظام كاميرات وحراسة', 'مصاعد وسلالم متحركة'
  ],
  malls: [
    'محلات ماركات عالمية ومحلية', 'ردهة مطاعم وكافيهات متكاملة', 'صالة ألعاب وملاهي أطفال',
    'مواقف سيارات طابقية', 'أجهزة صراف آلي لكافة البنوك', 'مصاعد وسلالم كهربائية'
  ],
  shops: [
    'بيع بالتجزئة وأسعار مناسبة', 'إمكانية الاستبدال والاسترجاع الميسر', 'توصيل داخلي للطلبات',
    'طرق دفع إلكترونية متعددة'
  ],
  'cleaning-companies': [
    'تنظيف منازل وشقق وفلل', 'تنظيف واجهات مباني وأبراج', 'جلي وتلميع الرخام والبلاط',
    'تنظيف وتعقيم الخزانات', 'مكافحة الحشرات ورش المبيدات', 'غسيل سجاد ومفروشات بالبخار'
  ],
  'car-dealerships': [
    'سيارات جديدة ومستعملة معتمدة', 'فحص فني شامل قبل البيع', 'تسهيلات بالتقسيط والتمويل',
    'خدمات استبدال السيارات', 'إنهاء إجراءات الترسيم ونقل الملكية'
  ],
  'motorcycle-dealerships': [
    'دراجات نارية جديدة ومستعملة', 'قطع غيار أصلية', 'صيانة وتجهيز دراجات التوصيل',
    'معدات سلامة وخوذ', 'لوحات وتخليص أوراق رسمي'
  ],
  'clothing-shoes': [
    'أزياء رجالية وأطقم جاهزة', 'أزياء نسائية وفساتين سهرة وعبايات', 'ملابس ومستلزمات أطفال',
    'أحذية جلدية ورياضية ماركات أصلية', 'غرف قياس مريحة وخاصة'
  ],
  'jewelry-gold': [
    'ذهب عيار 21 وعيار 24 رسمي', 'سبائك وجنيهات استثمارية مرخصة', 'ألماس ومجوهرات أصلية',
    'صياغة وتفصيل موديلات خاصة بالطلب', 'فواتير رسمية موثقة بالأوزان والعيارات'
  ],
  'poultry-farms': [
    'دواجن طازجة ومذبوحة يومياً', 'بيض مائدة طازج بأحجام متنوعة', 'توريد للمطاعم والفنادق',
    'إشراف بيطري ورعاية صحية', 'نقل مبرد وتوزيع مباشر'
  ],
  'optics-hearing': [
    'فحص نظر دقيق بأجهزة رقمية', 'نظارات طبية وشمسية أصلية', 'عدسات لاصقة طبية وملونة',
    'سماعات طبية وبرمجة تشخيصية لضعف السمع', 'صيانة وقطع غيار للنظارات والسماعات'
  ]
};

interface DynamicSectorFeaturesProps {
  categorySlug: string;
  savedFeatures: any;
  onChange: (updatedFeatures: SectorFeatureItem[]) => void;
}

export const DynamicSectorFeatures: React.FC<DynamicSectorFeaturesProps> = ({
  categorySlug,
  savedFeatures,
  onChange,
}) => {
  const [customInput, setCustomInput] = useState('');

  // استخراج القائمة المدمجة بناءً على التصنيف والميزات المحفوظة
  const items: SectorFeatureItem[] = useMemo(() => {
    let savedList: any[] = [];
    if (Array.isArray(savedFeatures)) {
      savedList = savedFeatures;
    } else if (savedFeatures && typeof savedFeatures === 'object') {
      savedList = Object.keys(savedFeatures).map(k => ({
        id: k,
        label: savedFeatures[k]?.label || k,
        enabled: Boolean(savedFeatures[k]?.enabled ?? savedFeatures[k]),
        details: savedFeatures[k]?.details || '',
        isCustom: Boolean(savedFeatures[k]?.isCustom)
      }));
    }

    const defaultLabels = CATEGORY_SECTOR_SPECS[categorySlug] || [
      'خدمة عملاء مباشرة', 'حجز مسبق', 'توصيل طلبات', 'طرق دفع إلكترونية'
    ];

    const merged: SectorFeatureItem[] = defaultLabels.map((label, idx) => {
      const existing = savedList.find(s => s.label === label || s.id === `feat_${idx}`);
      return {
        id: existing?.id || `feat_${idx}`,
        label,
        enabled: Boolean(existing?.enabled), // شرط صارم: غير مفعل افتراضياً
        details: existing?.details || '',
        isCustom: false,
      };
    });

    // إضافة الميزات المخصصة التي أضافتها الإدارة سابقاً
    savedList.filter(s => s.isCustom).forEach(cust => {
      if (!merged.some(m => m.label === cust.label)) {
        merged.push({
          id: cust.id || `custom_${Date.now()}`,
          label: cust.label,
          enabled: Boolean(cust.enabled),
          details: cust.details || '',
          isCustom: true,
        });
      }
    });

    return merged;
  }, [categorySlug, savedFeatures]);

  const handleToggle = (id: string) => {
    const updated = items.map(it => it.id === id ? { ...it, enabled: !it.enabled } : it);
    onChange(updated);
  };

  const handleDetailChange = (id: string, text: string) => {
    const updated = items.map(it => it.id === id ? { ...it, details: text } : it);
    onChange(updated);
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (items.some(it => it.label === trimmed)) {
      setCustomInput('');
      return;
    }

    const newItem: SectorFeatureItem = {
      id: `custom_${Date.now()}`,
      label: trimmed,
      enabled: true,
      details: '',
      isCustom: true,
    };
    onChange([...items, newItem]);
    setCustomInput('');
  };

  const handleDeleteCustom = (id: string) => {
    const updated = items.filter(it => it.id !== id);
    onChange(updated);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#161D2B] border border-[#1F2937] space-y-4">
      {/* الرأس: مسمى القسم وصندوق إضافة ميزة جديدة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#1F2937]">
        <div>
          <label className="text-white font-bold flex items-center gap-2 text-sm">
            <SlidersHorizontal size={16} className="text-[#FFC500]" />
            ميزات وخدمات القطاع الفعلية (اضغط للتفعيل المباشر):
          </label>
          <p className="text-[11px] text-gray-400 mt-0.5">
            تتغير ديناميكياً حسب التصنيف المختار ({categorySlug}). كل خيار غير مفعل ما لم يتم تفعيله يدوياً.
          </p>
        </div>

        {/* إضافة ميزة جديدة للمنشأة من قِبل الإدارة */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder="إضافة خدمة أو ميزة إضافية..."
            className="px-3 py-1.5 bg-[#0B0F17] border border-[#1F2937] text-white text-xs rounded-xl outline-none focus:border-[#FFC500]/50 w-full sm:w-56"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="px-3 py-1.5 bg-[#FFC500] hover:bg-[#e0ad00] text-black font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition"
          >
            <Plus size={13} className="text-black" />
            إضافة
          </button>
        </div>
      </div>

      {/* قائمة أزرار الميزات القابلة للتفعيل والإيقاف */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                item.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                  : 'bg-[#0B0F17] text-gray-400 border-[#1F2937] hover:border-gray-700'
              }`}
            >
              <Check size={13} className={item.enabled ? 'opacity-100 text-emerald-400' : 'opacity-0'} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* تفاصيل الميزات المفعلة فقط */}
        {items.some(it => it.enabled) && (
          <div className="mt-3 pt-3 border-t border-[#1F2937]/60 space-y-2">
            <label className="text-gray-300 text-[11px] font-bold block">
              تفاصيل إضافية للخدمات المفعلة (أرقام الفروع، السعة، أوقات العمل، العيارات):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.filter(it => it.enabled).map((act) => (
                <div key={act.id} className="flex items-center gap-2 p-2 bg-[#0B0F17] border border-[#1F2937] rounded-xl">
                  <span className="text-xs text-white font-medium shrink-0 max-w-[140px] truncate">
                    {act.label}:
                  </span>
                  <input
                    type="text"
                    value={act.details || ''}
                    onChange={(e) => handleDetailChange(act.id, e.target.value)}
                    placeholder="ملاحظات أو مواصفات (اختياري)..."
                    className="flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder-gray-600"
                  />
                  {act.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustom(act.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded transition"
                      title="حذف الميزة"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicSectorFeatures;
