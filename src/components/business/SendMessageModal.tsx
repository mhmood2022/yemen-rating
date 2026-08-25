import React, { useState } from 'react';
import { YRBusiness } from '../../types/database.types';
import { sendMessageToBusiness } from '../../services/businessService';

interface SendMessageModalProps {
  business: YRBusiness;
  isOpen: boolean;
  onClose: () => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({ business, isOpen, onClose }) => {
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await sendMessageToBusiness({
      business_id: business.id,
      sender_name: senderName,
      sender_phone: senderPhone,
      subject,
      message,
      is_read: false,
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
      alert('حدث خطأ أثناء إرسال الرسالة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 text-white shadow-2xl dir-rtl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-xl font-bold text-yellow-400">مراسلة - {business.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center text-green-400">
            <i className="fa-solid fa-circle-check mb-2 text-4xl"></i>
            <p className="text-lg font-semibold">تم إرسال رسالتك بنجاح إلى صاحب النشاط.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">الاسم الكربف</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">رقم الهاتف/الواتساب</label>
                <input
                  type="text"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">موضوع الرسالة</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="استفسار عن حجز / أسعار / مواعيد..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">مضمون الرسالة</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب استفسارك بالتفصيل..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-yellow-400 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-yellow-400 py-2.5 font-bold text-black hover:bg-yellow-500 disabled:opacity-50"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
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
