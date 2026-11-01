import React from 'react';
import {
  ShieldAlert, MessageCircle, ShieldCheck, Building2, Briefcase,
  Home, CreditCard, Crown, Megaphone, AlertTriangle, ChevronLeft, Paperclip,
} from 'lucide-react';
import type { AdminRequest, RequestType } from '../types';
import { TYPE_LABELS, timeAgo } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';

interface Props {
  request: AdminRequest;
  onClick: (r: AdminRequest) => void;
}

const ICONS: Record<RequestType, React.ElementType> = {
  report: ShieldAlert,
  support: MessageCircle,
  verification: ShieldCheck,
  claim: Building2,
  job_application: Briefcase,
  property_inquiry: Home,
  payment: CreditCard,
  subscription: Crown,
  ad: Megaphone,
  appeal: AlertTriangle,
};

const TYPE_COLORS: Record<RequestType, string> = {
  report: '#EF4444',
  support: '#1D9BF0',
  verification: '#FFC500',
  claim: '#22C55E',
  job_application: '#8B5CF6',
  property_inquiry: '#F59E0B',
  payment: '#10B981',
  subscription: '#FFC500',
  ad: '#EC4899',
  appeal: '#F97316',
};

// كشف سريع لوجود ملفات داخل وصف الطلب
const FILE_RE = /(?:object\/)?public\/media\/[^\s]+|https?:\/\/[^\s]+\.(?:pdf|jpg|jpeg|png|webp|gif)(?:[?#][^\s]*)?/i;
const hasAttachments = (desc?: string | null) => !!desc && FILE_RE.test(desc);

export const RequestCard: React.FC<Props> = ({ request, onClick }) => {
  const Icon = ICONS[request.type] || ShieldAlert;
  const color = TYPE_COLORS[request.type] || '#9CA3AF';
  const typeLabel = TYPE_LABELS[request.type] || request.type;
  const isNew = request.status === 'new';
  const hasFiles = hasAttachments(request.description);

  return (
    <button
      onClick={() => onClick(request)}
      className="w-full text-right p-4 rounded-2xl transition active:opacity-70 hover:bg-[#0A0A0B]"
      style={{
        background: isNew ? '#0A0A0B' : '#000000',
        border: `1px solid ${isNew ? color + '40' : '#2A2B30'}`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${color}20`, color }}
            >
              {typeLabel}
            </span>
            <PriorityBadge priority={request.priority} />
            {hasFiles && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFC500]/15 text-[#FFC500]">
                <Paperclip className="w-3 h-3" />
                مرفقات
              </span>
            )}
            {isNew && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EF4444] text-white">
                جديد
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-white truncate mb-1">
            {request.title}
          </h3>

          {/* Description */}
          {request.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
              {request.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
              <span className="font-mono" dir="ltr">{request.reference_number}</span>
              <span>· {timeAgo(request.created_at)}</span>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Arrow */}
        <ChevronLeft className="w-4 h-4 text-zinc-600 shrink-0 mt-3" />
      </div>
    </button>
  );
};
