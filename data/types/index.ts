export type Insumo = {
  id: string; // presentacion.id — usar como presentacion_id en update/move
  nombre: string;
  categoria: string;
  cantidad: number;
  unidadMedida: string;
  ambulanciaPatente: string;
  ambulanciaId: number; // resuelto desde /api/ambulancias/ al cargar
  stock: number;
};

export type NuevoInsumo = {
  nombre_insumo: string;
  categoria_id: number;
  cantidad: number;
  unidad_medida_id: number;
  stock: number;
  ambulancia_id: number;
};

export type InsumoUtilizado = {
  insumoId: string;
  dosis: number;
  observaciones: string;
};

export type FormCompleta = {
  // Paciente
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  fechaNacimiento: string;
  telefono?: string;
  condicionPaciente: string;
  comuna?: string;
  // Despacho
  direccionOrigen: string;
  direccionDestino: string;
  descripcionLlamado: string;
  grupoAsignado: string;
  unidad: string;
};

export type FormUsuario = CamposPaciente & {
  controlSignos: SignosVitales[];
  preInforme: PreInforme;
  cronologia: Cronologia;
  insumosUtilizados: InsumoUtilizado[];
};

export type SignosVitales = {
  hora: string; // max_length=4, formato "HHMM"
  pas: number; // presion_sistolica
  pad: number; // presion_diastolica
  pam: number; // calculado en front
  fc: number; // frecuencia_cardiaca
  fr: number; // fr
  satO2: number; // saturacion_oxigeno
  fio2: number; // fio2
  temperatura: number; // temperatura
  hgt: number; // hgt
  gcs: number; // gcs
  eva: number; // eva
};

export type CamposPaciente = {
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  fechaNacimiento: string; // date_birth → YYYY-MM-DD
  telefono?: string; // null=True en modelo
  condicionPaciente: string; // requerido en modelo (TextField)
  comuna?: string; // blank=True en modelo
  direccionOrigen: string; // direccion en el serializer
  direccionDestino?: string; // no está en Paciente, viene del Despacho
};

export type PreInforme = {
  preInforme: string; // pre_informe
  motivoLlamado: string; // motivo_llamado
  estadoPaciente: string; // estado_paciente (null=True en modelo)
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
  insumosUtilizados: InsumoUtilizado[];
};

export type NuevoWorker = {
  first_name: string;
  last_name: string;
  rut: string;
  rol_id: number;
};

export type WorkerCreado = {
  totp_uri: string;
  password: string;
  usuario_id: number;
};

export type Miembro = {
  nombre: string;
  rut: string;
  rol: string;
};

export type Grupo = {
  grupo_id: number;
  grupo_nombre: string;
  miembros: Miembro[];
};
