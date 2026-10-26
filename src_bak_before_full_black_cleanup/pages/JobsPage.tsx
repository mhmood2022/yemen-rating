import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onNavigate?: (path: string) => void;
  onBack?: () => void;
}

export const JobsPage: React.FC<Props> = ({ onNavigate, onBack }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicJobs();
  }, []);

  const loadPublicJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'PUBLISHED')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching public jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080B] text-white font-['Cairo',sans-serif] pb-24 max-w-4xl mx-auto px-4 pt-4 space-y-4" dir="rtl">
      {/* الرأس */}
      <div className="flex justify-between items-center pb-3 border-b border-[#22222E]">
        <h1 className="text-base font-black text-white flex items-center gap-2">
          <Briefcase className="text-[#FFC500] w-5 h-5" />
          <span>بوابة الوظائف والوساطة الذكية</span>
        </h1>
        <button 
          onClick={() => onBack ? onBack() : onNavigate ? onNavigate('/') : window.history.back()} 
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          الرئيسية
        </button>
      </div>

      {/* بنر الخصوصية والوساطة */}
      <div className="bg-[#14141C] border border-[#FFC500]/30 rounded-2xl p-4 text-xs text-neutral-300 leading-relaxed flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FFC500] text-black flex items-center justify-center text-lg shrink-0 font-bold">
          <ShieldCheck size={20} />
        </div>
        <div>
          <div className="font-bold text-white mb-0.5">وساطة يمن ريتنغ المعتمدة</div>
          <div>يتم استقبال طلبات التوظيف ومطابقتها بالذكاء الاصطناعي مع حفظ سرية بيانات الأطراف والعمولات.</div>
        </div>
      </div>

      {/* قائمة الوظائف المنشورة */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-[#FFC500]" />
          <span className="text-xs">جارٍ جلب أحدث الشواغر المعتمدة...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs bg-[#111118] border border-slate-800 rounded-2xl p-6">
          لا توجد شواغر منشورة حالياً. يمكنك متابعة الإعلانات الجديدة قريباً!
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="p-4 rounded-2xl bg-[#111118] border border-slate-800/80 hover:border-[#FFC500]/50 transition-all space-y-2.5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                  {job.type || 'دوام كامل'}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {job.experience || 'خبرة متوسطة'}
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-white">{job.title}</h2>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/50 text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#FFC500]" /> {job.city || 'اليمن'}
                  </span>
                  {job.salary && (
                    <span className="text-emerald-400 font-bold">
                      {job.salary}
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => alert('سيتم فتح نموذج التقديم الذكي لهذه الوظيفة')}
                  className="px-4 py-1.5 rounded-xl bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs shadow cursor-pointer transition-colors"
                >
                  تقديم الآن
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
