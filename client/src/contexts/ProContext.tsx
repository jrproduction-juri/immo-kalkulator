import React, { createContext, useContext, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Plan-Hierarchie:
 *   none  → Free (1 Objekt, eingeschränkte Kennzahlen, kein PDF/Export)
 *   basic → Basic (10 Objekte, alle Kennzahlen, kein PDF/Exposé)
 *   pro   → Pro (50 Objekte, PDF, Exposé, Email, erweiterte Szenarien)
 *   investor → Investor (unbegrenzt, Excel, Portfolio)
 */

export const FREE_LIMITS = {
  maxObjekte: 1,
  /** Nur Bruttomietrendite + Netto-Cashflow sichtbar (keine EK-Rendite, AfA, Steuer etc.) */
  eingeschraenkteKennzahlen: true,
  /** Kein PDF-Export */
  keinPDF: true,
  /** Kein Excel-Export */
  keinExcel: true,
  /** Keine erweiterten Szenarien */
  keineSzenarien: true,
};

interface ProContextType {
  isPro: boolean;
  isBasic: boolean;
  isInvestor: boolean;
  isFree: boolean;
  plan: string;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  activatePro: () => void;
}

const ProContext = createContext<ProContextType>({
  isPro: false,
  isBasic: false,
  isInvestor: false,
  isFree: true,
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
  const isPro = plan === 'pro' || isInvestor;
  const isBasic = plan === 'basic' || isPro;
  const isFree = plan === 'none';

  const activatePro = () => {
    setShowUpgradeModal(false);
  };

  return (
    <ProContext.Provider value={{
      isPro,
      isBasic,
      isInvestor,
      isFree,
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
