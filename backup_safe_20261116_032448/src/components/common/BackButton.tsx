import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  showText?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'رجوع',
  className = '',
  showText = true,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 text-yellow-400 hover:text-yellow-300 hover:bg-zinc-800 border border-zinc-800 transition-all font-bold text-xs shadow-sm group cursor-pointer shrink-0 ${className}`}
      title={label}
      aria-label={label}
    >
      <ArrowRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
      {showText && <span>{label}</span>}
    </button>
  );
};

export default BackButton;
