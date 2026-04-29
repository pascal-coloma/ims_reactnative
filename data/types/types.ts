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
