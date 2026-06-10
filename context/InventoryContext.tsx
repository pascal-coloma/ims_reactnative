import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { Insumo, NuevoInsumo } from '@/data/types';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type InventarioContextType = {
  insumos: Insumo[];
  loading: boolean;
  error: string | null;
  buscarInsumo: (termino: string) => Insumo[];
  agregarInsumos: (items: NuevoInsumo[]) => Promise<void>;
  actualizarStock: (
    presentacionId: number,
    ambulanciaId: number,
    cantidad: number,
  ) => Promise<void>;
  moverInsumo: (
    presentacionId: number,
    ambulanciaFromId: number,
    ambulanciaToId: number,
    cantidad: number,
  ) => Promise<void>;
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
  }, [authLoading, refreshKey, user?.role]);

  const fetchInsumos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // El driver no tiene permiso de lectura de inventario en el backend.
      if (user?.role === 'driver') {
        setInsumos([]);
        return;
      }

      // /ims/api/inv/ es exclusivo de control; medic/nurse usan /ims/api/ambulancias/
      if (user?.role !== 'control') {
        const ambResp = await fetchConSesion('/ims/api/ambulancias/');
        if (!ambResp.ok) throw new Error(`Error ${ambResp.status}`);
        const ambData = await ambResp.json();

        setInsumos(
          ambData.flatMap((ambulancia: any) =>
            (ambulancia.stock ?? []).map(
              (item: any): Insumo => ({
                id: String(item.presentacion_id),
                nombre: item.insumo_nombre,
                categoria: item.categoria,
                cantidad: item.insumo_cantidad,
                unidadMedida: item.unidad_medida,
                ambulanciaPatente: ambulancia.patente,
                ambulanciaId: ambulancia.ambulancia_id,
                stock: item.stock,
              }),
            ),
          ),
        );
        return;
      }

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
  }, [authLoading, refreshKey, user?.role]);

  const recargar = useCallback(() => setRefreshKey((k) => k + 1), []);

  const buscarInsumo = useCallback(
    (termino: string) =>
      insumos.filter((i) => i.nombre.toLowerCase().includes(termino.toLowerCase())),
    [insumos],
  );

  const agregarInsumos = useCallback(
    async (items: NuevoInsumo[]) => {
      const response = await fetchConSesion('/ims/api/inv/add/', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      recargar();
    },
    [recargar],
  );

  // cantidad es un delta positivo o negativo que se suma al stock actual
  const actualizarStock = useCallback(
    async (presentacionId: number, ambulanciaId: number, cantidad: number) => {
      const response = await fetchConSesion('/ims/api/inv/update/', {
        method: 'PATCH',
        body: JSON.stringify({
          presentacion_id: presentacionId,
          ambulancia_id: ambulanciaId,
          cantidad,
        }),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      recargar();
    },
    [recargar],
  );

  const moverInsumo = useCallback(
    async (
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
    },
    [recargar],
  );

  const value = useMemo(
    () => ({
      insumos,
      loading,
      error,
      buscarInsumo,
      agregarInsumos,
      actualizarStock,
      moverInsumo,
      recargar,
    }),
    [insumos, loading, error, buscarInsumo, agregarInsumos, actualizarStock, moverInsumo, recargar],
  );

  return <InventarioContext.Provider value={value}>{children}</InventarioContext.Provider>;
};

export default InventarioProvider;

export function useInventario() {
  const ctx = useContext(InventarioContext);
  if (!ctx) throw new Error('useInventario debe usarse dentro de InventarioProvider');
  return ctx;
}
