import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { fetchConSesion } from './AuthContext';
import { Grupo } from '@/data/types/types';

type GrupoContextType = {
  grupos: Grupo[];
  loading: boolean;
  fetchGrupos: () => Promise<void>;
  crearGrupo: (nombre: string, personalIds: number[]) => Promise<void>;
  agregarMiembro: (grupoId: number, personalId: number) => Promise<void>;
  removerMiembro: (grupoId: number, personalId: number) => Promise<void>;
};

const GrupoContext = createContext<GrupoContextType | null>(null);

const GrupoProvider = ({ children }: { children: ReactNode }) => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGrupos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchConSesion('/ims/api/grupo/');
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setGrupos(data);
    } catch (error: unknown) {
      if (error instanceof Error) console.error('Error fetching grupos:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearGrupo = async (nombre: string, personalIds: number[]): Promise<void> => {
    const response = await fetchConSesion('/ims/api/grupo/crear/', {
      method: 'POST',
      body: JSON.stringify({ nombre_grupo: nombre, personal: personalIds }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error ?? `Error ${response.status}`);
    }
    await fetchGrupos();
  };

  const agregarMiembro = async (grupoId: number, personalId: number): Promise<void> => {
    const response = await fetchConSesion('/ims/api/grupo/suscribir/', {
      method: 'POST',
      body: JSON.stringify({ grupo_id: grupoId, personal_id: personalId }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const err = new Error(body?.error ?? `Error ${response.status}`);
      (err as Error & { status: number }).status = response.status;
      throw err;
    }
  };

  const removerMiembro = async (grupoId: number, personalId: number): Promise<void> => {
    const response = await fetchConSesion('/ims/api/grupo/desuscribir/', {
      method: 'PATCH',
      body: JSON.stringify({ group_id: grupoId, personal_id: personalId }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.error ?? `Error ${response.status}`);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  return (
    <GrupoContext.Provider
      value={{ grupos, loading, fetchGrupos, crearGrupo, agregarMiembro, removerMiembro }}
    >
      {children}
    </GrupoContext.Provider>
  );
};

export default GrupoProvider;

export function useGrupos() {
  const ctx = useContext(GrupoContext);
  if (!ctx) throw new Error('useGrupos debe usarse dentro de GrupoProvider');
  return ctx;
}
