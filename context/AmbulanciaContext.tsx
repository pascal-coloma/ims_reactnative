import { fetchConSesion } from '@/context/AuthContext';
import { mockAmbulancias, Ambulancia } from '@/data/constants/mockAmbulancia';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const BACKEND_READY = true;

type AmbulanciaContextType = {
  ambulancias: Ambulancia[];
  loading: boolean;
  error: string | null;
};

const AmbulanciaContext = createContext<AmbulanciaContextType | null>(null);

export const AmbulanciaProvider = ({ children }: { children: ReactNode }) => {
  const [ambulancias, setAmbulancias] = useState<Ambulancia[]>(mockAmbulancias);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (BACKEND_READY) fetchAmbulancias();
  }, []);

  const fetchAmbulancias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConSesion('/ims/api/ambulancias/');
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      // mapear id a string para consistencia
      setAmbulancias(data.map((a: any) => ({ ...a, id: String(a.id) })));
    } catch (e: any) {
      console.error('Error fetching ambulancias:', e);
      setError(e.message ?? 'Error desconocido');
      setAmbulancias(mockAmbulancias);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AmbulanciaContext.Provider value={{ ambulancias, loading, error }}>
      {children}
    </AmbulanciaContext.Provider>
  );
};

export const useAmbulancias = () => {
  const ctx = useContext(AmbulanciaContext);
  if (!ctx) throw new Error('useAmbulancias debe usarse dentro de AmbulanciaProvider');
  return ctx;
};
