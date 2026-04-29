import { createContext, useContext, useState } from 'react';
import mockDespachos, { Despacho } from '@/constants/mockDespachos';

type DespachosContextType = {
  despachos: Despacho[];
  agregarDespacho: (despacho: Despacho) => void;
};

const DespachosContext = createContext<DespachosContextType | null>(null);

export const useDespachos = () => {
  const context = useContext(DespachosContext);
  if (!context) throw new Error('useDespachos debe usarse dentro de DespachosProvider');
  return context;
};

const DespachosProvider = ({ children }: { children: React.ReactNode }) => {
  const [despachos, setDespachos] = useState<Despacho[]>(mockDespachos);

  const agregarDespacho = (despacho: Despacho) => {
    setDespachos((prev) => [...prev, despacho]);
  };

  return (
    <DespachosContext.Provider value={{ despachos, agregarDespacho }}>
      {children}
    </DespachosContext.Provider>
  );
};

export default DespachosProvider;
