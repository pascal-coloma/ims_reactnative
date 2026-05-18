export const traducirRol = (rol: string): string => {
  const roles: Record<string, string> = {
    medic: 'Médico',
    nurse: 'Enfermero/a',
    control: 'Control',
    driver: 'Conductor',
  };
  return roles[rol] ?? 'Usuario';
};
