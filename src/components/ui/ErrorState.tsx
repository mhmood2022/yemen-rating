import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'حدث خطأ أثناء تحميل البيانات',
  message = 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مجددًا.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-[14px] border border-[#DC2626]/20 my-4">
      <div className="p-3 bg-[#DC2626]/10 text-[#DC2626] rounded-full mb-3">
        <AlertTriangle size={32} strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-bold text-[#0B1F3A] mb-1">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={<RefreshCw size={14} />}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
};
