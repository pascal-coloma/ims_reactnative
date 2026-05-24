export type Ambulancia = {
  id: string;
  patente: string;
  modelo: string;
  estado_disponibilidad: 'disponible' | 'en_despacho' | 'mantencion' | 'fuera_servicio';
};

export const mockAmbulancias: Ambulancia[] = [
  {
    id: '1',
    patente: 'AMB-001',
    modelo: 'Mercedes Sprinter 2022',
    estado_disponibilidad: 'disponible',
  },
  { id: '2', patente: 'AMB-002', modelo: 'Ford Transit 2021', estado_disponibilidad: 'disponible' },
  { id: '3', patente: 'AMB-003', modelo: 'Iveco Daily 2020', estado_disponibilidad: 'mantencion' },
  {
    id: '4',
    patente: 'AMB-004',
    modelo: 'Renault Master 2023',
    estado_disponibilidad: 'disponible',
  },
];

export const CATEGORIAS_EMERGENCIA = [
  { label: 'C1 - Gravedad Extrema', value: 'C1' },
  { label: 'C2 - Gravedad Severa', value: 'C2' },
  { label: 'C3 - Gravedad Mediana', value: 'C3' },
  { label: 'C4 - Gravedad Leve', value: 'C4' },
  { label: 'C5 - Gravedad No Pertinente', value: 'C5' },
];
