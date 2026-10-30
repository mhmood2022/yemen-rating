import React, { useEffect, useState } from 'react';
import { 
  FileText, User, Clock, CheckCircle2, XCircle, DollarSign, 
  Shield, Eye, ChevronDown, ChevronUp, Filter, Download, Search 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface AuditLog {
  id: string;
  user_id: string;
  admin_name: string;
  action: string;
  table_name: string;
  record_id: string;
  old_value: any;
  new_value: any;
  notes: string;
  created_at: string;
}

const ACTION_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  'approve_payment': { label: 'قبول دفعة', icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  'reject_payment': { label: 'رفض دفعة', icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  'create_payment_method': { label: 'إضافة طريقة دفع', icon: DollarSign, color: '#1D9BF0', bg: 'rgba(29,155,240,0.1)' },
  'update_payment_method': { label: 'تعديل طريقة دفع', icon: DollarSign, color: '#FFC500', bg: 'rgba(255,197,0,0.1)' },
  'delete_payment_method': { label: 'حذف طريقة دفع', icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  'toggle_payment_method': { label: 'تفعيل/إخفاء طريقة دفع', icon: Eye, color: '#FFC500', bg: 'rgba(255,197,0,0.1)' },
  'update_commission_rule': { label: 'تعديل قاعدة عمولة', icon: DollarSign, color: '#FFC500', bg: 'rgba(255,197,0,0.1)' },
  'grant_subscription': { label: 'منح اشتراك', icon: Shield, color: '#1D9BF0', bg: 'rgba(29,155,240,0.1)' },
  'approve_subscription': { label: 'قبول اشتراك', icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  'verify_payment': { label: 'التحقق من دفعة', icon: Shield, color: '#1D9BF0', bg: 'rgba(29,155,240,0.1)' },
};

const TABLE_LABELS: Record<string, string> = {
  'payment_proofs': 'سندات الدفع',
  'payment_methods': 'طرق الدفع',
  'payment_orders': 'طلبات الدفع',
  'payment_transactions': 'الحركات المالية',
  'subscriptions': 'الاشتراكات',
  'profiles': 'المستخدمون',
  'commission_rules': 'قواعد العمولات',
  'commission_transactions': 'حركات العمولات',
  'service_requests': 'طلبات الخدمة',
  'financial_audit_logs': 'سجل التدقيق',
};

const STATUS_LABELS: Record<string, string> = {
  'PENDING': 'قيد المراجعة',
  'APPROVED': 'مقبول',
  'REJECTED': 'مرفوض',
  'ACTIVE': 'نشط',
  'EXPIRED': 'منتهي',
  'CANCELLED': 'ملغى',
  'clean': 'سليم',
  'suspicious': 'مريب',
  'needs_review': 'يحتاج مراجعة',
  'unverified': 'غير محقق',
};

const formatTableName = (table: string) => TABLE_LABELS[table] || table;

const formatValue = (value: any): string => {
  if (!value) return '';
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed)
        .map(([k, v]) => {
          const label = k === 'status' ? 'الحالة' :
                       k === 'reason' ? 'السبب' :
                       k === 'amount' ? 'المبلغ' :
                       k === 'currency' ? 'العملة' : k;
          const val = k === 'status' && typeof v === 'string' ? (STATUS_LABELS[v] || v) : v;
          return `${label}: ${val}`;
        })
        .join(' | ');
    }
    return String(parsed);
  } catch {
    return String(value);
  }
};

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_financial_audit_logs');
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.admin_name?.toLowerCase().includes(q) ||
        log.notes?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="space-y-4">
      {/* الترويسة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-[#FFC500]" /> سجل التدقيق المالي
          </h2>
          <p className="text-xs text-zinc-500 mt-1">تتبع كل الإجراءات المالية والإدارية على النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#111] border border-[#2A2B30] text-xs font-bold text-white">
            {logs.length} إجراء
          </span>
        </div>
      </div>

      {/* البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم المدير، أو الإجراء، أو التفاصيل..."
          className="w-full bg-black border border-[#2A2B30] rounded-xl pr-10 pl-3 py-2.5 text-sm text-white focus:border-[#FFC500] outline-none"
        />
      </div>

      {/* فلاتر الإجراءات */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setFilterAction('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
            filterAction === 'all' 
              ? 'bg-[#FFC500] text-black' 
              : 'bg-[#111] text-zinc-400 border border-[#2A2B30] hover:text-white'
          }`}
        >
          الكل ({logs.length})
        </button>
        {uniqueActions.map(action => {
          const meta = ACTION_META[action] || { label: action, color: '#9CA3AF' };
          const count = logs.filter(l => l.action === action).length;
          return (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                filterAction === action 
                  ? 'text-black' 
                  : 'bg-[#111] text-zinc-400 border border-[#2A2B30] hover:text-white'
              }`}
              style={filterAction === action ? { background: meta.color } : {}}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* قائمة السجلات */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-xl bg-[#0A0A0B] border border-[#2A2B30] animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1F2024]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-[#1F2024] rounded" />
                  <div className="h-2 w-24 bg-[#1F2024] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-black border border-[#2A2B30] rounded-2xl">
          <FileText className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500">لا توجد إجراءات مسجلة تطابق البحث</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map(log => {
            const meta = ACTION_META[log.action] || { 
              label: log.action, 
              icon: FileText, 
              color: '#9CA3AF',
              bg: 'rgba(156,163,175,0.1)' 
            };
            const Icon = meta.icon;
            const isExpanded = expandedId === log.id;
            const hasDetails = log.old_value || log.new_value;

            return (
              <div 
                key={log.id} 
                className="rounded-xl bg-black border border-[#2A2B30] overflow-hidden transition-all hover:border-[#3A3B40]"
              >
                <div 
                  className={`p-3 flex items-start gap-3 ${hasDetails ? 'cursor-pointer' : ''}`}
                  onClick={() => hasDetails && setExpandedId(isExpanded ? null : log.id)}
                >
                  {/* الأيقونة */}
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: meta.color }} />
                  </div>

                  {/* المحتوى */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span 
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="font-bold text-zinc-300">{log.admin_name}</span>
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-xs text-zinc-300 mt-1 line-clamp-2">{log.notes}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString('ar-YE', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      {log.table_name && (
                        <span className="px-1.5 py-0.5 rounded bg-[#111] border border-[#2A2B30]">
                          {formatTableName(log.table_name)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* زر التوسيع */}
                  {hasDetails && (
                    <div className="shrink-0 mt-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* تفاصيل التغيير */}
                {isExpanded && hasDetails && (
                  <div className="border-t border-[#2A2B30] bg-[#0A0A0B] p-3 space-y-2">
                    {log.old_value && (
                      <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                        <p className="text-[10px] font-bold text-red-400 mb-1">الحالة السابقة:</p>
                        <p className="text-xs text-zinc-300">
                          {formatValue(log.old_value)}
                        </p>
                      </div>
                    )}
                    {log.new_value && (
                      <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                        <p className="text-[10px] font-bold text-green-400 mb-1">الحالة الجديدة:</p>
                        <p className="text-xs text-zinc-300">
                          {formatValue(log.new_value)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
