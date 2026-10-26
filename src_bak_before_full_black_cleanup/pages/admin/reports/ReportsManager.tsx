import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ReportItem {
  id: string;
  reason: string;
  details?: string;
  target_type: string;
  target_id: string;
  reporter_name?: string;
  reporter_phone?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export const ReportsManager: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setReports(data);
      } else {
        setReports([
          {
            id: 'rep-1',
            reason: 'معلومات اتصال غير صحيحة أو مغلقة',
            details: 'تم الاتصال بالرقم المسجل في المنشأة والرقم مغلق وغير تابع لها.',
            target_type: 'business',
            target_id: '1',
            reporter_name: 'أحمد اليافعي',
            reporter_phone: '771234567',
            status: 'PENDING',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleAction = async (id: string, newStatus: 'RESOLVED' | 'DISMISSED') => {
    try {
      await supabase.from('reports').update({ status: newStatus }).eq('id', id);
    } catch(e) {}
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]" dir="rtl">
      <div className="flex items-center gap-3 pb-4 border-b border-[#1F2937]">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">إدارة البلاغات والشكاوى</h1>
          <p className="text-xs text-gray-400 mt-1">متابعة البلاغات الواردة من الزوار والنزلاء ضد المنشآت والخدمات.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-gray-400">جاري فحص البلاغات...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-[#0e1320] rounded-3xl border border-[#222b42] p-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">سجل البلاغات نظيف بالكامل</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((rep) => (
            <div key={rep.id} className="p-5 rounded-3xl bg-[#0e1320] border border-[#222b42] space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-sm font-bold text-white">{rep.reason}</h3>
                </div>
                <span className="text-[10px] text-gray-400">{new Date(rep.created_at).toLocaleDateString('ar-YE')}</span>
              </div>
              {rep.details && <p className="text-xs text-gray-300 bg-[#141a2c] p-3 rounded-2xl border border-[#1F2937]">{rep.details}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleAction(rep.id, 'RESOLVED')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl">اتخاذ إجراء</button>
                <button onClick={() => handleAction(rep.id, 'DISMISSED')} className="px-4 py-2 bg-[#161D2B] text-gray-300 text-xs font-bold rounded-xl">تجاهل البلاغ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsManager;
