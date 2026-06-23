import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import PersonalProvider, { usePersonal } from '@/context/PersonalContext';
import { Personal } from '@/data/mock/mockPersonal';

jest.mock('@/context/AuthContext', () => ({
  fetchConSesion: jest.fn(),
}));

import { fetchConSesion } from '@/context/AuthContext';
const mockFetchConSesion = fetchConSesion as jest.Mock;

const personal: Personal[] = [
  {
    id: '1',
    first_name: 'Ignacio',
    last_name: 'García',
    username: 'igarcia',
    rut: '11111111-1',
    rol_nombre: 'Médico',
    is_active: true,
  },
  {
    id: '2',
    first_name: 'Valentina',
    last_name: 'Soto',
    username: 'vsoto',
    rut: '22222222-2',
    rol_nombre: 'Médico',
    is_active: true,
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PersonalProvider>{children}</PersonalProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchConSesion.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(personal),
  });
});

describe('PersonalContext', () => {
  it('loads personal on mount', async () => {
    const { result } = renderHook(() => usePersonal(), { wrapper });
    await act(async () => {});
    expect(result.current.personal).toEqual(personal);
  });

  it('leaves personal empty and logs when fetch fails', async () => {
    mockFetchConSesion.mockResolvedValue({ ok: false, status: 500 });
    const { result } = renderHook(() => usePersonal(), { wrapper });
    await act(async () => {});
    expect(result.current.personal).toEqual([]);
  });

  describe('actualizarDisponibilidad', () => {
    it('marks only the target as inactive', async () => {
      const { result } = renderHook(() => usePersonal(), { wrapper });
      await act(async () => {});
      act(() => {
        result.current.actualizarDisponibilidad('1');
      });
      expect(result.current.personal.find((p) => p.id === '1')?.is_active).toBe(false);
      expect(result.current.personal.find((p) => p.id === '2')?.is_active).toBe(true);
    });
  });

  describe('registrarWorker', () => {
    it('POSTs the new worker and returns the created credentials', async () => {
      const { result } = renderHook(() => usePersonal(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockClear();
      const creado = { totp_uri: 'otpauth://...', password: 'temp123', usuario_id: 9 };
      mockFetchConSesion.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(creado),
      });
      const nuevo = { first_name: 'Nuevo', last_name: 'Worker', rut: '12345678-9', rol_id: 2 };

      let returned;
      await act(async () => {
        returned = await result.current.registrarWorker(nuevo);
      });

      expect(mockFetchConSesion).toHaveBeenCalledWith('/ims/api/personal/add/', {
        method: 'POST',
        body: JSON.stringify(nuevo),
      });
      expect(returned).toEqual(creado);
    });

    it('throws the API error message on failure', async () => {
      const { result } = renderHook(() => usePersonal(), { wrapper });
      await act(async () => {});
      mockFetchConSesion.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ error: 'RUT ya registrado' }),
      });
      await expect(
        act(async () => {
          await result.current.registrarWorker({
            first_name: 'Nuevo',
            last_name: 'Worker',
            rut: '11111111-1',
            rol_id: 2,
          });
        }),
      ).rejects.toThrow('RUT ya registrado');
    });
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => usePersonal())).toThrow();
  });
});
