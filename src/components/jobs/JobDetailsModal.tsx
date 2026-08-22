import React, { useState } from 'react';
import { JobVacancy } from '../../types/jobs';
import { Modal } from '../ui/Modal';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { Input } from '../ui/Input';
import { yrToast } from '../ui/Toast';
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Send,
  Building2,
  FileText,
  User,
  Phone,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface JobDetailsModalProps {
  job: JobVacancy | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateCompany?: (companyId: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onNavigateCompany,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidateSummary, setCandidateSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) return null;

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidatePhone.trim()) {
      yrToast.error('يرجى كتابة الاسم ورقم الهاتف للتواصل');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsApplying(false);
      yrToast.success('تم إرسال طلبك بنجاح!', 'سيصلك إشعار عند مراجعة الشركة لملفك ومطابقته ذكياً');
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isApplying ? 'نموذج التقديم الفوري' : 'تفاصيل الشاغر الوظيفي'}
      maxWidth="lg"
    >
      <div className="space-y-4 text-right">
        {/* Header: Company & Title */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#222222]">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-[#0A0A0A] shrink-0">
              <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1 min-w-0">
              <h2 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white leading-tight">
                {job.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#A1A1AA]">
                <span className="font-bold text-[#0B1F3A] dark:text-white">{job.companyName}</span>
                {job.isVerifiedEmployer && (
                  <VerifiedBadge variant={job.verifiedBadgeType || 'gold'} size={14} />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-[#F5C400]/20 text-[#F5C400] text-xs font-black shrink-0 border border-[#F5C400]/30">
            <Sparkles size={13} strokeWidth={2.5} />
            <span>{job.matchScore}% مطابقة AI</span>
          </div>
        </div>

        {/* Fast Key Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222]">
            <span className="text-[10px] text-[#71717A] block">المدينة</span>
            <span className="font-bold text-[#0B1F3A] dark:text-white">{job.city}</span>
          </div>
          <div className="p-2 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222]">
            <span className="text-[10px] text-[#71717A] block">نوع الدوام</span>
            <span className="font-bold text-[#0B1F3A] dark:text-white">{job.workType}</span>
          </div>
          <div className="p-2 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222]">
            <span className="text-[10px] text-[#71717A] block">الخبرة</span>
            <span className="font-bold text-[#0B1F3A] dark:text-white">{job.experienceLevel}</span>
          </div>
          <div className="p-2 rounded-[8px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222]">
            <span className="text-[10px] text-[#71717A] block">الراتب المتوقع</span>
            <span className="font-black text-[#16A34A] dark:text-[#22C55E] text-[11px]">{job.salaryRange}</span>
          </div>
        </div>

        {!isApplying ? (
          <div className="space-y-4 pt-1">
            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="font-black text-xs sm:text-sm text-[#0B1F3A] dark:text-white">الوصف والمهام الوظيفية:</h4>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#A1A1AA] leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <h4 className="font-black text-xs sm:text-sm text-[#0B1F3A] dark:text-white">الشروط والمهارات المطلوبة:</h4>
              <div className="space-y-1.5">
                {job.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#0B1F3A] dark:text-white">
                    <CheckCircle2 size={14} className="text-[#F5C400] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-black text-xs sm:text-sm text-[#0B1F3A] dark:text-white">المزايا والحوافز:</h4>
                <div className="space-y-1.5">
                  {job.benefits.map((ben, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#0B1F3A] dark:text-white">
                      <CheckCircle2 size={14} className="text-[#16A34A] dark:text-[#22C55E] shrink-0 mt-0.5" />
                      <span>{ben}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#222222] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsApplying(true)}
                className="flex-1 h-[42px] rounded-[10px] bg-[#F5C400] text-black font-black text-xs flex items-center justify-center gap-2 hover:bg-[#DDAF00] active:scale-95 transition-all shadow-md"
              >
                <Send size={15} strokeWidth={2.5} />
                <span>التقديم الفوري الآن (مطابقة ذكية)</span>
              </button>

              {onNavigateCompany && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateCompany(job.companyId);
                  }}
                  className="h-[42px] px-3.5 rounded-[10px] bg-[#F7F8FA] dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] text-xs font-bold text-[#0B1F3A] dark:text-white"
                >
                  ملف الشركة
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmitApplication} className="space-y-3 pt-1">
            <Input
              label="الاسم الرباعي الكامل"
              placeholder="مثال: أحمد محمد علي السامعي"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              rightIcon={<User size={16} />}
            />

            <Input
              label="رقم الهاتف والواتساب"
              type="tel"
              placeholder="77XXXXXXX"
              required
              value={candidatePhone}
              onChange={(e) => setCandidatePhone(e.target.value)}
              rightIcon={<Phone size={16} />}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0B1F3A] dark:text-white">
                نبذة عن خبراتك ومؤهلك الدراسي
              </label>
              <textarea
                rows={3}
                placeholder="اذكر ملخص سنوات خبرتك، وأهم المشروعات أو الأنظمة التي أتقنتها..."
                value={candidateSummary}
                onChange={(e) => setCandidateSummary(e.target.value)}
                className="w-full p-3 text-xs bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white border border-[#CBD5E1] dark:border-[#222222] rounded-[10px] outline-none focus:border-[#F5C400]"
              />
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#222222] flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-[42px] rounded-[10px] bg-[#F5C400] text-black font-black text-xs flex items-center justify-center gap-2 hover:bg-[#DDAF00] active:scale-95 transition-all shadow-md disabled:opacity-50"
              >
                <span>{isSubmitting ? 'جارٍ الإرسال...' : 'تأكيد إرسال الطلب'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsApplying(false)}
                className="h-[42px] px-4 rounded-[10px] bg-[#F7F8FA] dark:bg-[#141414] border border-[#E2E8F0] dark:border-[#222222] text-xs font-bold text-[#475569] dark:text-[#A1A1AA]"
              >
                رجوع
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
