import React, { useMemo, useState, useEffect } from 'react';
import {
  X, Clock, User, FileText, ExternalLink, AlertCircle, Download,
  CheckCircle2, XCircle, Lock, UserPlus, StickyNote, MessageSquare,
  Phone, Mail, AtSign, BadgeCheck,
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useRequestDetails } from '../hooks/useRequestDetails';
import { useRequestActions, RequestAction } from '../hooks/useRequestActions';
import { SkeletonCard } from './SkeletonCard';
import { formatStatus, formatPriority, formatType } from '../i18n';
import { timeAgo } from '../types';
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

const PdfViewer: React.FC<ViewerState & { onClose: () => void }> = ({ url, kind, onClose }) => {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth - 24 : 360
  );
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black" dir="rtl">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-black/95 backdrop-blur border-b border-[#2A2B30]">
        <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1F2024]">
          <X className="w-4 h-4 text-white" />
        </button>
        <p className="text-sm font-bold text-white">معاينة الملف</p>
        <a href={url} target="_blank" rel="noreferrer" download
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFC500]/15 text-[#FFC500]">
          <Download className="w-4 h-4" />
        </a>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#0F1012] px-3 py-3">
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
    request_info: { title: 'طلب معلومات إضافية', needReason: true, needAssignee: false, needNote: false, cta: 'إرسال الطلب', ctaColor: '#F59E0B' },
  };
  const c = CONFIG[action];

  const canSubmit =
    (!c.needReason || reason.trim().length >= 3) &&
    (!c.needAssignee || !!assignedTo) &&
    (!c.needNote || note.trim().length >= 2);

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/80" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-t-3xl bg-[#0A0A0B] border-t border-[#2A2B30] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">{c.title}</h3>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1F2024]">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {c.needReason && (
          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">
              {action === 'close' ? 'سبب الإغلاق' : 'السبب'} (مطلوب)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-white text-sm resize-none focus:outline-none focus:border-[#FFC500]"
              placeholder="اكتب سبباً واضحاً..."
            />
          </div>
        )}

        {c.needAssignee && (
          <div>
            <label className="text-[11px] font-bold text-zinc-400 block mb-1">اختر المسؤول</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-white text-sm focus:outline-none focus:border-[#FFC500]"
            >
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
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-[#0F1012] border border-[#2A2B30] text-white text-sm resize-none focus:outline-none focus:border-[#FFC500]"
              placeholder="لن يراها المستخدم..."
            />
          </div>
        )}

        {error && (
          <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-2">
            {error}
          </div>
        )}

        <button
          disabled={!canSubmit || loading}
          onClick={() => onConfirm({ reason: reason.trim() || undefined, assignedTo: assignedTo || undefined, note: note.trim() || undefined })}
          className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition"
          style={{ background: c.ctaColor, color: '#000' }}
        >
          {loading ? 'جاري...' : c.cta}
        </button>
      </div>
    </div>
  );
};

export const RequestDetailsSheet: React.FC<Props> = ({ request, onClose, onUpdated }) => {
  const { request: details, userProfile, loading, reload } = useRequestDetails(request.id);
  const { apply, loading: acting } = useRequestActions();
  const data = details || request;
  const status = formatStatus(data.status);
  const priority = formatPriority(data.priority);
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
    const res = await apply(request.id, pendingAction, {
      newStatus: statusMap[pendingAction],
      reason: opts.reason,
      assignedTo: opts.assignedTo,
      note: opts.note,
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

  return (
    <>
      <div className="fixed inset-0 z-[100] flex flex-col bg-black" dir="rtl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-black/95 backdrop-blur border-b border-[#2A2B30]">
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1F2024] active:scale-95 transition">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-bold text-white">تفاصيل الطلب</p>
            <p className="text-[10px] font-mono text-zinc-500" dir="ltr">{data.reference_number}</p>
          </div>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
          {loading ? (
            <SkeletonCard count={2} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#1D9BF0]/15 text-[#1D9BF0]">{type}</span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${priority.color}`}>{priority.label}</span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white mb-1">{data.title}</h2>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>تم الإنشاء {timeAgo(data.created_at)}</span>
                </div>
              </div>

              {data.description && (
                <div className="p-3 rounded-xl bg-[#0F1012] border border-[#2A2B30]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">الوصف والمرفقات</p>
                  </div>
                  <div className="space-y-0.5">{renderDescription(data.description, setViewer)}</div>
                </div>
              )}

              {data.rejection_reason && (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <p className="text-[11px] font-bold text-red-400 mb-1">سبب الرفض</p>
                  <p className="text-xs text-zinc-300">{data.rejection_reason}</p>
                </div>
              )}

              {data.internal_notes && (
                <div className="p-3 rounded-xl bg-[#FFC500]/5 border border-[#FFC500]/20">
                  <p className="text-[11px] font-bold text-[#FFC500] mb-1">ملاحظات داخلية</p>
                  <p className="text-xs text-zinc-300 whitespace-pre-wrap">{data.internal_notes}</p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#0F1012] border border-[#2A2B30]">
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">مقدم الطلب</p>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  {data.user_avatar ? (
                    <img src={data.user_avatar} alt="" className="w-10 h-10 rounded-full object-cover bg-[#1F2024]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FFC500]/15 text-[#FFC500] flex items-center justify-center font-bold text-base">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold text-white truncate">{data.user_name || 'مستخدم'}</p>
                      {userProfile?.is_verified && (
                        <BadgeCheck className="w-4 h-4 text-[#1D9BF0] shrink-0" />
                      )}
                    </div>
                    {userProfile?.username && (
                      <p className="text-[11px] text-zinc-500" dir="ltr">@{userProfile.username}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#2A2B30]">
                  {userProfile?.phone && (
                    <a href={`tel:${userProfile.phone}`} className="flex items-center gap-2 text-xs text-zinc-300">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span dir="ltr">{userProfile.phone}</span>
                    </a>
                  )}
                  {userProfile?.email && (
                    <a href={`mailto:${userProfile.email}`} className="flex items-center gap-2 text-xs text-zinc-300">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span dir="ltr">{userProfile.email}</span>
                    </a>
                  )}
                  {!userProfile?.phone && !userProfile?.email && (
                    <p className="text-[11px] text-zinc-500 text-center py-1">لا توجد بيانات تواصل متاحة</p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <AtSign className="w-3.5 h-3.5" />
                    <span className="font-mono" dir="ltr">
                      {(userProfile?.id || data.user_id || data.target_id || '—').slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && !isClosed && (
          <div className="sticky bottom-0 bg-black/95 backdrop-blur border-t border-[#2A2B30] px-3 py-3">
            <div className="grid grid-cols-5 gap-2">
              <ActionBtn icon={CheckCircle2} label="قبول" color="#22C55E" onClick={() => setPendingAction('approve')} />
              <ActionBtn icon={XCircle} label="رفض" color="#EF4444" onClick={() => setPendingAction('reject')} />
              <ActionBtn icon={MessageSquare} label="معلومات" color="#F59E0B" onClick={() => setPendingAction('request_info')} />
              <ActionBtn icon={UserPlus} label="تعيين" color="#FFC500" onClick={() => setPendingAction('assign')} />
              <ActionBtn icon={StickyNote} label="ملاحظة" color="#9CA3AF" onClick={() => setPendingAction('note')} />
            </div>
          </div>
        )}

        {isClosed && (
          <div className="sticky bottom-0 bg-black/95 backdrop-blur border-t border-[#2A2B30] px-4 py-3">
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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[400] px-4 py-2 rounded-xl bg-[#22C55E] text-black text-xs font-bold shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
};

const ActionBtn: React.FC<{ icon: React.ElementType; label: string; color: string; onClick: () => void }> = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-[#0F1012] border border-[#2A2B30] active:scale-95 transition"
    style={{ color }}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);
