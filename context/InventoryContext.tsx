import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { Insumo, NuevoInsumo } from '@/data/types/types';
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';

type InventarioContextType = {
  insumos: Insumo[];
  loading: boolean;
  error: string | null;
  buscarInsumo: (termino: string) => Insumo[];
  agregarInsumos: (items: NuevoInsumo[]) => Promise<void>;
  actualizarStock: (presentacionId: number, ambulanciaId: number, cantidad: number) => Promise<void>;
  moverInsumo: (presentacionId: number, ambulanciaFromId: number, ambulanciaToId: number, cantidad: number) => Promise<void>;
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
      const [invResp, ambResp] = await Promise.all([
        fetchConSesion('/ims/api/inv/'),
        fetchConSesion('/ims/api/ambulancias/'),
      ]);
      if (!invResp.ok) throw new Error(`Error ${invResp.status}`);
      if (!ambResp.ok) throw new Error(`Error ${ambResp.status}`);

      const data = await invResp.json();
      const ambData = await ambResp.json();

      const patenteToId = new Map<string, number>(
        ambData.map((a: any) => [a.patente, a.ambulancia_id]),
      );

      setInsumos(
        data.map(
          (item: any): Insumo => ({
            id: String(item.presentacion.id),
            nombre: item.presentacion.nombre,
            categoria: item.presentacion.categoria,
            cantidad: item.presentacion.cantidad,
            unidadMedida: item.presentacion.unidad_medida,
            ambulanciaPatente: item.ambulancia.patente,
            ambulanciaId: patenteToId.get(item.ambulancia.patente) ?? 0,
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

  const recargar = () => setRefreshKey((k) => k + 1);

  const buscarInsumo = (termino: string) =>
    insumos.filter((i) => i.nombre.toLowerCase().includes(termino.toLowerCase()));

  const agregarInsumos = async (items: NuevoInsumo[]) => {
    const response = await fetchConSesion('/ims/api/inv/add/', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    recargar();
  };

  // cantidad es un delta positivo o negativo que se suma al stock actual
  const actualizarStock = async (presentacionId: number, ambulanciaId: number, cantidad: number) => {
    const response = await fetchConSesion('/ims/api/inv/update/', {
      method: 'PATCH',
      body: JSON.stringify({ presentacion_id: presentacionId, ambulancia_id: ambulanciaId, cantidad }),
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    recargar();
  };

  const moverInsumo = async (
    presentacionId: number,
    ambulanciaFromId: number,
    ambulanciaToId: number,
    cantidad: number,
  ) => {
    const response = await fetchConSesion('/ims/api/inv/move/', {
      method: 'PATCH',
      body: JSON.stringify({
        presentacion_id: presentacionId,
        ambulancia_from_id: ambulanciaFromId,
        ambulancia_to_id: ambulanciaToId,
        cantidad,
      }),
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);
    recargar();
  };

  return (
    <InventarioContext.Provider
      value={{
        insumos,
        loading,
        error,
        buscarInsumo,
        agregarInsumos,
        actualizarStock,
        moverInsumo,
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
