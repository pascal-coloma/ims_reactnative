import { createContext, useContext, useState, ReactNode } from 'react';
import { Atencion } from '@/data/types/types';

type AtencionContextType = {
  atenciones: Atencion[];
  agregarAtencion: (atencion: Atencion) => void;
  buscarPorDespacho: (despachoId: string) => Atencion | undefined;
};

const AtencionContext = createContext<AtencionContextType | null>(null);

export const AtencionProvider = ({ children }: { children: ReactNode }) => {
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);

  const agregarAtencion = (atencion: Atencion) => {
    setAtenciones(prev => [...prev, atencion]);
  };

  const buscarPorDespacho = (despachoId: string) => {
    return atenciones.find(a => a.despachoId === despachoId);
  };

  return (
    <AtencionContext.Provider value={{ atenciones, agregarAtencion, buscarPorDespacho }}>
      {children}
    </AtencionContext.Provider>
  );
};

export const useAtenciones = () => {
  const ctx = useContext(AtencionContext);
  if (!ctx) throw new Error('useAtenciones debe usarse dentro de AtencionProvider');
  return ctx;
};