import mockDespachos, { Despacho } from '@/data/constants/mockDespachos';
import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormCompleta } from '@/data/types/types';

const BACKEND_READY = true;

type DespachosContextType = {
  despachos: Despacho[];
  despachoActivo: Despacho | null;
  agregarDespacho: (data: FormCompleta) => Promise<void>;
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
  const { user } = useAuth();
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
      const endpoint = user?.role === 'control'
        ? '/ims/api/despachos/getall/'
        : '/ims/api/despachos/';

      const response = await fetchConSesion(endpoint);
      console.log('data despachos raw:', await response.clone().json());
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();

      const mapped: Despacho[] = data.map((d: any) => ({
        id: String(d.id),
        primerNombre: '',
        segundoNombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rut: '',
        edad: 0,
        telefono: '',
        direccionOrigen: d.direccion_origen,
        direccionDestino: d.direccion_destino,
        estado: d.estado === 'asignado' ? 'activo' : d.estado,
        prioridad: 'alta',
        tipoEmergencia: d.descripcion_llamado,
        unidad: d.ambulancia_id ? String(d.ambulancia_id) : '',
        personalIds: d.personal
          ? d.personal.map((p: any) => String(p.personal__id))
          : [],
        ambulancia: d.ambulancia_id
          ? {
            id: String(d.ambulancia_id),
            numeroMovil: String(d.ambulancia_id),
            patente: '',
            tipo: 'basica',
            disponible: false,
          }
          : undefined,
        observaciones: d.descripcion_llamado,
      }));
      console.log('personal sample:', JSON.stringify(data[0]?.personal, null, 2));

      setDespachos(mapped);
    } catch (e: any) {
      console.error('Error fetching despachos:', e);
      setError(e.message ?? 'Error desconocido');
      setDespachos(mockDespachos);
    } finally {
      setLoading(false);
    }
  };

  const agregarDespacho = async (data: FormCompleta): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const grupoResp = await fetchConSesion('/ims/api/suscribirAgrupo/', {
        method: 'POST',
        body: JSON.stringify({
          nombre_grupo: `Despacho-${Date.now()}`,
          personal: data.equipoAsignado.map(Number), 
        }),
      });
      if (!grupoResp.ok) throw new Error(`Error creando grupo: ${grupoResp.status}`);
      const grupoData = await grupoResp.json();
      console.log('Paso 1 - grupo:', grupoData);
      const grupo_id: number = grupoData.group_id;

      // Paso 2 — crear el despacho
      const despachoResp = await fetchConSesion('/ims/api/despachos/create/', {
        method: 'POST',
        body: JSON.stringify({
          d_o: data.direccionOrigen,
          d_d: data.direccionDestino,
          d_llamado: data.tipoEmergencia, 
        }),
      });
      if (!despachoResp.ok) {
        const errorText = await despachoResp.text().catch(() => 'no body');
        console.log('Paso 2 - error raw:', errorText);
        throw new Error(`Error creando despacho: ${despachoResp.status}`);
      }
      const despachoData = await despachoResp.json();
      console.log('Paso 2 - despacho:', despachoData);
      const despacho_id: number = despachoData.despacho_id;

      const asignarResp = await fetchConSesion('/ims/api/despachos/asignar/', {
        method: 'PATCH',
        body: JSON.stringify({
          amb_id: Number(data.unidad),
          d_id: despacho_id,
          grupo_id,
        }),
      });
      console.log('Paso 3 - asignado');
      if (!asignarResp.ok) throw new Error(`Error asignando despacho: ${asignarResp.status}`);

      await fetchDespachos();
    } catch (e: any) {
      console.error('Error en agregarDespacho:', e);
      setError(e.message ?? 'Error desconocido');
      throw e; // re-lanzar para que el componente pueda reaccionar
    } finally {
      setLoading(false);
    }
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
