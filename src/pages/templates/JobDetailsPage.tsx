import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdBanner } from '../../components/common/AdBanner';

export const JobDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCity, setApplicantCity] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
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
  }, [slug]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantPhone.replace(/[^0-9]/g, '').length || applicantPhone.length < 9) {
      setToastMessage('يرجى إدخال رقم هاتف صحيح مكون من 9 أرقام');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (!agreedToPolicy) return;

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
          <div className="w-4 h-4 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          <span>جاري تحميل بيانات الوظيفة...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-8 text-center font-['Cairo'] text-white">
        <AlertCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
        <p className="text-base font-bold">لم يتم العثور على الوظيفة المطلوبة</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-4 py-2 bg-[#162238] border border-[#D4AF37]/50 text-[#D4AF37] rounded-lg text-xs"
        >
          العودة لقائمة الوظائف
        </button>
      </div>
    );
  }

  const workType = job.work_type || job.workType;
  const salary = job.salary_range || job.salaryRange;

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4 font-['Cairo'] text-white">
      <AdBanner placementId="4" className="mb-2" />

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#D4AF37] text-[#0B1325] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <button
          onClick={() => navigate('/jobs')}
          className="px-3 py-1.5 rounded-lg bg-[#162238] border border-[#D4AF37]/40 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1325] transition-all flex items-center gap-1.5"
        >
          <ArrowRight size={14} className="rtl:rotate-180" />
          <span>الرجوع للوظائف</span>
        </button>
        <span className="text-xs px-2.5 py-1 rounded bg-[#162238] text-slate-300 border border-slate-700">
          حالة الوظيفة: <strong className="text-emerald-400">{(job.status === 'ACTIVE' || job.status === 'PUBLISHED') ? 'متاحة للتقديم' : (job.status || 'متاحة')}</strong>
        </span>
      </div>

      <div className="bg-[#162238] rounded-2xl border border-slate-700/70 p-4 sm:p-6 space-y-5 shadow-xl">
        <div className="border-b border-slate-700/60 pb-4">
          <h1 className="text-lg sm:text-2xl font-black text-white">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
            {job.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{job.city}</span>
              </span>
            )}
            {workType && (
              <span className="px-2.5 py-1 rounded bg-[#0B1325] border border-slate-700">
                {workType}
              </span>
            )}
            {job.sector && (
              <span className="px-2.5 py-1 rounded bg-[#0B1325] border border-slate-700">
                {job.sector}
              </span>
            )}
            {job.experience_level && (
              <span className="px-2.5 py-1 rounded bg-[#0B1325] border border-slate-700">
                الخبرة: {job.experience_level}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {job.description && (
            <div>
              <h2 className="text-sm font-bold text-[#D4AF37] mb-2 flex items-center gap-1.5">
                <Briefcase size={16} />
                <span>الوصف الوظيفي</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0B1325]/40 p-4 rounded-xl border border-slate-700/40">
                {job.description}
              </p>
            </div>
          )}

          {salary && (
            <div className="bg-[#0B1325] p-3 rounded-xl border border-slate-700/70 flex items-center justify-between text-xs">
              <span className="text-slate-400">الراتب / الحافز:</span>
              <span className="text-sm font-bold text-[#D4AF37]">{salary}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>يتم التقديم وحفظ البيانات وفق سياسة وساطة يمن ريتغ.</span>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c5a230] text-[#0B1325] font-black rounded-lg text-xs transition-colors"
          >
            التقديم على الوظيفة
          </button>
        </div>
      </div>

      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#162238] border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 font-['Cairo'] text-white">
            <h3 className="text-base font-bold text-white border-b border-slate-700 pb-2">
              تقديم طلب للوظيفة
            </h3>

            <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">الاسم الكامل *</label>
                <input
                  required
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">رقم الهاتف (واتساب) *</label>
                <input
                  required
                  type="tel"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="77XXXXXXX"
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white text-left focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">المدينة *</label>
                <input
                  required
                  type="text"
                  value={applicantCity}
                  onChange={(e) => setApplicantCity(e.target.value)}
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">المؤهلات ونبذة عن الخبرة *</label>
                <textarea
                  required
                  rows={3}
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full bg-[#0B1325] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-0.5"
                />
                <label htmlFor="agree" className="text-[11px] text-slate-400">
                  أوافق على سياسة وساطة يمن ريتغ وتفويض المنصة بالتنسيق مع صاحب العمل.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!agreedToPolicy || submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#D4AF37] disabled:opacity-50 text-[#0B1325] font-bold text-xs"
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
