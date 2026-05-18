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
    .replace('+569', '')
    .replace(/[^0-9]/g, '')
    .slice(0, 8);
  return '+569 ' + limpio;
};


export const formatearHora = (hora: string): string => {
  if (!hora || hora.length < 4) return hora;
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