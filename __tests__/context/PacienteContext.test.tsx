import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import PacienteProvider, { usePacientes } from '@/context/PacienteContext';
import { Paciente } from '@/data/mock/mockPaciente';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: { role: 'control' } })),
  fetchConSesion: jest.fn(),
}));

import { fetchConSesion, useAuth } from '@/context/AuthContext';
const mockFetchConSesion = fetchConSesion as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

const pacientes: Paciente[] = [
  {
    rut: '11111111-1',
    nombre_completo: 'Juan Pérez',
    fecha_nacimiento: '1990-01-01',
    direccion: 'Calle 1',
    condicion_paciente: 'Estable',
    telefono: '912345678',
    comuna: 'Santiago',
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PacienteProvider>{children}</PacienteProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { role: 'control' } });
  mockFetchConSesion.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(pacientes),
  });
});

describe('PacienteContext', () => {
  it('loads pacientes on mount when there is a user', async () => {
    const { result } = renderHook(() => usePacientes(), { wrapper });
    await act(async () => {});
    expect(result.current.pacientes).toEqual(pacientes);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when there is no user', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    renderHook(() => usePacientes(), { wrapper });
    await act(async () => {});
    expect(mockFetchConSesion).not.toHaveBeenCalled();
  });

  it('sets error and logs when the fetch fails', async () => {
    mockFetchConSesion.mockResolvedValue({ ok: false, status: 500 });
    const { result } = renderHook(() => usePacientes(), { wrapper });
    await act(async () => {});
    expect(result.current.pacientes).toEqual([]);
    expect(result.current.error).not.toBeNull();
  });

  describe('agregarPaciente', () => {
    it('appends the new paciente to local state', async () => {
      const { result } = renderHook(() => usePacientes(), { wrapper });
      await act(async () => {});
      const nuevo: Paciente = {
        rut: '22222222-2',
        nombre_completo: 'Ana Soto',
        fecha_nacimiento: '1985-05-05',
        direccion: 'Calle 2',
        condicion_paciente: 'Crítico',
        telefono: '987654321',
        comuna: 'Providencia',
      };
      act(() => {
        result.current.agregarPaciente(nuevo);
      });
      expect(result.current.pacientes).toContainEqual(nuevo);
      expect(result.current.pacientes.length).toBe(pacientes.length + 1);
    });
  });

  describe('buscarPaciente', () => {
    it('finds by rut', async () => {
      const { result } = renderHook(() => usePacientes(), { wrapper });
      await act(async () => {});
      expect(result.current.buscarPaciente('11111111-1')?.nombre_completo).toBe('Juan Pérez');
    });

    it('returns undefined when no match', async () => {
      const { result } = renderHook(() => usePacientes(), { wrapper });
      await act(async () => {});
      expect(result.current.buscarPaciente('99999999-9')).toBeUndefined();
    });
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => usePacientes())).toThrow();
  });
});
