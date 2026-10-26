import React, { useState } from 'react';
import { Cpu, Sparkles, CheckCircle2, User, Briefcase } from 'lucide-react';
import { calculateYRMatch } from '../../../utils/matchingEngine';

export const MatchingAIManager: React.FC = () => {
  const sampleCandidate = {
    id: 'CAND-1',
    name: 'م. حسام العريقي',
    title: 'Full Stack React & Node.js Developer',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    experienceYears: 4,
    city: 'صنعاء',
    education: 'بكالوريوس تقنية معلومات'
  };

  const sampleJob = {
    id: 'JOB-101',
    title: 'Senior Frontend Developer (React)',
    requiredSkills: ['React', 'TypeScript', 'TailwindCSS'],
    minExperience: 3,
    city: 'صنعاء',
    jobType: 'Full-time'
  };

  const match = calculateYRMatch(sampleCandidate, sampleJob);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Cpu className="text-[#FFC500]" />
          المطابقة الذكية YR AI MATCH Engine
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          محرك مطابقة السير الذاتية والمهارات مع متطلبات الوظائف المعتمدة دون اختراع بيانات وهمية.
        </p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFC500]/15 text-[#FFC500] flex items-center justify-center font-bold">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">نتيجة التحليل الذكي YR AI</h3>
              <p className="text-xs text-[#9CA3AF]">مطابقة دقيقة مبنية على المسمى، المهارات، والخبرة</p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-black text-[#16A34A] font-mono">{match.score}%</div>
            <div className="text-[10px] text-[#9CA3AF] font-bold">نسبة التوافق الإجمالية</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#161D2B] border border-[#1F2937] space-y-2">
            <div className="text-xs font-bold text-[#FFC500] flex items-center gap-1.5">
              <User size={14} /> بيانات المرشح:
            </div>
            <div className="text-sm font-bold text-white">{sampleCandidate.name}</div>
            <div className="text-xs text-[#9CA3AF]">{sampleCandidate.title} • {sampleCandidate.city}</div>
            <div className="flex flex-wrap gap-1 pt-1">
              {sampleCandidate.skills.map(s => (
                <span key={s} className="px-2 py-0.5 rounded bg-[#0B0F17] text-[10px] text-gray-300">{s}</span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#161D2B] border border-[#1F2937] space-y-2">
            <div className="text-xs font-bold text-[#16A34A] flex items-center gap-1.5">
              <Briefcase size={14} /> متطلبات الوظيفة:
            </div>
            <div className="text-sm font-bold text-white">{sampleJob.title}</div>
            <div className="text-xs text-[#9CA3AF]">الخبرة المطلوبة: {sampleJob.minExperience} سنوات • {sampleJob.city}</div>
            <div className="flex flex-wrap gap-1 pt-1">
              {sampleJob.requiredSkills.map(s => (
                <span key={s} className="px-2 py-0.5 rounded bg-[#0B0F17] text-[10px] text-[#FFC500]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
