import {
  formatearRut,
  validarRut,
  validarFecha,
  formatearFecha,
  formatearTelefono,
  validarTelefono,
  formatearHora,
  formatearFechaHora,
} from '@/utils/format';

describe('formatearRut', () => {
  it('formats a clean RUT with dots and dash', () => {
    expect(formatearRut('12345678')).toBe('1.234.567-8');
  });

  it('strips existing formatting and re-applies it', () => {
    expect(formatearRut('12.345.678-9')).toBe('12.345.678-9');
  });

  it('handles RUT with k verifier', () => {
    expect(formatearRut('9876543k')).toBe('9.876.543-k');
  });

  it('returns raw value when too short', () => {
    expect(formatearRut('1')).toBe('1');
  });
});

describe('validarRut', () => {
  it('returns true for a valid RUT', () => {
    // 11.111.111 → suma=32, dvEsperado=1 ✓
    expect(validarRut('11.111.111-1')).toBe(true);
  });

  it('returns false for an invalid verifier digit', () => {
    expect(validarRut('12345678-0')).toBe(false);
  });

  it('returns false when too short', () => {
    expect(validarRut('1')).toBe(false);
  });

  it('accepts k verifier digit', () => {
    // 8888888 → suma=232, 232%11=1, dvEsperado=10 → k ✓
    expect(validarRut('8.888.888-k')).toBe(true);
  });
});

describe('validarFecha', () => {
  it('returns true for a valid date', () => {
    expect(validarFecha('01-01-1990')).toBe(true);
  });

  it('returns false for an invalid month', () => {
    expect(validarFecha('01-13-1990')).toBe(false);
  });

  it('returns false for an invalid day', () => {
    expect(validarFecha('32-01-1990')).toBe(false);
  });

  it('returns false for a future year', () => {
    expect(validarFecha('01-01-2999')).toBe(false);
  });

  it('returns false when input is too short', () => {
    expect(validarFecha('010119')).toBe(false);
  });
});

describe('formatearFecha', () => {
  it('returns raw digits when under 3 chars', () => {
    expect(formatearFecha('12')).toBe('12');
  });

  it('inserts first dash after day', () => {
    expect(formatearFecha('1201')).toBe('12-01');
  });

  it('returns full DD-MM-YYYY format', () => {
    expect(formatearFecha('12011990')).toBe('12-01-1990');
  });
});

describe('formatearTelefono', () => {
  it('adds +569 prefix to 8-digit number', () => {
    expect(formatearTelefono('12345678')).toBe('+569 12345678');
  });

  it('strips existing +569 prefix before re-formatting', () => {
    expect(formatearTelefono('+569 12345678')).toBe('+569 12345678');
  });

  it('returns empty string for empty input', () => {
    expect(formatearTelefono('')).toBe('');
  });
});

describe('validarTelefono', () => {
  it('returns true for a valid Chilean mobile', () => {
    expect(validarTelefono('+569 12345678')).toBe(true);
  });

  it('returns false when too short', () => {
    expect(validarTelefono('+569 1234')).toBe(false);
  });

  it('returns false when prefix is wrong', () => {
    expect(validarTelefono('+561 12345678')).toBe(false);
  });
});

describe('formatearHora', () => {
  it('returns dash for undefined input', () => {
    expect(formatearHora(undefined)).toBe('—');
  });

  it('returns already formatted HH:MM unchanged', () => {
    expect(formatearHora('14:30')).toBe('14:30');
  });

  it('converts HHMM to HH:MM', () => {
    expect(formatearHora('1430')).toBe('14:30');
  });
});

describe('formatearFechaHora', () => {
  it('returns dash for empty string', () => {
    expect(formatearFechaHora('')).toBe('—');
  });

  it('formats a valid ISO string to Chilean locale', () => {
    const result = formatearFechaHora('2024-03-15T10:00:00.000Z');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/03/);
    expect(result).toMatch(/2024/);
  });
});
