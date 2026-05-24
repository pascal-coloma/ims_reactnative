import PERSONAL, { Personal } from '@/data/constants/mockPersonal';
import { createContext, ReactNode, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { fetchConSesion } from './AuthContext';
import { NuevoWorker, WorkerCreado } from '@/data/types';

type PersonalContextType = {
  personal: Personal[];
  actualizarDisponibilidad: (id: string) => void;
  registrarWorker: (data: NuevoWorker) => Promise<WorkerCreado | null>;
};

// funcionamiento del retorno de los permisos adquiridos por el endpoint dentro de la clase DataPersonal.
// Uso del serializer como
const PersonalContext = createContext<PersonalContextType | null>(null);

const PersonalProvider = ({ children }: { children: ReactNode }) => {
  const [personal, setPersonal] = useState<Personal[]>([]);

  const registrarWorker = useCallback(async (data: NuevoWorker): Promise<WorkerCreado | null> => {
    try {
      const response = await fetchConSesion('/ims/api/personal/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      return await response.json();
    } catch (e: any) {
      console.error('Error registrando worker:', e.message);
      return null;
    }
  }, []);
  // Revision de la autenticacion y el uso de cookies para el fetch del personal en base a sus credenciales.
  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const response = await fetchConSesion('/ims/api/personal/');
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setPersonal(data);
      } catch (error: any) {
        console.error('Error fetching personal:', error.message);
      }
    };
    fetchPersonal();
  }, []);

  const actualizarDisponibilidad = useCallback((id: string): void => {
    setPersonal((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: false } : p)));
  }, []);

  const value = useMemo(
    () => ({ personal, actualizarDisponibilidad, registrarWorker }),
    [personal, actualizarDisponibilidad, registrarWorker],
  );

  return <PersonalContext.Provider value={value}>{children}</PersonalContext.Provider>;
};

export default PersonalProvider;

export function usePersonal() {
  const ctx = useContext(PersonalContext);
  if (!ctx) throw new Error('useContext debe usarse dentro de PersonalProvider');
  return ctx;
}
