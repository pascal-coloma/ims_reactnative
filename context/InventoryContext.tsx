import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { Insumo } from '@/data/types/types';
import { createContext, ReactNode, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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
  const { user } = useAuth();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) fetchInsumos();
  }, [user, refreshKey]);

  const fetchInsumos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConSesion('/ims/api/inv/get/');
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setInsumos(
        data.map(
          (item: any): Insumo => ({
            id: String(item.presentacion.id),
            nombre: item.presentacion.nombre,
            categoria: item.presentacion.categoria,
            cantidad: item.presentacion.cantidad,
            unidadMedida: item.presentacion.unidad_medida,
            ambulanciaPatente: item.ambulancia.patente,
            stock: item.ambulancia.stock,
          }),
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

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);

  const agregarInsumo = useCallback((insumo: Insumo) => {
    setInsumos((prev) => [...prev, insumo]);
  }, []);

  const buscarInsumo = useCallback((termino: string) => {
    return insumos.filter((i) => i.nombre.toLowerCase().includes(termino.toLowerCase()));
  }, [insumos]);

  const editarInsumo = useCallback((id: string, insumoActualizado: Insumo) => {
    setInsumos((prev) => prev.map((i) => (i.id === id ? insumoActualizado : i)));
  }, []);

  const eliminarInsumo = useCallback((id: string) => {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo(
    () => ({ insumos, loading, error, agregarInsumo, buscarInsumo, editarInsumo, eliminarInsumo, recargar }),
    [insumos, loading, error, agregarInsumo, buscarInsumo, editarInsumo, eliminarInsumo, recargar],
  );

  return <InventarioContext.Provider value={value}>{children}</InventarioContext.Provider>;
};

export default InventarioProvider;

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx) throw new Error('useInventario debe usarse dentro de InventarioProvider');
  return ctx;
}
