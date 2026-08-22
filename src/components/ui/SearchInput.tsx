import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './Input';

interface SearchInputProps extends Omit<InputProps, 'rightIcon' | 'leftIcon'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onClear, ...props }) => {
  return (
    <Input
      type="search"
      value={value}
      onChange={onChange}
      rightIcon={<Search size={17} strokeWidth={1.75} className="text-[#94A3B8] dark:text-[#71717A]" />}
      leftIcon={
        value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[#94A3B8] hover:text-[#0B1F3A] dark:text-[#71717A] dark:hover:text-white transition-colors pointer-events-auto"
            aria-label="مسح البحث"
          >
            <X size={15} strokeWidth={2} />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
};
