import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalContextType {
  isAdminLoginOpen: boolean;
  openAdminLogin: () => void;
  closeAdminLogin: () => void;
  isMoreDrawerOpen: boolean;
  openMoreDrawer: () => void;
  closeMoreDrawer: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  const openAdminLogin = useCallback(() => setIsAdminLoginOpen(true), []);
  const closeAdminLogin = useCallback(() => setIsAdminLoginOpen(false), []);
  const openMoreDrawer = useCallback(() => setIsMoreDrawerOpen(true), []);
  const closeMoreDrawer = useCallback(() => setIsMoreDrawerOpen(false), []);

  return (
    <ModalContext.Provider
      value={{
        isAdminLoginOpen,
        openAdminLogin,
        closeAdminLogin,
        isMoreDrawerOpen,
        openMoreDrawer,
        closeMoreDrawer,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};
