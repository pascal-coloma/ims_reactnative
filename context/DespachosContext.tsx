import mockDespachos, { Despacho } from '@/data/mock/mockDespachos';
import { OFFLINE_MODE } from '@/data/constants/defaultValues';
import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { createContext, useCallback, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import { FormCompleta } from '@/data/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAmbulancias } from './AmbulanciaContext';

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
  recargar: () => void;
};

const DespachosContext = createContext<DespachosContextType | null>(null);

export const useDespachos = () => {
  const context = useContext(DespachosContext);
  if (!context) throw new Error('useDespachos debe usarse dentro de DespachosProvider');
  return context;
};

const DespachosProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [despachoActivo, setDespachoActivo] = useState<Despacho | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const recargar = useCallback(() => setRefreshKey((prev) => prev + 1), []);

  useEffect(() => {
    if (user) fetchDespachos();
  }, [refreshKey]);

  const fetchDespachos = useCallback(async () => {
    if (OFFLINE_MODE) {
      setDespachos(mockDespachos);
      setDespachoActivo(mockDespachos.find((d) => d.estado === 'activo') ?? null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const esControl = user?.role === 'control';
      const endpoint = '/ims/api/despachos/getall/';

      const response = await fetchConSesion(endpoint);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();

      const mapearControl = (d: any): Despacho => ({
        id: String(d.id),
        direccionOrigen: d.direccion_origen,
        direccionDestino: d.direccion_destino,
        descripcionLlamado: d.descripcion_llamado,
        estado: d.estado === 'asignado' ? 'activo' : d.estado,
        fechaLlamado: d.fecha_llamado,
        fechaAsignacion: d.fecha_asignacion,
        paciente: d.paciente ?? undefined,
        rutPaciente: d.paciente?.rut ?? undefined,
        personalIds: d.personal ? d.personal.map((p: any) => String(p.personal__id)) : [],
        grupoNombre: d.grupo_nombre ?? undefined,
        ambulancia: d.ambulancia_id
          ? {
              ambulancia_id: Number(d.ambulancia_id),
              patente: '',
              estado: 'disponible' as const,
              stock: [],
            }
          : undefined,
      });

      const mapearWorker = (d: any): Despacho => ({
        id: String(d.id),
        direccionOrigen: d.direccionOrigen,
        direccionDestino: d.direccionDestino,
        descripcionLlamado: d.descripcionLlamado,
        estado: d.estado === 'asignado' ? 'activo' : d.estado,
        fechaLlamado: d.fechaLlamado,
        personalIds: d.personalIds ?? [],
        grupoNombre: d.grupoNombre ?? undefined,
        paciente: d.paciente ?? undefined,
        rutPaciente: d.paciente?.rut ?? undefined,
        ambulancia: d.ambulancia
          ? {
              ambulancia_id: Number(d.ambulancia.id),
              patente: d.ambulancia.patente ?? '',
              estado: d.ambulancia.estado ?? 'disponible',
              stock: [],
            }
          : undefined,
      });
      const mapped: Despacho[] = data.map(esControl ? mapearControl : mapearWorker);

      setDespachos(mapped);
    } catch (e: any) {
      console.error('Error fetching despachos:', e);
      setError(e.message ?? 'Error desconocido');
      setDespachos([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role, refreshKey]);

  const agregarDespacho = useCallback(async (data: FormCompleta): Promise<void> => {
    console.log('agregarDespacho llamado');
    console.log('data:', JSON.stringify(data, null, 2));
    const rutLimpio = data.rut.replace(/\./g, '');
    console.log('rutLimpio:', rutLimpio);

    setLoading(true);
    setError(null);
    try {
      const buscarResp = await fetchConSesion(
        `/ims/api/pacientes/?rut=${encodeURIComponent(rutLimpio)}`,
      );

      if (!buscarResp.ok) {
        const payloadPaciente = {
          rut: rutLimpio,
          nombre_completo: [
            data.primerNombre,
            data.segundoNombre ?? '',
            data.apellidoPaterno,
            data.apellidoMaterno,
          ]
            .filter(Boolean)
            .join(' '),
          fecha_nacimiento: data.fechaNacimiento.split('-').reverse().join('-'),
          direccion: data.direccionOrigen,
          condicion_paciente: data.condicionPaciente,
          telefono: (data.telefono ?? '').replace(/\s/g, '').slice(0, 12),
        };
        console.log('Paso 0 - paciente no existe, creando...');
        const crearResp = await fetchConSesion('/ims/api/pacientes/add', {
          method: 'POST',
          body: JSON.stringify(payloadPaciente),
        });
        if (!crearResp.ok) {
          const errorText = await crearResp.text().catch(() => 'no body');
          console.log('Error creando paciente:', errorText);
          throw new Error(`Error creando paciente: ${crearResp.status}`);
        }
        console.log('Paso 0 - paciente creado');
      } else {
        console.log('Paso 0 - paciente existente encontrado');
      }
      const despachoResp = await fetchConSesion('/ims/api/despachos/add/', {
        method: 'POST',
        body: JSON.stringify({
          direccion_origen: data.direccionOrigen,
          direccion_destino: data.direccionDestino,
          descripcion_llamado: data.descripcionLlamado,
          paciente_rut: rutLimpio,
        }),
      });
      if (!despachoResp.ok) {
        const errorText = await despachoResp.text().catch(() => 'no body');
        console.log('Error despacho body:', errorText);
        throw new Error(`Error creando despacho: ${despachoResp.status}`);
      }
      const despachoData = await despachoResp.json();
      console.log('Paso 1 - despacho:', despachoData);

      // Paso 2 — asignar
      const asignarResp = await fetchConSesion('/ims/api/despachos/asignar/', {
        method: 'PATCH',
        body: JSON.stringify({
          amb_id: Number(data.unidad),
          despacho_id: despachoData.despacho.id,
          grupo_id: Number(data.grupoAsignado),
        }),
      });
      if (!asignarResp.ok) {
        const errorText = await asignarResp.text().catch(() => 'no body');
        console.log('Error asignar body:', errorText);
        throw new Error(`Error asignando despacho: ${asignarResp.status}`);
      }
      console.log('Paso 2 - asignado');

      try {
        await fetchDespachos();
      } catch (e) {
        console.warn('fetchDespachos falló pero el despacho fue creado');
      }
    } catch (e: any) {
      console.error('Error en agregarDespacho:', e);
      setError(e.message ?? 'Error desconocido');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchDespachos]);

  const actualizarDespacho = useCallback((id: string, despacho: Partial<Despacho>) => {
    setDespachos((prev) => prev.map((d) => (d.id === id ? { ...d, ...despacho } : d)));
  }, []);

  const seleccionarDespacho = useCallback((id: string) => {
    setDespachoActivo(despachos.find((d) => d.id === id) ?? null);
  }, [despachos]);

  const despachosPorPersonal = useCallback(
    (personalId: string) =>
      despachos.filter((d) => d.personalIds?.includes(personalId) && d.estado === 'activo'),
    [despachos],
  );

  const setDespachoActivoPorUsuario = useCallback((personalId: string) => {
    setDespachoActivo(
      despachos.find((d) => d.personalIds?.includes(personalId) && d.estado === 'activo') ?? null,
    );
  }, [despachos]);

  const limpiarDespachoActivo = useCallback(() => setDespachoActivo(null), []);

  const value = useMemo(
    () => ({
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
      fetchDespachos,
      recargar,
    }),
    [despachos, despachoActivo, agregarDespacho, actualizarDespacho, seleccionarDespacho,
     despachosPorPersonal, setDespachoActivoPorUsuario, limpiarDespachoActivo,
     loading, error, fetchDespachos, recargar],
  );

  return (
    <DespachosContext.Provider value={value}>
      {children}
    </DespachosContext.Provider>
  );
};

export default DespachosProvider;
