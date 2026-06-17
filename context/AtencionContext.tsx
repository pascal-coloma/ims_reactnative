import { fetchConSesion } from '@/context/AuthContext';
import { OFFLINE_MODE } from '@/data/constants/defaultValues';
import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { Atencion } from '@/data/types';
import { SignosVitales, PreInforme, Cronologia } from '@/data/types';

type AtencionResumen = {
  id: number;
  hora_salida: string;
  hora_llegada: string | null;
  estado_sello: string;
  firma_digital: string;
  paciente__nombre_completo: string;
};

type AtencionContextType = {
  atenciones: Atencion[];
  resumenAtenciones: AtencionResumen[];
  agregarAtencion: (atencion: Atencion, ambulanciaId: string) => Promise<any>;
  fetchAtenciones: () => Promise<void>;
  fetchAtencionDetalle: (id: number) => Promise<any>;
  fetchAtencionDetalleLocal: (id: number) => Promise<any>;
  modificarAtencion: (atencionId: number, data: ModificacionPayload) => Promise<void>;
  buscarPorDespacho: (despachoId: string) => Atencion | undefined;
  loading: boolean;
  error: string | null;
};

type ModificacionPayload = {
  controlSignos: SignosVitales[];
  preInforme: PreInforme;
  cronologia: Cronologia;
};

const AtencionContext = createContext<AtencionContextType | null>(null);

export const AtencionProvider = ({ children }: { children: ReactNode }) => {
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [resumenAtenciones, setResumenAtenciones] = useState<AtencionResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agregarAtencion = useCallback(async (atencion: Atencion, ambulanciaId: string) => {
    if (OFFLINE_MODE) {
      setAtenciones((prev) => [...prev, atencion]);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const formatearHora = (hora: string) => {
        const nums = hora.replace(/[^0-9]/g, '');
        return nums.padStart(4, '0').slice(0, 4);
      };

      const horaAISO = (hora: string) => {
        const hhmm = formatearHora(hora);
        const fecha = atencion.fechaRegistro.split('T')[0];
        return `${fecha}T${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}:00`;
      };

      const payload = {
        despacho: {
          despacho_id: Number(atencion.despachoId),
          ambulancia_id: Number(ambulanciaId),
          hora_salida: atencion.fechaRegistro,
          hora_llegada: horaAISO(atencion.cronologia.llegadaQTH1),
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
        insumos_utilizados: atencion.insumosUtilizados.map((i) => ({
          presentacion_id: Number(i.insumoId),
          cantidad_usada: i.dosis,
          observaciones: i.observaciones ?? '',
        })),
        rut_receptor: atencion.rutReceptor,
      };

      const atencionResp = await fetchConSesion('/ims/api/atenciones/add/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!atencionResp.ok) {
        const errorBody = await atencionResp.json().catch(() => ({}));
        console.log('Error atención:', JSON.stringify(errorBody, null, 2));
        if (atencionResp.status === 409) {
          throw new Error(
            'Este despacho ya fue finalizado o no hay stock suficiente de los insumos utilizados',
          );
        }
        throw new Error(`Error registrando atención: ${atencionResp.status}`);
      }
      const result = await atencionResp.json();
      console.log('Paso 1 - atención registrada:', result);

      setAtenciones((prev) => [...prev, atencion]);
      return result;
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAtenciones = useCallback(async () => {
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
        firma_digital: a.firma_digital ?? '',
        paciente__nombre_completo: a.despacho?.paciente?.nombre ?? 'Sin paciente',
      }));
      setResumenAtenciones(mapped);
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAtencionDetalle = useCallback(
    async (id: number) => {
      try {
        const response = await fetchConSesion(`/ims/api/atenciones/?id=${id}`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        const s3Url = data.success;

        const s3Resp = await fetch(s3Url);
        if (!s3Resp.ok) {
          const body = await s3Resp.text().catch(() => '');
          throw new Error(`Error descargando documento de S3 (${s3Resp.status}): ${body}`);
        }
        const documento = await s3Resp.json();
        console.log('Documento S3:', JSON.stringify(documento, null, 2));

        const resumen = resumenAtenciones.find((a) => a.id === id);
        if (resumen && documento.atencion) {
          documento.atencion.estado_sello = resumen.estado_sello;
          documento.atencion.sello_electronico = resumen.firma_digital;
        }

        return documento;
      } catch (e: any) {
        console.error('Error en fetchAtencionDetalle:', e);
        setError(e.message ?? 'Error desconocido');
        return null;
      }
    },
    [resumenAtenciones],
  );

  const fetchAtencionDetalleLocal = useCallback(async (id: number) => {
    try {
      const response = await fetchConSesion(`/ims/api/atenciones/?id=${id}`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      const s3Url = data.success;

      const s3Resp = await fetch(s3Url);
      if (!s3Resp.ok) {
        const body = await s3Resp.text().catch(() => '');
        throw new Error(`Error descargando documento de S3 (${s3Resp.status}): ${body}`);
      }
      return await s3Resp.json();
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
      return null;
    }
  }, []);

  const modificarAtencion = useCallback(async (atencionId: number, data: ModificacionPayload) => {
    setLoading(true);
    setError(null);
    try {
      const formatearHora = (hora: string) => {
        const nums = hora.replace(/[^0-9]/g, '');
        return nums.padStart(4, '0').slice(0, 4);
      };

      const payload = {
        atencion_id: atencionId,
        signos_vitales: data.controlSignos.map((s) => ({
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
          pre_informe: data.preInforme.preInforme,
          motivo_llamado: data.preInforme.motivoLlamado,
          estado_paciente: data.preInforme.estadoPaciente,
        },
        cronologia: {
          hora_llamada: formatearHora(data.cronologia.horaLlamada),
          despacho_movil: formatearHora(data.cronologia.despachoMovil),
          llegada_qth1: formatearHora(data.cronologia.llegadaQTH1),
          salida_qth1: formatearHora(data.cronologia.salidaQTH1),
          llegada_qth2: formatearHora(data.cronologia.llegadaQTH2),
          salida_qth2: formatearHora(data.cronologia.salidaQTH2),
          categoria: data.cronologia.categoria,
        },
      };

      const resp = await fetchConSesion('/ims/api/atenciones/update/', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const errorBody = await resp.json().catch(() => ({}));
        throw new Error(`Error modificando atención: ${resp.status} ${JSON.stringify(errorBody)}`);
      }
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarPorDespacho = useCallback(
    (despachoId: string) => atenciones.find((a) => a.despachoId === despachoId),
    [atenciones],
  );

  const value = useMemo(
    () => ({
      atenciones,
      resumenAtenciones,
      agregarAtencion,
      fetchAtenciones,
      fetchAtencionDetalle,
      fetchAtencionDetalleLocal,
      modificarAtencion,
      buscarPorDespacho,
      loading,
      error,
    }),
    [
      atenciones,
      resumenAtenciones,
      agregarAtencion,
      fetchAtenciones,
      fetchAtencionDetalle,
      fetchAtencionDetalleLocal,
      modificarAtencion,
      buscarPorDespacho,
      loading,
      error,
    ],
  );

  return <AtencionContext.Provider value={value}>{children}</AtencionContext.Provider>;
};

export const useAtenciones = () => {
  const ctx = useContext(AtencionContext);
  if (!ctx) throw new Error('useAtenciones debe usarse dentro de AtencionProvider');
  return ctx;
};
