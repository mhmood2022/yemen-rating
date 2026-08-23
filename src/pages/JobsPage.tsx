import React, { useState, useMemo } from 'react';
import { DEMO_JOBS } from '../data/demoJobs';
import { CITIES_LIST } from '../data/demoBusinesses';
import { JobVacancy, JobFilterState } from '../types/jobs';
import { JobCard } from '../components/jobs/JobCard';
import { JobDetailsModal } from '../components/jobs/JobDetailsModal';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { yrToast } from '../components/ui/Toast';
import {
  Briefcase,
  Sparkles,
  MapPin,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { cn } from '../lib/utils';

export const JobsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [filters, setFilters] = useState<JobFilterState>({
    searchQuery: '',
    city: '',
    sector: '',
    workType: '',
    experienceLevel: '',
    verifiedOnly: false,
    sortBy: 'newest',
  });

  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cityOptions = [
    { label: 'جميع المدن', value: '' },
    ...CITIES_LIST.map((c) => ({ label: c, value: c })),
  ];

  const sectorOptions = [
    { label: 'جميع التخصصات والقطاعات', value: '' },
    { label: 'تقنية وبرمجيات', value: 'تقنية وبرمجيات' },
    { label: 'محاسبة وبنوك', value: 'محاسبة وبنوك' },
    { label: 'طب ورعاية صحية', value: 'طب ورعاية صحية' },
    { label: 'مبيعات وتسويق', value: 'مبيعات وتسويق' },
    { label: 'نقل وخدمات لوجستية', value: 'نقل وخدمات لوجستية' },
  ];

  const workTypeOptions = [
    { label: 'جميع أوقات العمل', value: '' },
    { label: 'دوام كامل', value: 'دوام كامل' },
    { label: 'دوام جزئي', value: 'دوام جزئي' },
    { label: 'عن بعد (Remote)', value: 'عن بعد (Remote)' },
  ];

  const filteredJobs = useMemo(() => {
    return DEMO_JOBS.filter((job) => {
      if (filters.city && job.city !== filters.city) return false;
      if (filters.sector && job.sector !== filters.sector) return false;
      if (filters.workType && job.workType !== filters.workType) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        return (
          job.title.toLowerCase().includes(q) ||
          job.companyName.toLowerCase().includes(q) ||
          job.sector.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'highest_match') return b.matchScore - a.matchScore;
      return 0;
    });
  }, [filters]);

  const handleApply = (job: JobVacancy) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#222222]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="p-1 rounded-lg text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-white"
            aria-label="الرجوع للرئيسية"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white leading-tight">
              سوق الوظائف والتوظيف الذكي
            </h1>
            <span className="text-[10px] text-[#64748B] dark:text-[#71717A] block">
              فرص عمل موثقة لدى كبرى الشركات والمؤسسات في اليمن مع مطابقة AI
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => yrToast.info('خدمة نشر شواغر الشركات متاحة للجهات المعتمدة')}
          className="h-[32px] px-3 rounded-[8px] bg-[#F5C400] text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#DDAF00] transition-all shadow-sm"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>نشر وظيفة</span>
        </button>
      </div>

      {/* AI Matching Banner Card */}
      <div className="p-4 rounded-[14px] bg-[#0A0A0A] border border-[#222222] flex items-center justify-between gap-3 shadow-md">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#F5C400]">
            <Sparkles size={14} strokeWidth={2.5} />
            <span>نظام المطابقة الذكي YR Match</span>
          </div>
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed line-clamp-1">
            يقوم الذكاء الاصطناعي بمطابقة خبراتك مع متطلبات الشركات المعتمدة تلقائياً.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-[7px] bg-[#F5C400]/20 text-[#F5C400] text-xs font-black shrink-0">
          {filteredJobs.length} شاغر متاح
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <SearchInput
          placeholder="ابحث عن مسمى وظيفي، مهارة، أو شركة..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          onClear={() => setFilters({ ...filters, searchQuery: '' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select
            value={filters.city}
            options={cityOptions}
            onChange={(val) => setFilters({ ...filters, city: val })}
            placeholder="جميع المدن"
          />

          <Select
            value={filters.sector}
            options={sectorOptions}
            onChange={(val) => setFilters({ ...filters, sector: val })}
            placeholder="جميع التخصصات"
          />

          <Select
            value={filters.workType}
            options={workTypeOptions}
            onChange={(val) => setFilters({ ...filters, workType: val })}
            placeholder="نوع الدوام"
          />
        </div>
      </div>

      {/* Jobs Listing */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          title="لم يتم العثور على شواغر تطابق بحثك"
          description="جرب تغيير معايير التصفية أو البحث بتخصص ومحافظة أخرى."
          actionLabel="عرض كافة الوظائف"
          onAction={() =>
            setFilters({
              searchQuery: '',
              city: '',
              sector: '',
              workType: '',
              experienceLevel: '',
              verifiedOnly: false,
              sortBy: 'newest',
            })
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              onNavigateCompany={(id) => onNavigate(`/business/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Details & Fast Apply Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
        onNavigateCompany={(id) => onNavigate(`/business/${id}`)}
      />
    </div>
  );
};
