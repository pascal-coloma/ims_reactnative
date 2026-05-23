import { traducirRol } from '@/utils/labels';

describe('traducirRol', () => {
  it.each([
    ['medic', 'Médico'],
    ['nurse', 'Enfermero/a'],
    ['control', 'Control'],
    ['driver', 'Conductor'],
  ])('translates %s to %s', (input, expected) => {
    expect(traducirRol(input)).toBe(expected);
  });

  it('returns "Usuario" for unknown roles', () => {
    expect(traducirRol('unknown')).toBe('Usuario');
    expect(traducirRol('')).toBe('Usuario');
  });
});
