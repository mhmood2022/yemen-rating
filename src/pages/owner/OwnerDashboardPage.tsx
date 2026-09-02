import React, { useState } from 'react';
import { 
  Building2, Phone, Globe, MessageCircle, Mail, 
  MapPin, Plus, Trash2, CheckCircle2, ShieldCheck, 
  Save, Star, Camera, Tag, ArrowRight
} from 'lucide-react';
import { YRBadge } from '../../components/common/YRBadge';

export const OwnerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'reviews'>('profile');
  
  // بيانات المنشأة المملوكة
  const [bizName, setBizName] = useState('شركة يمن سوفت للحلول البرمجية');
  const [bizPhone, setBizPhone] = useState('777123456');
  const [bizWhatsapp, setBizWhatsapp] = useState('967777123456');
  const [bizWebsite, setBizWebsite] = useState('https://yemensoft.com');
  const [bizEmail, setBizEmail] = useState('info@yemensoft.com');
  const [bizCity, setBizCity] = useState('صنعاء — الدائري');
  const [bizAddress, setBizAddress] = useState('شارع الدائري الغربي — برج يمن سوفت');
  const [bizDesc, setBizDesc] = useState('رائد أنظمة وحلول تخطيط الموارد والأنظمة المالية والمصرفية وإدارة الأعمال وسلسلة إمداد المؤسسات في اليمن.');
  
  const [services, setServices] = useState([
    { id: '1', name: 'نظام أونكس برو للشركات الكبرى (Onyx Pro)', price: 1500000 },
    { id: '2', name: 'نظام المتكامل بلس للمحلات والمتاجر', price: 450000 },
    { id: '3', name: 'حلول الفوترة الإلكترونية والربط مع المنصات', price: 250000 }
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(50000);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('تم حفظ وتحديث بيانات المنشأة وتنعكس مباشرة على صفحة الزائر');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    setServices(prev => [...prev, { id: `srv-${Date.now()}`, name: newServiceName, price: Number(newServicePrice) }]);
    setNewServiceName('');
    setToastMessage('تمت إضافة الخدمة بنجاح');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto px-3 sm:px-4 py-3 space-y-4 font-['Cairo',sans-serif] text-white">
      
      {/* رأس لوحة تحكم المالك */}
      <div className="bg-[#0F0F12] p-4 sm:p-5 rounded-3xl border border-[#222226] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC500] text-black flex items-center justify-center font-black text-xl shadow-lg shadow-[#FFC500]/20">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white">{bizName}</h1>
              <YRBadge type="gold" size={18} showTooltip />
            </div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck size={12} /> ملكية موثقة ومعتمدة رسمياً من يمن ريتغ
            </span>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex gap-1 bg-[#161619] p-1 rounded-xl border border-[#27272A]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'profile' ? 'bg-[#FFC500] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            تعديل البيانات
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'services' ? 'bg-[#FFC500] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            الخدمات والأسعار
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reviews' ? 'bg-[#FFC500] text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            مراجعات العملاء
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-100 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* تبويب 1: تعديل البيانات الأساسية للمالك */}
      {activeTab === 'profile' && (
        <div className="bg-[#0F0F12] p-4 sm:p-5 rounded-2xl border border-[#222226] space-y-4 shadow-xl">
          <h3 className="text-xs sm:text-sm font-black text-white border-b border-[#222226] pb-2">
            تحديث بيانات ومعلومات التواصل
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">اسم المنشأة</label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full bg-[#161619] border border-[#27272A] rounded-xl p-2.5 text-white outline-none focus:border-[#FFC500]"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">المحافظة / المدينة</label>
                <input
                  type="text"
                  required
                  value={bizCity}
                  onChange={(e) => setBizCity(e.target.value)}
                  className="w-full bg-[#161619] border border-[#27272A] rounded-xl p-2.5 text-white outline-none focus:border-[#FFC500]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">رقم الهاتف الرسمي</label>
                <input
                  type="text"
                  required
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full bg-[#161619] border border-[#27272A] rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">رقم الواتساب</label>
                <input
                  type="text"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                  className="w-full bg-[#161619] border border-[#27272A] rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">الموقع الإلكتروني</label>
                <input
                  type="text"
                  value={bizWebsite}
                  onChange={(e) => setBizWebsite(e.target.value)}
                  className="w-full bg-[#161619] border border-[#27272A] rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">العنوان التفصيلي</label>
              <input
                type="text"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                className="w-full bg-[#161619] border border-[#27272A] rounded-xl p-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">نبذة عن النشاط والخدمات</label>
              <textarea
                rows={3}
                value={bizDesc}
                onChange={(e) => setBizDesc(e.target.value)}
                className="w-full bg-[#161619] border border-[#27272A] rounded-xl p-2.5 text-white outline-none"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-[#222226]">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#FFC500] text-black font-black rounded-xl hover:bg-[#FFC500]/90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Save size={14} />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* تبويب 2: إدارة الخدمات والأسعار */}
      {activeTab === 'services' && (
        <div className="bg-[#0F0F12] p-4 sm:p-5 rounded-2xl border border-[#222226] space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#222226] pb-2">
            <h3 className="text-xs sm:text-sm font-black text-white">الخدمات والمنتجات المعروضة</h3>
            <span className="text-[10px] text-zinc-400">تظهر في صفحة المنشأة مع الأسعار</span>
          </div>

          <form onSubmit={handleAddService} className="p-3 bg-[#161619] rounded-xl border border-[#27272A] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              type="text"
              required
              placeholder="اسم الخدمة أو المنتج..."
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="sm:col-span-2 bg-[#0F0F12] border border-[#27272A] rounded-lg p-2 text-white outline-none"
            />
            <div className="flex gap-1.5">
              <input
                type="number"
                required
                placeholder="السعر ﷼..."
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(Number(e.target.value))}
                className="flex-1 bg-[#0F0F12] border border-[#27272A] rounded-lg p-2 text-white font-mono outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#FFC500] text-black font-black rounded-lg hover:bg-[#FFC500]/90 shrink-0 cursor-pointer"
              >
                إضافة
              </button>
            </div>
          </form>

          <div className="space-y-1.5">
            {services.map(srv => (
              <div key={srv.id} className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A] flex justify-between items-center text-xs">
                <span className="font-bold text-white">{srv.name}</span>
                <div className="flex items-center gap-3">
                  <b className="font-mono text-[#FFC500]">{srv.price.toLocaleString()} ﷼</b>
                  <button onClick={() => handleRemoveService(srv.id)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تبويب 3: مراجعات وتقييمات العملاء */}
      {activeTab === 'reviews' && (
        <div className="bg-[#0F0F12] p-4 sm:p-5 rounded-2xl border border-[#222226] space-y-3 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#222226] pb-2">
            <h3 className="text-xs sm:text-sm font-black text-white">آراء وتقييمات العملاء الموثقة</h3>
            <span className="text-xs font-bold text-[#FFC500]">★ 4.9 من 140 مراجعة</span>
          </div>

          <div className="p-3 bg-[#161619] rounded-xl border border-[#27272A] text-xs space-y-1">
            <div className="flex justify-between">
              <b className="text-white">د. خالد العولقي</b>
              <span className="text-[#FFC500]">★★★★★</span>
            </div>
            <p className="text-zinc-300">أنظمة متطورة ودعم فني متواصل واحترافي.</p>
          </div>
        </div>
      )}

    </div>
  );
};
