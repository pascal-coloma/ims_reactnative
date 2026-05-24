import { FormCompleta, FormUsuario } from '../types';

export const DEFAULT_VALUES_ADMIN: FormCompleta = {
  primerNombre: '',
  segundoNombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  rut: '',
  fechaNacimiento: '',
  telefono: '',
  condicionPaciente: '',
  comuna: '',
  direccionOrigen: '',
  direccionDestino: '',
  descripcionLlamado: '',
  grupoAsignado: '',
  unidad: '',
};

export const DEFAULT_VALUES_USUARIO: FormUsuario = {
  primerNombre: '',
  segundoNombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  rut: '',
  fechaNacimiento: '',
  telefono: '',
  direccionOrigen: '',
  direccionDestino: '',
  condicionPaciente: '',
  comuna: '',
  controlSignos: [],
  insumosUtilizados: [],
  preInforme: { preInforme: '', motivoLlamado: '', estadoPaciente: 'estable' },
  cronologia: {
    horaLlamada: '',
    despachoMovil: '',
    llegadaQTH1: '',
    salidaQTH1: '',
    llegadaQTH2: '',
    salidaQTH2: '',
    categoria: '',
  },
};
