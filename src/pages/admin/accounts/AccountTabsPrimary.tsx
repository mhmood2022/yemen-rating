import React, { useState } from 'react';
import {
  AccountDetailBundle,
  ProfileKind,
} from '../../../types/adminAccountsPages';
import {
  AccountKindPill,
  AccountStatusPill,
  BadgePill,
  formatDateAr,
  formatDateTimeAr,
  SubCyclePill,
  SubStatusPill,
} from '../../../components/admin/accounts-pages/SharedAdminUI';
import { AdminButton, AdminConfirmDialog, AdminSelect, toArabicErrorMessage } from '../../../components/admin/accounts-pages/AndroidAdminKit';
import {
  manageSubscriptionRpc,
  maskEmail,
  maskPhone,
  moderateAccountRpc,
  moderatePostRpc,
  verifyAccountRpc,
} from '../../../services/accountsAdminService';
import { managePageAdminRpc, unlinkPageOwner } from '../../../services/pagesAdminService';
import { Building2, Eye, EyeOff, AlertTriangle, ExternalLink, ShieldCheck, Unlink } from 'lucide-react';

interface Props {
  tab: 'info' | 'activity' | 'verification' | 'subscriptions';
  bundle: AccountDetailBundle;
  canEdit: boolean;
  canViewPrivate: boolean;
  onRefresh: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AccountTabsPrimary: React.FC<Props> = ({
  tab,
  bundle,
  canEdit,
  canViewPrivate,
  onRefresh,
  onToast,
}) => {
  const { account, verifierProfile, ownedPages, managedPages, posts, comments, likesCountGiven, reposts, followers, following, subscriptions, payments, paymentProofs, plans } = bundle;

  const [fullName, setFullName] = useState(account.full_name);
  const [phone, setPhone] = useState(account.phone);
  const [city, setCity] = useState(account.city || '');
  const [bio, setBio] = useState(account.bio || '');
  const [profileKind, setProfileKind] = useState<ProfileKind>(account.profile_kind);

  const [badgeChoice, setBadgeChoice] = useState<'blue' | 'silver' | 'gold' | 'none'>(
    account.badge_type === 'gray' ? 'silver' : account.badge_type
  );
  const [badgeExpires, setBadgeExpires] = useState(
    account.verification_expires_at ? account.verification_expires_at.slice(0, 10) : ''
  );

  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [subDays, setSubDays] = useState<number>(30);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    desc: string;
    danger?: boolean;
    action: (reason: string) => Promise<void>;
  } | null>(null);

  const runAction = async (fn: () => Promise<void>, successMsg: string) => {
    try {
      await fn();
      onToast(successMsg, 'success');
      await onRefresh();
    } catch (e: any) {
      onToast(toArabicErrorMessage(e, 'تعذر تنفيذ الإجراء، يرجى المحاولة مرة أخرى.'), 'error');
    }
  };

  if (tab === 'info') {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0B0B0B] border border-[#2F3336] rounded p-4">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#71767B]">المعرف الداخلي:</span><span className="font-mono text-zinc-300">{account.id}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">اسم المستخدم:</span><span className="text-white font-bold" dir="ltr">@{account.username}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">البريد الإلكتروني:</span><span className="text-zinc-200">{maskEmail(account.email, canViewPrivate)}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">رقم الهاتف:</span><span className="text-zinc-200" dir="ltr">{maskPhone(account.phone, canViewPrivate)}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">تاريخ التسجيل:</span><span className="text-zinc-300">{formatDateTimeAr(account.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">آخر نشاط متاح:</span><span className="text-zinc-300">{formatDateTimeAr(account.last_activity_at)}</span></div>
            <div className="flex justify-between items-center"><span className="text-[#71767B]">نوع الحساب:</span><AccountKindPill kind={account.profile_kind} /></div>
            <div className="flex justify-between items-center"><span className="text-[#71767B]">حالة الرقابة:</span><AccountStatusPill status={account.moderation_status} /></div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FFC500]">تعديل البيانات المصرح بها ونوع الحساب</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] text-[#71767B] mb-1">الاسم الكامل</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!canEdit}
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded px-3 py-2 text-white outline-none caret-white" />
              </div>
              <div>
                <label className="block text-[11px] text-[#71767B] mb-1">الهاتف</label>
                <input value={canViewPrivate ? phone : maskPhone(phone, false)} onChange={(e) => setPhone(e.target.value)} disabled={!canEdit || !canViewPrivate}
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded px-3 py-2 text-white outline-none caret-white" dir="ltr" />
              </div>
              <div>
                <label className="block text-[11px] text-[#71767B] mb-1">المدينة</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} disabled={!canEdit}
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded px-3 py-2 text-white outline-none caret-white" />
              </div>
              <div>
                <label className="block text-[11px] text-[#71767B] mb-1">نوع الحساب</label>
                <AdminSelect title="نوع الحساب" disabled={!canEdit} value={profileKind} onChange={(v) => setProfileKind(v as ProfileKind)} options={[{ value: 'personal', label: 'شخصي' }, { value: 'business_owner', label: 'صاحب منشأة' }, { value: 'businessman', label: 'رجل أعمال' }]} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-[#71767B] mb-1">النبذة التعريفية</label>
              <textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} disabled={!canEdit}
                className="w-full bg-black border border-[#2F3336] focus:border-white rounded p-2.5 text-xs text-white outline-none caret-white resize-none" />
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  setConfirmState({
                    open: true,
                    title: 'حفظ تعديلات بيانات الحساب',
                    desc: `سيتم تحديث بيانات ${account.full_name} وتوثيق التعديل في السجل الإداري.`,
                    action: async (reason) =>
                      runAction(async () => {
                        await moderateAccountRpc({
                          userId: account.id,
                          action: 'edit_info',
                          reason,
                          fullName,
                          phone: canViewPrivate ? phone : undefined,
                          city,
                          bio,
                          profileKind,
                        });
                        setConfirmState(null);
                      }, 'تم حفظ بيانات الحساب وتوثيق الإجراء'),
                  })
                }
                className="px-4 py-2 rounded bg-[#FFC500] text-black text-xs font-black cursor-pointer hover:opacity-90"
              >
                حفظ التعديلات المسموح بها
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-3">
          <h4 className="text-xs font-black text-white flex items-center gap-2">
            <Building2 size={15} className="text-[#FFC500]" />
            الصفحات العامة المرتبطة بالحساب ({ownedPages.length} مملوكة، {managedPages.length} مفوض بها)
          </h4>
          {ownedPages.length === 0 && managedPages.length === 0 ? (
            <p className="text-xs text-[#71767B]">لا توجد صفحات عامة مرتبطة بهذا الحساب الشخصي حالياً.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ownedPages.map((p) => (
                <div key={p.id} className="p-3 rounded bg-black border border-[#2F3336] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{p.name}</span>
                      <BadgePill badge={p.badge_type} />
                    </div>
                    <p className="text-[11px] text-[#71767B]" dir="ltr">@{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {canEdit && <AdminButton variant="danger" size="sm" icon={<Unlink size={12} />} onClick={() => setConfirmState({ open: true, title: 'فك ارتباط الصفحة', desc: `سيتم فك ارتباط "${account.full_name}" عن ملكية "${p.name}".`, danger: true, action: async (reason) => runAction(async () => { await unlinkPageOwner({ businessId: p.id, reason }); setConfirmState(null); }, 'تم فك ارتباط الصفحة بنجاح') })}>فك الربط</AdminButton>}
                    <a href={`/business-page/${p.id}`} target="_blank" rel="noreferrer" className="p-2 rounded bg-[#111] border border-[#2F3336] text-[#FFC500] hover:bg-[#FFC500]/10"><ExternalLink size={14} /></a>
                  </div>
                </div>
              ))}
              {managedPages.map((m) => (
                <div key={m.business_id} className="p-3 rounded bg-black border border-[#2F3336] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{m.page_name}</p>
                    <p className="text-[11px] text-sky-400">مسؤول مفوض ({m.role})</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {canEdit && <AdminButton variant="danger" size="sm" icon={<Unlink size={12} />} onClick={() => setConfirmState({ open: true, title: 'إلغاء التفويض', desc: `سيتم فك تفويض "${account.full_name}" عن صفحة "${m.page_name}".`, danger: true, action: async (reason) => runAction(async () => { await managePageAdminRpc({ businessId: m.business_id, userId: account.id, operation: 'remove', reason }); setConfirmState(null); }, 'تم إلغاء التفويض بنجاح') })}>فك الربط</AdminButton>}
                    <a href={`/business-page/${m.business_id}`} target="_blank" rel="noreferrer" className="p-2 rounded bg-[#111] border border-[#2F3336] text-zinc-300"><ExternalLink size={14} /></a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {confirmState && (
          <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireDate={(confirmState as any).requireDate} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />
        )}
      </div>
    );
  }

  if (tab === 'activity') {
    const hiddenPosts = posts.filter((p) => p.is_hidden);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          {[
            { label: 'المنشورات الشخصية', val: posts.length },
            { label: 'التعليقات', val: comments.length },
            { label: 'إعجابات مُنحت', val: likesCountGiven },
            { label: 'إعادة النشر', val: reposts.length },
            { label: 'مخفية إدارياً', val: hiddenPosts.length },
          ].map((s) => (
            <div key={s.label} className="bg-[#0B0B0B] border border-[#2F3336] rounded p-3">
              <div className="text-lg font-black text-white tabular-nums">{s.val}</div>
              <div className="text-[11px] text-[#71767B]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-2 max-h-60 overflow-y-auto">
            <h4 className="text-xs font-black text-white">المتابِعون ({followers.length})</h4>
            {followers.length === 0 ? <p className="text-xs text-[#71767B]">لا يوجد متابعون</p> : followers.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-xs py-1 border-b border-[#2F3336]/50">
                <span className="text-white">{f.full_name} <span className="text-[#71767B]">@{f.username}</span></span>
                <span className="text-[10px] text-[#71767B]">{formatDateAr(f.created_at)}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-2 max-h-60 overflow-y-auto">
            <h4 className="text-xs font-black text-white">يتابِع ({following.length})</h4>
            {following.length === 0 ? <p className="text-xs text-[#71767B]">لا يتابع أحداً</p> : following.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-xs py-1 border-b border-[#2F3336]/50">
                <span className="text-white">{f.full_name} <span className="text-[#71767B]">@{f.username}</span></span>
                <span className="text-[10px] text-[#71767B]">{formatDateAr(f.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-2.5 max-h-80 overflow-y-auto">
          <h4 className="text-xs font-black text-white">منشورات الحساب (بما فيها المخفية إدارياً)</h4>
          {posts.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد منشورات شخصية.</p> : posts.map((p) => (
            <div key={p.id} className={`p-3 rounded border text-xs flex items-start justify-between gap-3 ${p.is_hidden ? 'bg-rose-950/20 border-rose-500/30' : 'bg-black border-[#2F3336]'}`}>
              <div className="space-y-1 min-w-0">
                <p className="text-zinc-200 whitespace-pre-wrap">{p.content || '(وسائط بدون نص)'}</p>
                <div className="flex flex-wrap gap-3 text-[10px] text-[#71767B]">
                  <span>{formatDateTimeAr(p.created_at)}</span>
                  <span>إعجاب: {p.likes_count || 0}</span>
                  <span>ردود: {p.comments_count || 0}</span>
                  <span>إعادة نشر: {p.reposts_count || 0}</span>
                  {p.is_hidden && <span className="text-rose-400 font-bold">مخفي إدارياً</span>}
                </div>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmState({
                      open: true,
                      title: p.is_hidden ? 'استعادة المنشور' : 'إخفاء المنشور إدارياً',
                      desc: 'سيتم تحديث حالة ظهور المنشور وتوثيق السبب في سجل التدقيق.',
                      danger: !p.is_hidden,
                      action: async (reason) =>
                        runAction(async () => {
                          await moderatePostRpc(p.id, !p.is_hidden, reason);
                          setConfirmState(null);
                        }, p.is_hidden ? 'تمت استعادة المنشور' : 'تم إخفاء المنشور'),
                    })
                  }
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-[#111] border border-[#2F3336] text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {p.is_hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                  <span>{p.is_hidden ? 'استعادة' : 'إخفاء'}</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-2 max-h-56 overflow-y-auto">
          <h4 className="text-xs font-black text-white">أحدث التعليقات ({comments.length})</h4>
          {comments.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد تعليقات.</p> : comments.slice(0, 30).map((c) => (
            <div key={c.id} className="p-2 rounded-lg bg-black border border-[#2F3336] text-xs">
              <p className="text-zinc-200">{c.content}</p>
              <span className="text-[10px] text-[#71767B]">{formatDateTimeAr(c.created_at)}</span>
            </div>
          ))}
        </div>

        {confirmState && (
          <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireDate={(confirmState as any).requireDate} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />
        )}
      </div>
    );
  }

  if (tab === 'verification') {
    return (
      <div className="space-y-4">
        <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="font-black text-[#FFC500] flex items-center gap-1.5"><ShieldCheck size={15} /> حالة التوثيق الحالية</h4>
            <div className="flex justify-between"><span className="text-[#71767B]">الشارة:</span><BadgePill badge={account.badge_type} /></div>
            <div className="flex justify-between"><span className="text-[#71767B]">تاريخ المنح:</span><span>{formatDateTimeAr(account.verified_at)}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">تاريخ انتهاء الأهلية:</span><span>{formatDateAr(account.verification_expires_at)}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">سبب المنح:</span><span className="text-zinc-200">{account.verification_reason || '—'}</span></div>
            <div className="flex justify-between"><span className="text-[#71767B]">الموظف المعتمد:</span><span>{verifierProfile?.full_name || '—'}</span></div>
          </div>

          {canEdit && (
            <div className="space-y-3">
              <h4 className="font-black text-white">إدارة شارة الحساب (لا تُمنح تلقائياً للاشتراك)</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#71767B] mb-1">نوع الشارة</label>
                  <AdminSelect title="نوع الشارة" value={badgeChoice} onChange={(v) => setBadgeChoice(v as any)} options={[{ value: 'blue', label: 'أزرق (حساب شخصي)' }, { value: 'silver', label: 'فضي (رجل أعمال)' }, { value: 'gold', label: 'ذهبي (خاص)' }, { value: 'none', label: 'بدون (سحب التوثيق)' }]} />
                </div>
                <div>
                  <label className="block text-[11px] text-[#71767B] mb-1">تاريخ انتهاء الأهلية (اختياري)</label>
                  <input type="date" value={badgeExpires} onChange={(e) => setBadgeExpires(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded px-3 py-2 text-white outline-none caret-white" />
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfirmState({
                    open: true,
                    title: badgeChoice === 'none' ? 'سحب شارة التوثيق' : 'منح / تجديد شارة التوثيق',
                    desc: 'سيتم تحديث شارة التوثيق وتوثيق الموظف والسبب في السجل الإداري.',
                    danger: badgeChoice === 'none',
                    action: async (reason) =>
                      runAction(async () => {
                        await verifyAccountRpc({
                          userId: account.id,
                          badgeType: badgeChoice,
                          reason,
                          expiresAt: badgeExpires ? new Date(badgeExpires).toISOString() : null,
                        });
                        setConfirmState(null);
                      }, 'تم تحديث شارة التوثيق بنجاح'),
                  })
                }
                className="px-4 py-2 rounded bg-[#FFC500] text-black font-black text-xs cursor-pointer"
              >
                اعتماد التوثيق وتسجيله
              </button>
            </div>
          )}
        </div>

        {confirmState && (
          <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireDate={(confirmState as any).requireDate} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />
        )}
      </div>
    );
  }

  const expiringSoon = subscriptions.some((s) => {
    if (s.status !== 'ACTIVE' || !s.end_date) return false;
    const diff = new Date(s.end_date).getTime() - Date.now();
    return diff > 0 && diff <= 7 * 86400000;
  });

  return (
    <div className="space-y-4">
      {expiringSoon && (
        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle size={15} />
          <span>تنبيه: يوجد اشتراك قريب من الانتهاء خلال 7 أيام!</span>
        </div>
      )}

      {canEdit && (
        <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-3">
          <h4 className="text-xs font-black text-[#FFC500]">منح أو تفعيل اشتراك جديد للحساب</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <AdminSelect title="الباقة" value={selectedPlanId} onChange={setSelectedPlanId} options={[{ value: '', label: 'اختر الباقة' }, ...plans.map((pl) => ({ value: pl.id, label: `${pl.name} (${pl.price} ${pl.currency})` }))]} />
            <AdminSelect title="مدة الاشتراك" value={String(subDays)} onChange={(v) => setSubDays(Number(v))} options={[{ value: '30', label: 'شهري (30 يوماً)' }, { value: '365', label: 'سنوي (365 يوماً)' }]} />
            <button
              type="button"
              onClick={() =>
                setConfirmState({
                  open: true,
                  title: 'تفعيل اشتراك إدارياً',
                  desc: 'سيتم تفعيل اشتراك للحساب وتوثيق السبب في سجل التدقيق.',
                  action: async (reason) =>
                    runAction(async () => {
                      await manageSubscriptionRpc({
                        action: 'activate',
                        reason,
                        userId: account.id,
                        planId: selectedPlanId || null,
                        durationDays: subDays,
                      });
                      setConfirmState(null);
                    }, 'تم تفعيل الاشتراك'),
                })
              }
              className="px-4 py-2 rounded bg-[#FFC500] text-black font-black cursor-pointer"
            >
              تفعيل الاشتراك
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-2.5">
        <h4 className="text-xs font-black text-white">الاشتراكات الحالية والسابقة ({subscriptions.length})</h4>
        {subscriptions.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد اشتراكات مسجلة.</p> : subscriptions.map((s) => (
          <div key={s.id} className="p-3 rounded bg-black border border-[#2F3336] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{s.plan?.name || 'باقة اشتراك'}</span>
                <SubCyclePill cycle={s.billing_cycle === 'yearly' || (s.plan?.duration_days || 0) >= 300 ? 'yearly' : 'monthly'} />
                <SubStatusPill status={String(s.status || '').toLowerCase() as any} />
              </div>
              <div className="text-[11px] text-[#71767B]">
                من {formatDateAr(s.start_date)} إلى {formatDateAr(s.end_date)} • المدفوع: {s.amount_paid || 0} {s.plan?.currency || 'YER'}
              </div>
            </div>
            {canEdit && s.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={() =>
                  setConfirmState({
                    open: true,
                    title: 'إيقاف / إلغاء الاشتراك',
                    desc: 'سيتم إيقاف هذا الاشتراك فوراً وتسجيل السبب.',
                    danger: true,
                    action: async (reason) =>
                      runAction(async () => {
                        await manageSubscriptionRpc({ action: 'cancel', reason, subscriptionId: s.id, userId: account.id });
                        setConfirmState(null);
                      }, 'تم إلغاء الاشتراك'),
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold cursor-pointer"
              >
                إيقاف الاشتراك
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-4 space-y-2">
        <h4 className="text-xs font-black text-white">سجل المدفوعات والإيصالات ({payments.length + paymentProofs.length})</h4>
        {payments.length === 0 && paymentProofs.length === 0 ? (
          <p className="text-xs text-[#71767B]">لا توجد مدفوعات أو سندات مرفوعة.</p>
        ) : (
          <div className="space-y-2 text-xs">
            {payments.map((p) => (
              <div key={p.id} className="p-2.5 rounded bg-black border border-[#2F3336] flex justify-between items-center">
                <span>{p.service_type} — {p.amount} {p.currency} (مرجع: {p.reference_number || '—'})</span>
                <span className="text-[#FFC500] font-bold">{p.status}</span>
              </div>
            ))}
            {paymentProofs.map((pr) => (
              <div key={pr.id} className="p-2.5 rounded bg-black border border-[#2F3336] flex justify-between items-center">
                <span>سند دفع: {pr.amount} {pr.currency} ({pr.payment_method})</span>
                <div className="flex items-center gap-2">
                  {pr.proof_url && <a href={pr.proof_url} target="_blank" rel="noreferrer" className="text-sky-400 underline">الإيصال</a>}
                  <span className="text-zinc-300">{pr.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmState && (
        <AdminConfirmDialog open={confirmState.open} title={confirmState.title} description={confirmState.desc} variant={confirmState.danger ? 'danger' : 'warning'} requireDate={(confirmState as any).requireDate} requireReason onCancel={() => setConfirmState(null)} onConfirm={confirmState.action} />
      )}
    </div>
  );
};
