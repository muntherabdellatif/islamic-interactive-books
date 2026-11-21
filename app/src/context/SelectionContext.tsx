import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface SelectionContextValue {
  selectedEntityId: string | null;
  selectEntity: (entityId: string | null) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const value = useMemo<SelectionContextValue>(
    () => ({ selectedEntityId, selectEntity: setSelectedEntityId }),
    [selectedEntityId],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);
  if (!context) throw new Error("useSelection must be used within a SelectionProvider");
  return context;
}
