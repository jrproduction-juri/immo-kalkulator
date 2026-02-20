import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProContextType {
  isPro: boolean;
  activatePro: () => void;
  deactivatePro: () => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
}

const ProContext = createContext<ProContextType>({
  isPro: false,
  activatePro: () => {},
  deactivatePro: () => {},
  showUpgradeModal: false,
  setShowUpgradeModal: () => {},
});

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(() => {
    return localStorage.getItem('immo_pro_status') === 'true';
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const activatePro = () => {
    setIsPro(true);
    localStorage.setItem('immo_pro_status', 'true');
    setShowUpgradeModal(false);
  };

  const deactivatePro = () => {
    setIsPro(false);
    localStorage.removeItem('immo_pro_status');
  };

  return (
    <ProContext.Provider value={{ isPro, activatePro, deactivatePro, showUpgradeModal, setShowUpgradeModal }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  return useContext(ProContext);
}
