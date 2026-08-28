import React, { useState } from 'react';
import { YRBusiness } from '../../types/database.types';
import { sendLeadRequest } from '../../services/businessService';

interface QuoteModalProps {
  business: YRBusiness;
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ business, isOpen, onClose }) => {
  const [service, setService] = useState('');
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'whatsapp' | 'email'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await sendLeadRequest({
      business_id: business.id,
      service_requested: service,
      details,
      budget_estimation: budget,
      preferred_contact_method: contactMethod,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } else {
      alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 text-white shadow-2xl dir-rtl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-xl font-bold text-yellow-400">طلب عرض سعر - {business.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center text-green-400">
            <i className="fa-solid fa-circle-check mb-2 text-4xl"></i>
            <p className="text-lg font-semibold">تم إرسال طلبك بنجاح! سيتم التواصل معك قريبًا.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">الخدمة المطلوب سعرها</label>
              <input
                type="text"
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="مثال: تركيب نظام كاميرات، صيانة كهربائية..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">تفاصيل الطلب والاحتياجات</label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="اشرح المواصفات أو التفاصيل التي تحتاجها..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">الميزانية التقديرية (اختياري)</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="مثال: 500$ - 1000$"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">طريقة التواصل المفضلة</label>
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as any)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
              >
                <option value="whatsapp">واتساب (مفضل)</option>
                <option value="phone">اتصال هاتفي</option>
                <option value="email">البريد الإلكتروني</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-yellow-400 py-2.5 font-bold text-black hover:bg-yellow-500 disabled:opacity-50"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-700 bg-gray-800 px-5 py-2.5 font-medium text-gray-300 hover:bg-gray-700"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
