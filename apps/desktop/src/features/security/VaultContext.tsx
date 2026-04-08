import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface VaultContextValue {
  masterPassword: string;
  isUnlocked: boolean;
  setMasterPassword: (value: string) => void;
  unlock: () => void;
  lock: () => void;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({
  children,
  initialPassword = "",
  initialUnlocked = false,
}: {
  children: ReactNode;
  initialPassword?: string;
  initialUnlocked?: boolean;
}) {
  const [masterPassword, setMasterPassword] = useState(initialPassword);
  const [isUnlocked, setIsUnlocked] = useState(initialUnlocked);

  const value = useMemo<VaultContextValue>(
    () => ({
      masterPassword,
      isUnlocked,
      setMasterPassword,
      unlock: () => setIsUnlocked(true),
      lock: () => setIsUnlocked(false),
    }),
    [isUnlocked, masterPassword],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVault must be used inside VaultProvider");
  }

  return context;
}
