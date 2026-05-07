export type FormCompleta = CamposPaciente & {
  prioridad: string;
  tipoEmergencia: string;
  equipoAsignado: string[];
  estadoUnidad: string;
  observaciones?: string;
  unidad: string;
};

export type FormUsuario = CamposPaciente & {
  controlSignos: SignosVitales[];
  preInforme: PreInforme;
  cronologia: Cronologia;
};

export type SignosVitales = {
  hora: string;
  pas: number;
  pad: number;
  pam: number;
  fc: number;
  fr: number;
  satO2: number;
  fio2: number;
  temperatura: number;
  hgt: number;
  gcs: number;
  eva: number;
};

export type CamposPaciente = {
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  edad: number;
  telefono: string;
  direccionOrigen: string;
  direccionDestino: string;
};

export type PreInforme = {
  preInforme: string;
  motivoLlamado: string;
  estadoPaciente: 'estable' | 'inestable';
};

export type Cronologia = {
  horaLlamada: string;
  despachoMovil: string;
  llegadaQTH1: string;
  salidaQTH1: string;
  llegadaQTH2: string;
  salidaQTH2: string;
  categoria: string;
};

export type Atencion = {
  id: string;
  despachoId: string;
  fechaRegistro: string;
  paciente: CamposPaciente;
  controlSignos: SignosVitales[];
  preInforme: PreInforme;
  cronologia: Cronologia;
};
