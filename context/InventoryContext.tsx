import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { Insumo } from '@/data/types/types';
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';

type InventarioContextType = {
  insumos: Insumo[];
  loading: boolean;
  error: string | null;
  agregarInsumo: (insumo: Insumo) => void;
  buscarInsumo: (termino: string) => Insumo[];
  editarInsumo: (id: string, insumo: Insumo) => void;
  eliminarInsumo: (id: string) => void;
  recargar: () => void;
};

const InventarioContext = createContext<InventarioContextType | null>(null);

const InventarioProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && user) fetchInsumos();
  }, [authLoading, refreshKey]);

  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConSesion('/ims/api/inv/');
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setInsumos(
        data.flatMap((ambulancia: any) =>
          (ambulancia.stock ?? []).map(
            (item: any): Insumo => ({
              id: String(item.presentacion_id),
              nombre: item.insumo_nombre,
              categoria: item.categoria,
              cantidad: item.insumo_cantidad,
              unidadMedida: item.unidad_medida,
              ambulanciaPatente: ambulancia.patente,
              stock: item.stock,
            }),
          ),
        ),
      );
    } catch (e: any) {
      console.error('Error fetching insumos:', e);
      setError(e.message ?? 'Error desconocido');
      setInsumos([]);
    } finally {
      setLoading(false);
    }
  };

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
        error,
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
