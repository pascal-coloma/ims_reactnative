import mockDespachos, { Despacho } from '@/data/constants/mockDespachos';
import { createContext, useContext, useState } from 'react';

type DespachosContextType = {
  despachos: Despacho[];
  despachoActivo: Despacho | null;
  agregarDespacho: (despacho: Despacho) => void;
  actualizarDespacho: (id: string, atencion: Partial<Despacho>) => void;
  seleccionarDespacho: (id: string) => void;
};

const DespachosContext = createContext<DespachosContextType | null>(null);

export const useDespachos = () => {
  const context = useContext(DespachosContext);
  if (!context) throw new Error('useDespachos debe usarse dentro de DespachosProvider');
  return context;
};

const DespachosProvider = ({ children }: { children: React.ReactNode }) => {
  const [despachos, setDespachos] = useState<Despacho[]>(mockDespachos);
  const [despachoActivo, setDespachoActivo] = useState<Despacho | null>(null);

  const agregarDespacho = (despacho: Despacho) => {
    setDespachos((prev) => [...prev, despacho]);
  };

  const actualizarDespacho = (id: string, atencion: Partial<Despacho>) => {
    setDespachos((prev) => prev.map((d) => (d.id === id ? { ...d, ...atencion } : d)));
  };

  const seleccionarDespacho = (id: string) => {
    const despacho = despachos.find((d) => d.id === id);
    setDespachoActivo(despacho ?? null);
  };

  return (
    <DespachosContext.Provider
      value={{
        despachos,
        despachoActivo,
        agregarDespacho,
        actualizarDespacho,
        seleccionarDespacho,
      }}
    >
      {children}
    </DespachosContext.Provider>
  );
};

export default DespachosProvider;
