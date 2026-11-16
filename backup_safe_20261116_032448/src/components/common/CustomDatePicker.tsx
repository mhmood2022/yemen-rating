import React, { useState, useEffect, useRef } from 'react';
import { Calendar, X, ChevronDown } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const toAr = (n: string | number) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

export const CustomDatePicker = ({ value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'year' | 'month' | 'day' | null>(null);
  
  const [year, setYear] = useState('1988');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parseInt(parts[1]).toString());
        setDay(parseInt(parts[2]).toString());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    const y = year.padStart(4, '0');
    const m = month.padStart(2, '0');
    const d = day.padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  const CustomSelect = ({ label, val, options, onChange, isOpen, onToggle }: any) => (
    <div className="relative flex-1">
      <label className="block text-[#71767B] text-xs mb-1">{label}</label>
      <button 
        type="button" 
        onClick={onToggle} 
        className="w-full bg-black text-white p-2.5 rounded-xl border border-[#2F3336] text-sm flex justify-between items-center"
      >
        <span>{val}</span>
        <ChevronDown size={16} className="text-[#FFC500]" /> {/* تم تغيير اللون للأصفر */}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-[#2F3336] rounded-xl max-h-48 overflow-y-auto z-[999] shadow-2xl">
          {options.map((opt: any) => (
            <button 
              key={opt.value} 
              type="button" 
              onClick={() => { onChange(opt.value); onToggle(); }} 
              className="w-full text-right p-3 text-white text-sm hover:bg-white/10 active:bg-white/20 transition" /* تم إضافة مؤشر الاختيار */
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full bg-transparent text-white text-base pb-2 outline-none cursor-pointer flex items-center justify-between"
        dir="ltr"
      >
        <span>{value ? toAr(value) : 'اختر تاريخ الميلاد'}</span>
        <Calendar size={18} className="text-[#71767B]" />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          {/* تم إزالة overflow-hidden لكي تطفو القوائم المنسدلة فوق أي شيء */}
          <div className="bg-[#0A0A0A] border border-[#2F3336] rounded-2xl w-full max-w-sm shadow-2xl relative" ref={dropdownRef}>
            
            <div className="flex items-center justify-between p-4"> {/* تم إزالة border-b */}
              <h3 className="text-white font-bold">تاريخ الميلاد</h3>
              <button type="button" onClick={() => { setIsOpen(false); setOpenDropdown(null); }} className="text-[#71767B] hover:text-white transition"><X size={20} /></button>
            </div>
            
            <div className="px-4 pb-4 flex gap-2 relative">
              <CustomSelect 
                label="السنة" 
                val={toAr(year)} 
                options={years.map(y => ({ value: y, label: toAr(y) }))} 
                onChange={setYear} 
                isOpen={openDropdown === 'year'} 
                onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')} 
              />
              <CustomSelect 
                label="الشهر" 
                val={monthNames[parseInt(month) - 1]} 
                options={months.map((m, i) => ({ value: m, label: monthNames[i] }))} 
                onChange={setMonth} 
                isOpen={openDropdown === 'month'} 
                onToggle={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')} 
              />
              <CustomSelect 
                label="اليوم" 
                val={toAr(day)} 
                options={days.map(d => ({ value: d, label: toAr(d) }))} 
                onChange={setDay} 
                isOpen={openDropdown === 'day'} 
                onToggle={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')} 
              />
            </div>

            <div className="p-4 flex justify-end"> {/* تم إزالة border-t */}
              <button type="button" onClick={handleSave} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
