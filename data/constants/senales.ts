// Valores literales que espera el backend (Senal en task_notificaciones.py).
// Solo las señales de equipo, ligadas a un despacho_id; las de patente/mensaje
// (senal_ambulancia/ocupada/outofservice/otro) no tienen UI todavía.
export const SENAL_EQUIPO = {
  DISPONIBLE: 'senal_disponible',
  EN_CAMINO: 'senal_en_camino',
  EN_DESTINO: 'senal_en_destino',
  REGRESANDO: 'senal_regresando',
} as const;

export type SenalEquipo = (typeof SENAL_EQUIPO)[keyof typeof SENAL_EQUIPO];

export const SENAL_EQUIPO_LABEL: Record<SenalEquipo, string> = {
  [SENAL_EQUIPO.DISPONIBLE]: 'Disponible',
  [SENAL_EQUIPO.EN_CAMINO]: 'En camino',
  [SENAL_EQUIPO.EN_DESTINO]: 'En destino',
  [SENAL_EQUIPO.REGRESANDO]: 'Regresando',
};
