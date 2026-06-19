// Valores literales que espera/devuelve el backend (Ambulancia.ESTADOS en models.py).
export const AMBULANCIA_ESTADO = {
  DISPONIBLE: 'Lista para un nuevo despacho',
  TRABAJANDO: 'Actualmente en despacho',
  ENPREPARACION: 'Preparación previa para operar',
  MANTENCION: 'En mantención',
  NO_SERVICE: 'Fuera de servicio temporalmente',
} as const;

export type AmbulanciaEstado = (typeof AMBULANCIA_ESTADO)[keyof typeof AMBULANCIA_ESTADO];

export const AMBULANCIA_ESTADO_LABEL: Record<AmbulanciaEstado, string> = {
  [AMBULANCIA_ESTADO.DISPONIBLE]: 'Disponible',
  [AMBULANCIA_ESTADO.TRABAJANDO]: 'En despacho',
  [AMBULANCIA_ESTADO.ENPREPARACION]: 'En preparación',
  [AMBULANCIA_ESTADO.MANTENCION]: 'Mantención',
  [AMBULANCIA_ESTADO.NO_SERVICE]: 'Fuera de servicio',
};
