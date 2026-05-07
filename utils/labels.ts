const ROL_LABELS: Record<string, string> = {
  driver: 'Conductor',
  paramedic: 'Paramédico',
  nurse: 'Enfermero/a',
  medic: 'Médico',
  technician: 'Técnico',
  coordinator: 'Coordinador',
};

export const traducirRol = (rol: string): string => {
  return ROL_LABELS[rol.toLowerCase()] ?? rol;
};
