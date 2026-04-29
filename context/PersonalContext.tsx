import PERSONAL, { Personal } from '@/constants/mockPersonal';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type PersonalContextType = {
  personal: Personal[];
  actualizarDisponilidad: (id: string) => void;
};

const PersonalContext = createContext<PersonalContextType | null>(null);

const PersonalProvider = ({ children }: { children: ReactNode }) => {
  const [personal, setPersonal] = useState<Personal[]>(PERSONAL);

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const response = await fetch('http://52.91.220.207/ims/api/allpersonal/');
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const personal = await response.json();
        setPersonal(personal);
      } catch (error: any) {
        console.error(error.message);
      }
    };
    fetchPersonal();
  }, []);

  function actualizarDisponilidad(id: string): void {
    setPersonal((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: false } : p)));
  }
  return (
    <PersonalContext.Provider value={{ personal, actualizarDisponilidad }}>
      {children}
    </PersonalContext.Provider>
  );
};

export default PersonalProvider;

export function usePersonal() {
  const ctx = useContext(PersonalContext);
  if (!ctx) throw new Error('useContext debe usarse dentro de PersonalProvider');
  return ctx;
}
