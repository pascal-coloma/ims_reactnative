import { Insumo } from '@/data/types/types';

const mockInsumos: Insumo[] = [
  // Analgésicos y antipiréticos
  {
    id: '1',
    nombre: 'Paracetamol',
    dosis: 500,
    unidad: 'mg',
    observacion: 'Analgésico y antipirético',
  },
  { id: '2', nombre: 'Ibuprofeno', dosis: 400, unidad: 'mg', observacion: 'Antiinflamatorio AINE' },
  {
    id: '3',
    nombre: 'Aspirina',
    dosis: 100,
    unidad: 'mg',
    observacion: 'Antiagregante plaquetario',
  },
  {
    id: '4',
    nombre: 'Aspirina',
    dosis: 500,
    unidad: 'mg',
    observacion: 'Analgésico y antipirético',
  },
  {
    id: '5',
    nombre: 'Ketorolaco',
    dosis: 30,
    unidad: 'mg',
    observacion: 'Analgésico AINE inyectable',
  },
  { id: '6', nombre: 'Diclofenaco', dosis: 50, unidad: 'mg', observacion: 'Antiinflamatorio AINE' },
  { id: '7', nombre: 'Tramadol', dosis: 50, unidad: 'mg', observacion: 'Analgésico opioide' },
  {
    id: '8',
    nombre: 'Morfina',
    dosis: 10,
    unidad: 'mg',
    observacion: 'Opioide de rescate — uso controlado',
  },

  // Antihistamínicos y antialérgicos
  { id: '9', nombre: 'Clorfenamina', dosis: 4, unidad: 'mg', observacion: 'Antihistamínico' },
  {
    id: '10',
    nombre: 'Loratadina',
    dosis: 10,
    unidad: 'mg',
    observacion: 'Antihistamínico no sedante',
  },

  // Antibióticos
  {
    id: '11',
    nombre: 'Amoxicilina',
    dosis: 500,
    unidad: 'mg',
    observacion: 'Antibiótico de amplio espectro',
  },

  // Gastrointestinales
  {
    id: '12',
    nombre: 'Metoclopramida',
    dosis: 10,
    unidad: 'mg',
    observacion: 'Antiemético y procinético',
  },
  { id: '13', nombre: 'Ranitidina', dosis: 150, unidad: 'mg', observacion: 'Antagonista H2' },
  {
    id: '14',
    nombre: 'Omeprazol',
    dosis: 20,
    unidad: 'mg',
    observacion: 'Inhibidor bomba de protones',
  },

  // Cardiovasculares / urgencia
  {
    id: '15',
    nombre: 'Adrenalina (Epinefrina)',
    dosis: 1,
    unidad: 'mg',
    observacion: 'Vasoconstrictor — paro cardíaco y anafilaxia',
  },
  {
    id: '16',
    nombre: 'Atropina',
    dosis: 1,
    unidad: 'mg',
    observacion: 'Anticolinérgico — bradicardia',
  },
  {
    id: '17',
    nombre: 'Nitroglicerina',
    dosis: 500,
    unidad: 'mg',
    observacion: 'Vasodilatador — angina de pecho',
  },

  // Sedantes / convulsiones
  {
    id: '18',
    nombre: 'Midazolam',
    dosis: 5,
    unidad: 'mg',
    observacion: 'Benzodiacepina — sedación y convulsiones',
  },
  {
    id: '19',
    nombre: 'Diazepam',
    dosis: 10,
    unidad: 'mg',
    observacion: 'Benzodiacepina — convulsiones',
  },

  // Soluciones IV
  {
    id: '20',
    nombre: 'Suero fisiológico NaCl 0,9%',
    dosis: 500,
    unidad: 'ml',
    observacion: 'Reposición de volumen',
  },
  {
    id: '21',
    nombre: 'Ringer Lactato',
    dosis: 500,
    unidad: 'ml',
    observacion: 'Reposición de volumen isotónico',
  },
  {
    id: '22',
    nombre: 'Glucosa 50%',
    dosis: 50,
    unidad: 'ml',
    observacion: 'Corrección de hipoglicemia',
  },
  {
    id: '23',
    nombre: 'Glucosa 5%',
    dosis: 500,
    unidad: 'ml',
    observacion: 'Solución de mantención',
  },

  // Materiales
  { id: '24', nombre: 'Guantes de nitrilo', dosis: 1, unidad: 'unidades', observacion: 'Talla M' },
  { id: '25', nombre: 'Mascarilla quirúrgica', dosis: 1, unidad: 'unidades' },
  { id: '26', nombre: 'Mascarilla N95', dosis: 1, unidad: 'unidades' },
  {
    id: '27',
    nombre: 'Venda elástica',
    dosis: 1,
    unidad: 'unidades',
    observacion: '10 cm × 4,5 m',
  },
  { id: '28', nombre: 'Gasa estéril', dosis: 1, unidad: 'unidades', observacion: '10 × 10 cm' },
  { id: '29', nombre: 'Jeringa 5 ml', dosis: 1, unidad: 'unidades' },
  { id: '30', nombre: 'Jeringa 10 ml', dosis: 1, unidad: 'unidades' },
  { id: '31', nombre: 'Aguja 21G', dosis: 1, unidad: 'unidades' },
  { id: '32', nombre: 'Catéter IV 18G', dosis: 1, unidad: 'unidades' },
  {
    id: '33',
    nombre: 'Cánula orofaríngea',
    dosis: 1,
    unidad: 'unidades',
    observacion: 'Talla adulto',
  },
  { id: '34', nombre: 'Apósito adhesivo', dosis: 1, unidad: 'unidades' },
  { id: '35', nombre: 'Tubo endotraqueal', dosis: 1, unidad: 'unidades', observacion: 'Talla 7,5' },
];

export default mockInsumos;
