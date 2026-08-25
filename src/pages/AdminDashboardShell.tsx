import React, { useState } from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminDashboardShell: React.FC<Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'rates' | 'reviews'>('overview');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans flex flex-col md:grid md:grid-cols-[260px_1fr]" dir="rtl">
      
      {/* القائمة الجانبية الفاخرة لسطح المكتب */}
      <aside className="bg-[#0E0E14] border-l border-[#22222E] p-4 flex flex-col justify-between hidden md:flex min-h-screen">
        <div>
          <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-[#22222E]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-black flex items-center justify-center">
              YR
            </div>
            <div>
              <div className="font-black text-sm text-white">يمن ريتغ</div>
              <div className="text-[10px] text-amber-400 font-bold">لوحة الإدارة المركزية</div>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-bold">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${activeTab === 'overview' ? 'bg-amber-400 text-black font-black' : 'text-neutral-400 hover:text-white'}`}>
              <i className="fa-solid fa-chart-pie w-4"></i>
              <span>الرئيسية والإحصائيات</span>
            </button>
            <button onClick={() => setActiveTab('businesses')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${activeTab === 'businesses' ? 'bg-amber-400 text-black font-black' : 'text-neutral-400 hover:text-white'}`}>
              <i className="fa-solid fa-building w-4"></i>
              <span>دليل المنشآت (1,248)</span>
            </button>
            <button onClick={() => setActiveTab('rates')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${activeTab === 'rates' ? 'bg-amber-400 text-black font-black' : 'text-neutral-400 hover:text-white'}`}>
              <i className="fa-solid fa-coins w-4"></i>
              <span>أسعار الصرف (صنعاء/عدن)</span>
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition ${activeTab === 'reviews' ? 'bg-amber-400 text-black font-black' : 'text-neutral-400 hover:text-white'}`}>
              <i className="fa-solid fa-star w-4"></i>
              <span>التقييمات والمراجعات</span>
            </button>
          </nav>
        </div>

        <button onClick={() => onNavigate('/')} className="w-full py-2 bg-[#14141C] hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
          <i className="fa-solid fa-arrow-left text-amber-400"></i>
          <span>عرض الموقع العام</span>
        </button>
      </aside>

      {/* مساحة العمل */}
      <main className="p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-white">لوحة تحكم الإدارة الشاملة</h1>
            <p className="text-xs text-neutral-400">نظام المراقبة والتحقق المركزي لمنصة يمن ريتغ</p>
          </div>
          <button onClick={() => showToast('✅ النظام آمن ومتصل بقاعدة بيانات Supabase')} className="px-4 py-2 rounded-xl bg-[#14141C] border border-[#22222E] text-emerald-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>النظام متصل</span>
          </button>
        </div>

        {/* كروت الإحصائيات الأربعة */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4">
            <div className="text-xs text-neutral-400 font-bold mb-1">إجمالي المنشآت</div>
            <div className="text-2xl font-black text-white">1,248</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1">+18 نشاط جديد</div>
          </div>
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4">
            <div className="text-xs text-neutral-400 font-bold mb-1">طلبات التوثيق</div>
            <div className="text-2xl font-black text-amber-400">230</div>
            <div className="text-[10px] text-amber-400 font-bold mt-1">بانتظار المراجعة</div>
          </div>
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4">
            <div className="text-xs text-neutral-400 font-bold mb-1">الوظائف النشطة</div>
            <div className="text-2xl font-black text-white">326</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1">وساطة مفعلة</div>
          </div>
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4">
            <div className="text-xs text-neutral-400 font-bold mb-1">التقييمات</div>
            <div className="text-2xl font-black text-white">5,432</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1">+156 هذا الشهر</div>
          </div>
        </div>

        {/* عرض محتوى التبويب */}
        <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-3">سجل العمليات والأنشطة المحدثة</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#101015] border border-[#22222E]">
              <span>تم اعتماد شارة التوثيق الذهبية لـ (بنك الكريمي)</span>
              <span className="text-neutral-500">منذ 10 دقائق</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#101015] border border-[#22222E]">
              <span>تم تحديث أسعار صرف العملات لسوق صنعاء وعدن</span>
              <span className="text-neutral-500">منذ 30 دقيقة</span>
            </div>
          </div>
        </div>
      </main>

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-full shadow-2xl z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
