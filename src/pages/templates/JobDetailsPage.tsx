import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminAuctionsService } from '../../services/adminService';
import { AdBanner } from '../../components/common/AdBanner';

export const JobDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commissionSettings, setCommissionSettings] = useState<any>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCity, setApplicantCity] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [agreedToApplicantPolicy, setAgreedToApplicantPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      if (!slug) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', slug)
          .maybeSingle();

        if (error) throw error;
        setJob(data);
      } catch (err: any) {
        setError(err.message || 'تعذر تحميل بيانات الوظيفة');
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
    adminAuctionsService.getPlatformCommissionSettings?.().then((res: any) => {
      if (res?.data) setCommissionSettings(res.data);
    }).catch(() => {});
  }, [slug]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, '').slice(0, 9);
    setApplicantPhone(numeric);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (applicantPhone.length !== 9) {
      setToastMessage('يرجى إدخال رقم هاتف مكون من 9 أرقام بالضبط (مثال: 77XXXXXXX)');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (!agreedToApplicantPolicy) return;

    try {
      setSubmitting(true);
      const { error: appError } = await supabase.from('job_applications').insert([
        {
          job_id: job.id,
          applicant_name: applicantName,
          applicant_phone: applicantPhone,
          applicant_city: applicantCity || job.city,
          qualifications: qualifications,
          status: 'SUBMITTED'
        }
      ]);

      if (appError) throw appError;

      setIsApplyModalOpen(false);
      setToastMessage('تم استلام طلب التقديم بنجاح عبر وساطة يمن ريتغ وسيتم التنسيق معك');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(err.message || 'تم تسجيل طلبك مبدئياً');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[50vh] flex items-center justify-center font-['Cairo'] text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#F5C400] border-t-transparent animate-spin" />
          <span>جاري تحميل بيانات الوظيفة...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-8 text-center font-['Cairo'] text-white">
        <AlertCircle className="w-12 h-12 text-[#F5C400] mx-auto mb-3" />
        <p className="text-base font-bold">لم يتم العثور على الوظيفة المطلوبة</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-4 py-2 bg-[#0D1527] border border-[#F5C400]/50 text-[#F5C400] rounded-xl text-xs font-bold"
        >
          العودة لقائمة الوظائف
        </button>
      </div>
    );
  }

  const jobCommissionAmount = commissionSettings?.default_fixed_commission_amount || 20000;
  const jobCommissionCurr = commissionSettings?.default_fixed_commission_currency || 'ريال يمني';
  const jobCommText = `${jobCommissionAmount.toLocaleString()} ${jobCommissionCurr}`;

  const workType = job.work_type || job.workType;
  const salary = job.salary_range || job.salaryRange;

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="4" className="mb-2" />

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-4 py-2.5 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          onClick={() => navigate('/jobs')}
          className="px-3 py-1.5 rounded-xl bg-[#0D1527] border border-slate-800 text-xs font-bold text-[#F5C400] hover:bg-[#F5C400] hover:text-black transition-all flex items-center gap-1.5"
        >
          <ArrowRight size={14} className="rtl:rotate-180" />
          <span>الرجوع للوظائف</span>
        </button>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-[#0D1527] text-slate-300 border border-slate-800">
          حالة الوظيفة: <strong className="text-emerald-400">{(job.status === 'ACTIVE' || job.status === 'PUBLISHED') ? 'متاحة للتقديم' : (job.status || 'متاحة')}</strong>
        </span>
      </div>

      <div className="bg-[#0D1527] rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-5 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-lg sm:text-2xl font-black text-white">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
            {job.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F5C400]" />
                <span>{job.city}</span>
              </span>
            )}
            {workType && (
              <span className="px-2.5 py-1 rounded-lg bg-[#060A13] border border-slate-800 font-bold">
                {workType}
              </span>
            )}
            {job.sector && (
              <span className="px-2.5 py-1 rounded-lg bg-[#060A13] border border-slate-800">
                {job.sector}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {job.description && (
            <div>
              <h2 className="text-sm font-bold text-[#F5C400] mb-2 flex items-center gap-1.5">
                <Briefcase size={16} />
                <span>الوصف والشروط الوظيفية</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#060A13] p-4 rounded-xl border border-slate-800">
                {job.description}
              </p>
            </div>
          )}

          {salary && (
            <div className="bg-[#060A13] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">الراتب / الحافز:</span>
              <span className="text-sm font-bold text-[#F5C400]">{salary}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>يتم التقديم وحفظ البيانات والوساطة وفق سياسة يمن ريتغ المعتمدة.</span>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-6 py-2.5 bg-[#F5C400] hover:bg-[#DDAF00] text-black font-black rounded-xl text-xs transition-colors shadow-md"
          >
            التقديم على الوظيفة
          </button>
        </div>
      </div>

      {/* نافذة التقديم مع شرط المتقدم الإلزامي بالخلفية الخضراء الشفافة بالنص الأصلي */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 font-['Cairo'] text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white">تقديم طلب للوظيفة</h3>
              <button onClick={() => setIsApplyModalOpen(false)} className="p-1 rounded-lg bg-[#060A13] text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  required
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  رقم الهاتف (واتساب) * <span className="text-[#F5C400] text-[10px]">(9 أرقام بالضبط)</span>
                </label>
                <input
                  required
                  type="tel"
                  maxLength={9}
                  value={applicantPhone}
                  onChange={handlePhoneChange}
                  placeholder="77XXXXXXX"
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white text-left font-mono focus:outline-none focus:border-[#F5C400]"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  تم إدخال: {applicantPhone.length} من 9 أرقام
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">المدينة *</label>
                <input
                  required
                  type="text"
                  value={applicantCity}
                  onChange={(e) => setApplicantCity(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">المؤهلات ونبذة عن الخبرة *</label>
                <textarea
                  required
                  rows={2}
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              {/* شرط المتقدم للوظيفة الإلزامي بالخلفية الخضراء الشفافة بالنص الأصلي */}
              <div className="p-3.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 space-y-2 text-right">
                <div className="flex items-center gap-1.5 text-[#16A34A] font-bold text-xs">
                  <ShieldCheck size={16} />
                  <span>تنبيه إلزامي:</span>
                </div>
                <p className="text-[11px] text-gray-200 leading-relaxed">
                  توفر لك منصة يمن ريتغ خدمة الوساطة والتوظيف، ويتم إشعارك عند حصولك على الوظيفة. بتقديم الطلب، يقرّ المتقدم بموافقته على شروط الوساطة ويلتزم بسداد عمولة الوساطة البالغة ({jobCommText}) من راتب الشهر الأول عند استلام الوظيفة.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToApplicantPolicy}
                    onChange={(e) => setAgreedToApplicantPolicy(e.target.checked)}
                    className="w-4 h-4 accent-[#16A34A] rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-white">
                    أوافق على شروط الوساطة والالتزام بسداد العمولة ({jobCommText})
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToApplicantPolicy || applicantPhone.length !== 9 || submitting}
                  className="px-5 py-2 rounded-xl bg-[#F5C400] disabled:opacity-40 text-black font-black text-xs transition-colors shadow-md"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
