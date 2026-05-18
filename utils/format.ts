export const formatearRut = (rut: string): string => {
  const clean = rut.replace(/[^0-9kK]/g, '').slice(0, 9);
  if (clean.length <= 1) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};