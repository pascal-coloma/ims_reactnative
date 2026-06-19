import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { Ambulancia } from '@/data/mock/mockAmbulancia';
import { AmbulanciaEstado } from '@/data/constants/ambulanciaEstados';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

type AmbulanciaContextType = {
  ambulancias: Ambulancia[];
  cambiarEstado: (ambulanciaId: string, estado: AmbulanciaEstado) => Promise<void>;
  loading: boolean;
  error: string | null;
};

const AmbulanciaContext = createContext<AmbulanciaContextType | null>(null);

export const AmbulanciaProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [ambulancias, setAmbulancias] = useState<Ambulancia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchAmbulancias();
  }, [user?.role]);

  const fetchAmbulancias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConSesion('/ims/api/ambulancias/');

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setAmbulancias(
        data.map((a: any) => ({
          id: String(a.ambulancia_id),
          patente: a.patente,
          estado: a.estado,
        })),
      );
    } catch (e: any) {
      console.error('Error fetching ambulancias:', e);
      setError(e.message ?? 'Error desconocido');
      setAmbulancias([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const cambiarEstado = useCallback(
    async (ambulanciaId: string, estado: AmbulanciaEstado) => {
      const params = new URLSearchParams({
        ambid: ambulanciaId,
        conid: user?.personalId ?? '',
        estado,
      });
      const response = await fetchConSesion(`/ims/api/ambulancias/estados/?${params}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      await fetchAmbulancias();
    },
    [user?.personalId, fetchAmbulancias],
  );

  const value = useMemo(
    () => ({ ambulancias, cambiarEstado, loading, error }),
    [ambulancias, cambiarEstado, loading, error],
  );

  return <AmbulanciaContext.Provider value={value}>{children}</AmbulanciaContext.Provider>;
};

export const useAmbulancias = () => {
  const ctx = useContext(AmbulanciaContext);
  if (!ctx) throw new Error('useAmbulancias debe usarse dentro de AmbulanciaProvider');
  return ctx;
};
