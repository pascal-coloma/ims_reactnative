import mockDespachos, { Despacho } from '@/data/constants/mockDespachos';
import { fetchConSesion } from '@/context/AuthContext';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const BACKEND_READY = true;

type DespachosContextType = {
  despachos: Despacho[];
  despachoActivo: Despacho | null;
  agregarDespacho: (despacho: Despacho) => void;
  actualizarDespacho: (id: string, despacho: Partial<Despacho>) => void;
  seleccionarDespacho: (id: string) => void;
  despachosPorPersonal: (personalId: string) => Despacho[];
  setDespachoActivoPorUsuario: (personalId: string) => void;
  limpiarDespachoActivo: () => void;
  loading: boolean;
  error: string | null;
  fetchDespachos: () => Promise<void>;
};

const DespachosContext = createContext<DespachosContextType | null>(null);

export const useDespachos = () => {
  const context = useContext(DespachosContext);
  if (!context) throw new Error('useDespachos debe usarse dentro de DespachosProvider');
  return context;
};

const DespachosProvider = ({ children }: { children: ReactNode }) => {
  const [despachos, setDespachos] = useState<Despacho[]>(mockDespachos);
  const [despachoActivo, setDespachoActivo] = useState<Despacho | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (BACKEND_READY) fetchDespachos();
  }, []);

  const fetchDespachos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConSesion('/ims/api/despachos/');
      console.log(response);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();

      const mapped: Despacho[] = data.map((d: any) => ({
        id: d.id,
        primerNombre: '',
        segundoNombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rut: '',
        edad: 0,
        telefono: '',
        direccionOrigen: d.direccionOrigen,
        direccionDestino: d.direccionDestino,
        estado: d.estado === 'asignado' ? 'activo' : d.estado,
        prioridad: 'alta',
        tipoEmergencia: d.descripcionLlamado,
        unidad: d.ambulancia?.id ?? '',
        personalIds: d.personalIds,
        ambulancia: d.ambulancia
          ? {
              id: d.ambulancia.id,
              numeroMovil: d.ambulancia.id,
              patente: d.ambulancia.patente,
              tipo: 'basica',
              disponible: d.ambulancia.estado === 'disponible',
            }
          : undefined,
        observaciones: d.descripcionLlamado,
      }));

      setDespachos(mapped);
    } catch (e: any) {
      console.error('Error fetching despachos:', e);
      setError(e.message ?? 'Error desconocido');
      setDespachos(mockDespachos);
    } finally {
      setLoading(false);
    }
  };

  const agregarDespacho = (despacho: Despacho) => {
    setDespachos((prev) => [...prev, despacho]);
  };

  const actualizarDespacho = (id: string, despacho: Partial<Despacho>) => {
    setDespachos((prev) => prev.map((d) => (d.id === id ? { ...d, ...despacho } : d)));
  };

  const seleccionarDespacho = (id: string) => {
    const despacho = despachos.find((d) => d.id === id);
    setDespachoActivo(despacho ?? null);
  };

  const despachosPorPersonal = (personalId: string) => {
    return despachos.filter((d) => d.personalIds?.includes(personalId) && d.estado === 'activo');
  };

  const setDespachoActivoPorUsuario = (personalId: string) => {
    const despacho = despachos.find(
      (d) => d.personalIds?.includes(personalId) && d.estado === 'activo',
    );
    setDespachoActivo(despacho ?? null);
  };

  const limpiarDespachoActivo = () => setDespachoActivo(null);

  return (
    <DespachosContext.Provider
      value={{
        despachos,
        despachoActivo,
        agregarDespacho,
        actualizarDespacho,
        seleccionarDespacho,
        despachosPorPersonal,
        setDespachoActivoPorUsuario,
        limpiarDespachoActivo,
        loading,
        error,
        fetchDespachos
      }}
    >
      {children}
    </DespachosContext.Provider>
  );
};

export default DespachosProvider;
