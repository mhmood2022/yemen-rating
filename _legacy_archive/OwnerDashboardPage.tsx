import React, { useState, useEffect } from 'react';
import { getBusinesses } from '../services/businessService';
import { BusinessItem } from '../types/database.types';

interface Props {
  onNavigate: (path: string) => void;
}

export const OwnerDashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const business: BusinessItem = mockBusinesses[0]; // بنك الكريمي كمثال
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [bizName, setBizName] = useState(business.name);
  const [bizDesc, setBizDesc] = useState(business.description);
  const [phone, setPhone] = useState(business.phone);
  const [whatsapp, setWhatsapp] = useState(business.whatsapp);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    showToast('✅ تم حفظ وتحديث بيانات النشاط بنجاح');
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-sans pb-24" dir="rtl">
      
      {/* الهيدر */}
      <div className="bg-[#0E0E14] border-b border-[#22222E] px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-sm text-white">
          <i className="fa-solid fa-store text-amber-400"></i>
          <span>لوحة إدارة النشاط التجاري</span>
        </div>
        <button onClick={() => onNavigate('/')} className="text-xs font-bold text-neutral-400 hover:text-amber-400">
          <i className="fa-solid fa-house ml-1"></i> الرئيسية
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-5">
        
        {/* الغلاف والشعار */}
        <div className="relative h-40 rounded-2xl overflow-hidden border border-[#22222E] bg-black">
          <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute -bottom-2 right-4">
            <div className="w-16 h-16 rounded-xl border-2 border-[#14141C] bg-black overflow-hidden flex items-center justify-center">
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>{bizName}</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#FFB800" d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.02-2.9-1.08-3.99s-2.6-1.54-3.99-1.08C14.32 2.28 13.08 1.4 11.65 1.4s-2.67.88-3.34 2.19c-1.39-.46-2.9-.02-3.99 1.08s-1.54 2.6-1.08 3.99C1.88 9.33 1 10.57 1 12s.88 2.67 2.19 3.34c-.46 1.39-.02 2.9 1.08 3.99s2.6 1.54 3.99 1.08c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.02 3.99-1.08s1.54-2.6 1.08-3.99c1.31-.67 2.19-1.91 2.19-3.34z"/>
                <path fill="#FFFFFF" d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4-6.7 6.7z"/>
              </svg>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">{business.categoryName} • {business.city}</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-xl">
            حساب معتمد وموثق ✅
          </span>
        </div>

        {/* نسبة اكتمال الملف 86% */}
        <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-4">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-neutral-400">نسبة اكتمال الملف التجاري</span>
            <span className="text-amber-400">86%</span>
          </div>
          <div className="w-full h-2 bg-[#1A1A24] rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: '86%' }} />
          </div>
        </div>

        {/* المؤشرات الـ 3 */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-3.5">
            <div className="text-xs text-neutral-400 font-bold mb-1">مشاهدات الملف</div>
            <div className="text-lg font-black text-white">15,230</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1">+18%</div>
          </div>
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-3.5">
            <div className="text-xs text-neutral-400 font-bold mb-1">الاتصالات</div>
            <div className="text-lg font-black text-white">245</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1">+15%</div>
          </div>
          <div className="bg-[#14141C] border border-[#22222E] rounded-2xl p-3.5">
            <div className="text-xs text-neutral-400 font-bold mb-1">طلبات الأسعار</div>
            <div className="text-lg font-black text-amber-400">89</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1">+20%</div>
          </div>
        </div>

        {/* شبكة الأدوات الـ 8 */}
        <h3 className="text-sm font-black text-white">إدارة نشاطك التجاري</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div onClick={() => setActiveModal('editInfo')} className="bg-[#14141C] border border-[#22222E] hover:border-amber-400 p-4 rounded-2xl text-center cursor-pointer transition">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] text-amber-400 flex items-center justify-center mx-auto mb-2 text-base">
              <i className="fa-solid fa-pen-to-square"></i>
            </div>
            <div className="text-xs font-bold text-white">المعلومات الأساسية</div>
          </div>

          <div onClick={() => setActiveModal('offers')} className="bg-[#14141C] border border-[#22222E] hover:border-amber-400 p-4 rounded-2xl text-center cursor-pointer transition">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] text-amber-400 flex items-center justify-center mx-auto mb-2 text-base">
              <i className="fa-solid fa-tags"></i>
            </div>
            <div className="text-xs font-bold text-white">العروض والخصومات</div>
          </div>

          <div onClick={() => setActiveModal('jobs')} className="bg-[#14141C] border border-[#22222E] hover:border-amber-400 p-4 rounded-2xl text-center cursor-pointer transition">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] text-amber-400 flex items-center justify-center mx-auto mb-2 text-base">
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div className="text-xs font-bold text-white">الوظائف والتوظيف</div>
          </div>

          <div onClick={() => showToast('⭐ لديك تقييمان جديدان بانتظار الرد')} className="bg-[#14141C] border border-[#22222E] hover:border-amber-400 p-4 rounded-2xl text-center cursor-pointer transition">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A24] text-amber-400 flex items-center justify-center mx-auto mb-2 text-base">
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="text-xs font-bold text-white">التقييمات والردود</div>
          </div>
        </div>

      </div>

      {/* نافذة تعديل المعلومات */}
      {activeModal === 'editInfo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" dir="rtl">
          <div className="bg-[#14141C] border border-[#2A2A38] w-full max-w-lg rounded-2xl p-6 text-white">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#22222E]">
              <h3 className="text-sm font-black text-white">تعديل المعلومات الأساسية</h3>
              <button onClick={() => setActiveModal(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveInfo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">اسم النشاط *</label>
                <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">الوصف *</label>
                <textarea rows={3} value={bizDesc} onChange={e => setBizDesc(e.target.value)} className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl p-3 text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">رقم الهاتف *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">رقم الواتساب</label>
                  <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-[#101015] border border-[#2A2A38] rounded-xl px-3 py-2 text-xs text-white" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-400 text-black font-black text-xs rounded-xl shadow mt-2">حفظ التعديلات</button>
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
