import React, { useState } from 'react';
import { supabase } from '.././lib/supabase';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('مطاعم وكافيهات');
  const [city, setCity] = useState('صنعاء');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('businesses').insert([
        {
          name,
          category_name: category,
          city,
          phone,
          whatsapp,
          description,
          rating: 5.0,
          reviews_count: 0,
          is_verified: false,
          created_at: new Date().toISOString()
        }
      ]);

      setLoading(false);
      if (error) {
        alert('حدث خطأ أثناء إضافة النشاط: ' + error.message);
      } else {
        alert('تمت إضافة النشاط التجاري بنجاح!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      setLoading(false);
      alert('حدث خطأ غير متوقع.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dir-rtl" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-lg rounded-2xl border p-6 text-white shadow-2xl" style={{ backgroundColor: '#14141C', borderColor: '#2A2A2A' }}>
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#2A2A2A' }}>
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#FFC107' }}>
            <i className="fa-solid fa-circle-plus"></i>
            <span>إضافة نشاط تجاري جديد</span>
          </h3>
          <button onClick={onClose} className="hover:opacity-75 transition" style={{ color: '#A1A1AA' }}>
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: '#A1A1AA' }}>اسم النشاط / الشركة *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: المقطري للخدمات الكهربائية"
              className="w-full rounded-xl border p-2.5 text-sm text-white focus:outline-none"
              style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: '#A1A1AA' }}>التصنيف *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border p-2.5 text-sm text-white focus:outline-none cursor-pointer"
                style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A' }}
              >
                <option value="مطاعم وكافيهات">مطاعم وكافيهات</option>
                <option value="الفنادق والسياحة">الفنادق والسياحة</option>
                <option value="البنوك والمصارف">البنوك والمصارف</option>
                <option value="شركات الصرافة">شركات الصرافة</option>
                <option value="الشركات والمؤسسات">الشركات والمؤسسات</option>
                <option value="السيارات والنقل">السيارات والنقل</option>
                <option value="الخدمات العامة">الخدمات العامة</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: '#A1A1AA' }}>المدينة *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border p-2.5 text-sm text-white focus:outline-none cursor-pointer"
                style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A' }}
              >
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="المكلا">المكلا</option>
                <option value="إب">إب</option>
                <option value="الحديدية">الحديدة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: '#A1A1AA' }}>رقم الهاتف</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="770000000"
                className="w-full rounded-xl border p-2.5 text-sm text-white focus:outline-none"
                style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A' }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: '#A1A1AA' }}>واتساب</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="770000000"
                className="w-full rounded-xl border p-2.5 text-sm text-white focus:outline-none"
                style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A' }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: '#A1A1AA' }}>وصف مختصر للخدمات</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة عن الخدمات والأعمال التي يقدمها النشاط..."
              className="w-full rounded-xl border p-2.5 text-sm text-white focus:outline-none"
              style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A' }}
            ></textarea>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl py-3 font-bold text-black transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#FFC107' }}
            >
              {loading ? 'جاري الإضافة...' : 'حفظ ونشر النشاط'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-5 py-3 font-medium transition"
              style={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A2A', color: '#A1A1AA' }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
