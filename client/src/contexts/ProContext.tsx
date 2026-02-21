import React, { createContext, useContext, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface ProContextType {
  isPro: boolean;
  isBasic: boolean;
  isInvestor: boolean;
  plan: string;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  // Legacy für bestehende Komponenten
  activatePro: () => void;
}

const ProContext = createContext<ProContextType>({
  isPro: false,
  isBasic: false,
  isInvestor: false,
  plan: 'none',
  showUpgradeModal: false,
  setShowUpgradeModal: () => {},
  activatePro: () => {},
});

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { isAuthenticated } = useAuth();

  // Plan aus der DB laden wenn eingeloggt
  const planQuery = trpc.plan.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const plan = planQuery.data?.plan ?? 'none';
  const isInvestor = plan === 'investor';
  const isPro = plan === 'pro' || plan === 'trial' || isInvestor;
  const isBasic = plan === 'basic' || isPro;

  const activatePro = () => {
    setShowUpgradeModal(false);
  };

  return (
    <ProContext.Provider value={{
      isPro,
      isBasic,
      isInvestor,
      plan,
      showUpgradeModal,
      setShowUpgradeModal,
      activatePro,
    }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  return useContext(ProContext);
}
