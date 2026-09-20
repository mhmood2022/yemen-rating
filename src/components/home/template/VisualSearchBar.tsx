import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";

interface VisualSearchBarProps {
  onSearchSubmit?: (searchTerm: string, city: string) => void;
}

export const VisualSearchBar: React.FC<VisualSearchBarProps> = ({ onSearchSubmit }) => {
  const [term, setTerm] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(term, city);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 sm:my-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md"
      >
        <div className="relative flex-1 w-full flex items-center">
          <Search className="w-5 h-5 text-amber-500 absolute right-3 pointer-events-none" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="ابحث عن منشأة، خدمة، مزاد، أو وظيفة..."
            className="w-full pr-10 pl-3 py-2.5 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="relative w-full sm:w-44 flex items-center border-t sm:border-t-0 sm:border-r border-slate-100 dark:border-slate-800 pt-2 sm:pt-0">
          <MapPin className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">جميع المدن</option>
            <option value="sanaa">صنعاء</option>
            <option value="aden">عدن</option>
            <option value="taiz">تعز</option>
            <option value="mukalla">المكلا</option>
            <option value="hodeidah">الحديدة</option>
            <option value="ibb">إب</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-sm"
        >
          بحث
        </button>
      </form>
    </div>
  );
};
