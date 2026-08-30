import React, { useState } from 'react';
import { Briefcase, MapPin, Building2, Clock, ArrowRight, DollarSign, Send, CheckCircle2 } from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

export const JobsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedJobModal, setSelectedJobModal] = useState<any | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const jobs = [
    {
      id: 'job-1',
      title: 'مطور واجهات أمامية (React / TypeScript)',
      company: 'شركة يمن سوفت للحلول البرمجية',
      city: 'صنعاء',
      type: 'دوام كامل',
      salary: '800$ - 1200$',
      postedAt: 'قبل يومين',
      isVerified: true,
      description: 'مطلوب مطور واجهات مستخدم محترف يمتلك خبرة لا تقل عن سنتين في بناء تطبيقات React الحديثة وتصميمات Tailwind.',
      requirements: ['إتقان React.js & TypeScript', 'خبرة في ربط RESTful APIs', 'إتقان Tailwind CSS والتصميم المتجاوب']
    },
    {
      id: 'job-2',
      title: 'محاسب مالي أول (Senior Accountant)',
      company: 'مجموعة هائل سعيد أنعم وشركاه',
      city: 'عدن',
      type: 'دوام كامل',
      salary: 'راتب مجزي + بدلات',
      postedAt: 'قبل 4 أيام',
      isVerified: true,
      description: 'إدارة العمليات المحاسبية وإعداد القوائم المالية والتقارير الدورية وضبط الحسابات الختامية.',
      requirements: ['بكالوريوس محاسبة بتقدير ممتاز', 'خبرة 3 سنوات في الشركات التجارية', 'إتقان الأنظمة المحاسبية ERP']
    },
    {
      id: 'job-3',
      title: 'مسؤول تسويق رقمي وإعلانات ممولة',
      company: 'وكالة صدى الإعلانية',
      city: 'المكلا',
      type: 'دوام جزئي / عن بُعد',
      salary: '400$ - 600$',
      postedAt: 'قبل أسبوع',
      isVerified: false,
      description: 'إدارة الحملات الإعلانية على منصات التواصل الاجتماعي وصناعة المحتوى الإبداعي وتحليل البيانات.',
      requirements: ['خبرة في إدارة إعلانات Meta و Google Ads', 'مهارات كتابة المحتوى الإعلاني', 'إتقان برامج التصميم']
    }
  ];

  return (
    <div dir="rtl" className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/10">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              بوابة التوظيف والفرص المهنية
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              وظائف شاغرة بالشركات والمؤسسات المعتمدة في كافة التخصصات
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-400/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-white hover:text-amber-400 transition-colors">{job.title}</h3>
                <span className="text-[11px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-md font-semibold">
                  {job.type}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1 text-zinc-200">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  {job.company}
                  {job.isVerified && <VerifiedBadge type="gold" size="sm" />}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {job.city}
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-mono">
                  <DollarSign className="w-3.5 h-3.5" />
                  {job.salary}
                </span>
              </div>

              <p className="text-xs text-zinc-300 line-clamp-2">{job.description}</p>
            </div>

            <button
              onClick={() => {
                setSelectedJobModal(job);
                setAppliedSuccess(false);
              }}
              className="w-full md:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl transition-colors flex-shrink-0 shadow-md"
            >
              التقديم على الوظيفة
            </button>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {selectedJobModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">التقديم على: {selectedJobModal.title}</h3>
            
            {appliedSuccess ? (
              <div className="p-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>تم إرسال طلب التوظيف للجهة المعلنة بنجاح!</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAppliedSuccess(true);
                  setTimeout(() => setSelectedJobModal(null), 2000);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">الاسم الكامل</label>
                  <input type="text" required placeholder="أدخل اسمك الثلاثي" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">رقم الهاتف / الواتساب</label>
                  <input type="tel" required placeholder="777000000" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">رابط السيرة الذاتية (CV / LinkedIn)</label>
                  <input type="url" placeholder="https://..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setSelectedJobModal(null)} className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800">إلغاء</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الطلب</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
