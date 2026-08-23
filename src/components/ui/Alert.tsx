import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  className,
  variant = 'info',
  title,
  ...props
}) => {
  const configs = {
    info: {
      icon: <Info size={20} strokeWidth={1.75} className="text-[#2563EB] dark:text-[#60A5FA] shrink-0" />,
      classes: 'bg-[#2563EB]/10 dark:bg-[#2563EB]/15 border-[#2563EB]/25 dark:border-[#2563EB]/40 text-[#1E40AF] dark:text-[#93C5FD]',
    },
    success: {
      icon: <CheckCircle2 size={20} strokeWidth={1.75} className="text-[#16A34A] dark:text-[#4ADE80] shrink-0" />,
      classes: 'bg-[#16A34A]/10 dark:bg-[#16A34A]/15 border-[#16A34A]/25 dark:border-[#16A34A]/40 text-[#166534] dark:text-[#86EFAC]',
    },
    warning: {
      icon: <AlertTriangle size={20} strokeWidth={1.75} className="text-[#F59E0B] dark:text-[#FBBF24] shrink-0" />,
      classes: 'bg-[#F59E0B]/10 dark:bg-[#F59E0B]/15 border-[#F59E0B]/25 dark:border-[#F59E0B]/40 text-[#92400E] dark:text-[#FDE68A]',
    },
    danger: {
      icon: <AlertCircle size={20} strokeWidth={1.75} className="text-[#DC2626] dark:text-[#F87171] shrink-0" />,
      classes: 'bg-[#DC2626]/10 dark:bg-[#DC2626]/15 border-[#DC2626]/25 dark:border-[#DC2626]/40 text-[#991B1B] dark:text-[#FCA5A5]',
    },
  };

  const config = configs[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-[10px] border text-sm',
        config.classes,
        className
      )}
      {...props}
    >
      {config.icon}
      <div className="flex-1 space-y-0.5">
        {title && <h4 className="font-bold">{title}</h4>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};
