import React, { useState } from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const PropertiesPage: React.FC<Props> = ({ onNavigate }) => {
  const [listingType, setListingType] = useState<'all' | 'SALE' | 'RENT'>('all');
  const [selectedProp, setSelectedProp] = useState<any | null>(null);
  const [inqName, setInqName] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const properties = [
    {
      id: 'prop-101',
      title: 'شقة سكنية سوبر ديلوكس (حي حدة الراقي)',
      listing_type: 'SALE',
      price: '$55,000',
      area: '165 م²',
      beds: 3,
      baths: 2,
      city: 'صنعاء',
      district: 'حدة - قرب المجمع السكني',
      features: ['موقف سيارات', 'مصعد كهربائي', 'حراسة 24/7', 'خزان مستقل'],
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600'
    },
    {
      id: 'prop-102',
      title: 'أرض تجارية استثمارية على شارعين رئيسيين',
      listing_type: 'SALE',
      price: '$120,000',
      area: '450 م²',
      beds: 0,
      baths: 0,
      city: 'عدن',
      district: 'المنصورة - الشارع العام',
      features: ['واجهة تجارية 20م', 'موقع استثماري حيوي', 'بصائر معتمدة'],
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'
    },
    {
      id: 'prop-103',
      title: 'فيلا فاخرة للإيجار السنوي (سفارات وشركات)',
      listing_type: 'RENT',
      price: '$1,200 / شهر',
      area: '380 م²',
      beds: 5,
      baths: 4,
      city: 'صنعاء',
      district: 'بيت بوس - حي السفارات',
      features: ['حوش وحديقة', 'طاقة شمسية', 'غرفة حراسة', 'مجلس مستقل'],
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600'
    }
  ];

  const filtered = listingType === 'all' ? properties : properties.filter(p => p.listing_type === listingType);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedProp(null);
    showToast(`✅ شكراً ${inqName}، تم تسجيل طلب المعاينة وسيتواصل معك وسيط يمن ريتغ.`);
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24 max-w-4xl mx-auto px-4 pt-4 space-y-5" dir="rtl">
      <div className="flex justify-between items-center pb-3 border-b border-[#22222E]">
        <h1 className="text-base font-black text-white flex items-center gap-2">
          <i className="fa-solid fa-city text-amber-400"></i>
          <span>بوابة العقارات والوساطة الذكية</span>
        </h1>
        <button onClick={() => onNavigate('/')} className="text-xs text-neutral-400 hover:text-white">
          <i className="fa-solid fa-house ml-1"></i> الرئيسية
        </button>
      </div>

      <div className="bg-[#14141C] border border-amber-400/30 rounded-2xl p-4 text-xs text-neutral-300 leading-relaxed flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center text-lg flex-shrink-0 font-bold">
          <i className="fa-solid fa-building-shield"></i>
        </div>
        <div>
          <div className="font-bold text-white mb-0.5">نظام العروض العقارية المحمية</div>
          <div>تُعرض العقارات بدون كشف بيانات المالك، ويتم حجز مواعيد المعاينة ومطابقة الطلبات عبر وساطة يمن ريتغ المعتمدة بأمان تام.</div>
        </div>
      </div>

      {/* الفلترة */}
      <div className="flex gap-2 pb-1 overflow-x-auto">
        <button onClick={() => setListingType('all')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${listingType === 'all' ? 'bg-amber-400 text-black font-black' : 'bg-[#14141C] border border-[#22222E] text-neutral-400'}`}>
          جميع العروض
        </button>
        <button onClick={() => setListingType('SALE')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${listingType === 'SALE' ? 'bg-amber-400 text-black font-black' : 'bg-[#14141C] border border-[#22222E] text-neutral-400'}`}>
          عقارات للبيع
        </button>
        <button onClick={() => setListingType('RENT')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${listingType === 'RENT' ? 'bg-amber-400 text-black font-black' : 'bg-[#14141C] border border-[#22222E] text-neutral-400'}`}>
          عقارات للإيجار
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-[#14141C] border border-[#22222E] hover:border-amber-400/50 rounded-2xl overflow-hidden transition">
            <div className="relative h-44 bg-black">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
              <span className={`absolute top-3 right-3 text-xs font-black px-3 py-1 rounded-lg ${p.listing_type === 'SALE' ? 'bg-amber-400 text-black' : 'bg-blue-500 text-white'}`}>
                {p.listing_type === 'SALE' ? 'للبيع' : 'للإيجار'}
              </span>
              <span className="absolute bottom-3 right-3 bg-black/85 border border-white/10 px-3 py-1 rounded-lg text-sm font-black text-white">
                {p.price}
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-black text-white">{p.title}</h3>
                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot text-amber-400 text-xs"></i>
                  <span>{p.city} • {p.district}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#101015] p-2.5 rounded-xl text-center text-xs">
                <div>المساحة: <strong className="text-white">{p.area}</strong></div>
                <div>الغرف: <strong className="text-white">{p.beds || '-'}</strong></div>
                <div>الحمامات: <strong className="text-white">{p.baths || '-'}</strong></div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {p.features.map((f, i) => (
                  <span key={i} className="bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    ✓ {f}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSelectedProp(p)}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <span>حجز موعد معاينة ميدانية (وساطة ذكية)</span>
                <i className="fa-solid fa-arrow-left text-xs"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة حجز المعاينة */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" dir="rtl">
          <div className="bg-[#14141C] border border-[#2A2A38] w-full max-w-lg rounded-2xl p-6 text-white">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#22222E]">
              <h3 className="text-sm font-black text-white">حجز موعد معاينة: {selectedProp.title}</h3>
              <button onClick={() => setSelectedProp(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleInquiry} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">اسمك الكامل *</label>
                <input type="text" required value={inqName} onChange={e => setInqName(e.target.value)} placeholder="مثال: م. عادل الصعفاني" className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">رقم الهاتف للاتصال والواتساب *</label>
                <input type="tel" required value={inqPhone} onChange={e => setInqPhone(e.target.value)} placeholder="770123456" className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-400 text-black font-black text-xs rounded-xl shadow mt-2">
                تأكيد إرسال الطلب لوسيط يمن ريتغ
              </button>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-full shadow-2xl z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
