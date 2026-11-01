import React from 'react';
import { Inbox } from 'lucide-react';

interface Props {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({ icon: Icon = Inbox, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: '#111', border: '1px solid #2A2B30' }}
      >
        <Icon className="w-7 h-7" style={{ color: '#9CA3AF' }} />
      </div>
      <h3 className="text-base font-semibold mb-1 text-white">{title}</h3>
      {description && <p className="text-sm max-w-xs text-zinc-400">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-bold transition active:opacity-70"
          style={{ background: '#FFC500', color: '#000' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
