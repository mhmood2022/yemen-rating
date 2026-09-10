import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface YROption {
  value: string;
  label: string;
}

interface YRSelectProps {
  label?: string;
  value: string;
  options: (string | YROption)[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
}

export const YRSelect: React.FC<YRSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "اختر...",
  className = "",
  compact = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: YROption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const currentLabel =
    normalizedOptions.find((o) => o.value === value)?.label || value || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className={"relative w-full text-right font-['Cairo',sans-serif] " + className} ref={containerRef}>
      {label && (
        <label className="text-gray-200 font-bold block mb-1 text-[11px] select-none">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={"w-full bg-[#18181C] border border-[#27272A] hover:border-zinc-500 text-white flex items-center justify-between outline-none transition-all cursor-pointer select-none active:scale-[0.99] " +
          (compact ? "h-9 px-2 text-[10.5px] font-bold rounded-lg " : "h-11 px-3 text-xs font-bold rounded-xl ") +
          (isOpen ? "border-[#FFC500]/60 ring-1 ring-[#FFC500]/20 " : "") +
          (disabled ? "opacity-50 cursor-not-allowed " : "")}
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown
          size={compact ? 13 : 15}
          className={"text-gray-400 transition-transform duration-200 shrink-0 mr-1.5 " + (isOpen ? "rotate-180 text-[#FFC500]" : "")}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-1 z-50 bg-[#141418] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1 space-y-0.5">
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={"rounded-lg font-bold cursor-pointer flex items-center justify-between transition-colors " +
                    (compact ? "px-2.5 py-1.5 text-[11px] " : "px-3.5 py-2.5 text-xs ") +
                    (isSelected
                      ? "bg-[#FFC500]/15 text-[#FFC500]"
                      : "text-gray-300 hover:bg-[#1F2937] hover:text-white active:bg-[#1F2937]")}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={compact ? 12 : 14} className="text-[#FFC500] shrink-0 mr-1.5" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
