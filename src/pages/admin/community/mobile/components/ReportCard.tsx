import React, { useState } from 'react';
import { VerifiedBadge } from '../../../../../components/common/VerifiedBadge';
import { AlertTriangle, Trash2, UserX, Check, X, Eye, User as UserIcon, MessageSquare, Maximize2 } from 'lucide-react';
import type { ReportItem } from '../../shared/types';
import { timeAgo } from '../../shared/types';

export interface ReporterInfo {
  name: string;
  avatar: string;
  username: string;
  verification_type?: string | null;
}

interface Props {
  report: ReportItem;
  reporter?: ReporterInfo;
  onView?: (r: ReportItem) => void;
  onDismiss: (r: ReportItem) => void;
  onDeletePost: (r: ReportItem) => void;
  onBlockUser: (r: ReportItem) => void;
  onResolve: (r: ReportItem) => void;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'جديد', reviewing: 'قيد المراجعة', resolved: 'تم الحل', dismissed: 'مرفوض',
};
const STATUS_COLOR: Record<string, string> = {
  pending: '#FFC500', reviewing: '#1D9BF0', resolved: '#22C55E', dismissed: '#9CA3AF',
};

export const ReportCard: React.FC<Props> = ({
  report, reporter, onView, onDismiss, onDeletePost, onBlockUser, onResolve,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isAccountReport = report.reported_item_type === 'user';
  const statusKey = (report.status || 'pending').toLowerCase();
  const statusColor = STATUS_COLOR[statusKey] || '#FFFFFF';
  const statusLabel = STATUS_LABEL[statusKey] || report.status;

  const targetName = report.targetUser?.full_name || report.targetPost?.authorName || 'مستخدم';
  const targetUsername = report.targetUser?.username || report.targetPost?.authorUsername || 'user';
  const targetAvatar = report.targetUser?.avatar_url || report.targetPost?.authorAvatar || '';
  const targetBadge = report.targetUser?.verification_type || (report.targetUser?.is_verified ? 'blue' : null) || report.targetPost?.authorBadge;
  const targetContent = report.targetPost?.content;
  const targetImage = report.targetPost?.image_url;
  const targetVideo = report.targetPost?.video_url;

  const reporterName = reporter?.name || report.reporter_name || 'مجهول';
  const reporterAvatar = reporter?.avatar || '';
  const reporterUsername = reporter?.username || '';

  return (
    <>
      <div className="rounded-2xl p-4 space-y-3" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
        {/* ترويسة */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: isAccountReport ? '#1D9BF020' : '#EF444420', border: `1px solid ${isAccountReport ? '#1D9BF0' : '#EF4444'}40` }}>
              {isAccountReport ? <UserIcon className="w-3.5 h-3.5" style={{ color: '#1D9BF0' }} /> : <MessageSquare className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold" style={{ color: isAccountReport ? '#1D9BF0' : '#EF4444' }}>
                {isAccountReport ? 'بلاغ عن حساب' : 'بلاغ عن تغريدة'}
              </p>
              <p className="text-[11px]" style={{ color: '#9CA3AF' }}>{timeAgo(report.created_at)}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}40` }}>{statusLabel}</span>
        </div>

        {/* المُبلّغ */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: '#111111', border: '1px solid #2A2B30' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold" style={{ background: '#1F2024', color: '#FFFFFF' }}>
            {reporterAvatar ? <img src={reporterAvatar} alt="" className="w-full h-full object-cover" /> : reporterName?.[0] || '؟'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold" style={{ color: '#9CA3AF' }}>المُبلّغ</p>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold truncate" style={{ color: '#FFFFFF' }}>{reporterName}</p>
              {reporter?.verification_type && <VerifiedBadge type={reporter.verification_type as any} size={16} />}
            </div>
            {reporterUsername && <p className="text-[10px] truncate" style={{ color: '#9CA3AF' }} dir="ltr">@{reporterUsername}</p>}
          </div>
        </div>

        {/* السبب */}
        <div className="space-y-1">
          <p className="text-sm" style={{ color: '#FFFFFF' }}>
            <span style={{ color: '#EF4444', fontWeight: 600 }}>السبب: </span>{report.reason}
          </p>
          {report.details && <p className="text-xs" style={{ color: '#9CA3AF' }}>التفاصيل: {report.details}</p>}
        </div>

        {/* المحتوى المبلغ عنه */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: '#0A0A0B', border: `1px solid ${isAccountReport ? '#1D9BF040' : '#EF444440'}` }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold" style={{ color: isAccountReport ? '#1D9BF0' : '#EF4444' }}>
              {isAccountReport ? 'الحساب المبلغ عنه:' : 'التغريدة المبلغ عنها:'}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setShowDetails(true)} className="w-6 h-6 rounded flex items-center justify-center active:opacity-60" style={{ background: '#1F2024' }}>
                <Maximize2 className="w-3 h-3" style={{ color: '#FFFFFF' }} />
              </button>
              {onView && (
                <button onClick={() => onView(report)} className="w-6 h-6 rounded flex items-center justify-center active:opacity-60" style={{ background: '#1F2024' }}>
                  <Eye className="w-3 h-3" style={{ color: '#FFFFFF' }} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold overflow-hidden" style={{ background: '#1F2024', color: '#FFFFFF' }}>
              {targetAvatar ? <img src={targetAvatar} alt="" className="w-full h-full object-cover" /> : targetName?.[0] || '؟'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold truncate" style={{ color: '#FFFFFF' }}>{targetName}</p>
                {targetBadge && targetBadge !== 'none' && <VerifiedBadge type={targetBadge as any} size={16} />}
              </div>
              <p className="text-[11px] truncate" style={{ color: '#9CA3AF' }} dir="ltr">@{targetUsername}</p>
            </div>
          </div>
          {!isAccountReport && targetContent && (
            <p className="text-xs p-2 rounded-lg line-clamp-3" style={{ color: '#D1D5DB', background: '#000000', border: '1px solid #2A2B30', whiteSpace: 'pre-wrap' }}>{targetContent}</p>
          )}
        </div>

        {/* الأزرار */}
        {statusKey === 'pending' || statusKey === 'reviewing' ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {!isAccountReport && report.targetPost && (
              <button onClick={() => onDeletePost(report)} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70" style={{ background: '#EF444415', border: '1px solid #EF444440', color: '#EF4444' }}>
                <Trash2 className="w-3.5 h-3.5" /> حذف التغريدة
              </button>
            )}
            {(isAccountReport || report.targetUser) && (
              <button onClick={() => onBlockUser(report)} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70" style={{ background: '#EF444415', border: '1px solid #EF444440', color: '#EF4444' }}>
                <UserX className="w-3.5 h-3.5" /> حظر الحساب
              </button>
            )}
            <button onClick={() => onDismiss(report)} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70" style={{ background: '#111111', border: '1px solid #2A2B30', color: '#FFFFFF' }}>
              <X className="w-3.5 h-3.5" /> تجاهل
            </button>
            <button onClick={() => onResolve(report)} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition active:opacity-70" style={{ background: '#22C55E15', border: '1px solid #22C55E40', color: '#22C55E' }}>
              <Check className="w-3.5 h-3.5" /> حل البلاغ
            </button>
          </div>
        ) : (
          <p className="text-xs text-center py-1" style={{ color: '#9CA3AF' }}>تمت معالجة هذا البلاغ</p>
        )}
      </div>

      {/* Modal في المنتصف للتفاصيل الكاملة */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            style={{ background: '#111111', border: '1px solid #2A2B30' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>تفاصيل البلاغ</h3>
              <button onClick={() => setShowDetails(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1F2024' }}>
                <X className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#0A0A0B', border: '1px solid #2A2B30' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold overflow-hidden" style={{ background: '#1F2024', color: '#FFFFFF' }}>
                {targetAvatar ? <img src={targetAvatar} alt="" className="w-full h-full object-cover" /> : targetName?.[0] || '؟'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{targetName}</p>
                  {targetBadge && targetBadge !== 'none' && <VerifiedBadge type={targetBadge as any} size={16} />}
                </div>
                <p className="text-xs" style={{ color: '#9CA3AF' }} dir="ltr">@{targetUsername}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl text-sm whitespace-pre-wrap" style={{ background: '#0A0A0B', color: '#FFFFFF', border: '1px solid #2A2B30', lineHeight: 1.7 }}>
              {targetContent || '(لا يوجد نص)'}
            </div>

            {targetImage && (
              <img src={targetImage} alt="" className="w-full rounded-xl" style={{ border: '1px solid #2A2B30' }} />
            )}
            {targetVideo && (
              <video src={targetVideo} controls className="w-full rounded-xl" style={{ border: '1px solid #2A2B30' }} />
            )}
          </div>
        </div>
      )}
    </>
  );
};
