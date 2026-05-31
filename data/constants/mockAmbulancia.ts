export type AmbulanciaStock = {
  presentacion_id: number;
  insumo_nombre: string;
  insumo_cantidad: number;
  categoria: string;
  unidad_medida: string;
  stock: number;
};

export type Ambulancia = {
  ambulancia_id: number;
  patente: string;
  estado: 'disponible' | 'en_despacho' | 'mantencion' | 'fuera_servicio';
  stock: AmbulanciaStock[];
};

export const mockAmbulancias: Ambulancia[] = [
  { ambulancia_id: 1, patente: 'AMB-001', estado: 'disponible', stock: [] },
  { ambulancia_id: 2, patente: 'AMB-002', estado: 'disponible', stock: [] },
  { ambulancia_id: 3, patente: 'AMB-003', estado: 'mantencion', stock: [] },
  { ambulancia_id: 4, patente: 'AMB-004', estado: 'disponible', stock: [] },
];

export const CATEGORIAS_EMERGENCIA = [
  { label: 'C1 - Gravedad Extrema', value: 'C1' },
  { label: 'C2 - Gravedad Severa', value: 'C2' },
  { label: 'C3 - Gravedad Mediana', value: 'C3' },
  { label: 'C4 - Gravedad Leve', value: 'C4' },
  { label: 'C5 - Gravedad No Pertinente', value: 'C5' },
];
