import { FormCompleta, FormUsuario } from "../types/types";

export const DEFAULT_VALUES_ADMIN: FormCompleta = {
  primerNombre: '',
  segundoNombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  telefono: '',
  rut: '',
  edad: 50,
  direccionOrigen: '',
  direccionDestino: '',
  prioridad: '',
  tipoEmergencia: '',
  equipoAsignado: [],
  unidad: '',
  observaciones: '',
  estadoUnidad: '',
};

export const DEFAULT_VALUES_USUARIO: FormUsuario = {
  primerNombre: '',
  segundoNombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  telefono: '',
  rut: '',
  edad: 0,
  direccionOrigen: '',
  direccionDestino: '',
  controlSignos: [],
  preInforme: {
    preInforme: '',
    motivoLlamado: '',
    estadoPaciente: 'estable',
  },
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

