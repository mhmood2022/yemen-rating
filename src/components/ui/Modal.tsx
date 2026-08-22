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
      <div
        className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-[2px] transition-opacity"
        onClick={handleAttemptClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full bg-white rounded-[14px] shadow-2xl border border-[#E2E8F0] overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150',
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] bg-white sticky top-0">
          <h3 className="text-lg font-bold text-[#0B1F3A]">{title}</h3>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0B1F3A] hover:bg-[#F1F5F9] transition-colors"
            aria-label="إغلاق"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-5 py-3.5 bg-[#F7F8FA] border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
