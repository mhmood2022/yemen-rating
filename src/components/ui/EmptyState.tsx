import React from 'react';
import { FolderSearch } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#10263F] rounded-[14px] border border-[#E2E8F0] dark:border-[#263A52] my-4 shadow-sm">
      <div className="p-4 bg-[#F7F8FA] dark:bg-[#0F2138] rounded-full text-[#94A3B8] dark:text-[#64748B] mb-3">
        {icon || <FolderSearch size={36} strokeWidth={1.75} />}
      </div>
      <h3 className="text-base font-bold text-[#0B1F3A] dark:text-[#F8FAFC] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mb-4 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
