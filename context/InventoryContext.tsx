import mockInsumos, { Insumo } from '@/data/constants/mockInventario';
import { createContext, ReactNode, useContext, useState } from 'react';

type InventarioContextType = {
  insumos: Insumo[];
  agregarInsumo: (insumo: Insumo) => void;
  buscarInsumo: (ubicacion: string) => Insumo[];
  editarInsumo: (id: string, insumo: Insumo) => void;
  eliminarInsumo: (id: string) => void;
};

const InventarioContext = createContext<InventarioContextType | null>(null);

const InventarioProvider = ({ children }: { children: ReactNode }) => {
  const [insumos, setInsumos] = useState<Insumo[]>(mockInsumos);

  const agregarInsumo = (insumo: Insumo) => {
    setInsumos([...insumos, insumo]);
  };

  const buscarInsumo = (ubicacion: string) => {
    const insumo = insumos.filter((p) => p.ubicacion == ubicacion);
    return insumo;
  };

  const editarInsumo = (id: string, insumoActualizado: Insumo) => {
    const insumosActualizados = insumos.map((i) => (i.id == id ? insumoActualizado : i));
    setInsumos(insumosActualizados);
  };

  const eliminarInsumo = (id: string) => {
    const insumoEliminado = insumos.filter((i) => i.id != id);
    setInsumos(insumoEliminado);
  };

  return (
    <InventarioContext.Provider
      value={{ insumos, agregarInsumo, buscarInsumo, editarInsumo, eliminarInsumo }}
    >
      {children}
    </InventarioContext.Provider>
  );
};

export default InventarioProvider;

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx) throw new Error('useContext debe usarse dentro de PersonalProvider');
  return ctx;
}
