export type Personal = {
   id: string;
  first_name: string;
  last_name: string;
  username: string;   
  rut: string;        
  rol_nombre: string; 
  is_active: boolean;
};

const PERSONAL: Personal[] = [
  {
    id: '1',
    first_name: 'Ignacio',
    last_name: 'García',
    rol__nombre_rol: 'Médico',
    is_active: true,
  },
  {
    id: '2',
    first_name: 'Valentina',
    last_name: 'Soto',
    rol__nombre_rol: 'Médico',
    is_active: false,
  },
  {
    id: '3',
    first_name: 'Camila',
    last_name: 'Martínez',
    rol__nombre_rol: 'Enfermero/a',
    is_active: true,
  },
  {
    id: '4',
    first_name: 'Sebastián',
    last_name: 'Rojas',
    rol__nombre_rol: 'Enfermero/a',
    is_active: true,
  },
  {
    id: '5',
    first_name: 'Francisca',
    last_name: 'Núñez',
    rol__nombre_rol: 'Técnico Paramédico',
    is_active: true,
  },
  {
    id: '6',
    first_name: 'Diego',
    last_name: 'Fuentes',
    rol__nombre_rol: 'Técnico Paramédico',
    is_active: false,
  },
  {
    id: '7',
    first_name: 'Javiera',
    last_name: 'Morales',
    rol__nombre_rol: 'Técnico Paramédico',
    is_active: true,
  },
  {
    id: '8',
    first_name: 'Luis',
    last_name: 'Rodríguez',
    rol__nombre_rol: 'Conductor',
    is_active: true,
  },
  {
    id: '9',
    first_name: 'Patricio',
    last_name: 'Vega',
    rol__nombre_rol: 'Conductor',
    is_active: false,
  },
  {
    id: '10',
    first_name: 'Andrea',
    last_name: 'Castillo',
    rol__nombre_rol: 'Conductor',
    is_active: true,
  },
];

export default PERSONAL;
