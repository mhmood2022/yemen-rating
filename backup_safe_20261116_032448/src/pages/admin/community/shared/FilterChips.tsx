import React from 'react';
export interface FilterChip { id: string; label: string; count?: number; }
interface Props { chips: FilterChip[]; active: string; onChange: (id: string) => void; }

export const FilterChips: React.FC<Props> = ({ chips, active, onChange }) => (
  <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 pb-1" style={{ scrollbarWidth: 'none' }}>
    {chips.map(chip => {
      const isActive = chip.id === active;
      return (
        <button key={chip.id} onClick={() => onChange(chip.id)} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition active:opacity-70" style={{ background: isActive ? '#FFC500' : '#111111', color: isActive ? '#000' : '#FFFFFF', border: isActive ? '1px solid #FFC500' : '1px solid #2A2B30' }}>
          <span>{chip.label}</span>
          {typeof chip.count === 'number' && chip.count > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: isActive ? '#00000030' : '#1F2024', color: isActive ? '#000' : '#FFFFFF' }}>{chip.count > 99 ? '99+' : chip.count}</span>
          )}
        </button>
      );
    })}
  </div>
);
