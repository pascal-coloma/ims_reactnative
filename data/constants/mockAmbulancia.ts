export type Ambulancia = {
  id: string;
  numeroMovil: string;
  patente: string;
  tipo: 'basica' | 'avanzada';
  disponible: boolean;
};
export const mockAmbulancias: Ambulancia[] = [
  { id: '1', numeroMovil: 'M-01', patente: 'AB1234', tipo: 'basica', disponible: true },
  { id: '2', numeroMovil: 'M-02', patente: 'CD5678', tipo: 'avanzada', disponible: true },
  { id: '3', numeroMovil: 'M-03', patente: 'EF9012', tipo: 'basica', disponible: false },
];

export const CATEGORIAS_EMERGENCIA = [
  { label: 'C1 - Emergencia vital', value: 'C1' },
  { label: 'C2 - Emergencia evidente', value: 'C2' },
  { label: 'C3 - Urgencia', value: 'C3' },
  { label: 'C4 - Urgencia mediata', value: 'C4' },
  { label: 'C5 - Sin urgencia', value: 'C5' },
];
