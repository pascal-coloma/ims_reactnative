import { fetchConSesion } from '@/context/AuthContext';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Atencion } from '@/data/types/types';

const BACKEND_READY = true;

type AtencionResumen = {
  id: number;
  hora_salida: string;
  hora_llegada: string;
  estado_sello: string;
  paciente__nombre_completo: string;
};

type AtencionContextType = {
  atenciones: Atencion[];
  resumenAtenciones: AtencionResumen[];
  agregarAtencion: (
    atencion: Atencion,
    ambulanciaId: string,
    direccionDespacho: string, // ← agrega
  ) => Promise<void>;
  fetchAtenciones: () => Promise<void>;
  fetchAtencionDetalle: (id: number) => Promise<any>;
  buscarPorDespacho: (despachoId: string) => Atencion | undefined;
  loading: boolean;
  error: string | null;
};

const AtencionContext = createContext<AtencionContextType | null>(null);

export const AtencionProvider = ({ children }: { children: ReactNode }) => {
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [resumenAtenciones, setResumenAtenciones] = useState<AtencionResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatearHora = (hora: string) => {
    const nums = hora.replace(/[^0-9]/g, '');
    return nums.padStart(4, '0').slice(0, 4); // "557" → "0557"
  };

  const agregarAtencion = async (
    atencion: Atencion,
    ambulanciaId: string,
    direccionDespacho: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Paso 0 — buscar paciente por rut
      const buscarResp = await fetchConSesion(
        `/ims/api/pacientes/?rut=${encodeURIComponent(atencion.paciente.rut)}`,
      );
      if (!buscarResp.ok)
        throw new Error('Paciente no encontrado — debe ser registrado por control primero');
      const pacienteData = await buscarResp.json();
      const paciente_id: number = pacienteData.id;
      console.log('Paso 0 - paciente_id:', paciente_id);

      // Paso 1 — registrar atención
      const formatearHora = (hora: string) => {
        const nums = hora.replace(/[^0-9]/g, '');
        return nums.padStart(4, '0').slice(0, 4);
      };

      const payload = {
        despacho: {
          despacho_id: Number(atencion.despachoId),
          paciente_id,
          ambulancia_id: Number(ambulanciaId),
          direccion_despacho: direccionDespacho,
          hora_salida: atencion.fechaRegistro,
          hora_llegada: atencion.fechaRegistro,
        },
        signos_vitales: atencion.controlSignos.map((s) => ({
          presion_sistolica: s.pas,
          presion_diastolica: s.pad,
          frecuencia_cardiaca: s.fc,
          saturacion_oxigeno: s.satO2,
          temperatura: s.temperatura,
          fr: s.fr,
          fio2: s.fio2,
          hgt: s.hgt,
          gcs: s.gcs,
          eva: s.eva,
          hora: formatearHora(s.hora),
        })),
        preinforme: {
          pre_informe: atencion.preInforme.preInforme,
          motivo_llamado: atencion.preInforme.motivoLlamado,
          estado_paciente: atencion.preInforme.estadoPaciente,
        },
        cronologia: {
          hora_llamada: formatearHora(atencion.cronologia.horaLlamada),
          despacho_movil: formatearHora(atencion.cronologia.despachoMovil),
          llegada_qth1: formatearHora(atencion.cronologia.llegadaQTH1),
          salida_qth1: formatearHora(atencion.cronologia.salidaQTH1),
          llegada_qth2: formatearHora(atencion.cronologia.llegadaQTH2),
          salida_qth2: formatearHora(atencion.cronologia.salidaQTH2),
          categoria: atencion.cronologia.categoria,
        },
        insumos_utilizados: [],
      };

      const atencionResp = await fetchConSesion('/ims/api/atenciones/add/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!atencionResp.ok) {
        const errorBody = await atencionResp.json().catch(() => ({}));
        console.log('Error atención:', JSON.stringify(errorBody, null, 2));
        throw new Error(`Error registrando atención: ${atencionResp.status}`);
      }
      const result = await atencionResp.json();
      console.log('Paso 1 - atención registrada:', result);

      setAtenciones((prev) => [...prev, atencion]);
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const fetchAtenciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchConSesion('/ims/api/atenciones/');
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setResumenAtenciones(data);
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchAtencionDetalle = async (id: number) => {
    try {
      const response = await fetchConSesion(`/ims/api/atenciones/${id}/`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      return data.datos_atencion;
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
      return null;
    }
  };

  const buscarPorDespacho = (despachoId: string) =>
    atenciones.find((a) => a.despachoId === despachoId);

  return (
    <AtencionContext.Provider
      value={{
        atenciones,
        resumenAtenciones,
        agregarAtencion,
        fetchAtenciones,
        fetchAtencionDetalle,
        buscarPorDespacho,
        loading,
        error,
      }}
    >
      {children}
    </AtencionContext.Provider>
  );
};

export const useAtenciones = () => {
  const ctx = useContext(AtencionContext);
  if (!ctx) throw new Error('useAtenciones debe usarse dentro de AtencionProvider');
  return ctx;
};
