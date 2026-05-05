export type Paciente = {
  rut: string;
  pnombre: string;
  snombre: string | undefined;
  apaterno: string;
  amaterno: string;
  edad: number;
  telefono: string;
};

const prefijo = '+569';

const mockPacientes: Paciente[] = [
  {
    rut: '12.345.678-9',
    pnombre: 'Carlos',
    snombre: 'Andrés',
    apaterno: 'Fuentes',
    amaterno: 'Rojas',
    edad: 45,
    telefono: prefijo + '12345678',
  },
  {
    rut: '9.876.543-2',
    pnombre: 'María',
    snombre: '',
    apaterno: 'González',
    amaterno: 'Pérez',
    edad: 32,
    telefono: prefijo + '87654321',
  },
  {
    rut: '15.234.567-K',
    pnombre: 'Jorge',
    snombre: 'Luis',
    apaterno: 'Muñoz',
    amaterno: 'Soto',
    edad: 67,
    telefono: prefijo + '23456789',
  },
  {
    rut: '11.111.111-1',
    pnombre: 'Ana',
    snombre: 'Valentina',
    apaterno: 'Herrera',
    amaterno: 'Castro',
    edad: 28,
    telefono: prefijo + '34567890',
  },
  {
    rut: '7.654.321-3',
    pnombre: 'Roberto',
    snombre: '',
    apaterno: 'Díaz',
    amaterno: 'Vega',
    edad: 54,
    telefono: prefijo + '45678901',
  },
];

export default mockPacientes;
