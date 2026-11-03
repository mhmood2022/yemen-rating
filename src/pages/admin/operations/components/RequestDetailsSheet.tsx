import React, { useMemo, useState, useEffect } from 'react';
import {
  X, Clock, FileText, ExternalLink, AlertCircle, Download,
  CheckCircle2, XCircle, Lock, MessageSquare,
  Phone, Mail, Copy, Check, Building2, Hash, Calendar,
  UserCheck,
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useRequestDetails } from '../hooks/useRequestDetails';
import { useRequestActions, RequestAction } from '../hooks/useRequestActions';
import { SkeletonCard } from './SkeletonCard';
import { formatStatus, formatPriority, formatType } from '../i18n';
import type { AdminRequest } from '../types';
import { supabase } from '../../../../lib/supabase';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Props {
  request: AdminRequest;
  onClose: () => void;
  onUpdated?: () => void;
}

interface ViewerState {
  url: string;
  kind: 'pdf' | 'image';
}

const LINK_REGEX = /((?:object\/)?public\/media\/[^\s]+|https?:\/\/[^\s]+)/g;
const isPdf = (u: string) => /\.pdf($|\?)/i.test(u);
const isImage = (u: string) => /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(u);
const toPublicUrl = (raw: string) => {
  const clean = raw.replace(/^object\//, '');
  if (clean.startsWith('http')) return clean;
  const base = (supabase as any).supabaseUrl || '';
  return `${base}/storage/v1/${clean}`;
};

const CopyButton: React.FC<{ value: string; label?: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold active:scale-95 transition"
      title={`نسخ ${label || ''}`}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

const Divider = () => <div className="border-t border-zinc-800 my-4" />;

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-bold text-[#FFC500] mb-3 text-center">{children}</h3>
);

const PdfViewer: React.FC<ViewerState & { onClose: () => void }> = ({ url, kind, onClose }) => {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth - 24 : 360
  );
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black" dir="rtl">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-black border-b border-zinc-800">
        <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-900">
          <X className="w-4 h-4 text-white" />
        </button>
        <p className="text-sm font-bold text-white">معاينة الملف</p>
        <a href={url} target="_blank" rel="noreferrer" download
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFC500]/15 text-[#FFC500]">
          <Download className="w-4 h-4" />
        </a>
      </div>
      <div className="flex-1 overflow-y-auto bg-black px-3 py-3">
        {kind === 'image' ? (
          <div className="w-full h-full flex items-center justify-center">
            <img src={url} alt="" className="max-w-full object-contain" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-white">تعذر عرض الملف</p>
            <p className="text-[11px] text-zinc-500">{error}</p>
            <a href={url} target="_blank" rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-[#FFC500] text-black text-xs font-bold">
              فتح في تاب جديد
            </a>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(e) => setError(e?.message || 'فشل تحميل الملف')}
            loading={
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-[#FFC500] border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            {Array.from({ length: numPages }, (_, i) => (
              <div key={i} className="mb-3 flex justify-center">
                <Page pageNumber={i + 1} width={pageWidth} renderAnnotationLayer={false} renderTextLayer={false} />
              </div>
            ))}
          </Document>
        )}
      </div>
    </div>
  );
};

const renderDescription = (text: string | undefined, onOpen: (v: ViewerState) => void) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    LINK_REGEX.lastIndex = 0;
    while ((m = LINK_REGEX.exec(line)) !== null) {
      if (m.index > lastIndex) parts.push(line.slice(lastIndex, m.index));
      const url = m[0];
      const fullUrl = toPublicUrl(url);
      const kind: 'pdf' | 'image' = isPdf(url) ? 'pdf' : isImage(url) ? 'image' : 'pdf';
      const label = kind === 'pdf' ? 'عرض PDF' : 'عرض الصورة';
      parts.push(
        <button key={`${i}-${m.index}`} type="button" onClick={() => onOpen({ url: fullUrl, kind })}
          className="inline-flex items-center gap-1 px-2 py-1 mx-1 rounded-md bg-[#FFC500]/15 text-[#FFC500] text-[11px] font-bold">
          <ExternalLink className="w-3 h-3" />
          {label}
        </button>
      );
      lastIndex = m.index + url.length;
    }
    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return (
      <p key={i} className="text-xs text-zinc-300 leading-relaxed mb-1 break-words">
        {parts.length ? parts : line}
      </p>
    );
  });
};

interface ActionSheetProps {
  action: RequestAction | null;
  onCancel: () => void;
  onConfirm: (opts: { reason?: string; assignedTo?: string; note?: string }) => void;
  loading: boolean;
  error?: string | null;
  admins?: { id: string; full_name: string }[];
}

const ActionSheet: React.FC<ActionSheetProps> = ({ action, onCancel, onConfirm, loading, error, admins }) => {
  const [reason, setReason] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [note, setNote] = useState('');

  if (!action) return null;

  const CONFIG: Record<RequestAction, { title: string; needReason: boolean; needAssignee: boolean; needNote: boolean; cta: string; ctaColor: string }> = {
    approve: { title: 'قبول الطلب', needReason: false, needAssignee: false, needNote: false, cta: 'تأكيد القبول', ctaColor: '#22C55E' },
    reject: { title: 'رفض الطلب', needReason: true, needAssignee: false, needNote: false, cta: 'تأكيد الرفض', ctaColor: '#EF4444' },
    close: { title: 'إغلاق الطلب', needReason: true, needAssignee: false, needNote: false, cta: 'إغلاق', ctaColor: '#6B7280' },
    assign: { title: 'تعيين مسؤول', needReason: false, needAssignee: true, needNote: false, cta: 'تعيين', ctaColor: '#FFC500' },
    note: { title: 'ملاحظة داخلية', needReason: false, needAssignee: false, needNote: true, cta: 'حفظ', ctaColor: '#FFC500' },
    request_info: { title: 'طلب مستندات إضافية', needReason: true, needAssignee: false, needNote: false, cta: 'إرسال', ctaColor: '#F59E0B' },
  };
  const c = CONFIG[action];

  const canSubmit =
    (!c.needReason || reason.trim().length >= 3) &&
    (!c.needAssignee || !!assignedTo) &&
    (!c.needNote || note.trim().length >= 2);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-black border border-zinc-800 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">{c.title}</h3>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {c.needReason && (
          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
              {action === 'close' ? 'سبب الإغلاق' : 'السبب'} (مطلوب)
            </label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-sm resize-none focus:outline-none focus:border-[#FFC500]"
              placeholder="اكتب سبباً واضحاً..." />
          </div>
        )}

        {c.needAssignee && (
          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">اختر المسؤول</label>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-sm focus:outline-none focus:border-[#FFC500]">
              <option value="">— اختر —</option>
              {(admins || []).map((a) => (
                <option key={a.id} value={a.id}>{a.full_name}</option>
              ))}
            </select>
          </div>
        )}

        {c.needNote && (
          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">الملاحظة (داخلية فقط)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-sm resize-none focus:outline-none focus:border-[#FFC500]"
              placeholder="لن يراها المستخدم..." />
          </div>
        )}

        {error && (
          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-2">{error}</div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-300 text-sm font-bold active:scale-95 transition disabled:opacity-50">
            إلغاء
          </button>
          <button disabled={!canSubmit || loading} onClick={() => onConfirm({ reason: reason.trim() || undefined, assignedTo: assignedTo || undefined, note: note.trim() || undefined })}
            className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-40 active:scale-95 transition"
            style={{ background: c.ctaColor, color: '#000' }}>
            {loading ? 'جاري...' : c.cta}
          </button>
        </div>
      </div>
    </div>
  );
};


export const RequestDetailsSheet: React.FC<Props> = ({ request, onClose, onUpdated }) => {
  const { request: details, userProfile, loading, reload } = useRequestDetails(request.id);
  const { apply, loading: acting } = useRequestActions();
  const data = details || request;
  const status = formatStatus(data.status);
  const type = formatType(data.type);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [pendingAction, setPendingAction] = useState<RequestAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<{ id: string; full_name: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('profiles').select('id, full_name').eq('role', 'admin').then(({ data }) => {
      setAdmins((data as any) || []);
    });
  }, []);

  const initials = useMemo(() => {
    const n = data.user_name?.trim();
    return n ? n.charAt(0) : '؟';
  }, [data.user_name]);

  const performAction = async (opts: { reason?: string; assignedTo?: string; note?: string }) => {
    if (!pendingAction) return;
    setActionError(null);
    const statusMap: Record<RequestAction, string | undefined> = {
      approve: 'approved',
      reject: 'rejected',
      close: 'closed',
      assign: undefined,
      note: undefined,
      request_info: 'pending',
    };
    // استخرج claim_id من metadata أو source_id
    const claimId = (data as any).metadata?.claim_id || (data as any).source_id || undefined;
    const requestType = (data as any).type || undefined;

    const res = await apply(request.id, pendingAction, {
      newStatus: statusMap[pendingAction],
      reason: opts.reason,
      assignedTo: opts.assignedTo,
      note: opts.note,
      claimId,
      requestType,
    });
    if (!res.ok) {
      setActionError(res.error || 'فشل الإجراء');
      return;
    }
    setPendingAction(null);
    setToast('تم تنفيذ الإجراء بنجاح');
    await reload();
    onUpdated?.();
    setTimeout(() => setToast(null), 2500);
  };

  const isClosed = ['closed', 'rejected', 'completed', 'resolved', 'cancelled'].includes(data.status || '');
  const businessName = (data as any).metadata?.business_name || '—';
  const businessId = (data as any).metadata?.business_id || data.target_id || '—';

  return (
    <>
      <div className="fixed inset-0 z-[100] flex flex-col bg-black" dir="rtl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-black border-b border-zinc-800">
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-900 active:scale-95 transition">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-bold text-white">تفاصيل الطلب</p>
          </div>
          <div className="w-9" />
        </div>

        {/* Body — بطاقة واحدة موحدة */}
        <div className="flex-1 overflow-y-auto px-3 py-4 pb-32 bg-black">
          {loading ? (
            <SkeletonCard count={2} />
          ) : (
            <div className="rounded-2xl bg-black border border-zinc-800 p-4">

              {/* شارات + رقم الطلب */}
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400">{type}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono" dir="ltr">{data.reference_number}</span>
              </div>

              <Divider />

              {/* معلومات المنشأة */}
              <SectionTitle>معلومات المنشأة</SectionTitle>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{businessName}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] text-zinc-500">معرف:</span>
                    <span className="text-[10px] font-mono text-zinc-400 truncate" dir="ltr">{String(businessId).slice(0, 24)}</span>
                    <CopyButton value={String(businessId)} label="معرف المنشأة" />
                  </div>
                </div>
              </div>

              <Divider />

              {/* بيانات مقدم الطلب */}
              <SectionTitle>بيانات مقدم الطلب</SectionTitle>
              <div className="flex flex-col items-center gap-2 mb-3">
                {data.user_avatar ? (
                  <img src={data.user_avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-zinc-800" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-zinc-900 text-[#FFC500] flex items-center justify-center font-bold text-xl border-2 border-zinc-800">
                    {initials}
                  </div>
                )}
                <p className="text-sm font-bold text-white">{data.user_name || 'مستخدم'}</p>
                <p className="text-[10px] text-zinc-500">مقدم طلب إثبات الملكية</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-zinc-500 mb-1">رقم الهاتف</p>
                  {userProfile?.phone || (data as any).metadata?.claimant_phone ? (
                    <a href={`tel:${userProfile?.phone || (data as any).metadata?.claimant_phone}`} className="flex items-center gap-1 text-xs text-white font-mono" dir="ltr">
                      <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{userProfile?.phone || (data as any).metadata?.claimant_phone}</span>
                    </a>
                  ) : <span className="text-xs text-zinc-600">—</span>}
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 mb-1">البريد الإلكتروني</p>
                  {userProfile?.email || (data as any).metadata?.claimant_email ? (
                    <a href={`mailto:${userProfile?.email || (data as any).metadata?.claimant_email}`} className="flex items-center gap-1 text-xs text-white break-all">
                      <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{userProfile?.email || (data as any).metadata?.claimant_email}</span>
                    </a>
                  ) : <span className="text-xs text-zinc-600">—</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 mt-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <Hash className="w-3 h-3 text-zinc-500 shrink-0" />
                <span className="text-[10px] font-mono text-zinc-400 truncate flex-1" dir="ltr">
                  {String(userProfile?.id || data.user_id || '—').slice(0, 24)}
                </span>
                <CopyButton value={String(userProfile?.id || data.user_id || '')} label="معرف الحساب" />
              </div>

              <Divider />

              {/* تفاصيل الطلب */}
              <SectionTitle>تفاصيل الطلب</SectionTitle>
              {data.description ? (
                <div className="text-xs text-zinc-300 leading-relaxed">{renderDescription(data.description, setViewer)}</div>
              ) : (
                <p className="text-xs text-zinc-500 text-center py-2">لا يوجد وصف إضافي</p>
              )}

              <Divider />

              {/* المرفقات */}
              <SectionTitle>المرفقات والوثائق</SectionTitle>
              {(() => {
                const meta = (data as any).metadata || {};
                const attachments = [];
                if (meta.license_url) attachments.push({ label: 'الترخيص', url: meta.license_url, icon: '📄' });
                if (meta.commercial_register_url) attachments.push({ label: 'السجل التجاري', url: meta.commercial_register_url, icon: '📄' });
                if (meta.id_card_file_url) attachments.push({ label: 'بطاقة الشخصية', url: meta.id_card_file_url, icon: '🆔' });
                if (meta.has_license && !meta.license_url) attachments.push({ label: 'الترخيص (مرفوع)', url: '#', icon: '📄' });
                
                if (attachments.length === 0) {
                  return (
                    <div className="flex items-center justify-center py-4 border-2 border-dashed border-zinc-800 rounded-xl">
                      <div className="text-center">
                        <FileText className="w-6 h-6 text-zinc-600 mx-auto mb-1" />
                        <p className="text-[10px] text-zinc-500">لا توجد مرفقات</p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-2">
                    {attachments.map((att, idx) => (
                      <a key={idx} href={att.url} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#FFC500]/50 transition">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{att.icon}</span>
                          <span className="text-xs font-bold text-white">{att.label}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#FFC500]" />
                      </a>
                    ))}
                  </div>
                );
              })()}

              <Divider />

              {/* سجل الطلب */}
              <SectionTitle>سجل الطلب</SectionTitle>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-zinc-300 flex-wrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFC500]" />
                  <span className="text-zinc-500">رقم الطلب:</span>
                  <span className="font-mono text-white" dir="ltr">{data.reference_number}</span>
                  <CopyButton value={data.reference_number} label="رقم الطلب" />
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span className="text-zinc-500">تاريخ الإنشاء:</span>
                  <span className="text-white">{new Date(data.created_at).toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span className="text-zinc-500">آخر تحديث:</span>
                  <span className="text-white">{new Date(data.updated_at || data.created_at).toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <UserCheck className="w-3 h-3 text-zinc-500" />
                  <span className="text-zinc-500">الموظف المسؤول:</span>
                  <span className="text-white">{data.assigned_to ? 'معين' : 'غير معين'}</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Action Bar */}
        {!loading && !isClosed && (
          <div className="sticky bottom-0 bg-black border-t border-zinc-800 px-3 py-3">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setPendingAction('approve')} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 active:scale-95 transition">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] font-bold">قبول</span>
              </button>
              <button onClick={() => setPendingAction('reject')} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 active:scale-95 transition">
                <XCircle className="w-5 h-5" />
                <span className="text-[10px] font-bold">رفض</span>
              </button>
              <button onClick={() => setPendingAction('request_info')} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 active:scale-95 transition">
                <MessageSquare className="w-5 h-5" />
                <span className="text-[10px] font-bold">مستندات</span>
              </button>
            </div>
          </div>
        )}

        {isClosed && (
          <div className="sticky bottom-0 bg-black border-t border-zinc-800 px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <Lock className="w-3.5 h-3.5" />
              <span>الطلب مغلق — لا يمكن تنفيذ إجراءات</span>
            </div>
          </div>
        )}
      </div>

      {viewer && <PdfViewer url={viewer.url} kind={viewer.kind} onClose={() => setViewer(null)} />}

      <ActionSheet
        action={pendingAction}
        onCancel={() => { setPendingAction(null); setActionError(null); }}
        onConfirm={performAction}
        loading={acting}
        error={actionError}
        admins={admins}
      />

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[400] px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
};
