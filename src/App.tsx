import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { BusinessDetailPage } from './pages/BusinessDetailPage';
import { YRBusiness } from './types/database.types';
import { ComparisonProvider } from './context/ComparisonContext';

export const App: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<YRBusiness | null>(null);

  return (
    <ComparisonProvider>
      <div className="bg-[#0D0D12] min-h-screen text-white font-sans dir-rtl">
        {selectedBusiness ? (
          <BusinessDetailPage
            business={selectedBusiness}
            onBack={() => setSelectedBusiness(null)}
          />
        ) : (
          <HomePage onSelectBusiness={(b) => setSelectedBusiness(b)} />
        )}
      </div>
    </ComparisonProvider>
  );
};

export default App;
