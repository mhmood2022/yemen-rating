import React, { useState, useMemo } from 'react';
import {
  Settings,
  ShieldAlert,
  History,
  Key,
  Lock,
  Search,
  Filter,
  Download,
  Check,
  AlertTriangle,
  RefreshCw,
  Server,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  Database,
  Cpu,
  Activity
} from 'lucide-react';

export interface AuditLog {
  id: string;
  admin: string;
  role: string;
  action: string;
  category: 'توثيق' | 'عمولات ومزادات' | 'أسعار وسلع' | 'سوق الهواتف' | 'صلاحيات وأمان';
  target: string;
  ip: string;
  time: string;
  status: 'success' | 'warning' | 'critical';
}

const INITIAL_LOGS: AuditLog[] = [
  { id: 'LOG-881', admin: 'أحمد الوصابي', role: 'Super Admin', action: 'تعديل شارة المنشأة إلى GOLD', category: 'توثيق', target: 'مجموعة بن محفوظ التجارية', ip: '185.220.101.5', time: 'منذ 5 دقائق', status: 'success' },
  { id: 'LOG-882', admin: 'سامي المنصوري', role: 'Auctions Mgr', action: 'تحديد عمولة مخصصة للمزاد', category: 'عمولات ومزادات', target: 'AUC-101 (كتربلر 500KVA)', ip: '185.220.101.12', time: 'منذ 35 دقيقة', status: 'success' },
  { id: 'LOG-883', admin: 'فاطمة باحاج', role: 'Claims Officer', action: 'قبول طلب توثيق رسمي', category: 'توثيق', target: 'مستشفى النخبة التخصصي', ip: '82.114.160.4', time: 'اليوم، 11:20 ص', status: 'success' },
  { id: 'LOG-884', admin: 'عمر القاضي', role: 'Markets Officer', action: 'تحديث تسعيرة مؤشر السكر والأرز', category: 'أسعار وسلع', target: 'سوق الجملة المركزي (صنعاء)', ip: '82.114.160.9', time: 'اليوم، 09:40 ص', status: 'success' },
  { id: 'LOG-885', admin: 'طارق اليافعي', role: 'Phones Mgr', action: 'رفض إعلان هاتف لمخالفة السعر', category: 'سوق الهواتف', target: 'PH-1004 (iPhone 13)', ip: '185.220.101.20', time: 'أمس، 06:15 م', status: 'warning' },
  { id: 'LOG-886', admin: 'أحمد الوصابي', role: 'Super Admin', action: 'تغيير سياسة العمولة (OFF)', category: 'صلاحيات وأمان', target: 'Phone Market Commission', ip: '185.220.101.5', time: 'منذ يومين', status: 'critical' },
];

export const SettingsAuditManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'general' | 'security' | 'system'>('audit');
  const [logs] = useState<AuditLog[]>(INITIAL_LOGS);
  
  // فلاتر سجل التدقيق
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // إعدادات المنصة العامة
  const [siteName, setSiteName] = useState('منصة يمن ريتغ - Yemen Rating');
  const [siteTagline, setSiteTagline] = useState('دليل التقييم والأنشطة والأسواق الشامل في اليمن');
  const [supportPhone, setSupportPhone] = useState('+967 777 000 111');
  const [supportEmail, setSupportEmail] = useState('support@yemen-rating.com');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [cacheClearedToast, setCacheClearedToast] = useState(false);

  // حفظ الإعدادات
  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2500);
  };

  // تفريغ الكاش
  const handleClearCache = () => {
    setCacheClearedToast(true);
    setTimeout(() => setCacheClearedToast(false), 2500);
  };

  // تصفية السجلات
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch =
        log.admin.includes(searchQuery) ||
        log.action.includes(searchQuery) ||
        log.target.includes(searchQuery) ||
        log.ip.includes(searchQuery) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || log.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [logs, searchQuery, categoryFilter]);

  return (
    <div dir="rtl" className="space-y-6 text-zinc-100 font-sans">
      {/* 1. رأس الصفحة والتبويبات */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">سجل العمليات الأمني وإعدادات النظام</h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                تتبع العمليات الإدارية (Audit Logs)، ضبط إعدادات المنصة، ومراقبة سياسات الأمان وRLS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" /> حماية RLS مفعلة
            </span>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {[
            { id: 'audit', label: 'سجل التدقيق والعمليات', icon: History, count: logs.length },
            { id: 'general', label: 'إعدادات المنصة العامة', icon: Settings },
            { id: 'security', label: 'الأمان وصلاحيات المشرفين', icon: Lock },
            { id: 'system', label: 'أدوات النظام والخادم', icon: Server },
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
      {/* التبويب 1: سجل التدقيق الأمني (Audit Logs)                 */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* شريط البحث والفلترة */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3" />
              <input
                type="text"
                placeholder="بحث باسم المشرف، الإجراء، الهدف، أو IP..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-500"
              >
                <option value="all">كل أقسام العمليات</option>
                <option value="توثيق">توثيق وشارات</option>
                <option value="عمولات ومزادات">عمولات ومزادات</option>
                <option value="أسعار وسلع">أسعار وسلع</option>
                <option value="سوق الهواتف">سوق الهواتف</option>
                <option value="صلاحيات وأمان">صلاحيات وأمان</option>
              </select>

              <button
                onClick={() => alert('تم تصدير سجل التدقيق كملف CSV')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold border border-zinc-800 shrink-0 transition"
              >
                <Download className="w-3.5 h-3.5" /> تصدير
              </button>
            </div>
          </div>

          {/* جدول السجلات */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4">رقم السجل</th>
                    <th className="py-3.5 px-4">المشرف المسؤول</th>
                    <th className="py-3.5 px-4">القسم</th>
                    <th className="py-3.5 px-4">نوع الإجراء والعملية</th>
                    <th className="py-3.5 px-4">العنصر المتأثر</th>
                    <th className="py-3.5 px-4 text-center">عنوان IP</th>
                    <th className="py-3.5 px-4 text-center">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-200">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-zinc-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-500">{log.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">{log.admin}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{log.role}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[11px] border border-zinc-800">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold text-xs ${
                            log.status === 'critical'
                              ? 'text-rose-400'
                              : log.status === 'warning'
                              ? 'text-amber-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-300">{log.target}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-zinc-500 text-[11px]">{log.ip}</td>
                      <td className="py-3.5 px-4 text-center text-zinc-400 text-[11px]">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 2: إعدادات المنصة العامة                           */}
      {/* ========================================================= */}
      {activeTab === 'general' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="pb-4 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white">إعدادات الهوية والتواصل للمنصة</h2>
            <p className="text-xs text-zinc-400 mt-1">التحكم في بيانات الواجهة، قنوات الدعم، ووضع الصيانة</p>
          </div>

          <form onSubmit={handleSaveGeneralSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">اسم المنصة الرسمي:</label>
              <input
                type="text"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">الشعار / الوصف التعريفي (Tagline):</label>
              <input
                type="text"
                value={siteTagline}
                onChange={e => setSiteTagline(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">هاتف وواتساب الدعم:</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={e => setSupportPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">بريد خدمة العملاء:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* وضع الصيانة */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 mt-4">
              <div>
                <h4 className="font-bold text-sm text-white">وضع الصيانة المؤقت (Maintenance Mode)</h4>
                <p className="text-xs text-zinc-400 mt-0.5">إظهار صفحة أعمال الصيانة للزوار مع إبقاء لوحة التحكم للمشرفين</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMaintenanceMode(prev => !prev)}
                className={`w-14 h-7 rounded-full transition-colors relative p-1 ${
                  isMaintenanceMode ? 'bg-yellow-500' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-zinc-950 transition-transform ${
                    isMaintenanceMode ? 'translate-x-0' : '-translate-x-7'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md shadow-yellow-500/10"
              >
                {saveSuccessToast ? <><Check className="w-4 h-4" /> تم حفظ الإعدادات بنجاح</> : 'حفظ الإعدادات'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 3: الأمان وسياسات RLS والمشرفين                     */}
      {/* ========================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">حماية الصفوف RLS</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                قواعد Row Level Security مفعلة لعزل بيانات المنشآت الحساسة وأرقام التواصل وأسعار الصفقات.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-yellow-400">
                <Key className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">إدارة الجلسات والأمان</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                تنتهي جلسة الإدارة تلقائياً بعد ساعتين من عدم النشاط لحماية حسابات المشرفين من أي وصول غير مصرح.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Lock className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">صلاحيات المشرفين</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                تدرج هرمي للأدوار: Super Admin، مسؤولي التوثيق (Claims)، مسؤولي الأسواق، ومسؤولي الإعلانات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب 4: أدوات النظام والخادم                            */}
      {/* ========================================================= */}
      {activeTab === 'system' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white">أدوات فحص وصيانة الخادم</h2>
            <p className="text-xs text-zinc-400 mt-1">تفريغ الكاش، فحص الاستجابة، وحالة النظام البرمجي</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">تفريغ الذاكرة المؤقتة (Clear Cache)</h4>
                <p className="text-xs text-zinc-400 mt-0.5">إعادة تحميل مؤشرات الأسعار والأنشطة المحفوظة</p>
              </div>
              <button
                onClick={handleClearCache}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-yellow-500 hover:text-zinc-950 text-zinc-200 rounded-xl text-xs font-bold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> تفريغ
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">حالة الخادم ووقت التشغيل</h4>
                <p className="text-xs text-emerald-400 mt-0.5">● Uptime: 99.98% (استجابة سريعة)</p>
              </div>
              <span className="font-mono text-xs font-bold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">
                24ms
              </span>
            </div>
          </div>

          {cacheClearedToast && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" /> تم تفريغ الكاش وتحديث الذاكرة المؤقتة بنجاح!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsAuditManager;
