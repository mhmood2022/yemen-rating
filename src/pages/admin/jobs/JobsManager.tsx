import React, { useState } from 'react';
import { Briefcase, Plus, MapPin, Building2, CheckCircle2 } from 'lucide-react';

export const JobsManager: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([
    {
      id: 'job-1',
      title: 'مدير تسويق وعلاقات عامة',
      company: 'مجموعة النخبة الاستثمارية',
      city: 'صنعاء',
      type: 'دوام كامل',
      applicants: 14,
      status: 'نشط'
    },
    {
      id: 'job-2',
      title: 'محاسب مالي قانوني خبرة 3 سنوات',
      company: 'شركة سبأ الدولية',
      city: 'مأرب',
      type: 'دوام كامل',
      applicants: 8,
      status: 'نشط'
    }
  ]);

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة الوظائف وفرص العمل</h1>
            <p className="text-xs text-gray-400 mt-1">متابعة إعلانات التوظيف الشاغرة وطلبات المتقدمين.</p>
          </div>
        </div>
        <button onClick={() => alert('إضافة وظيفة شاغرة جديدة')} className="px-5 py-2.5 bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg">
          <Plus size={16} /> إضافة وظيفة شاغرة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="p-5 rounded-3xl bg-[#0e1320] border border-[#222b42] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full">{job.type}</span>
              <span className="text-xs text-emerald-400 font-bold">{job.applicants} متقدم للوظيفة</span>
            </div>
            <h3 className="text-sm font-bold text-white">{job.title}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <Building2 size={13} className="text-[#FFC500]" /> {job.company} • <MapPin size={13} /> {job.city}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsManager;
