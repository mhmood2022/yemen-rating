import React, { useState } from 'react';
import { Briefcase, Building2, MapPin, Users, DollarSign } from 'lucide-react';

export const JobsManager: React.FC = () => {
  const [jobs] = useState([
    {
      id: 'JOB-301',
      title: 'مهندس برمجيات وتطبيقات React/Node',
      company: 'شركة يمن سوفت للحلول',
      city: 'صنعاء',
      type: 'دوام كامل',
      applicantsCount: 18,
      fixedCommission: '150 USD',
      status: 'active'
    },
    {
      id: 'JOB-302',
      title: 'مدير تسويق رقمي وحملات إعلانية',
      company: 'مجموعة هائل سعيد أنعم',
      city: 'تعز / عدن',
      type: 'دوام كامل',
      applicantsCount: 24,
      fixedCommission: '200 USD',
      status: 'active'
    },
    {
      id: 'JOB-303',
      title: 'محاسب مالي قانوني',
      company: 'بنك الكريمي للتمويل',
      city: 'حضرموت - المكلا',
      type: 'دوام كامل',
      applicantsCount: 12,
      fixedCommission: '100 USD',
      status: 'closed'
    }
  ]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Briefcase className="text-[#FFC500]" />
          إدارة الوظائف والتوظيف
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          إدارة إعلانات الوظائف، مراجعة المتقدمين، وعمولة التوظيف الثابتة (Fixed Commission) المحددة من الإدارة.
        </p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
            <tr>
              <th className="py-3.5 px-4">المسمى الوظيفي والشركة</th>
              <th className="py-3.5 px-4">المدينة ونوع العمل</th>
              <th className="py-3.5 px-4 text-center">المتقدمون</th>
              <th className="py-3.5 px-4 text-center text-[#FFC500]">عمولة التوظيف الثابتة</th>
              <th className="py-3.5 px-4 text-center">حالة الوظيفة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] text-white">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-[#161D2B]/50">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white">{job.title}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{job.company}</div>
                </td>
                <td className="py-3.5 px-4 text-[#9CA3AF]">
                  {job.city} • <span className="text-white">{job.type}</span>
                </td>
                <td className="py-3.5 px-4 text-center font-mono font-bold text-[#FFC500]">
                  {job.applicantsCount} متقدم
                </td>
                <td className="py-3.5 px-4 text-center font-mono font-bold text-[#16A34A]">
                  {job.fixedCommission}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    job.status === 'active' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {job.status === 'active' ? 'نشطة ومتاحة' : 'مكتملة'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
