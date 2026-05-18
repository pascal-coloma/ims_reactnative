import mockDespachos, { Despacho } from '@/data/constants/mockDespachos';
import { fetchConSesion, useAuth } from '@/context/AuthContext';
import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { FormCompleta } from '@/data/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const esControl = user?.role === 'control';
      const endpoint = esControl ? '/ims/api/despachos/getall/' : '/ims/api/despachos/get/';

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
        personalIds: d.personal ? d.personal.map((p: any) => String(p.personal__id)) : [],
        ambulancia: d.ambulancia_id
          ? {
              id: String(d.ambulancia_id),
              patente: '',
              modelo: '',
              estado_disponibilidad: 'disponible',
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
        paciente: d.paciente ?? undefined,
        rutPaciente: d.paciente?.rut ?? undefined,
        ambulancia: d.ambulancia
          ? {
              id: String(d.ambulancia.id),
              patente: d.ambulancia.patente ?? '',
              modelo: d.ambulancia.modelo ?? '',
              estado_disponibilidad: d.ambulancia.estado ?? 'disponible',
            }
          : undefined,
      });
      const mapped: Despacho[] = data.map(esControl ? mapearControl : mapearWorker);

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
        // Paciente no existe → crear
        console.log('Paso 0 - paciente no existe, creando...');
        const crearResp = await fetchConSesion('/ims/api/pacientes/', {
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
        fetchDespachos,
      }}
    >
      {children}
    </DespachosContext.Provider>
  );
};

export default DespachosProvider;
