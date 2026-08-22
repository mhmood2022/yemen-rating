import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  hasUnsavedChanges?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  hasUnsavedChanges = false,
}) => {
  const handleAttemptClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('هل أنت متأكد من الإغلاق؟ لديك تغييرات غير محفوظة.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleAttemptClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, hasUnsavedChanges]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay - Pure Black with blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-[3px] transition-opacity"
        onClick={handleAttemptClose}
        aria-hidden="true"
      />
      
      {/* Modal Box - Pure Black with clean #222222 border */}
      <div
        className={cn(
          'relative w-full rounded-[14px] shadow-2xl border overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150',
          'bg-white dark:bg-[#000000] border-[#E2E8F0] dark:border-[#222222] text-[#0F172A] dark:text-white',
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Header - Pure Black */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] dark:border-[#222222] bg-white dark:bg-[#000000] sticky top-0">
          <h3 className="text-base sm:text-lg font-bold text-[#0B1F3A] dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0B1F3A] dark:text-[#A1A1AA] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#161616] transition-colors"
            aria-label="إغلاق"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* Content Body - Pure Black */}
        <div className="p-4 sm:p-5 overflow-y-auto bg-white dark:bg-[#000000]">{children}</div>

        {/* Optional Footer - Black */}
        {footer && (
          <div className="px-5 py-3.5 bg-[#F7F8FA] dark:bg-[#000000] border-t border-[#E2E8F0] dark:border-[#222222] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
