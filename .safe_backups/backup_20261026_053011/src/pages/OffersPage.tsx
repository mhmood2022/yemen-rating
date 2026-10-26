import React, { useState } from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const OffersPage: React.FC<Props> = ({ onNavigate }) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const offers = [
    {
      id: 1,
      bizName: 'متجر العصرية للجوالات',
      title: 'عروض متجر العصرية الكبرى للجوالات',
      desc: 'خصم 20% على جميع الهواتف الذكية والشواحن الأصلية مع ضمان سنة كاملة.',
      discount: 'خصم 20%',
      code: 'YR20',
      image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600'
    },
    {
      id: 2,
      bizName: 'مطعم حضرموت الدولي',
      title: 'وجبات الغداء والمشويات العائلية الفاخرة',
      desc: 'استمتع بخصم 15% على المأكولات التراثية واللحوم الطازجة لرواد منصة يمن ريتغ.',
      discount: 'خصم 15%',
      code: 'HADRAMOUT15',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600'
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setToastMsg(`🎉 تم نسخ كود الخصم: ${code}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24 max-w-4xl mx-auto px-4 pt-4 space-y-4" dir="rtl">
      <div className="flex justify-between items-center pb-3 border-b border-[#22222E]">
        <h1 className="text-base font-black text-white flex items-center gap-2">
          <i className="fa-solid fa-tags text-amber-400"></i>
          <span>العروض والخصومات الحصرية</span>
        </h1>
        <button onClick={() => onNavigate('/')} className="text-xs text-neutral-400 hover:text-white">الرئيسية</button>
      </div>

      <div className="space-y-4">
        {offers.map(o => (
          <div key={o.id} className="bg-[#14141C] border border-[#22222E] rounded-2xl overflow-hidden">
            <div className="h-40 bg-black relative">
              <img src={o.image} alt={o.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-lg">
                {o.discount}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-xs font-bold text-amber-400">{o.bizName}</div>
              <div className="text-sm font-black text-white">{o.title}</div>
              <p className="text-xs text-neutral-400">{o.desc}</p>
              <div className="flex justify-between items-center p-2.5 bg-[#101015] border border-dashed border-amber-400/50 rounded-xl">
                <span className="font-mono font-black text-amber-400">{o.code}</span>
                <button onClick={() => handleCopyCode(o.code)} className="px-3 py-1 bg-amber-400 text-black font-black text-xs rounded-lg hover:bg-amber-500">
                  نسخ الكود
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-full shadow-2xl z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
