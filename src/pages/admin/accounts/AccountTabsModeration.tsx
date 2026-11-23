import React, { useState } from 'react';
import { AccountDetailBundle } from '../../../types/adminAccountsPages';
import {
  formatDateAr,
  formatDateTimeAr,
} from '../../../components/admin/accounts-pages/SharedAdminUI';
import { AdminConfirmDialog, toArabicErrorMessage } from '../../../components/admin/accounts-pages/AndroidAdminKit';
import {
  moderateAccountRpc,
  replyAdminRequestTicket,
  replyUserSupportMessage,
  resolveReportAction,
} from '../../../services/accountsAdminService';
import { moderateAdRpc } from '../../../services/pagesAdminService';
import { Ban, PauseCircle, PlayCircle, ShieldAlert, Send } from 'lucide-react';

interface Props {
  tab: 'ads' | 'reports' | 'support' | 'logs';
  bundle: AccountDetailBundle;
  canEdit: boolean;
  onRefresh: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AccountTabsModeration: React.FC<Props> = ({
  tab,
  bundle,
  canEdit,
  onRefresh,
  onToast,
}) => {
  const { account, ads, reportsSubmitted, reportsReceived, supportTickets, moderationLogs } = bundle;
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    desc: string;
    danger?: boolean;
    requireDate?: boolean;
    action: (reason: string, dt?: string) => Promise<void>;
  } | null>(null);

  const runAction = async (fn: () => Promise<void>, okMsg: string) => {
    try {
      await fn();
      onToast(okMsg, 'success');
      await onRefresh();
    } catch (e: any) {
      onToast(toArabicErrorMessage(e, 'تعذر تنفيذ الإجراء، يرجى المحاولة مرة أخرى.'), 'error');
    }
  };

  if (tab === 'ads') {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-black text-white">الإعلانات المرتبطة بالحساب ({ads.length})</h4>
        {ads.length === 0 ? (
          <p className="text-xs text-[#71767B]">لا توجد إعلانات مرتبطة بهذا الحساب.</p>
        ) : ads.map((ad) => (
          <div key={`${ad.sourceTable}-${ad.id}`} className="p-3 rounded bg-[#0B0B0B] border border-[#2F3336] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-white">{ad.title} <span className="text-[#FFC500]">({ad.kind})</span></div>
              <div className="text-[11px] text-[#71767B]">
                الأماكن: {(ad.placements || []).join('، ') || '—'} • من {ad.start_date} إلى {ad.end_date}
              </div>
              <div className="text-[11px] text-zinc-300">
                المبلغ: {ad.budget} • المشاهدات: {ad.impressions} • النقرات: {ad.clicks} • الحالة: {ad.status}
              </div>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => setConfirmState({
                  open: true,
                  title: ad.status === 'paused' ? 'تفعيل الإعلان' : 'إيقاف الإعلان',
                  desc: 'سيتم تغيير حالة الإعلان وتوثيق السبب.',
                  danger: ad.status !== 'paused',
                  action: async (reason) => runAction(async () => {
                    await moderateAdRpc(ad.sourceTable, ad.id, ad.status === 'paused' ? 'activate' : 'pause', reason);
                    setConfirmState(null);
                  }, 'تم تحديث حالة الإعلان'),
                })}
                className="px-3 py-1.5 rounded-lg bg-black border border-[#2F3336] text-zinc-200 hover:border-white cursor-pointer"
              >
                {ad.status === 'paused' ? 'تفعيل' : 'إيقاف'}
              </button>
            )}
          </div>
        ))}
        {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireDate={(confirmState as any).requireDate} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
      </div>
    );
  }

  if (tab === 'reports') {
    const renderList = (title: string, items: any[], isReceived: boolean) => (
      <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-2.5">
        <h4 className="text-xs font-black text-white">{title} ({items.length})</h4>
        {items.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد بلاغات.</p> : items.map((r) => (
          <div key={r.id} className="p-3 rounded bg-black border border-[#2F3336] space-y-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <span className="font-bold text-white">النوع: {r.reported_item_type} • السبب: {r.reason}</span>
              <span className="text-[11px] text-[#FFC500]">{r.status}</span>
            </div>
            {r.details && <p className="text-zinc-300 text-[11px]">{r.details}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#71767B]">
              <span>تاريخ البلاغ: {formatDateTimeAr(r.created_at)}</span>
              {canEdit && isReceived && r.status !== 'resolved' && r.status !== 'dismissed' && (
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setConfirmState({
                    open: true, title: 'معالجة البلاغ واعتماد القرار', desc: 'اكتب قرار الإدارة وملاحظاتها حول البلاغ.',
                    action: async (reason) => runAction(async () => { await resolveReportAction(r.id, 'resolved', reason); setConfirmState(null); }, 'تمت معالجة البلاغ'),
                  })} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold cursor-pointer">معالجة</button>
                  <button type="button" onClick={() => setConfirmState({
                    open: true, title: 'رفض / تجاهل البلاغ', desc: 'اكتب سبب رفض أو إغلاق البلاغ.',
                    action: async (reason) => runAction(async () => { await resolveReportAction(r.id, 'dismissed', reason); setConfirmState(null); }, 'تم إغلاق البلاغ'),
                  })} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-bold cursor-pointer">إغلاق</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
    return (
      <div className="space-y-4">
        {renderList('البلاغات الواردة على الحساب', reportsReceived, true)}
        {renderList('البلاغات المقدمة من الحساب', reportsSubmitted, false)}
        {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireDate={(confirmState as any).requireDate} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
      </div>
    );
  }

  if (tab === 'support') {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-black text-white">طلبات الدعم والشكاوى ({supportTickets.length})</h4>
        {supportTickets.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد طلبات دعم لهذا الحساب.</p> : supportTickets.map((t) => (
          <div key={t.id} className="p-3.5 rounded bg-[#0B0B0B] border border-[#2F3336] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#FFC500]">{t.source === 'admin_requests' ? 'طلب نظام موحد' : 'رسالة دعم'}</span>
              <span className="text-[11px] text-zinc-300">{t.status || 'pending'} • {formatDateTimeAr(t.created_at)}</span>
            </div>
            <p className="text-zinc-200 whitespace-pre-wrap">{t.message}</p>
            {t.reply && (
              <div className="p-2.5 rounded bg-black border border-emerald-500/30 text-emerald-300 text-[11px]">
                <strong>الرد:</strong> {t.reply} {t.replied_at ? `(${formatDateAr(t.replied_at)})` : ''}
              </div>
            )}
            {canEdit && (t.source === 'user_support_messages' || t.source === 'admin_requests') && (
              <div className="flex flex-wrap gap-2 pt-1">
                <input
                  value={replyDrafts[t.id] || ''}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  placeholder={t.source === 'admin_requests' ? 'اكتب رداً أو ملاحظة للطلب الموحد...' : 'اكتب رداً للمستخدم...'}
                  className="flex-1 min-w-[180px] bg-black border border-[#2F3336] focus:border-white rounded px-3 py-1.5 text-white outline-none caret-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const txt = replyDrafts[t.id] || '';
                    if (!txt.trim()) return;
                    runAction(async () => {
                      if (t.source === 'admin_requests') {
                        await replyAdminRequestTicket(t.id, txt, false);
                      } else {
                        await replyUserSupportMessage(t.id, txt);
                      }
                      setReplyDrafts((p) => ({ ...p, [t.id]: '' }));
                    }, 'تم إرسال الرد بنجاح');
                  }}
                  className="px-3 py-1.5 rounded bg-[#FFC500] text-black font-black flex items-center gap-1 cursor-pointer"
                >
                  <Send size={13} /><span>رد</span>
                </button>
                {t.source === 'admin_requests' && t.status !== 'closed' && (
                  <button
                    type="button"
                    onClick={() => {
                      const txt = replyDrafts[t.id] || 'تمت معالجة الطلب وإغلاقه';
                      runAction(async () => {
                        await replyAdminRequestTicket(t.id, txt, true);
                        setReplyDrafts((p) => ({ ...p, [t.id]: '' }));
                      }, 'تم رد وإغلاق الطلب');
                    }}
                    className="px-3 py-1.5 rounded bg-zinc-800 text-white font-bold cursor-pointer"
                  >
                    إغلاق الطلب
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  const actBtn = (label: string, action: any, title: string, desc: string, danger?: boolean, requireDate?: boolean) => (
    <button
      type="button"
      onClick={() => setConfirmState({
        open: true, title, desc, danger, requireDate,
        action: async (reason, dt) => runAction(async () => {
          await moderateAccountRpc({ userId: account.id, action, reason, suspendedUntil: dt ? new Date(dt).toISOString() : null });
          setConfirmState(null);
        }, `تم تنفيذ الإجراء: ${label}`),
      })}
      className={`px-3 py-1.5 rounded text-xs font-bold border cursor-pointer ${danger ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-[#111] text-white border-[#2F3336] hover:border-white'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-3">
          <h4 className="text-xs font-black text-[#FFC500] flex items-center gap-1.5"><ShieldAlert size={15} /> أدوات الرقابة والإجراءات الإدارية</h4>
          <div className="flex flex-wrap gap-2">
            {actBtn('توجيه تحذير', 'warn', 'توجيه تحذير إداري', 'سيُحفظ التحذير في سجل مخالفات الحساب.')}
            {actBtn('تقييد النشر', 'restrict_posting', 'تقييد النشر', 'سيُمنع الحساب من نشر منشورات جديدة.', true)}
            {actBtn('تقييد التفاعلات', 'restrict_interactions', 'تقييد التفاعلات', 'سيُمنع الحساب من التعليق والتفاعل.', true)}
            {actBtn('إيقاف مؤقت', 'suspend', 'إيقاف الحساب مؤقتاً', 'سيتم إيقاف الحساب مؤقتاً مع إمكانية تحديد تاريخ انتهاء.', true, true)}
            {actBtn('حظر الحساب', 'ban', 'حظر الحساب نهائياً', 'سيتم حظر الحساب ومنعه من الدخول. لن تُحذف صفحاته تلقائياً.', true)}
            {account.moderation_status !== 'active' && actBtn('رفع الإيقاف / إعادة تفعيل', 'activate', 'إعادة تفعيل الحساب', 'سيعود الحساب نشطاً بكامل صلاحياته.')}
          </div>
          {account.restriction_reason && <p className="text-[11px] text-amber-400">سبب التقييد/الإيقاف الحالي: {account.restriction_reason}</p>}
        </div>
      )}

      <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-2.5">
        <h4 className="text-xs font-black text-white">سجل المخالفات والإجراءات الإدارية ({moderationLogs.length})</h4>
        {moderationLogs.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد إجراءات مسجلة لهذا الحساب.</p> : moderationLogs.map((log) => (
          <div key={log.id} className="p-3 rounded bg-black border border-[#2F3336] text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#FFC500]">{log.action_type}</span>
              <span className="text-[10px] text-[#71767B]">{formatDateTimeAr(log.created_at)}</span>
            </div>
            <p className="text-zinc-200">السبب: {log.reason}</p>
            <p className="text-[10px] text-[#71767B]">بواسطة: {log.actor_name} ({log.actor_email || '—'})</p>
          </div>
        ))}
      </div>
      {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireDate={(confirmState as any).requireDate} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
    </div>
  );
};
