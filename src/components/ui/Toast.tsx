import React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export const ToastProvider: React.FC = () => {
  return (
    <SonnerToaster
      position="top-center"
      dir="rtl"
      toastOptions={{
        style: {
          fontFamily: 'var(--yr-font)',
          borderRadius: '10px',
          padding: '14px',
          border: '1px solid #E2E8F0',
        },
        classNames: {
          toast: 'bg-white text-[#0B1F3A] shadow-lg',
          title: 'font-bold text-sm text-[#0B1F3A]',
          description: 'text-xs text-[#475569]',
          actionButton: 'bg-[#0B1F3A] text-white',
          cancelButton: 'bg-[#F1F5F9] text-[#475569]',
          success: '!border-[#16A34A]/30 !bg-[#16A34A]/5',
          error: '!border-[#DC2626]/30 !bg-[#DC2626]/5',
          warning: '!border-[#F59E0B]/30 !bg-[#F59E0B]/5',
          info: '!border-[#2563EB]/30 !bg-[#2563EB]/5',
        },
      }}
    />
  );
};

export const yrToast = {
  success: (msg: string, description?: string) =>
    sonnerToast.success(msg, { description }),
  error: (msg: string, description?: string) =>
    sonnerToast.error(msg, { description }),
  warning: (msg: string, description?: string) =>
    sonnerToast.warning(msg, { description }),
  info: (msg: string, description?: string) =>
    sonnerToast.info(msg, { description }),
};
