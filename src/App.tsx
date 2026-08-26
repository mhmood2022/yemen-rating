import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { ComparisonProvider } from './context/ComparisonContext';

export function App() {
  const [currentPath, setCurrentPath] = useState('/');

  return (
    <ComparisonProvider>
      <div className="min-h-screen bg-[#0D0D0D] text-white">
        <HomePage onNavigate={(path) => setCurrentPath(path)} />
      </div>
    </ComparisonProvider>
  );
}

export default App;
