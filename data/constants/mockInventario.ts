import { Insumo } from '@/data/types/types';

const mockInsumos: Insumo[] = [
  {
    id: '1',
    nombre: 'Paracetamol',
    categoria: 'Analgésicos',
    cantidad: 500,
    unidadMedida: 'mg',
    ambulanciaPatente: 'MOCK-01',
    stock: 10,
  },
  {
    id: '2',
    nombre: 'Ibuprofeno',
    categoria: 'Analgésicos',
    cantidad: 400,
    unidadMedida: 'mg',
    ambulanciaPatente: 'MOCK-01',
    stock: 8,
  },
  {
    id: '3',
    nombre: 'Adrenalina',
    categoria: 'Cardiovasculares',
    cantidad: 1,
    unidadMedida: 'mg',
    ambulanciaPatente: 'MOCK-01',
    stock: 5,
  },
  {
    id: '4',
    nombre: 'Suero fisiológico NaCl 0,9%',
    categoria: 'Soluciones IV',
    cantidad: 500,
    unidadMedida: 'ml',
    ambulanciaPatente: 'MOCK-01',
    stock: 6,
  },
  {
    id: '5',
    nombre: 'Midazolam',
    categoria: 'Sedantes',
    cantidad: 5,
    unidadMedida: 'mg',
    ambulanciaPatente: 'MOCK-01',
    stock: 4,
  },
];

export default mockInsumos;
