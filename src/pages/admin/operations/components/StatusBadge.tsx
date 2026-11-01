import React from 'react';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../types';
import type { RequestStatus, RequestPriority } from '../types';

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const color = STATUS_COLORS[status] || '#9CA3AF';
  const label = STATUS_LABELS[status] || status;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: RequestPriority }> = ({ priority }) => {
  const color = PRIORITY_COLORS[priority] || '#9CA3AF';
  const label = PRIORITY_LABELS[priority] || priority;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
};
