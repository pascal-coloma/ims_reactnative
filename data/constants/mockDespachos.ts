import { CamposPaciente } from '../types/types';
import { Ambulancia } from './mockAmbulancia';

export type Despacho = CamposPaciente & {
  id: string;
  estado: 'pendiente' | 'activo' | 'completado';
  prioridad: 'alta' | 'media' | 'baja';
  tipoEmergencia: string;
  personalIds: string[];
  ambulancia?: Ambulancia;
  observaciones?: string;
};

const mockDespachos: Despacho[] = [
  {
    id: 'DSP-1',
    primerNombre: 'Carlos',
    segundoNombre: 'Andrés',
    apellidoPaterno: 'Fuentes',
    apellidoMaterno: 'Rojas',
    rut: '12.345.678-9',
    edad: 45,
    telefono: '+56912345678',
    direccionOrigen: 'Av. Libertador 123',
    direccionDestino: 'Hospital Base Valparaíso',
    estado: 'activo',
    prioridad: 'alta',
    tipoEmergencia: 'C1',
    personalIds: ['1'],
    observaciones: 'Paciente con antecedentes cardíacos',
  },
];

export default mockDespachos;
