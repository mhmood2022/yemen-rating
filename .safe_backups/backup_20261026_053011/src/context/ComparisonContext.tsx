import React, { createContext, useContext, useState, ReactNode } from 'react';
import { YRBusiness } from '../types/database.types';

interface ComparisonContextType {
  selectedBusinesses: YRBusiness[];
  addToCompare: (business: YRBusiness) => void;
  removeFromCompare: (id: string) => void;
  clearComparison: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedBusinesses, setSelectedBusinesses] = useState<YRBusiness[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const addToCompare = (business: YRBusiness) => {
    setSelectedBusinesses((prev) => {
      const list = prev || [];
      if (list.some((b) => b.id === business.id)) return list;
      if (list.length >= 4) {
        alert('يمكنك مقارنة 4 منشآت كحد أقصى في المرة الواحدة.');
        return list;
      }
      return [...list, business];
    });
  };

  const removeFromCompare = (id: string) => {
    setSelectedBusinesses((prev) => (prev || []).filter((b) => b.id !== id));
  };

  const clearComparison = () => {
    setSelectedBusinesses([]);
  };

  return (
    <ComparisonContext.Provider
      value={{
        selectedBusinesses: selectedBusinesses || [],
        addToCompare,
        removeFromCompare,
        clearComparison,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
