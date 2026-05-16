import { Ambulancia } from './mockAmbulancia';

export type Despacho = {
  id: string;
  rutPaciente?: string;
  paciente?: {
    nombre_completo: string;
    rut: string;
  };
  direccionOrigen: string;
  direccionDestino: string;
  descripcionLlamado: string;
  estado: 'recibido' | 'asignado' | 'finalizado' | 'cancelado' | 'activo';
  fechaLlamado?: string;
  fechaAsignacion?: string;
  ambulancia?: Ambulancia;
  personalIds: string[];
};

const mockDespachos: Despacho[] = [
  {
    id: 'DSP-1',
    direccionOrigen: 'Av. Libertador 123',
    direccionDestino: 'Hospital Base Valparaíso',
    descripcionLlamado: 'C1',
    estado: 'activo',
    personalIds: ['1'],
  },
];

export default mockDespachos;
