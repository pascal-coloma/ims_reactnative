import { Personal } from './mockPersonal';

const mockDespachos: Despacho[] = [];

export type Despacho = {
  id: string;
  rutPaciente: string;
  nombrePaciente: string;
  edad: number;
  destino: string;
  origen: string;
  estado: 'pendiente' | 'activo' | 'completado';
  prioridad: 'alta' | 'media' | 'baja';
  tipoEmergencia: string;
  unidad: string;
  personal: Personal[];
  observaciones?: string;
};

export default mockDespachos;
