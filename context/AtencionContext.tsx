import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchConSesion } from '@/context/AuthContext';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Atencion } from '@/data/types/types';

const BACKEND_READY = false;

type AtencionResumen = {
  id: number;
  fecha_registro: string;
  estado_sello: string;
};

type AtencionContextType = {
  atenciones: Atencion[];
  resumenAtenciones: AtencionResumen[];
  agregarAtencion: (atencion: Atencion) => Promise<void>;
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

  const agregarAtencion = async (atencion: Atencion) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        despachoId: atencion.despachoId,
        paciente: atencion.paciente,
        controlSignos: atencion.controlSignos,
        preInforme: atencion.preInforme,
        cronologia: atencion.cronologia,
      };

      if (BACKEND_READY) {
        const response = await fetchConSesion('/ims/api/atenciones/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const result = await response.json();
        console.log('Atención registrada con id:', result.id);
      } else {
        const key = `atencion_${Date.now()}`;
        await AsyncStorage.setItem(key, JSON.stringify(payload));
        console.log(`[${key}]`, JSON.stringify(payload, null, 2));
      }

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

  const buscarPorDespacho = (despachoId: string) => {
    return atenciones.find((a) => a.despachoId === despachoId);
  };

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
