export type Insumo = {
  id: string;
  nombre: string;
  stockTotal: number;
  stockMinimo: number;
  unidadMedida: string;
  tipo: string;
  ubicacion: 'bodega' | 'ambulancia';
};

// inventario por ambulancia o general de ambulancias??

const mockInsumos: Insumo[] = [
  {
    id: '1',
    nombre: 'Suero fisiológico',
    stockTotal: 50,
    stockMinimo: 10,
    unidadMedida: 'ml',
    tipo: 'medicamento',
    ubicacion: 'bodega',
  },
  {
    id: '2',
    nombre: 'Adrenalina',
    stockTotal: 20,
    stockMinimo: 5,
    unidadMedida: 'mg',
    tipo: 'medicamento',
    ubicacion: 'ambulancia',
  },
  {
    id: '3',
    nombre: 'Guantes de látex',
    stockTotal: 200,
    stockMinimo: 50,
    unidadMedida: 'unidades',
    tipo: 'material',
    ubicacion: 'bodega',
  },
  {
    id: '4',
    nombre: 'Desfibrilador',
    stockTotal: 2,
    stockMinimo: 1,
    unidadMedida: 'unidades',
    tipo: 'equipamiento',
    ubicacion: 'ambulancia',
  },
  {
    id: '5',
    nombre: 'Vendas elásticas',
    stockTotal: 80,
    stockMinimo: 20,
    unidadMedida: 'unidades',
    tipo: 'material',
    ubicacion: 'bodega',
  },
  {
    id: '6',
    nombre: 'Morfina',
    stockTotal: 15,
    stockMinimo: 5,
    unidadMedida: 'mg',
    tipo: 'medicamento',
    ubicacion: 'ambulancia',
  },
  {
    id: '7',
    nombre: 'Oxígeno',
    stockTotal: 10,
    stockMinimo: 3,
    unidadMedida: 'unidades',
    tipo: 'equipamiento',
    ubicacion: 'ambulancia',
  },
  {
    id: '8',
    nombre: 'Jeringas 10ml',
    stockTotal: 300,
    stockMinimo: 100,
    unidadMedida: 'unidades',
    tipo: 'material',
    ubicacion: 'bodega',
  },
];

export default mockInsumos;
