const ROL_LABELS: Record<string, string> = {
  driver: 'Conductor',
  paramedic: 'Paramédico',
  nurse: 'Enfermero/a',
  medic: 'Médico',
  technician: 'Técnico',
  coordinator: 'Coordinador',
};

export const traducirRol = (rol: string): string => {
  if (!rol) return 'Sin rol';
  return ROL_LABELS[rol.toLowerCase()] ?? rol;
};
