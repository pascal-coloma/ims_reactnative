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
    username: 'igarcia',
    rut: '11111111-1',
    rol_nombre: 'Médico',
    is_active: true,
  },
  {
    id: '2',
    first_name: 'Valentina',
    last_name: 'Soto',
    username: 'vsoto',
    rut: '22222222-2',
    rol_nombre: 'Médico',
    is_active: false,
  },
  {
    id: '3',
    first_name: 'Camila',
    last_name: 'Martínez',
    username: 'cmartinez',
    rut: '33333333-3',
    rol_nombre: 'Enfermero/a',
    is_active: true,
  },
  {
    id: '4',
    first_name: 'Sebastián',
    last_name: 'Rojas',
    username: 'srojas',
    rut: '44444444-4',
    rol_nombre: 'Enfermero/a',
    is_active: true,
  },
  {
    id: '5',
    first_name: 'Francisca',
    last_name: 'Núñez',
    username: 'fnunez',
    rut: '55555555-5',
    rol_nombre: 'Técnico Paramédico',
    is_active: true,
  },
  {
    id: '6',
    first_name: 'Diego',
    last_name: 'Fuentes',
    username: 'dfuentes',
    rut: '66666666-6',
    rol_nombre: 'Técnico Paramédico',
    is_active: false,
  },
  {
    id: '7',
    first_name: 'Javiera',
    last_name: 'Morales',
    username: 'jmorales',
    rut: '77777777-7',
    rol_nombre: 'Técnico Paramédico',
    is_active: true,
  },
  {
    id: '8',
    first_name: 'Luis',
    last_name: 'Rodríguez',
    username: 'lrodriguez',
    rut: '88888888-8',
    rol_nombre: 'Conductor',
    is_active: true,
  },
  {
    id: '9',
    first_name: 'Patricio',
    last_name: 'Vega',
    username: 'pvega',
    rut: '99999999-9',
    rol_nombre: 'Conductor',
    is_active: false,
  },
  {
    id: '10',
    first_name: 'Andrea',
    last_name: 'Castillo',
    username: 'acastillo',
    rut: '10101010-1',
    rol_nombre: 'Conductor',
    is_active: true,
  },
];

export default PERSONAL;
