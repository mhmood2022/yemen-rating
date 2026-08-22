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
      icon: <Info size={20} strokeWidth={2} className="text-[#2563EB] shrink-0" />,
      classes: 'bg-[#2563EB]/10 border-[#2563EB]/25 text-[#1E40AF]',
    },
    success: {
      icon: <CheckCircle2 size={20} strokeWidth={2} className="text-[#16A34A] shrink-0" />,
      classes: 'bg-[#16A34A]/10 border-[#16A34A]/25 text-[#166534]',
    },
    warning: {
      icon: <AlertTriangle size={20} strokeWidth={2} className="text-[#F59E0B] shrink-0" />,
      classes: 'bg-[#F59E0B]/10 border-[#F59E0B]/25 text-[#92400E]',
    },
    danger: {
      icon: <AlertCircle size={20} strokeWidth={2} className="text-[#DC2626] shrink-0" />,
      classes: 'bg-[#DC2626]/10 border-[#DC2626]/25 text-[#991B1B]',
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
