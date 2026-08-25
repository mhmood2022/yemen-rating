import React from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const NotificationsPage: React.FC<Props> = ({ onNavigate }) => {
  const notifs = [
    { title: 'تعميم رسمي للبنوك والمصارف', time: 'منذ 10 دقائق', text: 'يرجى تحديث أسعار الصرف الصباحية وتأكيد أرقام خدمة العملاء.' },
    { title: 'تم اعتماد وتوثيق منشأتك بالشارة الذهبية', time: 'منذ 30 دقيقة', text: 'تمت مراجعة مستندات بنك الكريمي ومنحه الشارة الذهبية YR 97.' }
  ];

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24 max-w-4xl mx-auto px-4 pt-4 space-y-4" dir="rtl">
      <div className="flex justify-between items-center pb-3 border-b border-[#22222E]">
        <h1 className="text-base font-black text-white flex items-center gap-2">
          <i className="fa-solid fa-bell text-amber-400"></i>
          <span>مركز الإشعارات والتعميمات</span>
        </h1>
        <button onClick={() => onNavigate('/')} className="text-xs text-neutral-400 hover:text-white">الرئيسية</button>
      </div>

      <div className="space-y-3">
        {notifs.map((n, i) => (
          <div key={i} className="p-4 bg-[#14141C] border border-[#22222E] rounded-2xl space-y-1">
            <div className="flex justify-between items-center">
              <div className="text-sm font-black text-white">{n.title}</div>
              <div className="text-[10px] text-neutral-500">{n.time}</div>
            </div>
            <p className="text-xs text-neutral-400">{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
