import { AMBULANCIA_ESTADO, AmbulanciaEstado } from '../constants/ambulanciaEstados';

export type AmbulanciaStock = {
  presentacion_id: number;
  insumo_nombre: string;
  insumo_cantidad: number;
  categoria: string;
  unidad_medida: string;
  stock: number;
};

export type Ambulancia = {
  id: string;
  patente: string;
  estado: AmbulanciaEstado;
};

export const mockAmbulancias: Ambulancia[] = [
  { id: '1', patente: 'AMB-001', estado: AMBULANCIA_ESTADO.DISPONIBLE },
  { id: '2', patente: 'AMB-002', estado: AMBULANCIA_ESTADO.DISPONIBLE },
  { id: '3', patente: 'AMB-003', estado: AMBULANCIA_ESTADO.MANTENCION },
  { id: '4', patente: 'AMB-004', estado: AMBULANCIA_ESTADO.DISPONIBLE },
];

export const CATEGORIAS_EMERGENCIA = [
  { label: 'C1 - Gravedad Extrema', value: 'C1' },
  { label: 'C2 - Gravedad Severa', value: 'C2' },
  { label: 'C3 - Gravedad Mediana', value: 'C3' },
  { label: 'C4 - Gravedad Leve', value: 'C4' },
  { label: 'C5 - Gravedad No Pertinente', value: 'C5' },
];
