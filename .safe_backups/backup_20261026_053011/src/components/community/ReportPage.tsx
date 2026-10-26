import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface ReportPageProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
  authorName?: string;
  authorUsername?: string;
  type?: 'post' | 'account';
}

export const ReportPage: React.FC<ReportPageProps> = ({ onClose, onSubmit, authorName, authorUsername, type = 'post' }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedReason, setSelectedReason] = useState('');

  const reasons = [
    'رسائل مزعجة',
    'الكراهية أو الإساءة أو التحريض',
    'سلامة الأطفال',
    'الكلام الذي يحضّ على العنف',
    'السلوكيات غير القانونية والخاضعة للتنظيم',
    'انتحال شخصية',
    'المحتوى الخاص أو غير التوافقي',
    'الانتحار أو إيذاء النفس'
  ];

  const handleNext = () => {
    if (selectedReason) setStep(2);
  };

  const handleSubmit = () => {
    onSubmit(selectedReason);
    setStep(3);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col" dir="rtl">
      {/* الشريط العلوي */}
      <div className="flex items-center justify-between p-4 border-b border-[#2F3336]">
        <button onClick={() => {
          if (step === 1) onClose();
          else if (step === 2) setStep(1);
          else onClose();
        }} className="text-white p-1">
          <ArrowRight size={24} />
        </button>
        <h2 className="text-base font-bold text-white">
          {step === 1 ? (type === 'post' ? 'الإبلاغ عن تغريدة' : 'الإبلاغ عن حساب') : step === 2 ? 'تأكيد الإبلاغ' : 'تم الإرسال'}
        </h2>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-6">ما الذي تبلغ عنه؟</h3>
            
            <div className="space-y-1">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className="w-full flex items-center justify-between p-4 rounded-xl transition text-right hover:bg-white/5"
                >
                  <span className="text-sm text-white font-bold">{reason}</span>
                  {/* الدائرة: صفراء بالكامل وعلامة صح بيضاء عند الاختيار، أو رمادية رفيعة عند عدم الاختيار */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    selectedReason === reason 
                      ? 'bg-[#FFC500]' 
                      : 'border border-zinc-500'
                  }`}>
                    {selectedReason === reason && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-6">
              <button
                onClick={handleNext}
                disabled={!selectedReason}
                className="w-full py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">هل أنت متأكد؟</h3>
            <div className="bg-[#111111] border border-[#2F3336] rounded-xl p-4">
              <p className="text-xs text-zinc-400 mb-2">السبب المختار:</p>
              <p className="text-sm text-white font-bold">{selectedReason}</p>
            </div>
            <p className="text-xs text-zinc-400">بالإبلاغ، أنت تساعدنا في الحفاظ على مجتمع يمن ريتنج آمناً.</p>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-full border border-[#2F3336] text-white font-bold text-sm hover:bg-white/5 transition"
              >
                رجوع
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-full bg-[#FFC500] text-black font-bold text-sm hover:bg-[#E5B200] transition"
              >
                تم
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center pt-8">
            <div className="w-20 h-20 mx-auto bg-[#FFC500]/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-[#FFC500]" />
            </div>
            <h3 className="text-xl font-bold text-white">شكرًا لك على المساهمة في تحسين تجربة الجميع</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              نعلم أن الأمر لم يكن سهلاً، لذا نقدّر لك وقتك الذي خصصته للإجابة عن هذه الأسئلة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
