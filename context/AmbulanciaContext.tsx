import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { Ambulancia } from '@/data/constants/mockAmbulancia';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AmbulanciaContextType = {
  ambulancias: Ambulancia[];
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

  const fetchAmbulancias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConSesion('/ims/api/ambulancias/');

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();

      setAmbulancias(data.map((a: any) => ({ ...a, id: String(a.id) })));
    } catch (e: any) {
      console.error('Error fetching ambulancias:', e);
      setError(e.message ?? 'Error desconocido');
      setAmbulancias([]);
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
