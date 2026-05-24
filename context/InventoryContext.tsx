import mockInsumos from '@/data/constants/mockInventario';
import { Insumo } from '@/data/types/types';
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';

type InventarioContextType = {
  insumos: Insumo[];
  loading: boolean;
  agregarInsumo: (insumo: Insumo) => void;
  buscarInsumo: (ubicacion: string) => Insumo[];
  editarInsumo: (id: string, insumo: Insumo) => void;
  eliminarInsumo: (id: string) => void;
  recargar: () => void;
};

const InventarioContext = createContext<InventarioContextType | null>(null);

const InventarioProvider = ({ children }: { children: ReactNode }) => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setInsumos(mockInsumos);
    setLoading(false);
  }, [refreshKey]);

  const recargar = () => setRefreshKey((k) => k + 1);

  const agregarInsumo = (insumo: Insumo) => {
    setInsumos((prev) => [...prev, insumo]);
  };

  const buscarInsumo = (termino: string) => {
    return insumos.filter((i) => i.nombre.toLowerCase().includes(termino.toLowerCase()));
  };

  const editarInsumo = (id: string, insumoActualizado: Insumo) => {
    setInsumos((prev) => prev.map((i) => (i.id === id ? insumoActualizado : i)));
  };

  const eliminarInsumo = (id: string) => {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <InventarioContext.Provider
      value={{
        insumos,
        loading,
        agregarInsumo,
        buscarInsumo,
        editarInsumo,
        eliminarInsumo,
        recargar,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
};

export default InventarioProvider;

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx) throw new Error('useInventario debe usarse dentro de InventarioProvider');
  return ctx;
}
