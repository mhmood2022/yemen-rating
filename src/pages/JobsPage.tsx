import React, { useState } from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const JobsPage: React.FC<Props> = ({ onNavigate }) => {
  const [selectedCity, setSelectedCity] = useState('all');

  const jobs = [
    { id: 'job-1', title: 'محاسب مالي أول (تدقيق ومصارف)', city: 'صنعاء', salary: '$800 - $1,200', type: 'دوام كامل', exp: 3, skills: ['محاسبة', 'Excel', 'تدقيق'] },
    { id: 'job-2', title: 'مدير مبيعات وتسويق تجزئة', city: 'عدن', salary: '$600 - $900', type: 'دوام كامل', exp: 2, skills: ['مبيعات', 'تسويق', 'خدمة عملاء'] }
  ];

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24 max-w-4xl mx-auto px-4 pt-4 space-y-4" dir="rtl">
      <div className="flex justify-between items-center pb-3 border-b border-[#22222E]">
        <h1 className="text-base font-black text-white flex items-center gap-2">
          <i className="fa-solid fa-briefcase text-amber-400"></i>
          <span>بوابة الوظائف والوساطة الذكية</span>
        </h1>
        <button onClick={() => onNavigate('/')} className="text-xs text-neutral-400 hover:text-white">
          <i className="fa-solid fa-house ml-1"></i> الرئيسية
        </button>
      </div>

      <div className="bg-[#14141C] border border-amber-400/30 rounded-2xl p-4 text-xs text-neutral-300 leading-relaxed flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center text-lg flex-shrink-0 font-bold">
          <i className="fa-solid fa-shield-halved"></i>
        </div>
        <div>
          <div className="font-bold text-white mb-0.5">وساطة يمن ريتغ المعتمدة</div>
          <div>يتم استقبال طلبات التوظيف ومطابقتها بالذكاء الاصطناعي دون كشف بيانات الاتصال المباشرة لطرف ثالث لحفظ الخصوصية.</div>
        </div>
      </div>

      <div className="space-y-3">
        {jobs.map(j => (
          <div key={j.id} className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-black text-white">{j.title}</h3>
                <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-3">
                  <span><i className="fa-solid fa-location-dot text-amber-400 ml-1"></i>{j.city}</span>
                  <span><i className="fa-solid fa-clock text-amber-400 ml-1"></i>{j.type}</span>
                  <span><i className="fa-solid fa-graduation-cap text-amber-400 ml-1"></i>خبرة {j.exp} سنوات</span>
                </div>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black px-2.5 py-1 rounded-lg">
                {j.salary}
              </span>
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {j.skills.map((s, i) => (
                <span key={i} className="bg-[#1A1A24] border border-[#22222E] text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <i className="fa-solid fa-check text-[8px]"></i>
                  <span>{s}</span>
                </span>
              ))}
            </div>

            <button onClick={() => alert('تم فتح نموذج التقديم وفحص المطابقة الذكية')} className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2">
              <i className="fa-solid fa-bolt text-xs"></i>
              <span>تقديم طلب توظيف فوري (AI Match)</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
