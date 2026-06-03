export type Paciente = {
  rut: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  direccion: string;
  condicion_paciente: string;
  telefono: string;
  comuna: string;
};

const prefijo = '+569';

const mockPacientes: Paciente[] = [];

export default mockPacientes;
