export const formatearRut = (rut: string): string => {
  const clean = rut.replace(/[^0-9kK]/g, '').slice(0, 9);
  if (clean.length <= 1) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};

export const validarRut = (rut: string): boolean => {
  const clean = rut.replace(/[^0-9kK]/g, '');
  if (clean.length < 2) return false;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1).toLowerCase();

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'k' : String(dvEsperado);

  return dv === dvCalculado;
};

export const validarFecha = (fecha: string): boolean => {
  const clean = fecha.replace(/[^0-9]/g, '');
  if (clean.length < 8) return false;
  const dia = parseInt(clean.slice(0, 2));
  const mes = parseInt(clean.slice(2, 4));
  const anno = parseInt(clean.slice(4, 8));
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (anno < 1900 || anno > new Date().getFullYear()) return false;
  const date = new Date(anno, mes - 1, dia);
  return date.getFullYear() === anno && date.getMonth() === mes - 1 && date.getDate() === dia;
};

export const formatearFecha = (fechaNacimiento: string): string => {
  const limpiar = fechaNacimiento.replace(/[^0-9]/g, '');
  if (limpiar.length <= 1) return limpiar;
  const dia = limpiar.slice(0, 2);
  const mes = limpiar.slice(2, 4);
  const anno = limpiar.slice(4, 8);
  return limpiar.length < 3
    ? dia
    : limpiar.length < 5
      ? dia + '-' + mes
      : dia + '-' + mes + '-' + anno;
};

export const formatearTelefono = (telefono: string): string => {
  const limpio = telefono
    .replace(/\+569\s?/g, '')
    .replace(/[^0-9]/g, '')
    .slice(0, 8);
  if (!limpio) return '';
  return '+569 ' + limpio;
};

export const validarTelefono = (telefono: string): boolean => {
  const digits = telefono.replace(/[^0-9]/g, '');
  // +569 + 8 dígitos = 12 dígitos totales
  return digits.length === 11 && digits.startsWith('569');
};

export const formatearHora = (hora: string | undefined): string => {
  if (!hora) return '—';
  if (hora.includes(':')) return hora;
  if (hora.length < 4) return hora;
  return `${hora.slice(0, 2)}:${hora.slice(2, 4)}`;
};

export const formatearFechaHora = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
