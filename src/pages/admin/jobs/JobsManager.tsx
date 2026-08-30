import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Bell,
  Coins,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  Layers,
  ArrowUpRight,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  MessageSquare,
  Lock
} from 'lucide-react';
import { 
  DEMO_JOBS, 
  DEMO_SEEKERS, 
  DEMO_MATCH_RECORDS, 
  DEMO_HIRE_RECORDS, 
  CURRENT_COMMISSION_POLICY 
} from '../../../data/demoJobs';
import { 
  JobVacancy, 
  JobSeekerProfile, 
  JobMatchRecord, 
  CommissionPolicy, 
  ConfirmedHireRecord 
} from '../../../types/jobs';

export const JobsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'hires' | 'policy' | 'jobs' | 'reminders'>('matches');
  
  // الحالات
  const [jobs, setJobs] = useState<JobVacancy[]>(DEMO_JOBS);
  const [matchRecords, setMatchRecords] = useState<JobMatchRecord[]>(DEMO_MATCH_RECORDS);
  const [hireRecords, setHireRecords] = useState<ConfirmedHireRecord[]>(DEMO_HIRE_RECORDS);
  const [policy, setPolicy] = useState<CommissionPolicy>(CURRENT_COMMISSION_POLICY);
  
  // حفظ الإعدادات
  const [isSavedPolicy, setIsSavedPolicy] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<JobMatchRecord | null>(null);

  // حفظ سياسة العمولة
  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedPolicy(true);
    setTimeout(() => setIsSavedPolicy(false), 2500);
  };

  // إحصائيات
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalMatches: matchRecords.length,
    confirmedHires: hireRecords.length,
    pendingReminders: hireRecords.filter(h => h.commissionStatus === 'due').length,
  };

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans">
      {/* 1. رأس الصفحة والتبويبات */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">إدارة نظام التوظيف والتطابق الذكي</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                متابعة التطابقات YR، إشعارات الإحالة، سياسة عمولة الشهر الأول، والتذكيرات الذكية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              {stats.totalMatches} تطابق مسجل
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {stats.confirmedHires} توظيف ناجح
            </span>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {[
            { id: 'matches', label: 'سجلات التطابق وإشعارات الإحالة (YR)', icon: Sparkles, count: stats.totalMatches },
            { id: 'hires', label: 'تقارير التوظيف والعمولات المستحقة', icon: CheckCircle2, count: stats.confirmedHires },
            { id: 'reminders', label: 'تذكيرات نهاية الشهر الأول', icon: Bell, count: stats.pendingReminders },
            { id: 'policy', label: 'سياسة وإعدادات العمولة', icon: Coins },
            { id: 'jobs', label: 'كافة الشواغر المسجلة', icon: Briefcase, count: stats.totalJobs },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-yellow-500 text-zinc-950 shadow-md shadow-yellow-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* التبويب 1: سجلات التطابق الذكي وإشعارات الإحالة            */}
      {/* ========================================================= */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-yellow-400">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">سجلات التطابق الذكي (Match Records)</h2>
              </div>
              <span className="text-xs text-zinc-400">تطابق الشروط تلقائياً بدون نسب وهمية</span>
            </div>

            <div className="space-y-3">
              {matchRecords.map(match => (
                <div
                  key={match.id}
                  className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-yellow-500 text-zinc-950">
                        {match.orderNumber}
                      </span>
                      <h3 className="font-bold text-sm text-white">{match.jobTitle}</h3>
                    </div>
                    <span className="text-xs text-zinc-400">{match.matchDate}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block text-[11px]">الجهة الموظفة (بيانات كاملة للإدارة):</span>
                      <span className="font-bold text-zinc-200 block">{match.companyName}</span>
                      <span className="font-mono text-zinc-400">{match.companyPhone} • {match.companyLocation}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[11px]">المتقدم المطابق:</span>
                      <span className="font-bold text-yellow-400 block">{match.applicantName}</span>
                      <span className="font-mono text-zinc-400">{match.applicantPhone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {match.matchedCriteria.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700">
                          ✓ {c}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-yellow-500 hover:text-zinc-950 text-zinc-200 font-bold rounded-lg text-xs transition"
                    >
                      عرض نص الإشعارين
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 2: تقارير التوظيف المؤكدة وعمولات الشهر الأول       */}
      {/* ========================================================= */}
      {activeTab === 'hires' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">تقارير التوظيف المؤكد ومتابعة العمولات</h2>
            </div>
            <span className="text-xs text-zinc-400">سجلات مباشرة العمل وتواريخ الاستحقاق</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">رقم الطلب</th>
                  <th className="py-3.5 px-4">الوظيفة والجهة</th>
                  <th className="py-3.5 px-4">الموظف المعين</th>
                  <th className="py-3.5 px-4 text-center">تاريخ المباشرة</th>
                  <th className="py-3.5 px-4 text-center">الراتب المتفق عليه</th>
                  <th className="py-3.5 px-4 text-center text-yellow-400">عمولة الشهر الأول</th>
                  <th className="py-3.5 px-4 text-center">تاريخ الاستحقاق</th>
                  <th className="py-3.5 px-4 text-center">حالة السداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {hireRecords.map(hire => (
                  <tr key={hire.id} className="hover:bg-zinc-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-yellow-400">{hire.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{hire.jobTitle}</span>
                      <span className="text-zinc-400 text-[10px]">{hire.companyName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-zinc-200 block">{hire.applicantName}</span>
                      <span className="font-mono text-zinc-500 text-[10px]">{hire.applicantPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-300">{hire.startDate}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">{hire.agreedSalary}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{hire.commissionAmountText}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-400">{hire.dueDate}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {hire.commissionStatus === 'due' ? '🔔 حان موعد المتابعة' : '⏳ قيد مدة الشهر'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 3: تذكيرات نهاية الشهر الأول الذكية                 */}
      {/* ========================================================= */}
      {activeTab === 'reminders' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-yellow-400">
              <Bell className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">تذكيرات استحقاق عمولة نهاية الشهر الأول</h2>
            </div>
            <span className="text-xs text-zinc-400">حساب الشهر الأول يبدأ تلقائياً من تاريخ المباشرة</span>
          </div>

          <div className="space-y-3">
            {hireRecords.map(hire => (
              <div
                key={hire.id}
                className="p-4 rounded-xl bg-zinc-900/60 border border-amber-500/30 flex items-start justify-between gap-3 flex-wrap"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5" /> تذكير بمتابعة عمولة توظيف ({hire.orderNumber})
                    </span>
                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                      مباشرة العمل: {hire.startDate}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    الموظف: <strong>{hire.applicantName}</strong> لدى <strong>{hire.companyName}</strong> ({hire.jobTitle})
                  </p>
                  <p className="text-xs text-emerald-400 font-semibold">
                    العمولة المستحقة: {hire.commissionAmountText} • موعد نهاية الشهر: {hire.dueDate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`تم إرسال إشعار متابعة التحصيل للطرف الملزم (${hire.payer === 'employer' ? 'الشركة' : 'الموظف'})`)}
                    className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-lg text-xs transition"
                  >
                    متابعة التحصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 4: سياسة وإعدادات العمولة المتقدمة                 */}
      {/* ========================================================= */}
      {activeTab === 'policy' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white">إعدادات سياسة عمولة التوظيف (شهر أول فقط)</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              تحديد الطرف الملزم، نوع الحساب (نسبة أو ثابت)، إظهار/إخفاء العمولة، وقواعد التخصصات
            </p>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-5">
            {/* إظهار وإخفاء العمولة */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div>
                <h3 className="font-bold text-sm text-white">تفعيل وإظهار خيار العمولة في النظام</h3>
                <p className="text-xs text-zinc-400 mt-0.5">إمكانية تعطيل أو إخفاء العمولة بدون إعادة بناء النظام</p>
              </div>
              <button
                type="button"
                onClick={() => setPolicy(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                className={`w-14 h-7 rounded-full transition-colors relative p-1 ${
                  policy.isEnabled ? 'bg-yellow-500' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-zinc-950 transition-transform ${
                    policy.isEnabled ? 'translate-x-0' : '-translate-x-7'
                  }`}
                />
              </button>
            </div>

            {/* الطرف الملزم بالعمولة */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2">الطرف الملزم بدفع عمولة التوظيف:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'employer_only', label: 'الجهة الموظفة فقط' },
                  { id: 'applicant_only', label: 'المتقدم فقط' },
                  { id: 'both', label: 'الطرفين معاً' },
                  { id: 'none', label: 'بدون عمولة (مجاني)' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPolicy(prev => ({ ...prev, payer: p.id as any }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      policy.payer === p.id
                        ? 'bg-yellow-500 text-zinc-950 border-yellow-500 shadow-md'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* طريقة الحساب */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">طريقة حساب العمولة:</label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setPolicy(prev => ({ ...prev, calculationType: 'percentage' }))}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      policy.calculationType === 'percentage'
                        ? 'bg-yellow-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    نسبة مئوية % من الراتب
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolicy(prev => ({ ...prev, calculationType: 'fixed' }))}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      policy.calculationType === 'fixed'
                        ? 'bg-yellow-500 text-zinc-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    مبلغ مقطوع ثابت
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  القيمة المقررة ({policy.calculationType === 'percentage' ? 'نسبة % من راتب أول شهر' : 'مبلغ ثابت بالريال'}):
                </label>
                <input
                  type="number"
                  value={policy.calculationType === 'percentage' ? policy.percentageValue : policy.fixedValue}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    if (policy.calculationType === 'percentage') {
                      setPolicy(prev => ({ ...prev, percentageValue: val }));
                    } else {
                      setPolicy(prev => ({ ...prev, fixedValue: val }));
                    }
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
            >
              {isSavedPolicy ? <><Check className="w-4 h-4" /> تم حفظ السياسة بنجاح</> : 'حفظ سياسة العمولة'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 5: كافة الشواغر                                   */}
      {/* ========================================================= */}
      {activeTab === 'jobs' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white pb-3 border-b border-zinc-800">قائمة الشواغر المسجلة في النظام</h2>
          <div className="space-y-2">
            {jobs.map(job => (
              <div key={job.id} className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{job.title}</span>
                  <span className="text-zinc-400">{job.companyName} ({job.phone}) • {job.city}</span>
                </div>
                <div className="text-left font-mono">
                  <span className="text-yellow-400 block">{job.salaryRange || 'يحدد بعد المقابلة'}</span>
                  <span className="text-zinc-500 text-[10px]">{job.status === 'active' ? 'نشطة' : 'تم التوظيف'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* نافذة نصوص الإشعارين الحرفية لكلا الطرفين                */}
      {/* ========================================================= */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-white">نصوص الإشعارات الرسمية: {selectedMatch.orderNumber}</h3>
              <button onClick={() => setSelectedMatch(null)} className="text-zinc-400 hover:text-white p-1">✕</button>
            </div>

            {/* 1. إشعار الجهة الموظفة */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-yellow-400 block pb-1 border-b border-zinc-800">📨 إشعار الجهة الموظفة:</span>
              <p className="text-zinc-300 leading-relaxed">
                تم العثور على موظف مناسب لوظيفتكم من خلال منصة يمن ريتغ.<br />
                <strong>اسم المتقدم:</strong> {selectedMatch.applicantName}<br />
                <strong>رقم الهاتف:</strong> {selectedMatch.applicantPhone}<br />
                <strong>الوظيفة:</strong> {selectedMatch.jobTitle}<br />
                <strong>رقم طلب يمن ريتغ:</strong> <span className="font-mono text-yellow-400 font-bold">{selectedMatch.orderNumber}</span><br />
                <span className="text-zinc-400 text-[11px] block mt-1">
                  * يرجى عند التواصل معه التأكد من رقم الطلب وذكر أن التواصل تم عن طريق منصة يمن ريتغ.
                </span>
              </p>
            </div>

            {/* 2. إشعار المتقدم */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 block pb-1 border-b border-zinc-800">📨 إشعار المتقدم:</span>
              <p className="text-zinc-300 leading-relaxed">
                تم العثور على وظيفة مناسبة لك من خلال منصة يمن ريتغ.<br />
                <strong>الشركة/الجهة:</strong> {selectedMatch.companyName}<br />
                <strong>الموقع:</strong> {selectedMatch.companyLocation}<br />
                <strong>الهاتف:</strong> {selectedMatch.companyPhone}<br />
                <strong>WhatsApp:</strong> {selectedMatch.companyWhatsapp || selectedMatch.companyPhone}<br />
                <strong>الوظيفة:</strong> {selectedMatch.jobTitle}<br />
                <strong>رقم طلب يمن ريتغ:</strong> <span className="font-mono text-yellow-400 font-bold">{selectedMatch.orderNumber}</span><br />
                <span className="text-zinc-400 text-[11px] block mt-1">
                  * عند التواصل مع الجهة، اذكر أنك وصلت إليها عن طريق منصة يمن ريتغ ورقم طلبك.
                </span>
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsManager;
