import React, { useState } from 'react';
import { PageDetailBundle } from '../../../types/adminAccountsPages';
import {
  BadgePill,
  formatDateAr,
  formatDateTimeAr,
  SubCyclePill,
  SubStatusPill,
} from '../../../components/admin/accounts-pages/SharedAdminUI';
import { AdminConfirmDialog, AdminSelect, toArabicErrorMessage } from '../../../components/admin/accounts-pages/AndroidAdminKit';
import {
  moderateAdRpc,
  moderatePageRpc,
  moderateReviewRpc,
  verifyPageRpc,
  replyBusinessSupportMessage,
} from '../../../services/pagesAdminService';
import { manageSubscriptionRpc, resolveReportAction } from '../../../services/accountsAdminService';
import { AlertTriangle, Eye, EyeOff, Send, ShieldCheck, Star } from 'lucide-react';

interface Props {
  tab: 'reviews' | 'verification' | 'subscriptions' | 'ads' | 'reports_support' | 'logs';
  bundle: PageDetailBundle;
  canEdit: boolean;
  onRefresh: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PageTabsBusinessOps: React.FC<Props> = ({ tab, bundle, canEdit, onRefresh, onToast }) => {
  const { page, verifierProfile, reviews, ratingDistribution, subscriptions, payments, ads, reports, supportTickets, moderationLogs, plans } = bundle;
  const [badgeChoice, setBadgeChoice] = useState<'gold' | 'silver' | 'blue' | 'none'>(
    page.badge_type === 'gray' ? 'silver' : page.badge_type
  );
  const [badgeExpires, setBadgeExpires] = useState(page.verification_expires_at ? page.verification_expires_at.slice(0, 10) : '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [subDays, setSubDays] = useState<number>(30);
  const [supportReplyText, setSupportReplyText] = useState('');
  const [confirmState, setConfirmState] = useState<{
    open: boolean; title: string; desc: string; danger?: boolean; action: (reason: string) => Promise<void>;
  } | null>(null);

  const runAction = async (fn: () => Promise<void>, okMsg: string) => {
    try { await fn(); onToast(okMsg, 'success'); await onRefresh(); }
    catch (e: any) { onToast(toArabicErrorMessage(e, 'تعذر تنفيذ الإجراء، يرجى المحاولة مرة أخرى.'), 'error'); }
  };

  if (tab === 'reviews') {
    const totalRev = reviews.length || 1;
    return (
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#181B20] border border-[#2A2E35] rounded p-4">
          <div className="flex flex-col justify-center items-center text-center p-3">
            <div className="text-3xl font-black text-[#FFC500] flex items-center gap-1.5"><Star size={24} className="fill-[#FFC500]" />{page.avg_rating}</div>
            <div className="text-[#71767B] mt-1">متوسط التقييم من {page.reviews_count} مراجعة</div>
            <div className="text-[10px] text-zinc-400 mt-2">سياسة التدقيق: لا يتم تعديل نص أو نجوم أي تقييم؛ الإخفاء يتم بتوثيق السبب فقط.</div>
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((st) => {
              const cnt = ratingDistribution[st] || 0;
              const pct = Math.round((cnt / totalRev) * 100);
              return (
                <div key={st} className="flex items-center gap-2">
                  <span className="w-8 text-right">{st} ★</span>
                  <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-[#2F3336]">
                    <div className="h-full bg-[#FFC500]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-left text-[#71767B]">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-2.5">
          {reviews.length === 0 ? <p className="text-[#71767B]">لا توجد تقييمات.</p> : reviews.map((r) => (
            <div key={r.id} className={`p-3 rounded border space-y-1.5 ${r.is_hidden ? 'bg-rose-950/20 border-rose-500/30' : 'bg-[#0B0B0B] border-[#2F3336]'}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{r.user_name || 'مقيم'} — <span className="text-[#FFC500]">{r.stars} ★</span></span>
                <span className="text-[10px] text-[#71767B]">{formatDateTimeAr(r.created_at)}</span>
              </div>
              <p className="text-zinc-200">{r.comment}</p>
              {r.owner_reply && <div className="p-2 rounded bg-[#14171C] border border-[#2A2E35] text-[11px] text-emerald-300">رد المنشأة: {r.owner_reply}</div>}
              {r.is_hidden && <p className="text-[11px] text-rose-400">مخفي إدارياً — السبب: {r.moderation_reason || '—'}</p>}
              {canEdit && (
                <button type="button" onClick={() => setConfirmState({
                  open: true, title: r.is_hidden ? 'استعادة التقييم' : 'إخفاء تقييم مخالف', desc: 'لن يُعدل التقييم نفسه؛ سيُسجل سبب التدخل الإداري فقط.', danger: !r.is_hidden,
                  action: async (reason) => runAction(async () => { await moderateReviewRpc(r.id, !r.is_hidden, reason); setConfirmState(null); }, 'تم تحديث حالة التقييم'),
                })} className="px-2.5 py-1 rounded bg-[#14171C] border border-[#2A2E35] text-zinc-300 flex items-center gap-1 cursor-pointer">
                  {r.is_hidden ? <Eye size={12} /> : <EyeOff size={12} />}<span>{r.is_hidden ? 'استعادة' : 'إخفاء بتوثيق'}</span>
                </button>
              )}
            </div>
          ))}
        </div>
        {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
      </div>
    );
  }

  if (tab === 'verification') {
    return (
      <div className="space-y-4 text-xs">
        <div className="bg-[#181B20] border border-[#2A2E35] rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-black text-[#FFC500] flex items-center gap-1.5"><ShieldCheck size={15} /> حالة توثيق الصفحة</h4>
            <div className="flex justify-between"><span className="text-[#71767B]">الشارة الحالية:</span><BadgePill badge={page.badge_type} /></div>
            <div className="flex justify-between"><span className="text-[#71767B]">تاريخ المنح:</span><span>{formatDateTimeAr(page.verified_at)}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">تاريخ الانتهاء:</span><span>{formatDateAr(page.verification_expires_at)}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">سبب الاعتماد:</span><span>{page.verification_reason || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">الموظف المسؤول:</span><span>{verifierProfile?.full_name || '—'}</span></div>
          </div>
          {canEdit && (
            <div className="space-y-3">
              <h4 className="font-black text-white">منح / سحب / تجديد التوثيق</h4>
              <div className="grid grid-cols-2 gap-2">
                <AdminSelect
                  title="شارة التوثيق"
                  value={badgeChoice}
                  onChange={(v) => setBadgeChoice(v as any)}
                  options={[
                    { value: 'gold', label: 'ذهبي (للمنشآت والشركات)' },
                    { value: 'silver', label: 'فضي (لصفحات رجال الأعمال)' },
                    { value: 'none', label: 'بدون (سحب التوثيق)' },
                  ]}
                />
                <input type="date" value={badgeExpires} onChange={(e) => setBadgeExpires(e.target.value)} className="bg-[#14171C] border border-[#2F343D] focus:border-white rounded px-3 py-2 text-white outline-none caret-white" />
              </div>
              <button type="button" onClick={() => setConfirmState({
                open: true, title: badgeChoice === 'none' ? 'سحب توثيق الصفحة' : 'اعتماد توثيق الصفحة', desc: 'تُمنح الشارة وفق شروط الأهلية والاعتماد وليس لمجرد الاشتراك.', danger: badgeChoice === 'none',
                action: async (reason) => runAction(async () => {
                  await verifyPageRpc({ businessId: page.id, badgeType: badgeChoice, reason, expiresAt: badgeExpires ? new Date(badgeExpires).toISOString() : null });
                  setConfirmState(null);
                }, 'تم تحديث توثيق الصفحة'),
              })} className="px-4 py-2 rounded bg-[#FFC500] text-black font-black cursor-pointer">حفظ قرار التوثيق</button>
            </div>
          )}
        </div>
        {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
      </div>
    );
  }

  if (tab === 'subscriptions') {
    const expiringSoon = subscriptions.some((s) => s.status === 'ACTIVE' && s.end_date && (new Date(s.end_date).getTime() - Date.now()) > 0 && (new Date(s.end_date).getTime() - Date.now()) <= 7 * 86400000);
    return (
      <div className="space-y-4 text-xs">
        {expiringSoon && (
          <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2"><AlertTriangle size={15} /><span>تنبيه: اشتراك قريب من الانتهاء خلال 7 أيام!</span></div>
        )}
        {canEdit && (
          <div className="bg-[#181B20] border border-[#2A2E35] rounded p-4 space-y-2.5">
            <h4 className="font-black text-[#FFC500]">تفعيل اشتراك للصفحة</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <AdminSelect
                title="اختر الباقة"
                value={selectedPlanId}
                onChange={setSelectedPlanId}
                options={[
                  { value: '', label: 'اختر الباقة' },
                  ...plans.map((pl) => ({ value: pl.id, label: `${pl.name} (${pl.price} ${pl.currency})` })),
                ]}
              />
              <AdminSelect
                title="مدة الاشتراك"
                value={String(subDays)}
                onChange={(v) => setSubDays(Number(v))}
                options={[
                  { value: '30', label: 'شهري (30 يوماً)' },
                  { value: '365', label: 'سنوي (365 يوماً)' },
                ]}
              />
              <button type="button" onClick={() => setConfirmState({
                open: true, title: 'تفعيل اشتراك الصفحة', desc: 'سيتم ربط الاشتراك بالصفحة وتسجيل السبب.',
                action: async (reason) => runAction(async () => {
                  await manageSubscriptionRpc({ action: 'activate', reason, businessId: page.id, userId: page.owner_id, planId: selectedPlanId || null, durationDays: subDays });
                  setConfirmState(null);
                }, 'تم تفعيل اشتراك الصفحة'),
              })} className="px-4 py-2 rounded bg-[#FFC500] text-black font-black cursor-pointer">تفعيل</button>
            </div>
          </div>
        )}
        <div className="bg-[#181B20] border border-[#2A2E35] rounded p-4 space-y-2">
          <h4 className="font-black text-white">سجل اشتراكات الصفحة والمالك ({subscriptions.length}) • الإيصالات ({payments.length})</h4>
          {subscriptions.length === 0 ? <p className="text-[#71767B]">لا توجد اشتراكات.</p> : subscriptions.map((s) => (
            <div key={s.id} className="p-2.5 rounded bg-[#14171C] border border-[#2A2E35] flex flex-wrap justify-between items-center gap-2">
              <div>
                <div className="flex items-center gap-2"><span className="font-bold">{s.plan?.name || 'باقة'}</span><SubCyclePill cycle={s.billing_cycle === 'yearly' ? 'yearly' : 'monthly'} /><SubStatusPill status={String(s.status || '').toLowerCase() as any} /></div>
                <div className="text-[11px] text-[#71767B]">{formatDateAr(s.start_date)} إلى {formatDateAr(s.end_date)} • {s.amount_paid || 0} {s.plan?.currency || 'YER'}</div>
              </div>
              {canEdit && s.status === 'ACTIVE' && (
                <button type="button" onClick={() => setConfirmState({
                  open: true, title: 'إيقاف اشتراك الصفحة', desc: 'اكتب سبب إيقاف الاشتراك.', danger: true,
                  action: async (reason) => runAction(async () => { await manageSubscriptionRpc({ action: 'cancel', reason, subscriptionId: s.id, businessId: page.id }); setConfirmState(null); }, 'تم إيقاف الاشتراك'),
                })} className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-400 font-bold cursor-pointer">إيقاف</button>
              )}
            </div>
          ))}
        </div>
        {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
      </div>
    );
  }

  if (tab === 'ads') {
    return (
      <div className="space-y-3 text-xs">
        <h4 className="font-black text-white">إعلانات وحملات الصفحة ({ads.length})</h4>
        {ads.length === 0 ? <p className="text-[#71767B]">لا توجد إعلانات مرتبطة بهذه الصفحة.</p> : ads.map((ad) => (
          <div key={`${ad.sourceTable}-${ad.id}`} className="p-3 rounded bg-[#14171C] border border-[#2A2E35] flex flex-wrap justify-between items-center gap-2">
            <div className="space-y-1">
              <div className="font-bold text-white">{ad.title} <span className="text-[#FFC500]">({ad.kind})</span></div>
              <div className="text-[11px] text-[#71767B]">الأماكن: {(ad.placements || []).join('، ') || '—'} • {ad.start_date} إلى {ad.end_date}</div>
              <div className="text-[11px] text-zinc-300">المبلغ: {ad.budget} • المشاهدات: {ad.impressions} • النقرات: {ad.clicks} • الحالة: {ad.status}</div>
            </div>
            {canEdit && (
              <button type="button" onClick={() => setConfirmState({
                open: true, title: ad.status === 'paused' ? 'تفعيل الإعلان' : 'إيقاف إعلان الصفحة', desc: 'سيتم تغيير حالة الإعلان وتوثيق القرار.', danger: ad.status !== 'paused',
                action: async (reason) => runAction(async () => { await moderateAdRpc(ad.sourceTable, ad.id, ad.status === 'paused' ? 'activate' : 'pause', reason); setConfirmState(null); }, 'تم تحديث الإعلان'),
              })} className="px-3 py-1.5 rounded bg-[#14171C] border border-[#2A2E35] text-zinc-200 cursor-pointer">{ad.status === 'paused' ? 'تفعيل' : 'إيقاف'}</button>
            )}
          </div>
        ))}
        {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
      </div>
    );
  }

  if (tab === 'reports_support') {
    return (
      <div className="space-y-4 text-xs">
        <div className="bg-[#181B20] border border-[#2A2E35] rounded p-4 space-y-2">
          <h4 className="font-black text-white">البلاغات المرتبطة بالصفحة ({reports.length})</h4>
          {reports.length === 0 ? <p className="text-[#71767B]">لا توجد بلاغات.</p> : reports.map((r) => (
            <div key={r.id} className="p-3 rounded bg-[#14171C] border border-[#2A2E35] space-y-1">
              <div className="flex justify-between"><span className="font-bold">{r.reported_item_type} • {r.reason}</span><span className="text-[#FFC500]">{r.status}</span></div>
              {r.details && <p className="text-zinc-300">{r.details}</p>}
              {canEdit && r.status !== 'resolved' && r.status !== 'dismissed' && (
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setConfirmState({
                    open: true, title: 'معالجة البلاغ', desc: 'أدخل قرار الإدارة.',
                    action: async (reason) => runAction(async () => { await resolveReportAction(r.id, 'resolved', reason); setConfirmState(null); }, 'تمت معالجة البلاغ'),
                  })} className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 font-bold cursor-pointer">معالجة</button>
                  <button type="button" onClick={() => setConfirmState({
                    open: true, title: 'إغلاق / تجاهل البلاغ', desc: 'أدخل سبب إغلاق أو رفض البلاغ.',
                    action: async (reason) => runAction(async () => { await resolveReportAction(r.id, 'dismissed', reason); setConfirmState(null); }, 'تم إغلاق البلاغ'),
                  })} className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-bold cursor-pointer">إغلاق</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="bg-[#181B20] border border-[#2A2E35] rounded p-4 space-y-2">
          <h4 className="font-black text-white">طلبات ورسائل الدعم ({supportTickets.length})</h4>
          {canEdit && (
            <div className="flex gap-2">
              <input
                value={supportReplyText}
                onChange={(e) => setSupportReplyText(e.target.value)}
                placeholder="اكتب رداً إدارياً على دعم الصفحة..."
                className="flex-1 bg-[#14171C] border border-[#2F343D] focus:border-white rounded px-3 py-2 text-white outline-none caret-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!supportReplyText.trim()) return;
                  runAction(async () => {
                    await replyBusinessSupportMessage(page.id, supportReplyText);
                    setSupportReplyText('');
                  }, 'تم إرسال الرد على دعم الصفحة');
                }}
                className="px-3 py-2 rounded bg-[#FFC500] text-black font-black flex items-center gap-1 cursor-pointer"
              >
                <Send size={13} /><span>إرسال</span>
              </button>
            </div>
          )}
          {supportTickets.length === 0 ? <p className="text-[#71767B]">لا توجد رسائل دعم.</p> : supportTickets.map((m) => (
            <div key={m.id} className="p-2.5 rounded bg-[#14171C] border border-[#2A2E35] space-y-1">
              <div className="flex justify-between text-[#FFC500]"><span>{m.sender_name || m.sender}</span><span>{formatDateTimeAr(m.created_at)}</span></div>
              <p className="text-zinc-200">{m.text}</p>
            </div>
          ))}
        </div>
        {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
      </div>
    );
  }

  const act = (label: string, action: any, title: string, desc: string, danger?: boolean) => (
    <button type="button" onClick={() => setConfirmState({
      open: true, title, desc, danger,
      action: async (reason) => runAction(async () => { await moderatePageRpc({ businessId: page.id, action, reason }); setConfirmState(null); }, `تم تنفيذ: ${label}`),
    })} className={`px-3 py-1.5 rounded text-xs font-bold border cursor-pointer ${danger ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-[#111] text-white border-[#2F3336] hover:border-white'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-4 text-xs">
      {canEdit && (
        <div className="bg-[#181B20] border border-[#2A2E35] rounded p-4 space-y-3">
          <h4 className="font-black text-[#FFC500]">أدوات التحكم بحالة الصفحة</h4>
          <div className="flex flex-wrap gap-2">
            {page.status !== 'hidden' && act('إخفاء الصفحة مؤقتاً', 'hide', 'إخفاء الصفحة مؤقتاً', 'ستُخفى الصفحة من الظهور العام مع بقاء بياناتها.')}
            {page.status === 'hidden' && act('إظهار الصفحة', 'unhide', 'إلغاء إخفاء الصفحة', 'ستعود الصفحة للظهور العام.')}
            {page.status !== 'suspended' && act('إيقاف الصفحة', 'suspend', 'إيقاف الصفحة إدارياً', 'سيتم إيقاف الصفحة وتسجيل السبب.', true)}
            {page.status !== 'pending' && act('تعليق للمراجعة', 'pending', 'تعيين الصفحة كمعلقة', 'ستُحوّل الصفحة إلى حالة معلقة للمراجعة.')}
            {page.status !== 'active' && act('إعادة تفعيل الصفحة', 'activate', 'إعادة تفعيل الصفحة', 'ستعود الصفحة نشطة.')}
          </div>
          {page.suspension_reason && <p className="text-amber-400">سبب الإيقاف الحالي: {page.suspension_reason}</p>}
        </div>
      )}
      <div className="bg-[#181B20] border border-[#2A2E35] rounded p-4 space-y-2">
        <h4 className="font-black text-white">سجل الإدارة والتغييرات ({moderationLogs.length})</h4>
        {moderationLogs.length === 0 ? <p className="text-[#71767B]">لا توجد إجراءات مسجلة لهذه الصفحة.</p> : moderationLogs.map((l) => (
          <div key={l.id} className="p-2.5 rounded bg-[#14171C] border border-[#2A2E35] space-y-1">
            <div className="flex justify-between"><span className="font-bold text-[#FFC500]">{l.action_type}</span><span className="text-[10px] text-[#71767B]">{formatDateTimeAr(l.created_at)}</span></div>
            <p className="text-zinc-200">السبب: {l.reason}</p>
            <p className="text-[10px] text-[#71767B]">الموظف: {l.actor_name} ({l.actor_email || '—'})</p>
          </div>
        ))}
      </div>
      {confirmState && <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />}
    </div>
  );
};
