import { fetchConSesion } from '@/context/AuthContext';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Atencion } from '@/data/types/types';


type AtencionResumen = {
  id: number;
  hora_salida: string;
  hora_llegada: string | null;
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
      const mapped = data.map((a: any) => ({
        id: a.atencion_id,
        hora_salida: a.hora_salida,
        hora_llegada: a.hora_llegada,
        estado_sello: a.estado_sello,
        paciente__nombre_completo: a.despacho?.paciente?.nombre ?? 'Sin paciente',
      }));
      setResumenAtenciones(mapped);
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchAtencionDetalle = async (id: number) => {
    try {
      // Paso 1 — obtener URL presignada de S3
      const response = await fetchConSesion(`/ims/api/atenciones/?id=${id}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      const s3Url = data.success;
      console.log('S3 URL:', s3Url);

      // Paso 2 — fetch del documento desde S3
      const s3Resp = await fetch(s3Url);
      if (!s3Resp.ok) throw new Error('Error descargando documento de S3');
      const documento = await s3Resp.json();
      console.log('Documento S3:', JSON.stringify(documento, null, 2));
      return documento;
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
